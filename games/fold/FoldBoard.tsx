'use client';

import { useEffect, useRef, useState } from 'react';
import { createInitialState, applyFold, FOLD_BUDGET, type FoldState } from '@/lib/games/fold';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { GAMES } from '@/lib/games/registry';

export function FoldBoard({ seed, dateString, puzzleNumber }: { seed: number; dateString: string; puzzleNumber: number }) {
  const game = GAMES.find((g) => g.slug === 'fold')!;
  const [state, setState] = useState<FoldState>(() => createInitialState(seed));
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);

  function handleCrease(creaseIndex: number) {
    if (state.won || state.lost) return;
    setState((prev) => applyFold(prev, creaseIndex));
  }

  useEffect(() => {
    if ((state.won || state.lost) && !finishedRef.current) {
      finishedRef.current = true;
      recordResult('fold', {
        date: dateString,
        won: state.won,
        moves: state.foldsUsed,
        score: state.target,
        elapsedMs: 0,
      });
      setStreak(getStreak('fold').current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.foldsUsed, state.target, dateString]);

  return (
    <div>
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.foldsUsed} movesLimit={FOLD_BUDGET} />

      <div className="stat-line flex justify-between text-ink/50 dark:text-white/40 mb-6">
        <span>
          Target: <span className="font-mono text-lg text-ink dark:text-white">{state.target}</span>
        </span>
        <span>
          Cells: <span className="font-mono text-ink dark:text-white">{state.strip.length}</span>
        </span>
      </div>

      <div className="flex items-center justify-center gap-0 mb-8 overflow-x-auto py-4">
        {state.strip.map((value, i) => (
          <div key={i} className="flex items-center">
            <div
              className={[
                'w-10 h-14 sm:w-12 sm:h-16 flex items-center justify-center font-mono font-bold text-sm sm:text-base shrink-0 border-2 border-graphite dark:border-white/80',
                value === state.target ? 'bg-fold text-white' : 'bg-fold-soft text-graphite dark:bg-fold/20 dark:text-white',
              ].join(' ')}
            >
              {value}
            </div>
            {i < state.strip.length - 1 && (
              <button
                onClick={() => handleCrease(i + 1)}
                disabled={state.won || state.lost}
                aria-label={`Fold here, between cell ${i + 1} and ${i + 2}`}
                className="w-5 h-14 sm:h-16 flex items-center justify-center shrink-0 group disabled:opacity-30"
              >
                <span className="w-px h-full border-l-2 border-dashed border-fold group-hover:border-graphite dark:group-hover:border-white transition-colors" />
              </button>
            )}
          </div>
        ))}
      </div>

      <p className="stat-line text-ink/50 dark:text-white/40 text-center">
        Tap between two cells to fold the strip there.
      </p>

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug="fold"
        gameName="Fold"
        puzzleNumber={puzzleNumber}
        won={state.won}
        moves={state.foldsUsed}
        movesLimit={FOLD_BUDGET}
        score={state.target}
        streak={streak}
      />
    </div>
  );
}
