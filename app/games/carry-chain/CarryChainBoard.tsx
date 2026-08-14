'use client';

import { useEffect, useRef, useState } from 'react';
import { createInitialState, applyMerge, MERGE_BUDGET, type CarryChainState } from '@/lib/games/carry-chain';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { CoinLeaderboard } from '@/components/CoinLeaderboard';
import { CoinModeSection } from '@/components/CoinModeSection';
import { GAMES } from '@/lib/games/registry';
import { loadCoinBalance, saveCoinBalance, rollCoinSeed, computeCoinDelta, GLOBAL_LEADERBOARD_SLUG } from '@/lib/coin-mode';
import { scaleLimit, type Difficulty } from '@/lib/difficulty';
import { getNickname, saveNickname, submitScore } from '@/lib/leaderboard-client';

const GAME_SLUG = 'carry-chain';

/** Token row UI, shared by the daily puzzle and Coin Mode rounds. */
function RowView({
  state,
  selected,
  onTap,
  disabled,
}: {
  state: CarryChainState;
  selected: number | null;
  onTap: (i: number) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex items-center justify-center gap-1.5 mb-4 flex-wrap py-4">
      {state.row.map((value, i) => (
        <button
          key={i}
          onClick={() => onTap(i)}
          disabled={disabled}
          aria-label={`Token ${value}`}
          className={[
            'w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center font-mono font-bold text-base sm:text-lg border-2 border-graphite dark:border-white/80 transition-transform',
            selected === i ? 'bg-carry text-white scale-90' : 'bg-carry-soft text-graphite dark:bg-carry/20 dark:text-white',
          ].join(' ')}
        >
          {value}
        </button>
      ))}
    </div>
  );
}

export function CarryChainBoard({ seed, dateString, puzzleNumber }: { seed: number; dateString: string; puzzleNumber: number }) {
  const game = GAMES.find((g) => g.slug === GAME_SLUG)!;

  // --- Daily puzzle (unchanged behavior) ---
  const [state, setState] = useState<CarryChainState>(() => createInitialState(seed));
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);

  function handleTap(i: number) {
    if (state.won || state.lost) return;
    if (selected === null) {
      setSelected(i);
      return;
    }
    if (selected === i) {
      setSelected(null);
      return;
    }
    if (Math.abs(selected - i) === 1) {
      const left = Math.min(selected, i);
      setState((prev) => applyMerge(prev, left));
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
        moves: state.mergesUsed,
        score: state.total,
        elapsedMs: 0,
      });
      setStreak(getStreak(GAME_SLUG).current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.mergesUsed, state.total, dateString]);

  const dailyFinished = state.won || state.lost;

  // --- Coin Mode: unlimited replay once today's puzzle is done. Balance
  // and leaderboard are global — shared across every game on the site. ---
  const [coins, setCoins] = useState<number>(() => loadCoinBalance());
  const [coinState, setCoinState] = useState<CarryChainState | null>(null);
  const [coinSelected, setCoinSelected] = useState<number | null>(null);
  const [nickname, setNicknameState] = useState<string>(() => getNickname());
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const coinRoundSettledRef = useRef(false);
  const [lastCoinDelta, setLastCoinDelta] = useState(0);

  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const coinBudgetRef = useRef(MERGE_BUDGET);

  function startCoinRound() {
    coinRoundSettledRef.current = false;
    coinBudgetRef.current = scaleLimit(MERGE_BUDGET, difficulty);
    setCoinSelected(null);
    setCoinState(createInitialState(rollCoinSeed()));
  }

  function handleCoinTap(i: number) {
    if (!coinState || coinState.won || coinState.lost) return;
    if (coinSelected === null) {
      setCoinSelected(i);
      return;
    }
    if (coinSelected === i) {
      setCoinSelected(null);
      return;
    }
    if (Math.abs(coinSelected - i) === 1) {
      const left = Math.min(coinSelected, i);
      setCoinState((prev) => (prev ? applyMerge(prev, left, coinBudgetRef.current) : prev));
      setCoinSelected(null);
    } else {
      setCoinSelected(i);
    }
  }

  useEffect(() => {
    if (!coinState || coinRoundSettledRef.current) return;
    if (!coinState.won && !coinState.lost) return;
    coinRoundSettledRef.current = true;

    const delta = computeCoinDelta({
      won: coinState.won,
      movesUsed: coinState.mergesUsed,
      movesLimit: coinBudgetRef.current,
      difficulty,
    });
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
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.mergesUsed} movesLimit={MERGE_BUDGET} />

      <div className="stat-line flex justify-between text-ink/50 dark:text-white/40 mb-3">
        <span>
          Total: <span className="font-mono text-lg text-ink dark:text-white">{state.total}</span>
        </span>
        <span>
          Target: <span className="font-mono text-lg text-ink dark:text-white">{state.target}</span>
        </span>
      </div>

      <RowView state={state} selected={selected} onTap={handleTap} disabled={dailyFinished} />

      <p className="stat-line text-ink/50 dark:text-white/40 text-center">
        {selected === null
          ? 'Tap a token, then tap its neighbor to merge them.'
          : 'Tap the token next to it to merge — or tap it again to deselect.'}
      </p>

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug={GAME_SLUG}
        gameName="Carry Chain"
        puzzleNumber={puzzleNumber}
        won={state.won}
        moves={state.mergesUsed}
        movesLimit={MERGE_BUDGET}
        score={state.total}
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
        {coinState && (
          <>
            <div className="stat-line flex justify-between text-ink/50 dark:text-white/40 mb-3">
              <span>
                Total: <span className="font-mono text-lg text-ink dark:text-white">{coinState.total}</span>
              </span>
              <span>
                Target: <span className="font-mono text-lg text-ink dark:text-white">{coinState.target}</span>
              </span>
            </div>
            <RowView state={coinState} selected={coinSelected} onTap={handleCoinTap} disabled={coinState.won || coinState.lost} />
          </>
        )}
      </CoinModeSection>

      {showLeaderboard && <CoinLeaderboard onClose={() => setShowLeaderboard(false)} />}
    </div>
  );
}
