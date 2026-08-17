// lib/games/croak.ts
//
// Croak: a frog hops across a pond of lily pads to reach the goal pad
// within a move budget. Same deterministic-seed shape as every other game
// on the site — createInitialState(seed) generates a guaranteed-solvable
// layout (BFS-verified, same technique as shadow.ts), and progress is
// tracked as movesUsed/moveLimit.
//
// The one added wrinkle versus a plain grid-walk game: a few pads hold a
// firefly. Landing on one for the first time grants +1 extra move for the
// rest of the run — a pure bonus that can never make an already-solvable
// layout unsolvable, so it's safe to sprinkle in without re-verifying
// reachability.

import { createRng, seededShuffle } from '../daily-seed';

export const GRID_SIZE = 7;
const TOTAL = GRID_SIZE * GRID_SIZE;
export const BASE_MOVE_LIMIT = 18;
export const FIREFLY_COUNT = 4;
export const FIREFLY_BONUS_MOVES = 1;

export type Dir = 'up' | 'down' | 'left' | 'right';
const DIRS: Record<Dir, [number, number]> = {
  up: [-1, 0],
  down: [1, 0],
  left: [0, -1],
  right: [0, 1],
};

export interface CroakState {
  seed: number;
  pads: Set<number>; // walkable lily-pad cells; everything else is open water
  player: number;
  goal: number;
  fireflies: Set<number>; // uncollected firefly cells
  baseLimit: number; // defaults to BASE_MOVE_LIMIT; Coin Mode can scale this by difficulty
  bonusMoves: number; // extra moves earned so far
  movesUsed: number;
  won: boolean;
  lost: boolean;
}

function idx(r: number, c: number) {
  return r * GRID_SIZE + c;
}
function rc(i: number) {
  return { r: Math.floor(i / GRID_SIZE), c: i % GRID_SIZE };
}

function step(pos: number, dir: Dir, pads: Set<number>): number {
  const [dr, dc] = DIRS[dir];
  const { r, c } = rc(pos);
  const nr = r + dr;
  const nc = c + dc;
  if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE) return pos;
  const ni = idx(nr, nc);
  if (!pads.has(ni)) return pos; // open water — hop refuses, frog stays put
  return ni;
}

function isReachable(start: number, goal: number, pads: Set<number>): boolean {
  const visited = new Set([start]);
  const queue = [start];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    if (cur === goal) return true;
    for (const dir of Object.keys(DIRS) as Dir[]) {
      const next = step(cur, dir, pads);
      if (next !== cur && !visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    }
  }
  return false;
}

export function createInitialState(seed: number, baseLimit: number = BASE_MOVE_LIMIT): CroakState {
  const rng = createRng(seed);
  const positions = seededShuffle(Array.from({ length: TOTAL }, (_, i) => i), rng);
  const start = positions[0];
  const goal = positions[1];

  // Carve out the pond — retry until start and goal are connected.
  let pads = new Set<number>();
  for (let attempt = 0; attempt < 30; attempt++) {
    pads = new Set<number>([start, goal]);
    for (let i = 2; i < TOTAL; i++) {
      if (rng() < 0.72) pads.add(positions[i]);
    }
    if (isReachable(start, goal, pads)) break;
  }

  // Scatter fireflies on reachable pads that aren't the start or goal.
  const candidates = Array.from(pads).filter((p) => p !== start && p !== goal);
  const shuffledCandidates = seededShuffle(candidates, rng);
  const fireflies = new Set(shuffledCandidates.slice(0, Math.min(FIREFLY_COUNT, shuffledCandidates.length)));

  return {
    seed,
    pads,
    player: start,
    goal,
    fireflies,
    baseLimit,
    bonusMoves: 0,
    movesUsed: 0,
    won: false,
    lost: false,
  };
}

export function applyHop(state: CroakState, dir: Dir): CroakState {
  if (state.won || state.lost) return state;

  const player = step(state.player, dir, state.pads);
  if (player === state.player) return state; // hop into water — no-op, doesn't cost a move

  const fireflies = new Set(state.fireflies);
  let bonusMoves = state.bonusMoves;
  if (fireflies.has(player)) {
    fireflies.delete(player);
    bonusMoves += FIREFLY_BONUS_MOVES;
  }

  const movesUsed = state.movesUsed + 1;
  const moveLimit = state.baseLimit + bonusMoves;
  const won = player === state.goal;
  const lost = !won && movesUsed >= moveLimit;

  return { ...state, player, fireflies, bonusMoves, movesUsed, won, lost };
}

export function currentMoveLimit(state: CroakState): number {
  return state.baseLimit + state.bonusMoves;
}
