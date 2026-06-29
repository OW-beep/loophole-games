import { createRng, randInt } from '../daily-seed';

export const GRID_SIZE = 5;
const TOTAL_CRATES = GRID_SIZE * GRID_SIZE;
export const SHIP_BUDGET = 10;
const MIN_WEIGHT = 1;
const MAX_WEIGHT = 9;
const TARGET_FRACTION = 0.85; // target score is this fraction of a witnessed achievable score
const PLAYOUT_TRIALS = 24;

export interface BraceYardState {
  weights: (number | null)[]; // null = already shipped (empty cell)
  shipped: number;
  score: number;
  target: number;
  won: boolean;
  lost: boolean; // ran out of shipments, or fully deadlocked, before reaching target
}

function idx(r: number, c: number) {
  return r * GRID_SIZE + c;
}
function rc(i: number) {
  return { r: Math.floor(i / GRID_SIZE), c: i % GRID_SIZE };
}

function neighbors(i: number): number[] {
  const { r, c } = rc(i);
  const out: number[] = [];
  if (r > 0) out.push(idx(r - 1, c));
  if (r < GRID_SIZE - 1) out.push(idx(r + 1, c));
  if (c > 0) out.push(idx(r, c - 1));
  if (c < GRID_SIZE - 1) out.push(idx(r, c + 1));
  return out;
}

/** A crate is shippable if its present neighbors can brace its weight, or it has no present neighbors left at all. */
export function isShippable(weights: (number | null)[], i: number): boolean {
  if (weights[i] === null) return false;
  const presentNeighbors = neighbors(i).filter((n) => weights[n] !== null);
  if (presentNeighbors.length === 0) return true;
  const support = presentNeighbors.reduce((sum, n) => sum + (weights[n] as number), 0);
  return support >= (weights[i] as number);
}

function hasAnyShippable(weights: (number | null)[]): boolean {
  for (let i = 0; i < weights.length; i++) {
    if (weights[i] !== null && isShippable(weights, i)) return true;
  }
  return false;
}

/** One simulated playout used only to derive a fair, witnessed-achievable daily target. */
function simulatePlayout(weights: number[], rng: () => number, heavyBias: number): number {
  const w: (number | null)[] = [...weights];
  let score = 0;
  for (let shipment = 0; shipment < SHIP_BUDGET; shipment++) {
    const opts: number[] = [];
    for (let i = 0; i < w.length; i++) if (w[i] !== null && isShippable(w, i)) opts.push(i);
    if (opts.length === 0) break;
    let choice: number;
    if (rng() < heavyBias) {
      opts.sort((a, b) => (w[b] as number) - (w[a] as number));
      choice = opts[0];
    } else {
      choice = opts[Math.floor(rng() * opts.length)];
    }
    score += w[choice] as number;
    w[choice] = null;
  }
  return score;
}

export function createInitialState(seed: number): BraceYardState {
  const rng = createRng(seed);
  const baseWeights = Array.from({ length: TOTAL_CRATES }, () => randInt(rng, MIN_WEIGHT, MAX_WEIGHT));

  let bestWitnessed = 0;
  for (let p = 0; p < PLAYOUT_TRIALS; p++) {
    const bias = 0.6 + (p % 4) * 0.1; // a spread of "fairly good" strategies, not just lucky randomness
    const score = simulatePlayout(baseWeights, rng, bias);
    bestWitnessed = Math.max(bestWitnessed, score);
  }
  const target = Math.max(20, Math.round(bestWitnessed * TARGET_FRACTION));

  return {
    weights: [...baseWeights],
    shipped: 0,
    score: 0,
    target,
    won: false,
    lost: false,
  };
}

export function shipCrate(state: BraceYardState, i: number): BraceYardState {
  if (state.won || state.lost) return state;
  if (!isShippable(state.weights, i)) return state; // invalid attempt — free, no cost

  const weights = [...state.weights];
  const gained = weights[i] as number;
  weights[i] = null;
  const shipped = state.shipped + 1;
  const score = state.score + gained;
  const won = score >= state.target;
  const lost = !won && (shipped >= SHIP_BUDGET || !hasAnyShippable(weights));

  return { weights, shipped, score, target: state.target, won, lost };
}

export { TOTAL_CRATES };
