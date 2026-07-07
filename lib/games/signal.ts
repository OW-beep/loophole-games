import { createRng, seededShuffle } from '../daily-seed';

export const GRID_SIZE = 5;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;

export interface SignalState {
  values: number[];       // required resolved-neighbor count for each cell
  resolved: boolean[];    // which cells have been resolved
  movesUsed: number;
  won: boolean;
  lost: boolean;          // stuck: remaining cells none resolvable (shouldn't happen with valid puzzle)
}

function neighbors(i: number): number[] {
  const r = Math.floor(i / GRID_SIZE), c = i % GRID_SIZE;
  const out: number[] = [];
  if (r > 0) out.push(i - GRID_SIZE);
  if (r < GRID_SIZE - 1) out.push(i + GRID_SIZE);
  if (c > 0) out.push(i - 1);
  if (c < GRID_SIZE - 1) out.push(i + 1);
  return out;
}

export function canResolve(values: number[], resolved: boolean[], i: number): boolean {
  if (resolved[i]) return false;
  const resolvedNeighborCount = neighbors(i).filter(n => resolved[n]).length;
  return resolvedNeighborCount === values[i];
}

export function createInitialState(seed: number): SignalState {
  const rng = createRng(seed);

  // Build by assigning values from a random resolution order.
  // Each cell's value = how many of its neighbors are already resolved
  // at the moment it gets resolved. This guarantees a valid solution exists.
  const order = seededShuffle(
    Array.from({ length: TOTAL_CELLS }, (_, i) => i),
    rng
  );

  const values = new Array(TOTAL_CELLS).fill(0);
  const resolvedSet = new Set<number>();
  for (const cell of order) {
    values[cell] = neighbors(cell).filter(n => resolvedSet.has(n)).length;
    resolvedSet.add(cell);
  }

  return {
    values,
    resolved: new Array(TOTAL_CELLS).fill(false),
    movesUsed: 0,
    won: false,
    lost: false,
  };
}

function hasAnyResolvable(values: number[], resolved: boolean[]): boolean {
  for (let i = 0; i < TOTAL_CELLS; i++) {
    if (canResolve(values, resolved, i)) return true;
  }
  return false;
}

export function resolveCell(state: SignalState, i: number): SignalState {
  if (state.won || state.lost) return state;
  if (!canResolve(state.values, state.resolved, i)) return state; // invalid — free

  const resolved = [...state.resolved];
  resolved[i] = true;
  const movesUsed = state.movesUsed + 1;
  const allResolved = resolved.every(Boolean);
  const won = allResolved;
  const lost = !won && !hasAnyResolvable(state.values, resolved);

  return { ...state, resolved, movesUsed, won, lost };
}
