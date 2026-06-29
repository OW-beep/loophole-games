import { createRng, randInt } from '../daily-seed';

export const ROW_LENGTH = 9;
export const MERGE_BUDGET = 5;
const MIN_CELL_VALUE = 1;
const MAX_CELL_VALUE = 4;
const MIN_CONSTRUCTION_MERGES = 2;
const MAX_CONSTRUCTION_MERGES = MERGE_BUDGET;

export interface CarryChainState {
  row: number[];
  mergesUsed: number;
  target: number;
  total: number;
  won: boolean;
  lost: boolean;
}

function sum(row: number[]): number {
  return row.reduce((a, b) => a + b, 0);
}

/**
 * Merges the tokens at `i` and `i + 1` into one (their sum), shortening the
 * row by one. The token that ends up immediately to the right of the merged
 * token (if any) gets bumped by +1 — the "carry" — whether the player wants
 * it or not. A merge at the row's right edge has no token to carry onto, so
 * the carry is simply lost.
 */
export function merge(row: number[], i: number): number[] {
  if (i < 0 || i >= row.length - 1) return row;
  const merged = row[i] + row[i + 1];
  const next = [...row.slice(0, i), merged, ...row.slice(i + 2)];
  if (i + 1 < next.length) {
    next[i + 1] += 1;
  }
  return next;
}

export function createInitialState(seed: number): CarryChainState {
  const rng = createRng(seed);
  const row = Array.from({ length: ROW_LENGTH }, () => randInt(rng, MIN_CELL_VALUE, MAX_CELL_VALUE));

  const numConstructionMerges = randInt(rng, MIN_CONSTRUCTION_MERGES, MAX_CONSTRUCTION_MERGES);
  let current = row;
  for (let i = 0; i < numConstructionMerges; i++) {
    if (current.length < 2) break;
    const idx = randInt(rng, 0, current.length - 2);
    current = merge(current, idx);
  }
  const target = sum(current);

  return { row, mergesUsed: 0, target, total: sum(row), won: false, lost: false };
}

export function applyMerge(state: CarryChainState, i: number): CarryChainState {
  if (state.won || state.lost) return state;
  if (state.row.length < 2) return state;

  const nextRow = merge(state.row, i);
  const mergesUsed = state.mergesUsed + 1;
  const total = sum(nextRow);
  const won = total === state.target;
  const lost = !won && (mergesUsed >= MERGE_BUDGET || nextRow.length === 1);

  return { row: nextRow, mergesUsed, target: state.target, total, won, lost };
}
