import { createRng, randInt } from '../daily-seed';

export const JUG_COUNT = 3;
export const MIN_CAPACITY = 3;
export const MAX_CAPACITY = 9;
export const MIN_TARGET_DISTANCE = 4; // don't pick a target that's trivially "just fill a jug"
export const MAX_TARGET_DISTANCE = 9;
export const MOVE_SLACK = 6; // extra moves beyond the optimal solution

export type Amounts = [number, number, number];
export type Capacities = [number, number, number];

export interface DecantState {
  capacities: Capacities;
  target: number;
  optimalMoves: number;
  moveLimit: number;
  amounts: Amounts;
  movesUsed: number;
  won: boolean;
  lost: boolean;
}

function stateKey(a: Amounts): string {
  return `${a[0]},${a[1]},${a[2]}`;
}

function neighborsOf(a: Amounts, capacities: Capacities): Amounts[] {
  const out: Amounts[] = [];
  for (let i = 0; i < JUG_COUNT; i++) {
    // Fill i
    if (a[i] !== capacities[i]) {
      const next = [...a] as Amounts;
      next[i] = capacities[i];
      out.push(next);
    }
    // Empty i
    if (a[i] !== 0) {
      const next = [...a] as Amounts;
      next[i] = 0;
      out.push(next);
    }
    // Pour i -> j
    for (let j = 0; j < JUG_COUNT; j++) {
      if (i === j) continue;
      if (a[i] === 0 || a[j] === capacities[j]) continue;
      const amount = Math.min(a[i], capacities[j] - a[j]);
      const next = [...a] as Amounts;
      next[i] -= amount;
      next[j] += amount;
      out.push(next);
    }
  }
  return out;
}

/** BFS from all-empty. Returns, for every amount that appears in any reachable
 * state, the shortest distance (in moves) at which it first becomes achievable
 * in some jug. */
function bfsShortestDistanceToAmount(capacities: Capacities): Map<number, number> {
  const start: Amounts = [0, 0, 0];
  const dist = new Map<string, number>();
  dist.set(stateKey(start), 0);
  const queue: Amounts[] = [start];
  const amountDistance = new Map<number, number>();

  let head = 0;
  while (head < queue.length) {
    const current = queue[head++];
    const d = dist.get(stateKey(current))!;
    for (const v of current) {
      if (!amountDistance.has(v) || amountDistance.get(v)! > d) {
        amountDistance.set(v, d);
      }
    }
    for (const next of neighborsOf(current, capacities)) {
      const key = stateKey(next);
      if (!dist.has(key)) {
        dist.set(key, d + 1);
        queue.push(next);
      }
    }
  }

  return amountDistance;
}

export function createInitialState(seed: number): DecantState {
  const rng = createRng(seed);

  // Try a handful of random capacity sets until one yields a good target.
  for (let attempt = 0; attempt < 30; attempt++) {
    const capacities = [
      randInt(rng, MIN_CAPACITY, MAX_CAPACITY),
      randInt(rng, MIN_CAPACITY, MAX_CAPACITY),
      randInt(rng, MIN_CAPACITY, MAX_CAPACITY),
    ] as Capacities;

    // Avoid all three jugs sharing one capacity — not interesting.
    if (capacities[0] === capacities[1] && capacities[1] === capacities[2]) continue;

    const amountDistance = bfsShortestDistanceToAmount(capacities);
    const candidates = Array.from(amountDistance.entries()).filter(
      ([amount, d]) => amount > 0 && d >= MIN_TARGET_DISTANCE && d <= MAX_TARGET_DISTANCE
    );

    if (candidates.length === 0) continue;

    const [target, optimalMoves] = candidates[randInt(rng, 0, candidates.length - 1)];

    return {
      capacities,
      target,
      optimalMoves,
      moveLimit: optimalMoves + MOVE_SLACK,
      amounts: [0, 0, 0],
      movesUsed: 0,
      won: false,
      lost: false,
    };
  }

  // Extremely unlikely fallback: a fixed, known-good classic puzzle (3, 5, 8 jugs, target 4).
  const fallbackCapacities: Capacities = [3, 5, 8];
  const fallbackDistances = bfsShortestDistanceToAmount(fallbackCapacities);
  const fallbackOptimal = fallbackDistances.get(4) ?? 6;
  return {
    capacities: fallbackCapacities,
    target: 4,
    optimalMoves: fallbackOptimal,
    moveLimit: fallbackOptimal + MOVE_SLACK,
    amounts: [0, 0, 0],
    movesUsed: 0,
    won: false,
    lost: false,
  };
}

function checkWin(state: DecantState): boolean {
  return state.amounts.includes(state.target);
}

function applyAction(state: DecantState, next: Amounts): DecantState {
  const movesUsed = state.movesUsed + 1;
  const won = next.includes(state.target);
  const lost = !won && movesUsed >= state.moveLimit;
  return { ...state, amounts: next, movesUsed, won, lost };
}

export function fillJug(state: DecantState, i: number): DecantState {
  if (state.won || state.lost) return state;
  if (state.amounts[i] === state.capacities[i]) return state;
  const next = [...state.amounts] as Amounts;
  next[i] = state.capacities[i];
  return applyAction(state, next);
}

export function emptyJug(state: DecantState, i: number): DecantState {
  if (state.won || state.lost) return state;
  if (state.amounts[i] === 0) return state;
  const next = [...state.amounts] as Amounts;
  next[i] = 0;
  return applyAction(state, next);
}

export function pourJug(state: DecantState, from: number, to: number): DecantState {
  if (state.won || state.lost) return state;
  if (from === to) return state;
  if (state.amounts[from] === 0 || state.amounts[to] === state.capacities[to]) return state;
  const amount = Math.min(state.amounts[from], state.capacities[to] - state.amounts[to]);
  const next = [...state.amounts] as Amounts;
  next[from] -= amount;
  next[to] += amount;
  return applyAction(state, next);
}

export { checkWin };
