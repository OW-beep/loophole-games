import { createRng, seededShuffle } from '../daily-seed';

export const NUM_COLORS = 5;
export const TUBE_CAPACITY = 4;
export const EMPTY_TUBES = 2;
export const TOTAL_TUBES = NUM_COLORS + EMPTY_TUBES;
const MAX_GENERATION_ATTEMPTS = 40;
const SOLVER_NODE_BUDGET = 20000;
const BUDGET_MARGIN = 1.3;
const MIN_BUDGET = 25;
const MAX_BUDGET = 60;

export interface VialsState {
  /** Each tube is a stack of color ids, index 0 = bottom (oldest poured). */
  tubes: number[][];
  selected: number | null;
  movesUsed: number;
  movesLimit: number;
  won: boolean;
  lost: boolean;
  /** Index of a tube that was just an invalid pour target, for a brief shake animation. Cleared on the next action. */
  lastInvalid: number | null;
}

function topColor(tube: number[]): number | null {
  return tube.length > 0 ? tube[tube.length - 1] : null;
}

/** Length of the contiguous run of the top color in a tube (e.g. [1,2,2,2] -> 3). */
function topRunLength(tube: number[]): number {
  if (tube.length === 0) return 0;
  const color = tube[tube.length - 1];
  let n = 0;
  for (let i = tube.length - 1; i >= 0 && tube[i] === color; i--) n++;
  return n;
}

function canPour(from: number[], to: number[]): boolean {
  if (from.length === 0) return false;
  if (to.length >= TUBE_CAPACITY) return false;
  const fromColor = topColor(from);
  const toColor = topColor(to);
  return toColor === null || toColor === fromColor;
}

/** Pours as much of the source's top matching run as fits in the destination. */
function pour(from: number[], to: number[]): { from: number[]; to: number[] } {
  const run = topRunLength(from);
  const space = TUBE_CAPACITY - to.length;
  const amount = Math.min(run, space);
  const moving = from.slice(from.length - amount);
  return {
    from: from.slice(0, from.length - amount),
    to: [...to, ...moving],
  };
}

function isSolved(tubes: number[][]): boolean {
  return tubes.every((t) => t.length === 0 || (t.length === TUBE_CAPACITY && t.every((c) => c === t[0])));
}

function tubesKey(tubes: number[][]): string {
  return tubes.map((t) => t.join(',')).join('|');
}

/** A pour that only relocates an already-finished tube into an empty one — no puzzle progress, just noise. */
function isUselessMove(tubes: number[][], i: number, j: number): boolean {
  const t = tubes[i];
  return t.length === TUBE_CAPACITY && t.every((c) => c === t[0]) && tubes[j].length === 0;
}

/** Favors moves that consolidate onto an existing matching color, and moves that fully clear their source tube — steers the DFS toward shorter, more sensible solutions without the cost of an exhaustive search. */
function scoreMove(tubes: number[][], i: number, j: number): number {
  const toColor = topColor(tubes[j]);
  const run = topRunLength(tubes[i]);
  let score = 0;
  if (toColor !== null) score += 100;
  if (run === tubes[i].length) score += 20;
  score += run;
  return score;
}

/**
 * Fast DFS solvability check with visited-state pruning and heuristic move
 * ordering. Returns whether a solution exists within the node budget, and —
 * when found — how many moves it took, used as a rough guide for the daily
 * move budget (the exact number doesn't need to be optimal: a generous
 * budget suits this game's relaxed, satisfying pace better than a tight one).
 */
function solve(initial: number[][], nodeBudget: number): { solvable: boolean; moves: number } {
  const seen = new Set<string>([tubesKey(initial)]);
  let nodes = 0;

  function dfs(tubes: number[][], depth: number): number {
    nodes++;
    if (nodes > nodeBudget) return -1;
    if (isSolved(tubes)) return depth;

    const candidates: [number, number, number][] = [];
    for (let i = 0; i < tubes.length; i++) {
      for (let j = 0; j < tubes.length; j++) {
        if (i === j) continue;
        if (!canPour(tubes[i], tubes[j])) continue;
        if (isUselessMove(tubes, i, j)) continue;
        candidates.push([i, j, scoreMove(tubes, i, j)]);
      }
    }
    candidates.sort((a, b) => b[2] - a[2]);

    for (const [i, j] of candidates) {
      const { from, to } = pour(tubes[i], tubes[j]);
      const copy = tubes.map((t, k) => (k === i ? from : k === j ? to : t));
      const key = tubesKey(copy);
      if (seen.has(key)) continue;
      seen.add(key);
      const result = dfs(copy, depth + 1);
      if (result !== -1) return result;
      if (nodes > nodeBudget) return -1;
    }
    return -1;
  }

  const moves = dfs(initial, 0);
  return { solvable: moves !== -1, moves: Math.max(moves, 0) };
}

function randomDeal(rng: () => number): number[][] {
  const balls: number[] = [];
  for (let c = 0; c < NUM_COLORS; c++) for (let i = 0; i < TUBE_CAPACITY; i++) balls.push(c);
  const shuffled = seededShuffle(balls, rng);
  const tubes: number[][] = [];
  for (let t = 0; t < NUM_COLORS; t++) tubes.push(shuffled.slice(t * TUBE_CAPACITY, (t + 1) * TUBE_CAPACITY));
  for (let e = 0; e < EMPTY_TUBES; e++) tubes.push([]);
  return tubes;
}

export function createInitialState(seed: number, movesLimit?: number): VialsState {
  const rng = createRng(seed);
  let tubes = randomDeal(rng);
  let solved = solve(tubes, SOLVER_NODE_BUDGET);

  for (let attempt = 1; attempt < MAX_GENERATION_ATTEMPTS && !solved.solvable; attempt++) {
    tubes = randomDeal(rng);
    solved = solve(tubes, SOLVER_NODE_BUDGET);
  }

  const shortestSolution = solved.solvable ? solved.moves : NUM_COLORS * TUBE_CAPACITY; // safe fallback, shouldn't trigger in practice
  const budget = Math.min(MAX_BUDGET, Math.max(MIN_BUDGET, Math.ceil(shortestSolution * BUDGET_MARGIN)));

  return {
    tubes,
    selected: null,
    movesUsed: 0,
    movesLimit: movesLimit ?? budget,
    won: false,
    lost: false,
    lastInvalid: null,
  };
}

/** Tapping a tube: first tap selects a source, second tap attempts to pour into it. */
export function tapTube(state: VialsState, index: number): VialsState {
  if (state.won || state.lost) return state;

  if (state.selected === null) {
    if (state.tubes[index].length === 0) return { ...state, lastInvalid: null };
    return { ...state, selected: index, lastInvalid: null };
  }

  if (state.selected === index) {
    return { ...state, selected: null, lastInvalid: null };
  }

  const from = state.tubes[state.selected];
  const to = state.tubes[index];
  if (!canPour(from, to)) {
    return { ...state, lastInvalid: index };
  }

  const { from: newFrom, to: newTo } = pour(from, to);
  const tubes = [...state.tubes];
  tubes[state.selected] = newFrom;
  tubes[index] = newTo;

  const movesUsed = state.movesUsed + 1;
  const won = isSolved(tubes);
  const lost = !won && movesUsed >= state.movesLimit;

  return { ...state, tubes, selected: null, movesUsed, won, lost, lastInvalid: null };
}
