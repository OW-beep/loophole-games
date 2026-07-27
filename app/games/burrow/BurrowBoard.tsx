'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createInitialState,
  stepTo,
  canStepTo,
  cellKey,
  gridNeighbors,
  GRID_ROWS,
  GRID_COLS,
  type BurrowState,
  type Cell,
} from '@/lib/games/burrow';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { GAMES } from '@/lib/games/registry';

const CHARACTER = '\u{1F994}'; // 🦔 a small burrowing critter

export function BurrowBoard({
  seed,
  dateString,
  puzzleNumber,
}: {
  seed: number;
  dateString: string;
  puzzleNumber: number;
}) {
  const game = GAMES.find((g) => g.slug === 'burrow')!;
  const [state, setState] = useState<BurrowState>(() => createInitialState(seed));
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if ((state.won || state.lost) && !finishedRef.current) {
      finishedRef.current = true;
      recordResult('burrow', {
        date: dateString,
        won: state.won,
        moves: state.movesUsed,
        score: state.moveLimit,
        elapsedMs: 0,
      });
      setStreak(getStreak('burrow').current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.movesUsed, state.moveLimit, dateString]);

  return (
    <div>
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.movesUsed} movesLimit={state.moveLimit} />

      <p className="stat-line text-center text-ink/50 dark:text-white/40 mb-4">
        {state.hasKey ? 'Key collected \u2014 head for the door' : 'Find the key, then the door'}
      </p>

      <div
        className="grid mx-auto mb-5 border-2 border-graphite dark:border-white/80"
        style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`, maxWidth: 320 }}
      >
        {Array.from({ length: GRID_ROWS }).flatMap((_, row) =>
          Array.from({ length: GRID_COLS }).map((_, col) => {
            const cell: Cell = { row, col };
            const hasRightNeighbor = col < GRID_COLS - 1;
            const hasBottomNeighbor = row < GRID_ROWS - 1;
            const rightWall = !hasRightNeighbor || !stepPossible(state, cell, { row, col: col + 1 });
            const bottomWall = !hasBottomNeighbor || !stepPossible(state, cell, { row: row + 1, col });

            const isPlayer = state.position.row === row && state.position.col === col;
            const isKey = !state.hasKey && state.key.row === row && state.key.col === col;
            const isExit = state.exit.row === row && state.exit.col === col;
            const isTrap = state.traps.has(cellKey(cell));
            const isAdjacent = gridNeighbors(state.position).some((n) => n.row === row && n.col === col);
            const canMoveHere = isAdjacent && canStepTo(state, cell);

            return (
              <button
                key={`${row}-${col}`}
                onClick={() => canMoveHere && setState((s) => stepTo(s, cell))}
                disabled={!canMoveHere || state.won || state.lost}
                className="aspect-square flex items-center justify-center text-lg relative"
                style={{
                  borderRight: rightWall ? '2px solid #1B1D22' : 'none',
                  borderBottom: bottomWall ? '2px solid #1B1D22' : 'none',
                  background: canMoveHere ? '#F7ECD8' : 'transparent',
                }}
              >
                {isPlayer ? CHARACTER : isExit ? '\u{1F6AA}' : isKey ? '\u{1F5DD}\u{FE0F}' : isTrap ? '\u26A0\uFE0F' : ''}
              </button>
            );
          })
        )}
      </div>

      <p className="stat-line text-center text-ink/40 dark:text-white/30">
        Tap an adjacent open cell to move. Avoid the marked hazards {'\u2014'} the correct route never crosses one.
      </p>

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug="burrow"
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

/** Whether a passage exists between two specific cells in the maze — used
 * purely for rendering walls, independent of the player's current position. */
function stepPossible(state: BurrowState, a: Cell, b: Cell): boolean {
  return state.edges.has(edgeKeyFor(a, b));
}

function edgeKeyFor(a: Cell, b: Cell): string {
  const ka = `${a.row},${a.col}`;
  const kb = `${b.row},${b.col}`;
  return ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`;
}
