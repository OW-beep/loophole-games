import { createRng, seededShuffle } from '../daily-seed';

export const GRID_SIZE = 5;
const TOTAL = GRID_SIZE * GRID_SIZE;
export const MOVE_LIMIT = 20;

export type Dir = 'up' | 'down' | 'left' | 'right';
export const DIRS: Record<Dir, [number, number]> = {
  up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1],
};

export interface PhaseState {
  player: number;
  stepCount: number; // odd = solid, even = ghost
  walls: Set<number>;
  holes: Set<number>; // cells without floor — ghost falls through
  goal: number;
  movesUsed: number;
  won: boolean;
  lost: boolean;
}

export function isGhostPhase(stepCount: number): boolean {
  return stepCount % 2 === 1; // after odd number of steps, you're in ghost phase
}

function idx(r: number, c: number) { return r * GRID_SIZE + c; }
function rc(i: number) { return { r: Math.floor(i / GRID_SIZE), c: i % GRID_SIZE }; }

function applyStep(
  pos: number, dr: number, dc: number,
  walls: Set<number>, holes: Set<number>, ghost: boolean
): number {
  const { r, c } = rc(pos);
  const nr = r + dr, nc = c + dc;
  if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE) return pos;
  const ni = idx(nr, nc);

  if (ghost) {
    // pass through walls; but fall through holes
    if (holes.has(ni)) {
      const fr = nr + 1;
      if (fr >= GRID_SIZE) return ni; // bottom edge — stay
      return idx(fr, nc);
    }
    return ni;
  } else {
    // solid — blocked by walls
    if (walls.has(ni)) return pos;
    return ni;
  }
}

function bfsSolvable(
  start: number, goal: number,
  walls: Set<number>, holes: Set<number>, budget: number
): boolean {
  const key = (p: number, s: number) => p * 100 + (s % 2);
  const q: { pos: number; steps: number }[] = [{ pos: start, steps: 0 }];
  const seen = new Set([key(start, 0)]);
  while (q.length > 0) {
    const { pos, steps } = q.shift()!;
    if (pos === goal) return true;
    if (steps >= budget) continue;
    const ghost = isGhostPhase(steps + 1);
    for (const [dr, dc] of Object.values(DIRS)) {
      const np = applyStep(pos, dr, dc, walls, holes, ghost);
      const k = key(np, steps + 1);
      if (!seen.has(k)) { seen.add(k); q.push({ pos: np, steps: steps + 1 }); }
    }
  }
  return false;
}

export function createInitialState(seed: number): PhaseState {
  const rng = createRng(seed);
  let player = 0, goal = 0, walls = new Set<number>(), holes = new Set<number>();

  for (let attempt = 0; attempt < 30; attempt++) {
    const positions = seededShuffle(Array.from({ length: TOTAL }, (_, i) => i), rng);
    player = positions[0];
    goal = positions[1];
    walls = new Set<number>();
    holes = new Set<number>();

    for (let i = 2; i < TOTAL; i++) {
      const v = rng();
      if (v < 0.15) walls.add(positions[i]);
      else if (v < 0.25) holes.add(positions[i]);
    }
    // never remove floor from start or goal
    holes.delete(player);
    holes.delete(goal);

    if (bfsSolvable(player, goal, walls, holes, MOVE_LIMIT)) break;
  }

  return { player, stepCount: 0, walls, holes, goal, movesUsed: 0, won: false, lost: false };
}

export function applyMove(state: PhaseState, dir: Dir): PhaseState {
  if (state.won || state.lost) return state;
  const [dr, dc] = DIRS[dir];
  const ghost = isGhostPhase(state.stepCount + 1);
  const player = applyStep(state.player, dr, dc, state.walls, state.holes, ghost);
  if (player === state.player) return state; // no movement — no cost

  const stepCount = state.stepCount + 1;
  const movesUsed = state.movesUsed + 1;
  const won = player === state.goal;
  const lost = !won && movesUsed >= MOVE_LIMIT;

  return { ...state, player, stepCount, movesUsed, won, lost };
}
