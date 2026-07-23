'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createInitialState,
  guessNext,
  GRID_SIZE,
  CELL_COUNT,
  MOVE_BUDGET,
  type WaypointState,
} from '@/lib/games/waypoint';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { GAMES } from '@/lib/games/registry';

export function WaypointBoard({
  seed,
  dateString,
  puzzleNumber,
}: {
  seed: number;
  dateString: string;
  puzzleNumber: number;
}) {
  const game = GAMES.find((g) => g.slug === 'waypoint')!;
  const [state, setState] = useState<WaypointState>(() => createInitialState(seed));
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if ((state.won || state.lost) && !finishedRef.current) {
      finishedRef.current = true;
      recordResult('waypoint', {
        date: dateString,
        won: state.won,
        moves: state.movesUsed,
        score: state.current,
        elapsedMs: 0,
      });
      setStreak(getStreak('waypoint').current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.movesUsed, state.current, dateString]);

  useEffect(() => {
    if (state.lastWrongCell === null) return;
    const t = setTimeout(() => {
      setState((s) => (s.lastWrongCell === null ? s : { ...s, lastWrongCell: null }));
    }, 350);
    return () => clearTimeout(t);
  }, [state.lastWrongCell]);

  return (
    <div>
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.movesUsed} movesLimit={MOVE_BUDGET} />

      <p className="stat-line text-ink/50 dark:text-white/40 mb-4">
        Filled {state.current} / {CELL_COUNT} · next up:{' '}
        <span className="font-mono text-ink dark:text-white">{state.current + 1 <= CELL_COUNT ? state.current + 1 : '—'}</span>
      </p>

      <div
        className="grid gap-1.5 mb-5 max-w-sm mx-auto"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: CELL_COUNT }).map((_, cellIndex) => {
          const value = state.filled.get(cellIndex);
          const isClue = state.clueValues.has(cellIndex);
          const isCurrentHead = value === state.current && value !== undefined;
          const isWrongFlash = state.lastWrongCell === cellIndex;

          return (
            <button
              key={cellIndex}
              onClick={() => setState((s) => guessNext(s, cellIndex))}
              disabled={state.won || state.lost || value !== undefined}
              className={[
                'aspect-square rounded-md border-2 flex items-center justify-center font-mono text-sm font-semibold transition-colors',
                isWrongFlash
                  ? 'border-debt bg-debt/20'
                  : isCurrentHead
                    ? 'border-waypoint bg-waypoint-soft dark:bg-waypoint/20'
                    : isClue
                      ? 'border-graphite dark:border-white/70 bg-index dark:bg-index-dark'
                      : 'border-graphite/40 dark:border-white/30',
              ].join(' ')}
            >
              {value ?? ''}
            </button>
          );
        })}
      </div>

      <p className="stat-line text-center text-ink/40 dark:text-white/30">
        Tap the cell adjacent to your current number to continue the path. Fixed numbers (shaded) can&rsquo;t move.
      </p>

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug="waypoint"
        gameName={game.name}
        puzzleNumber={puzzleNumber}
        won={state.won}
        moves={state.movesUsed}
        movesLimit={MOVE_BUDGET}
        score={state.current}
        streak={streak}
      />
    </div>
  );
}
