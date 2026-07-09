import { createRng, randInt, seededShuffle } from '../daily-seed';

export const GRID_SIZE = 5;
const TOTAL = GRID_SIZE * GRID_SIZE;
export const MOVE_LIMIT = 18;
export const MAX_TETHER = 4;

export type Dir = 'up' | 'down' | 'left' | 'right';
export const DIRS: Record<Dir, [number, number]> = {
  up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1],
};

export interface TetherState {
  posA: number;
  posB: number;
  goalA: number;
  goalB: number;
  walls: Set<number>;
  movesUsed: number;
  won: boolean;
  lost: boolean;
}

function idx(r: number, c: number) { return r * GRID_SIZE + c; }
function rc(i: number) { return { r: Math.floor(i / GRID_SIZE), c: i % GRID_SIZE }; }

export function manDist(a: number, b: number): number {
  const ra = rc(a), rb = rc(b);
  return Math.abs(ra.r - rb.r) + Math.abs(ra.c - rb.c);
}

function step(pos: number, dr: number, dc: number, walls: Set<number>): number {
  const { r, c } = rc(pos);
  const nr = r + dr, nc = c + dc;
  if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE) return pos;
  const ni = idx(nr, nc);
  return walls.has(ni) ? pos : ni;
}

function bfsSolvable(
  startA: number, startB: number,
  goalA: number, goalB: number,
  walls: Set<number>,
  budget: number
): boolean {
  const key = (a: number, b: number) => a * TOTAL + b;
  const q: { a: number; b: number; moves: number }[] = [{ a: startA, b: startB, moves: 0 }];
  const seen = new Set([key(startA, startB)]);
  while (q.length > 0) {
    const { a, b, moves } = q.shift()!;
    if (a === goalA && b === goalB) return true;
    if (moves >= budget) continue;
    for (const [dr, dc] of Object.values(DIRS)) {
      const na = step(a, dr, dc, walls);
      const nb = step(b, dr, dc, walls);
      if (manDist(na, nb) > MAX_TETHER) continue;
      const k = key(na, nb);
      if (!seen.has(k)) { seen.add(k); q.push({ a: na, b: nb, moves: moves + 1 }); }
    }
  }
  return false;
}

export function createInitialState(seed: number): TetherState {
  const rng = createRng(seed);
  let posA = 0, posB = 0, goalA = 0, goalB = 0;
  let walls = new Set<number>();

  for (let attempt = 0; attempt < 30; attempt++) {
    const positions = seededShuffle(Array.from({ length: TOTAL }, (_, i) => i), rng);
    posA = positions[0]; posB = positions[1];
    goalA = positions[2]; goalB = positions[3];
    if (manDist(posA, posB) > MAX_TETHER) continue;
    if (manDist(goalA, goalB) > MAX_TETHER) continue;

    walls = new Set<number>();
    for (let i = 4; i < TOTAL; i++) {
      if (rng() < 0.15) walls.add(positions[i]);
    }
    if (bfsSolvable(posA, posB, goalA, goalB, walls, MOVE_LIMIT)) break;
  }

  return { posA, posB, goalA, goalB, walls, movesUsed: 0, won: false, lost: false };
}

export function applyMove(state: TetherState, dir: Dir): TetherState {
  if (state.won || state.lost) return state;
  const [dr, dc] = DIRS[dir];
  const na = step(state.posA, dr, dc, state.walls);
  const nb = step(state.posB, dr, dc, state.walls);
  if (manDist(na, nb) > MAX_TETHER) return state; // tether would snap — no-op

  const movesUsed = state.movesUsed + 1;
  const won = na === state.goalA && nb === state.goalB;
  const lost = !won && movesUsed >= MOVE_LIMIT;
  return { ...state, posA: na, posB: nb, movesUsed, won, lost };
}
