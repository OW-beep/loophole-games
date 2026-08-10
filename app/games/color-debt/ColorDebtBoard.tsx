'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createInitialState,
  trySwap,
  countBadTiles,
  GRID_SIZE,
  MOVES_LIMIT,
  TARGET_SCORE,
  DEBT_MATURITY,
  type ColorDebtState,
} from '@/lib/games/color-debt';
import { createRng } from '@/lib/daily-seed';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { CoinLeaderboard } from '@/components/CoinLeaderboard';
import { CoinModeSection } from '@/components/CoinModeSection';
import { GAMES } from '@/lib/games/registry';
import { loadCoinBalance, saveCoinBalance, rollCoinSeed, computeCoinDelta, GLOBAL_LEADERBOARD_SLUG } from '@/lib/coin-mode';
import { getNickname, saveNickname, submitScore } from '@/lib/leaderboard-client';

const GAME_SLUG = 'color-debt';

function rcOf(i: number) {
  return { r: Math.floor(i / GRID_SIZE), c: i % GRID_SIZE };
}
function isAdjacent(a: number, b: number) {
  const ra = rcOf(a);
  const rb = rcOf(b);
  return Math.abs(ra.r - rb.r) + Math.abs(ra.c - rb.c) === 1;
}

function GridView({
  state,
  selected,
  onTap,
  disabled,
}: {
  state: ColorDebtState;
  selected: number | null;
  onTap: (i: number) => void;
  disabled: boolean;
}) {
  const badCount = countBadTiles(state.grid);

  return (
    <div>
      <div className="stat-line flex justify-between text-ink/50 dark:text-white/40 mb-3">
        <span>
          Score: <span className="font-mono text-ink dark:text-white">{state.score}</span> / {TARGET_SCORE}
        </span>
        <span>
          Bad tiles: <span className="font-mono text-ink dark:text-white">{badCount}</span>
        </span>
      </div>

      <div
        className="grid gap-1 mb-4 bg-index/30 dark:bg-index-dark/30 p-1.5 border-2 border-graphite dark:border-white/80"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
      >
        {state.grid.map((cell, i) => {
          const isSelected = selected === i;
          return (
            <button
              key={i}
              onClick={() => onTap(i)}
              disabled={disabled || cell?.kind === 'bad'}
              aria-label={cell?.kind === 'normal' ? 'Color tile' : cell?.kind === 'debt' ? 'Debt tile' : 'Locked tile'}
              className={[
                'relative aspect-square flex items-center justify-center transition-transform',
                isSelected ? 'ring-4 ring-graphite dark:ring-white scale-90 z-10' : '',
              ].join(' ')}
              style={{
                backgroundColor: cell?.kind === 'normal' ? cell.color : cell?.kind === 'debt' ? '#A9ADB4' : '#3A3E46',
              }}
            >
              {cell?.kind === 'debt' && <span className="font-mono text-xs font-bold text-graphite">{DEBT_MATURITY - cell.age}</span>}
              {cell?.kind === 'bad' && <span className="text-white text-xs">🔒</span>}
            </button>
          );
        })}
      </div>

      <p className="stat-line text-ink/50 dark:text-white/40 text-center">
        Tap a tile, then tap a neighbor to swap. Gray numbers count down to lock.
      </p>
    </div>
  );
}

