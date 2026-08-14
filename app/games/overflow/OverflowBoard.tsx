'use client';

import { useEffect, useRef, useState } from 'react';
import { createInitialState, tapCell, GRID_SIZE, TAP_BUDGET, type OverflowState } from '@/lib/games/overflow';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { CoinLeaderboard } from '@/components/CoinLeaderboard';
import { CoinModeSection } from '@/components/CoinModeSection';
import { GAMES } from '@/lib/games/registry';
import { loadCoinBalance, saveCoinBalance, rollCoinSeed, computeCoinDelta, GLOBAL_LEADERBOARD_SLUG } from '@/lib/coin-mode';
import { scaleLimit, type Difficulty } from '@/lib/difficulty';
import { getNickname, saveNickname, submitScore } from '@/lib/leaderboard-client';

const GAME_SLUG = 'overflow';

function GridView({ state, onTap, disabled }: { state: OverflowState; onTap: (i: number) => void; disabled: boolean }) {
  const [toast, setToast] = useState<string | null>(null);

  function handleTap(i: number) {
    onTap(i);
  }

  useEffect(() => {
    if (state.lastChainSize >= 3) {
      setToast(`Chain ×${state.lastChainSize}!`);
      const t = setTimeout(() => setToast(null), 1200);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.tapsUsed]);

  return (
    <div>
      <div className="stat-line flex justify-between text-ink/50 dark:text-white/40 mb-3">
        <span>
          Score: <span className="font-mono text-lg text-ink dark:text-white">{state.score}</span> / {state.target}
        </span>
        <span>
          Taps left: <span className="font-mono text-ink dark:text-white">{TAP_BUDGET - state.tapsUsed}</span>
        </span>
      </div>
      <div className="relative">
        <div
          className="grid gap-1 mb-4 bg-index/30 dark:bg-index-dark/30 p-1.5 border-2 border-graphite dark:border-white/80"
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
        >
          {state.cells.map((cell, i) => {
            if (!cell) return <div key={i} className="aspect-square bg-panel dark:bg-panel-dark" />;
            const isAlmost = cell.level === cell.capacity - 1;
            return (
              <button
                key={i}
                onClick={() => handleTap(i)}
                disabled={disabled}
                className={[
                  'aspect-square flex flex-col items-center justify-center font-mono border-2 transition-colors',
                  isAlmost
                    ? 'bg-overflow text-white border-graphite dark:border-white/80 animate-pulse'
                    : 'bg-overflow-soft text-graphite dark:bg-overflow/20 dark:text-white border-index dark:border-index-dark',
                ].join(' ')}
              >
                <span className="text-xs font-bold leading-none">{cell.level}</span>
                <span className="text-[9px] opacity-60">/{cell.capacity}</span>
              </button>
            );
          })}
        </div>
        {toast && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-overflow text-white stat-line px-3 py-1.5 animate-punch-pop">
            {toast}
          </div>
        )}
      </div>
      <p className="stat-line text-ink/50 dark:text-white/40 text-center">
        Tap a cell to add a drop. Pulsing cells are about to overflow.
      </p>
    </div>
  );
}

export function OverflowBoard({ seed, dateString, puzzleNumber }: { seed: number; dateString: string; puzzleNumber: number }) {
  const game = GAMES.find((g) => g.slug === GAME_SLUG)!;

  // --- Daily puzzle (unchanged behavior) ---
  const [state, setState] = useState<OverflowState>(() => createInitialState(seed));
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);

  function handleTap(i: number) {
    if (state.won || state.lost) return;
    setState((prev) => tapCell(prev, i));
  }

  useEffect(() => {
    if ((state.won || state.lost) && !finishedRef.current) {
      finishedRef.current = true;
      recordResult(GAME_SLUG, { date: dateString, won: state.won, moves: state.tapsUsed, score: state.score, elapsedMs: 0 });
      setStreak(getStreak(GAME_SLUG).current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.tapsUsed, state.score, dateString]);

  const dailyFinished = state.won || state.lost;

  // --- Coin Mode ---
  const [coins, setCoins] = useState<number>(() => loadCoinBalance());
  const [coinState, setCoinState] = useState<OverflowState | null>(null);
  const [nickname, setNicknameState] = useState<string>(() => getNickname());
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const coinRoundSettledRef = useRef(false);
  const [lastCoinDelta, setLastCoinDelta] = useState(0);

  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const coinBudgetRef = useRef(TAP_BUDGET);

  function startCoinRound() {
    coinRoundSettledRef.current = false;
    coinBudgetRef.current = scaleLimit(TAP_BUDGET, difficulty);
    setCoinState(createInitialState(rollCoinSeed()));
  }

  function handleCoinTap(i: number) {
    if (!coinState || coinState.won || coinState.lost) return;
    setCoinState((prev) => (prev ? tapCell(prev, i, coinBudgetRef.current) : prev));
  }

  useEffect(() => {
    if (!coinState || coinRoundSettledRef.current) return;
    if (!coinState.won && !coinState.lost) return;
    coinRoundSettledRef.current = true;

    const delta = computeCoinDelta({ won: coinState.won, movesUsed: coinState.tapsUsed, movesLimit: coinBudgetRef.current, difficulty });
    setLastCoinDelta(delta);
    setCoins((prev) => {
      const next = Math.max(0, prev + delta);
      saveCoinBalance(next);
      if (nickname) submitScore(GLOBAL_LEADERBOARD_SLUG, nickname, next);
      return next;
    });
  }, [coinState, nickname, difficulty]);

  function handleSaveNickname(name: string) {
    saveNickname(name);
    setNicknameState(name);
  }

  return (
    <div>
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.tapsUsed} movesLimit={TAP_BUDGET} />

      <GridView state={state} onTap={handleTap} disabled={dailyFinished} />

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug={GAME_SLUG}
        gameName="Overflow"
        puzzleNumber={puzzleNumber}
        won={state.won}
        moves={state.tapsUsed}
        movesLimit={TAP_BUDGET}
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
        onDifficultyChange={setDifficulty}
      >
        {coinState && <GridView state={coinState} onTap={handleCoinTap} disabled={coinState.won || coinState.lost} />}
      </CoinModeSection>

      {showLeaderboard && <CoinLeaderboard onClose={() => setShowLeaderboard(false)} />}
    </div>
  );
}
