'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createInitialState,
  selectVehicle,
  moveSelectedTo,
  vehicleCells,
  GRID_SIZE,
  EXIT_ROW,
  type ClearwayState,
} from '@/lib/games/clearway';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { GAMES } from '@/lib/games/registry';

export function ClearwayBoard({
  seed,
  dateString,
  puzzleNumber,
}: {
  seed: number;
  dateString: string;
  puzzleNumber: number;
}) {
  const game = GAMES.find((g) => g.slug === 'clearway')!;
  const [state, setState] = useState<ClearwayState>(() => createInitialState(seed));
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if ((state.won || state.lost) && !finishedRef.current) {
      finishedRef.current = true;
      recordResult('clearway', {
        date: dateString,
        won: state.won,
        moves: state.movesUsed,
        score: state.moveLimit,
        elapsedMs: 0,
      });
      setStreak(getStreak('clearway').current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.movesUsed, state.moveLimit, dateString]);

  const cellOwner = new Map<string, number>();
  for (const v of state.vehicles) {
    for (const { row, col } of vehicleCells(v)) cellOwner.set(`${row},${col}`, v.id);
  }

  function handleCellTap(row: number, col: number) {
    const owner = cellOwner.get(`${row},${col}`);
    if (state.selectedId !== null && owner === undefined) {
      setState((s) => moveSelectedTo(s, row, col));
    } else if (owner !== undefined) {
      setState((s) => selectVehicle(s, owner));
    }
  }

  return (
    <div>
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.movesUsed} movesLimit={state.moveLimit} />

      <p className="stat-line text-center text-ink/50 dark:text-white/40 mb-4">
        Get the marked vehicle to the right edge of its row
      </p>

      <div
        className="grid gap-1 mx-auto mb-5 relative"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
          maxWidth: 340,
        }}
      >
        {Array.from({ length: GRID_SIZE }).flatMap((_, row) =>
          Array.from({ length: GRID_SIZE }).map((_, col) => {
            const ownerId = cellOwner.get(`${row},${col}`);
            const vehicle = ownerId !== undefined ? state.vehicles.find((v) => v.id === ownerId) : undefined;
            const isSelected = vehicle && state.selectedId === vehicle.id;
            const isExitCell = row === EXIT_ROW && col === GRID_SIZE - 1;

            return (
              <button
                key={`${row}-${col}`}
                onClick={() => handleCellTap(row, col)}
                disabled={state.won || state.lost}
                className="aspect-square rounded-sm relative"
                style={{
                  background: vehicle
                    ? vehicle.isTarget
                      ? '#C6432E'
                      : isSelected
                        ? '#2D7DA855'
                        : '#8A97A6'
                    : '#EEF0F2',
                  border: isSelected ? '2px solid #2D7DA8' : '1px solid #d8dce0',
                  outline: isExitCell ? '2px dashed #4CAF7D' : 'none',
                  outlineOffset: '-2px',
                }}
              />
            );
          })
        )}
      </div>

      <p className="stat-line text-center text-ink/40 dark:text-white/30">
        Tap the red vehicle, then tap an empty cell in its row to slide it. Tap other vehicles to move
        them out of the way {'\u2014'} they can only slide along their own orientation.
      </p>

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug="clearway"
        gameName={game.name}
        puzzleNumber={puzzleNumber}
        won={state.won}
        moves={state.movesUsed}
        movesLimit={state.moveLimit}
        score={state.moveLimit}
        streak={streak}
      />
    </div>
  );
}