export function ColorDebtBoard({ seed, dateString, puzzleNumber }: { seed: number; dateString: string; puzzleNumber: number }) {
  const game = GAMES.find((g) => g.slug === GAME_SLUG)!;

  // --- Daily puzzle (unchanged behavior) ---
  const rngRef = useRef(createRng(seed + 31337));
  const [state, setState] = useState<ColorDebtState>(() => createInitialState(seed));
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);

  function handleClick(i: number) {
    if (state.won || state.lost) return;
    const cell = state.grid[i];
    if (cell?.kind === 'bad') return;

    if (selected === null) {
      setSelected(i);
      return;
    }
    if (selected === i) {
      setSelected(null);
      return;
    }
    if (isAdjacent(selected, i)) {
      setState((prev) => trySwap(prev, selected, i, rngRef.current));
      setSelected(null);
    } else {
      setSelected(i);
    }
  }

  useEffect(() => {
    if ((state.won || state.lost) && !finishedRef.current) {
      finishedRef.current = true;
      recordResult(GAME_SLUG, {
        date: dateString,
        won: state.won,
        moves: state.movesUsed,
        score: state.score,
        elapsedMs: 0,
      });
      setStreak(getStreak(GAME_SLUG).current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.movesUsed, state.score, dateString]);

  const dailyFinished = state.won || state.lost;

  // --- Coin Mode ---
  const coinRngRef = useRef(createRng(1));
  const [coins, setCoins] = useState<number>(() => loadCoinBalance());
  const [coinState, setCoinState] = useState<ColorDebtState | null>(null);
  const [coinSelected, setCoinSelected] = useState<number | null>(null);
  const [nickname, setNicknameState] = useState<string>(() => getNickname());
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const coinRoundSettledRef = useRef(false);
  const [lastCoinDelta, setLastCoinDelta] = useState(0);

  function startCoinRound() {
    const coinSeed = rollCoinSeed();
    coinRngRef.current = createRng(coinSeed + 31337);
    coinRoundSettledRef.current = false;
    setCoinSelected(null);
    setCoinState(createInitialState(coinSeed));
  }

  function handleCoinClick(i: number) {
    if (!coinState || coinState.won || coinState.lost) return;
    const cell = coinState.grid[i];
    if (cell?.kind === 'bad') return;

    if (coinSelected === null) {
      setCoinSelected(i);
      return;
    }
    if (coinSelected === i) {
      setCoinSelected(null);
      return;
    }
    if (isAdjacent(coinSelected, i)) {
      setCoinState((prev) => (prev ? trySwap(prev, coinSelected, i, coinRngRef.current) : prev));
      setCoinSelected(null);
    } else {
      setCoinSelected(i);
    }
  }

  useEffect(() => {
    if (!coinState || coinRoundSettledRef.current) return;
    if (!coinState.won && !coinState.lost) return;
    coinRoundSettledRef.current = true;

    const delta = computeCoinDelta({ won: coinState.won, movesUsed: coinState.movesUsed, movesLimit: MOVES_LIMIT });
    setLastCoinDelta(delta);
    setCoins((prev) => {
      const next = Math.max(0, prev + delta);
      saveCoinBalance(next);
      if (nickname) submitScore(GLOBAL_LEADERBOARD_SLUG, nickname, next);
      return next;
    });
  }, [coinState, nickname]);

  function handleSaveNickname(name: string) {
    saveNickname(name);
    setNicknameState(name);
  }

  return (
    <div>
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.movesUsed} movesLimit={MOVES_LIMIT} />

      <GridView state={state} selected={selected} onTap={handleClick} disabled={dailyFinished} />

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug={GAME_SLUG}
        gameName="Color Debt"
        puzzleNumber={puzzleNumber}
        won={state.won}
        moves={state.movesUsed}
        movesLimit={MOVES_LIMIT}
        score={state.score}
        streak={streak}
      />

      <CoinModeSection
        coins={coins}
        nickname={nickname}
        onSaveNickname={handleSaveNickname}
        roundActive={!!coinState}
        roundFinished={!!coinState && (coinState.won || coinState.lost)}
        roundWon={!!coinState?.won}
        lastDelta={lastCoinDelta}
        onStart={startCoinRound}
        onShowLeaderboard={() => setShowLeaderboard(true)}
      >
        {coinState && (
          <GridView state={coinState} selected={coinSelected} onTap={handleCoinClick} disabled={coinState.won || coinState.lost} />
        )}
      </CoinModeSection>

      {showLeaderboard && <CoinLeaderboard onClose={() => setShowLeaderboard(false)} />}
    </div>
  );
}
