'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createInitialState,
  fillJug,
  emptyJug,
  pourJug,
  JUG_COUNT,
  type DecantState,
} from '@/lib/games/decant';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { GAMES } from '@/lib/games/registry';

const JUG_LABELS = ['A', 'B', 'C'];

export function DecantBoard({
  seed,
  dateString,
  puzzleNumber,
}: {
  seed: number;
  dateString: string;
  puzzleNumber: number;
}) {
  const game = GAMES.find((g) => g.slug === 'decant')!;
  const [state, setState] = useState<DecantState>(() => createInitialState(seed));
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if ((state.won || state.lost) && !finishedRef.current) {
      finishedRef.current = true;
      recordResult('decant', {
        date: dateString,
        won: state.won,
        moves: state.movesUsed,
        score: state.optimalMoves,
        elapsedMs: 0,
      });
      setStreak(getStreak('decant').current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.movesUsed, state.optimalMoves, dateString]);

  return (
    <div>
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.movesUsed} movesLimit={state.moveLimit} />

      <p className="stat-line text-center text-ink/50 dark:text-white/40 mb-5">
        Get exactly <span className="font-mono text-lg text-ink dark:text-white">{state.target}</span> in any jug
      </p>

      <div className="flex justify-center gap-6 mb-6">
        {state.amounts.map((amount, i) => {
          const capacity = state.capacities[i];
          const pct = (amount / capacity) * 100;
          const isTarget = amount === state.target;
          return (
            <div key={i} className="flex flex-col items-center gap-2">
              <p className="stat-line text-ink/40 dark:text-white/30">
                JUG {JUG_LABELS[i]} · {capacity}L
              </p>
              <div className="w-16 h-32 rounded-b-lg border-2 border-graphite dark:border-white/70 relative overflow-hidden bg-index dark:bg-index-dark">
                <div
                  className={`absolute bottom-0 left-0 w-full transition-all ${isTarget ? 'bg-decant' : 'bg-decant/60'}`}
                  style={{ height: `${pct}%` }}
                />
              </div>
              <p className="font-mono text-sm font-semibold">{amount}L</p>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setState((s) => fillJug(s, i))}
                  disabled={state.won || state.lost || amount === capacity}
                  className="stat-line border-2 border-graphite dark:border-white/70 rounded px-2 py-1 disabled:opacity-30"
                >
                  Fill
                </button>
                <button
                  onClick={() => setState((s) => emptyJug(s, i))}
                  disabled={state.won || state.lost || amount === 0}
                  className="stat-line border-2 border-graphite dark:border-white/70 rounded px-2 py-1 disabled:opacity-30"
                >
                  Empty
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="stat-line text-ink/40 dark:text-white/30 mb-2 text-center">POUR</p>
      <div className="grid grid-cols-3 gap-2 mb-5 max-w-xs mx-auto">
        {Array.from({ length: JUG_COUNT }).flatMap((_, from) =>
          Array.from({ length: JUG_COUNT }).map((_, to) => {
            if (from === to) return <div key={`${from}-${to}`} />;
            const disabled =
              state.won || state.lost || state.amounts[from] === 0 || state.amounts[to] === state.capacities[to];
            return (
              <button
                key={`${from}-${to}`}
                onClick={() => setState((s) => pourJug(s, from, to))}
                disabled={disabled}
                className="stat-line border-2 border-graphite dark:border-white/70 rounded px-2 py-1.5 disabled:opacity-30"
              >
                {JUG_LABELS[from]} → {JUG_LABELS[to]}
              </button>
            );
          })
        )}
      </div>

      <p className="stat-line text-center text-ink/40 dark:text-white/30">
        Fill from an unlimited tap, empty completely, or pour until the source is empty or the destination is full.
      </p>

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug="decant"
        gameName={game.name}
        puzzleNumber={puzzleNumber}
        won={state.won}
        moves={state.movesUsed}
        movesLimit={state.moveLimit}
        score={state.optimalMoves}
        streak={streak}
      />
    </div>
  );
}
