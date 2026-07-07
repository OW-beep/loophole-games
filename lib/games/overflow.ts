import { createRng, randInt } from '../daily-seed';

export const GRID_SIZE = 5;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;
export const TAP_BUDGET = 10;
const MIN_CAPACITY = 3;
const MAX_CAPACITY = 5;
const TARGET_FRACTION = 0.9;
const PLAYOUT_TRIALS = 24;

export interface Cell {
  level: number;
  capacity: number;
}

export interface OverflowState {
  cells: (Cell | null)[];
  tapsUsed: number;
  score: number;
  target: number;
  won: boolean;
  lost: boolean;
  lastChainSize: number;
}

function idx(r: number, c: number) { return r * GRID_SIZE + c; }
function rc(i: number) { return { r: Math.floor(i / GRID_SIZE), c: i % GRID_SIZE }; }

function neighbors(i: number): number[] {
  const { r, c } = rc(i);
  const out: number[] = [];
  if (r > 0) out.push(idx(r - 1, c));
  if (r < GRID_SIZE - 1) out.push(idx(r + 1, c));
  if (c > 0) out.push(idx(r, c - 1));
  if (c < GRID_SIZE - 1) out.push(idx(r, c + 1));
  return out;
}

function addDrop(cells: (Cell | null)[], i: number): { cells: (Cell | null)[]; cleared: number } {
  const next = [...cells];
  const queue = [i];
  let cleared = 0;
  const visited = new Set<number>();

  while (queue.length > 0) {
    const cur = queue.shift()!;
    if (visited.has(cur) || next[cur] === null) continue;
    const cell = next[cur]!;
    const newLevel = cell.level + 1;
    if (newLevel >= cell.capacity) {
      next[cur] = null;
      cleared++;
      visited.add(cur);
      for (const n of neighbors(cur)) {
        if (next[n] !== null) queue.push(n);
      }
    } else {
      next[cur] = { ...cell, level: newLevel };
    }
  }
  return { cells: next, cleared };
}

function simulatePlayout(
  initCells: (Cell | null)[],
  rng: () => number,
  bias: number
): number {
  let cells = [...initCells];
  let score = 0;
  for (let tap = 0; tap < TAP_BUDGET; tap++) {
    const opts: number[] = [];
    for (let i = 0; i < TOTAL_CELLS; i++) {
      if (cells[i] !== null) opts.push(i);
    }
    if (opts.length === 0) break;
    let choice: number;
    if (rng() < bias) {
      opts.sort((a, b) => {
        const ca = cells[a]!, cb = cells[b]!;
        const prioA = -(ca.capacity - ca.level - 1) +
          neighbors(a).filter(n => cells[n] !== null && cells[n]!.level >= cells[n]!.capacity - 1).length * 3;
        const prioB = -(cb.capacity - cb.level - 1) +
          neighbors(b).filter(n => cells[n] !== null && cells[n]!.level >= cells[n]!.capacity - 1).length * 3;
        return prioB - prioA;
      });
      choice = opts[0];
    } else {
      choice = opts[Math.floor(rng() * opts.length)];
    }
    const res = addDrop(cells, choice);
    cells = res.cells;
    score += res.cleared;
  }
  return score;
}

export function createInitialState(seed: number): OverflowState {
  const rng = createRng(seed);
  const cells: (Cell | null)[] = Array.from({ length: TOTAL_CELLS }, () => {
    const capacity = randInt(rng, MIN_CAPACITY, MAX_CAPACITY);
    const level = randInt(rng, 0, capacity - 1);
    return { level, capacity };
  });

  let best = 0;
  for (let p = 0; p < PLAYOUT_TRIALS; p++) {
    const bias = 0.6 + (p % 4) * 0.1;
    const score = simulatePlayout(cells, rng, bias);
    best = Math.max(best, score);
  }
  const target = Math.max(5, Math.round(best * TARGET_FRACTION));

  return { cells, tapsUsed: 0, score: 0, target, won: false, lost: false, lastChainSize: 0 };
}

export function tapCell(state: OverflowState, i: number): OverflowState {
  if (state.won || state.lost) return state;
  if (state.cells[i] === null) return state;

  const { cells, cleared } = addDrop(state.cells, i);
  const tapsUsed = state.tapsUsed + 1;
  const score = state.score + cleared;
  const won = score >= state.target;
  const lost = !won && tapsUsed >= TAP_BUDGET;

  return { cells, tapsUsed, score, target: state.target, won, lost, lastChainSize: cleared };
}
