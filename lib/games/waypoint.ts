import { createRng, seededShuffle } from '../daily-seed';

export const GRID_SIZE = 5;
export const CELL_COUNT = GRID_SIZE * GRID_SIZE; // 25
export const MOVE_BUDGET = 20; // wrong guesses allowed before losing
export const CLUE_INTERVAL = 4; // reveal every 4th step along the path, plus start/end

export interface WaypointState {
  path: number[]; // path[i] = cell index (row*GRID_SIZE+col) visited at step i (0-indexed, step 0 = number 1)
  clueValues: Map<number, number>; // cellIndex -> revealed number, for pre-filled clues
  filled: Map<number, number>; // cellIndex -> number currently placed there (clues + confirmed placements)
  current: number; // highest number successfully placed so far (starts at 1 — cell "1" is always pre-filled)
  movesUsed: number; // wrong guesses made so far
  lastWrongCell: number | null; // most recent incorrect guess, for a brief UI flash
  won: boolean;
  lost: boolean;
}

function idx(row: number, col: number): number {
  return row * GRID_SIZE + col;
}

function neighbors(cellIndex: number): number[] {
  const row = Math.floor(cellIndex / GRID_SIZE);
  const col = cellIndex % GRID_SIZE;
  const out: number[] = [];
  const deltas: [number, number][] = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  for (const [dr, dc] of deltas) {
    const r = row + dr;
    const c = col + dc;
    if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) out.push(idx(r, c));
  }
  return out;
}

/** Randomized DFS with a Warnsdorff-style "fewest remaining options first" tiebreak,
 * plus backtracking. Grid Hamiltonian paths are abundant at 5x5, so this reliably
 * succeeds fast; the outer retry loop is just a safety net. */
function generateHamiltonianPath(rng: () => number): number[] {
  const MAX_ATTEMPTS = 40;
  const MAX_STEPS_PER_ATTEMPT = 20000;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const start = Math.floor(rng() * CELL_COUNT);
    const visited = new Set<number>([start]);
    const path = [start];
    let steps = 0;
    let stuck = false;

    while (path.length < CELL_COUNT && !stuck) {
      steps++;
      if (steps > MAX_STEPS_PER_ATTEMPT) {
        stuck = true;
        break;
      }
      const current = path[path.length - 1];
      const options = seededShuffle(
        neighbors(current).filter((n) => !visited.has(n)),
        rng
      );

      if (options.length === 0) {
        if (path.length === 1) {
          stuck = true;
          break;
        }
        const removed = path.pop()!;
        visited.delete(removed);
        continue;
      }

      let best = options[0];
      let bestFreedom = Infinity;
      for (const opt of options) {
        const freedom = neighbors(opt).filter((n) => !visited.has(n)).length;
        if (freedom < bestFreedom) {
          bestFreedom = freedom;
          best = opt;
        }
      }

      visited.add(best);
      path.push(best);
    }

    if (path.length === CELL_COUNT) return path;
  }

  throw new Error('Failed to generate a Waypoint path after multiple attempts');
}

export function createInitialState(seed: number): WaypointState {
  const rng = createRng(seed);
  const path = generateHamiltonianPath(rng);

  const clueValues = new Map<number, number>();
  for (let step = 0; step < CELL_COUNT; step++) {
    const number = step + 1;
    if (number === 1 || number === CELL_COUNT || step % CLUE_INTERVAL === 0) {
      clueValues.set(path[step], number);
    }
  }

  return {
    path,
    clueValues,
    filled: new Map(clueValues),
    current: 1,
    movesUsed: 0,
    lastWrongCell: null,
    won: false,
    lost: false,
  };
}

export function isAdjacentToCurrent(state: WaypointState, cellIndex: number): boolean {
  const currentCell = state.path[state.current - 1];
  return neighbors(currentCell).includes(cellIndex);
}

/**
 * Taps an adjacent, unfilled cell as a guess for the next number.
 * - Not adjacent, or already filled: ignored, free (not a real attempt).
 * - Adjacent + unfilled but wrong: costs one guess from the budget.
 * - Adjacent + unfilled + correct: locks in the next number.
 */
export function guessNext(state: WaypointState, cellIndex: number): WaypointState {
  if (state.won || state.lost) return state;
  if (state.filled.has(cellIndex)) return state;
  if (!isAdjacentToCurrent(state, cellIndex)) return state;

  const nextNumber = state.current + 1;
  const correctCell = state.path[nextNumber - 1];

  if (cellIndex !== correctCell) {
    const movesUsed = state.movesUsed + 1;
    return {
      ...state,
      movesUsed,
      lastWrongCell: cellIndex,
      lost: movesUsed >= MOVE_BUDGET,
    };
  }

  const filled = new Map(state.filled);
  filled.set(cellIndex, nextNumber);
  const won = nextNumber === CELL_COUNT;

  return {
    ...state,
    filled,
    current: nextNumber,
    lastWrongCell: null,
    won,
  };
}
