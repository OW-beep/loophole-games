'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createInitialState, resolveCell, canResolve,
  GRID_SIZE, type SignalState,
} from '@/lib/games/signal';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { GAMES } from '@/lib/games/registry';

const TOTAL = GRID_SIZE * GRID_SIZE;

export function SignalBoard({ seed, dateString, puzzleNumber }: { seed: number; dateString: string; puzzleNumber: number }) {
  const game = GAMES.find(g => g.slug === 'signal')!;
  const [state, setState] = useState<SignalState>(() => createInitialState(seed));
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);

  function handleTap(i: number) {
    if (state.won || state.lost) return;
    setState(prev => resolveCell(prev, i));
  }

  useEffect(() => {
    if ((state.won || state.lost) && !finishedRef.current) {
      finishedRef.current = true;
      recordResult('signal', {
        date: dateString,
        won: state.won,
        moves: state.movesUsed,
        score: state.resolved.filter(Boolean).length,
        elapsedMs: 0,
      });
      setStreak(getStreak('signal').current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.movesUsed, state.resolved, dateString]);

  const resolvedCount = state.resolved.filter(Boolean).length;

  return (
    <div>
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.movesUsed} movesLimit={TOTAL} />

      <div className="stat-line flex justify-between text-ink/50 dark:text-white/40 mb-3">
        <span>Resolved: <span className="font-mono text-ink dark:text-white">{resolvedCount}</span> / {TOTAL}</span>
        {state.lost && <span className="text-debt">No moves available</span>}
      </div>

      <div
        className="grid gap-1 mb-5 bg-index/30 dark:bg-index-dark/30 p-1.5 border-2 border-graphite dark:border-white/80"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
      >
        {state.values.map((value, i) => {
          const isResolved = state.resolved[i];
          const isReady = !isResolved && canResolve(state.values, state.resolved, i);
          return (
            <button
              key={i}
              onClick={() => handleTap(i)}
              disabled={!isReady || state.won || state.lost}
              aria-label={isResolved ? `Cell resolved` : `Cell needs ${value} resolved neighbors`}
              className={[
                'aspect-square flex items-center justify-center font-mono font-bold text-lg border-2 transition-all',
                isResolved
                  ? 'bg-oneline text-white border-oneline'
                  : isReady
                  ? 'bg-oneline-soft text-oneline dark:bg-oneline/20 dark:text-white border-oneline cursor-pointer scale-95'
                  : 'bg-panel dark:bg-panel-dark text-ink/40 dark:text-white/30 border-index dark:border-index-dark',
              ].join(' ')}
            >
              {isResolved ? '✓' : value}
            </button>
          );
        })}
      </div>

      <p className="stat-line text-ink/50 dark:text-white/40 text-center">
        Highlighted cells are ready to resolve. The number shows how many resolved neighbors it needs.
      </p>

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug="signal"
        gameName="Signal"
        puzzleNumber={puzzleNumber}
        won={state.won}
        moves={state.movesUsed}
        movesLimit={TOTAL}
        score={resolvedCount}
        streak={streak}
      />
    </div>
  );
}
