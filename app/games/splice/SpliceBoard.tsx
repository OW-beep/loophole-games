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
import { GAMES } from '@/lib/games/registry';

export function SpliceBoard({ seed, dateString, puzzleNumber }: { seed: number; dateString: string; puzzleNumber: number }) {
  const game = GAMES.find((g) => g.slug === 'splice')!;
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
      recordResult('splice', {
        date: dateString,
        won: state.won,
        moves: state.swapsUsed,
        score: 0,
        elapsedMs: 0,
      });
      setStreak(getStreak('splice').current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.swapsUsed, dateString]);

  function cellClass(value: number, col: number, isTop: boolean): string {
    const correct = isTop ? value <= STRAND_LENGTH : value > STRAND_LENGTH;
    const isRangeStart = rangeStart === col;
    const base = 'w-10 h-12 sm:w-12 sm:h-14 flex items-center justify-center font-mono font-bold text-sm sm:text-base border-2 transition-colors';
    if (isRangeStart) return `${base} bg-splice text-white border-graphite dark:border-white/80`;
    if (correct) return `${base} bg-splice-soft text-graphite dark:bg-splice/15 dark:text-white border-index dark:border-index-dark`;
    return `${base} bg-panel dark:bg-panel-dark text-ink dark:text-white border-splice`;
  }

  return (
    <div>
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.swapsUsed} movesLimit={SWAP_BUDGET} />

      <p className="stat-line text-ink/50 dark:text-white/40 mb-4 text-center">
        Top strand should hold 1–8. Bottom strand should hold 9–16.
      </p>

      <div className="flex flex-col gap-1.5 items-center mb-6">
        <div className="flex gap-1.5">
          {state.top.map((v, i) => (
            <button key={i} onClick={() => handleColumnTap(i)} disabled={state.won || state.lost} className={cellClass(v, i, true)}>
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
            <button key={i} onClick={() => handleColumnTap(i)} disabled={state.won || state.lost} className={cellClass(v, i, false)}>
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

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug="splice"
        gameName="Splice"
        puzzleNumber={puzzleNumber}
        won={state.won}
        moves={state.swapsUsed}
        movesLimit={SWAP_BUDGET}
        streak={streak}
      />
    </div>
  );
}
