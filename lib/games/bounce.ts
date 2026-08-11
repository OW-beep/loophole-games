// lib/games/bounce.ts
//
// Bounce: a chibi bunny bounces across floating cloud platforms to reach
// the rainbow goal platform. Mechanically this is the same proven shape as
// Croak's pond (grid-hop-to-goal, BFS-verified solvable, pure-bonus pickups
// that can never break solvability) — the point of this game is the
// character and the sky setting, not a new puzzle mechanic, so it reuses
// logic that's already been tested across hundreds of seeds rather than
// inventing a new generator.

import { createRng, seededShuffle } from '../daily-seed';

export const GRID_SIZE = 5;
const TOTAL = GRID_SIZE * GRID_SIZE;
export const BASE_MOVE_LIMIT = 10;
export const STAR_COUNT = 3;
export const STAR_BONUS_MOVES = 1;

export type Dir = 'up' | 'down' | 'left' | 'right';
const DIRS: Record<Dir, [number, number]> = {
  up: [-1, 0],
  down: [1, 0],
  left: [0, -1],
  right: [0, 1],
};

export interface BounceState {
  seed: number;
  platforms: Set<number>; // walkable cloud cells; everything else is open sky
  player: number;
  goal: number;
  stars: Set<number>; // uncollected star cells
  bonusMoves: number;
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

function step(pos: number, dir: Dir, platforms: Set<number>): number {
  const [dr, dc] = DIRS[dir];
  const { r, c } = rc(pos);
  const nr = r + dr;
  const nc = c + dc;
  if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE) return pos;
  const ni = idx(nr, nc);
  if (!platforms.has(ni)) return pos;
  return ni;
}

function isReachable(start: number, goal: number, platforms: Set<number>): boolean {
  const visited = new Set([start]);
  const queue = [start];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    if (cur === goal) return true;
    for (const dir of Object.keys(DIRS) as Dir[]) {
      const next = step(cur, dir, platforms);
      if (next !== cur && !visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    }
  }
  return false;
}

export function createInitialState(seed: number): BounceState {
  const rng = createRng(seed);
  const positions = seededShuffle(Array.from({ length: TOTAL }, (_, i) => i), rng);
  const start = positions[0];
  const goal = positions[1];

  let platforms = new Set<number>();
  for (let attempt = 0; attempt < 30; attempt++) {
    platforms = new Set<number>([start, goal]);
    for (let i = 2; i < TOTAL; i++) {
      if (rng() < 0.72) platforms.add(positions[i]);
    }
    if (isReachable(start, goal, platforms)) break;
  }

  const candidates = Array.from(platforms).filter((p) => p !== start && p !== goal);
  const shuffledCandidates = seededShuffle(candidates, rng);
  const stars = new Set(shuffledCandidates.slice(0, Math.min(STAR_COUNT, shuffledCandidates.length)));

  return {
    seed,
    platforms,
    player: start,
    goal,
    stars,
    bonusMoves: 0,
    movesUsed: 0,
    won: false,
    lost: false,
  };
}

export function applyHop(state: BounceState, dir: Dir): BounceState {
  if (state.won || state.lost) return state;

  const player = step(state.player, dir, state.platforms);
  if (player === state.player) return state;

  const stars = new Set(state.stars);
  let bonusMoves = state.bonusMoves;
  if (stars.has(player)) {
    stars.delete(player);
    bonusMoves += STAR_BONUS_MOVES;
  }

  const movesUsed = state.movesUsed + 1;
  const moveLimit = BASE_MOVE_LIMIT + bonusMoves;
  const won = player === state.goal;
  const lost = !won && movesUsed >= moveLimit;

  return { ...state, player, stars, bonusMoves, movesUsed, won, lost };
}

export function currentMoveLimit(state: BounceState): number {
  return BASE_MOVE_LIMIT + state.bonusMoves;
}
