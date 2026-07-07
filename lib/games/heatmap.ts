import { createRng, randInt, seededShuffle } from '../daily-seed';

export const GRID_SIZE = 5;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;
export const TAP_BUDGET = 10;
const TARGET_FRACTION = 0.8;
const PLAYOUT_TRIALS = 24;

export interface HeatmapState {
  values: number[];
  tapped: boolean[];
  tapsUsed: number;
  score: number;
  target: number;
  won: boolean;
  lost: boolean;
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

export function canTap(values: number[], tapped: boolean[], i: number): boolean {
  if (tapped[i]) return false;
  const supportSum = neighbors(i)
    .filter(n => !tapped[n])
    .reduce((s, n) => s + values[n], 0);
  return supportSum >= values[i];
}

function simulatePlayout(values: number[], rng: () => number, bias: number): number {
  const tapped = new Array(TOTAL_CELLS).fill(false);
  let score = 0;
  for (let t = 0; t < TAP_BUDGET; t++) {
    const opts: number[] = [];
    for (let i = 0; i < TOTAL_CELLS; i++) if (canTap(values, tapped, i)) opts.push(i);
    if (opts.length === 0) break;
    let choice: number;
    if (rng() < bias) {
      opts.sort((a, b) => values[b] - values[a]);
      choice = opts[0];
    } else {
      choice = opts[Math.floor(rng() * opts.length)];
    }
    tapped[choice] = true;
    score += values[choice];
  }
  return score;
}

export function createInitialState(seed: number): HeatmapState {
  const rng = createRng(seed);
  const order = seededShuffle(
    Array.from({ length: TOTAL_CELLS }, (_, i) => i),
    rng
  );

  const values = new Array(TOTAL_CELLS).fill(0);
  const resolvedSet = new Set<number>();

  for (const cell of order) {
    const remainingNeighbors = neighbors(cell).filter(n => !resolvedSet.has(n));
    if (remainingNeighbors.length === 0) {
      values[cell] = randInt(rng, 1, 3);
    } else {
      const maxVal = remainingNeighbors.reduce((s, n) => s + (values[n] || randInt(rng, 1, 6)), 0);
      values[cell] = Math.min(randInt(rng, 1, maxVal), 9);
    }
    resolvedSet.add(cell);
  }

  let best = 0;
  for (let p = 0; p < PLAYOUT_TRIALS; p++) {
    const bias = 0.6 + (p % 4) * 0.1;
    best = Math.max(best, simulatePlayout(values, rng, bias));
  }
  const target = Math.max(10, Math.round(best * TARGET_FRACTION));

  return {
    values,
    tapped: new Array(TOTAL_CELLS).fill(false),
    tapsUsed: 0,
    score: 0,
    target,
    won: false,
    lost: false,
  };
}

export function tapCell(state: HeatmapState, i: number): HeatmapState {
  if (state.won || state.lost) return state;
  if (!canTap(state.values, state.tapped, i)) return state;

  const tapped = [...state.tapped];
  tapped[i] = true;
  const tapsUsed = state.tapsUsed + 1;
  const score = state.score + state.values[i];
  const won = score >= state.target;
  const lost = !won && tapsUsed >= TAP_BUDGET;

  return { ...state, tapped, tapsUsed, score, won, lost };
}
