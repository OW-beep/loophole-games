// lib/games/wiggle.ts
//
// Wiggle: a caterpillar eats every leaf on a small grid before running out
// of moves — but every cell it has visited becomes part of its own body,
// which it can never cross again. This is deliberately a different kind of
// constraint from every other movement game on the site (Croak, Bounce,
// Shadow, Tether, Phase, Drift, Burrow, Clearway): those all navigate
// around a fixed layout of obstacles decided at generation time. Here
// there are no preset obstacles at all — the only hazard is the player's
// own growing trail, so the puzzle is entirely about the order you choose
// to visit things in.
//
// Solvability is guaranteed by construction rather than by verification:
// generation performs a random self-avoiding walk first and only places
// leaves ON that walk, so simply retracing the generated path always wins.
// A player is still free to deviate from it — deviating just risks
// trapping themselves, which is a normal, intended way to lose (the same
// principle as running out of a move budget elsewhere on the site).

import { createRng } from '../daily-seed';

export const GRID_SIZE = 6;
const TOTAL = GRID_SIZE * GRID_SIZE;
const PATH_LENGTH = 14; // cells visited by the generated solution, including the start
const LEAF_STEP = 2; // place a leaf every other step along the generated path
const MOVE_SLACK = 3;
const MAX_GENERATION_ATTEMPTS = 400;

export type Dir = 'up' | 'down' | 'left' | 'right';
const DIRS: Record<Dir, [number, number]> = {
  up: [-1, 0],
  down: [1, 0],
  left: [0, -1],
  right: [0, 1],
};

export interface WiggleState {
  seed: number;
  trail: number[]; // every cell visited so far, in order; trail[0] is the start
  leaves: Set<number>; // uncollected leaf cells
  totalLeaves: number;
  movesUsed: number;
  moveLimit: number;
  won: boolean;
  lost: boolean;
}

function idx(r: number, c: number) {
  return r * GRID_SIZE + c;
}
function rc(i: number) {
  return { r: Math.floor(i / GRID_SIZE), c: i % GRID_SIZE };
}

function neighbors(cell: number): number[] {
  const { r, c } = rc(cell);
  const out: number[] = [];
  for (const [dr, dc] of Object.values(DIRS)) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) out.push(idx(nr, nc));
  }
  return out;
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** A random self-avoiding walk of PATH_LENGTH cells, retried (with a fresh
 * start each time) until one is found. On a 6x6 grid with a 14-cell target
 * this succeeds within a handful of attempts essentially always. */
function generateWalk(rng: () => number): number[] {
  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
    const start = Math.floor(rng() * TOTAL);
    const path = [start];
    const visited = new Set([start]);
    let stuck = false;

    while (path.length < PATH_LENGTH) {
      const cur = path[path.length - 1];
      const options = shuffle(neighbors(cur), rng).filter((n) => !visited.has(n));
      if (options.length === 0) {
        stuck = true;
        break;
      }
      const next = options[0];
      path.push(next);
      visited.add(next);
    }

    if (!stuck) return path;
  }
  // Extremely unlikely fallback: a short straight line is always safe.
  return [0, 1, 2, 3];
}

export function createInitialState(seed: number): WiggleState {
  const rng = createRng(seed);
  const path = generateWalk(rng);

  const leaves = new Set<number>();
  for (let i = LEAF_STEP; i < path.length; i += LEAF_STEP) {
    leaves.add(path[i]);
  }
  // Guarantee at least one leaf even on a short fallback path.
  if (leaves.size === 0) leaves.add(path[path.length - 1]);

  const moveLimit = path.length - 1 + MOVE_SLACK;

  return {
    seed,
    trail: [path[0]],
    leaves,
    totalLeaves: leaves.size,
    movesUsed: 0,
    moveLimit,
    won: false,
    lost: false,
  };
}

function hasLegalMove(cell: number, trailSet: Set<number>): boolean {
  return neighbors(cell).some((n) => !trailSet.has(n));
}

export function applyMove(state: WiggleState, dir: Dir): WiggleState {
  if (state.won || state.lost) return state;

  const player = state.trail[state.trail.length - 1];
  const { r, c } = rc(player);
  const [dr, dc] = DIRS[dir];
  const nr = r + dr;
  const nc = c + dc;
  if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE) return state; // off the grid — no-op, free

  const next = idx(nr, nc);
  const trailSet = new Set(state.trail);
  if (trailSet.has(next)) return state; // would cross its own body — no-op, free

  const trail = [...state.trail, next];
  const leaves = new Set(state.leaves);
  leaves.delete(next);
  const movesUsed = state.movesUsed + 1;

  const won = leaves.size === 0;
  const nextTrailSet = new Set(trail);
  const trapped = !won && !hasLegalMove(next, nextTrailSet);
  const lost = !won && (movesUsed >= state.moveLimit || trapped);

  return { ...state, trail, leaves, movesUsed, won, lost };
}
