'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createInitialState,
  applySplice,
  STRAND_LENGTH,
  SWAP_BUDGET,
  type SpliceState,
} from '@/lib/games/splice';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { CoinLeaderboard } from '@/components/CoinLeaderboard';
import { CoinModeSection } from '@/components/CoinModeSection';
import { GAMES } from '@/lib/games/registry';
import { loadCoinBalance, saveCoinBalance, rollCoinSeed, computeCoinDelta, GLOBAL_LEADERBOARD_SLUG } from '@/lib/coin-mode';
import { scaleLimit, type Difficulty } from '@/lib/difficulty';
import { getNickname, saveNickname, submitScore } from '@/lib/leaderboard-client';

const GAME_SLUG = 'splice';

function cellClass(value: number, col: number, isTop: boolean, rangeStart: number | null): string {
  const correct = isTop ? value <= STRAND_LENGTH : value > STRAND_LENGTH;
  const isRangeStart = rangeStart === col;
  const base =
    'w-10 h-12 sm:w-12 sm:h-14 flex items-center justify-center font-mono font-bold text-sm sm:text-base border-2 transition-colors';
  if (isRangeStart) return `${base} bg-splice text-white border-graphite dark:border-white/80`;
  if (correct) return `${base} bg-splice-soft text-graphite dark:bg-splice/15 dark:text-white border-index dark:border-index-dark`;
  return `${base} bg-panel dark:bg-panel-dark text-ink dark:text-white border-splice`;
}

/** The two-strand board, shared by the daily puzzle and Coin Mode rounds. */
function StrandView({
  state,
  rangeStart,
  onTap,
  disabled,
}: {
  state: SpliceState;
  rangeStart: number | null;
  onTap: (col: number) => void;
  disabled: boolean;
}) {
  return (
    <div>
      <div className="flex flex-col gap-1.5 items-center mb-4">
        <div className="flex gap-1.5">
          {state.top.map((v, i) => (
            <button key={i} onClick={() => onTap(i)} disabled={disabled} className={cellClass(v, i, true, rangeStart)}>
              {v}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: STRAND_LENGTH }, (_, i) => (
            <div key={i} className="w-10 sm:w-12 h-3 flex items-center justify-center">
              <span className="text-ink/30 dark:text-white/20 text-xs">↕</span>
            </div>
          ))}
        </div>
        <div className="flex gap-1.5">
          {state.bottom.map((v, i) => (
            <button key={i} onClick={() => onTap(i)} disabled={disabled} className={cellClass(v, i, false, rangeStart)}>
              {v}
            </button>
          ))}
        </div>
      </div>
      <p className="stat-line text-ink/50 dark:text-white/40 text-center">
        {rangeStart === null
          ? 'Tap a column to start a splice range.'
          : 'Tap the column where the range ends — both strands swap across it.'}
      </p>
    </div>
  );
}

export function SpliceBoard({ seed, dateString, puzzleNumber }: { seed: number; dateString: string; puzzleNumber: number }) {
  const game = GAMES.find((g) => g.slug === GAME_SLUG)!;

  // --- Daily puzzle (unchanged behavior) ---
  const [state, setState] = useState<SpliceState>(() => createInitialState(seed));
  const [rangeStart, setRangeStart] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);

  function handleColumnTap(col: number) {
    if (state.won || state.lost) return;
    if (rangeStart === null) {
      setRangeStart(col);
      return;
    }
    setState((prev) => applySplice(prev, rangeStart, col));
    setRangeStart(null);
  }

  useEffect(() => {
    if ((state.won || state.lost) && !finishedRef.current) {
      finishedRef.current = true;
      recordResult(GAME_SLUG, {
        date: dateString,
        won: state.won,
        moves: state.swapsUsed,
        score: 0,
        elapsedMs: 0,
      });
      setStreak(getStreak(GAME_SLUG).current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.swapsUsed, dateString]);

  const dailyFinished = state.won || state.lost;

  // --- Coin Mode: unlimited replay once today's puzzle is done. Balance
  // and leaderboard are global — shared across every game on the site. ---
  const [coins, setCoins] = useState<number>(() => loadCoinBalance());
  const [coinState, setCoinState] = useState<SpliceState | null>(null);
  const [coinRangeStart, setCoinRangeStart] = useState<number | null>(null);
  const [nickname, setNicknameState] = useState<string>(() => getNickname());
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const coinRoundSettledRef = useRef(false);
  const [lastCoinDelta, setLastCoinDelta] = useState(0);

  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const coinBudgetRef = useRef(SWAP_BUDGET);

  function startCoinRound() {
    coinRoundSettledRef.current = false;
    coinBudgetRef.current = scaleLimit(SWAP_BUDGET, difficulty);
    setCoinRangeStart(null);
    setCoinState(createInitialState(rollCoinSeed()));
  }

  function handleCoinColumnTap(col: number) {
    if (!coinState || coinState.won || coinState.lost) return;
    if (coinRangeStart === null) {
      setCoinRangeStart(col);
      return;
    }
    setCoinState((prev) => (prev ? applySplice(prev, coinRangeStart, col, coinBudgetRef.current) : prev));
    setCoinRangeStart(null);
  }

  useEffect(() => {
    if (!coinState || coinRoundSettledRef.current) return;
    if (!coinState.won && !coinState.lost) return;
    coinRoundSettledRef.current = true;

    const delta = computeCoinDelta({
      won: coinState.won,
      movesUsed: coinState.swapsUsed,
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
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.swapsUsed} movesLimit={SWAP_BUDGET} />

      <p className="stat-line text-ink/50 dark:text-white/40 mb-4 text-center">
        Top strand should hold 1–8. Bottom strand should hold 9–16.
      </p>

      <StrandView state={state} rangeStart={rangeStart} onTap={handleColumnTap} disabled={dailyFinished} />

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug={GAME_SLUG}
        gameName="Splice"
        puzzleNumber={puzzleNumber}
        won={state.won}
        moves={state.swapsUsed}
        movesLimit={SWAP_BUDGET}
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
          <StrandView
            state={coinState}
            rangeStart={coinRangeStart}
            onTap={handleCoinColumnTap}
            disabled={coinState.won || coinState.lost}
          />
        )}
      </CoinModeSection>

      {showLeaderboard && <CoinLeaderboard onClose={() => setShowLeaderboard(false)} />}
    </div>
  );
}
