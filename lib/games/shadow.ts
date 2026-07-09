import { createRng, randInt, seededShuffle } from '../daily-seed';

export const GRID_SIZE = 5;
const TOTAL = GRID_SIZE * GRID_SIZE;
export const MOVE_LIMIT = 20;

export type Dir = 'up' | 'down' | 'left' | 'right';
export const DIRS: Record<Dir, [number, number]> = {
  up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1],
};

export interface ShadowState {
  player: number;       // cell index
  ghost: number | null; // cell index, null until first move
  ghostPending: { from: number; dir: Dir } | null; // queued echo for next turn
  walls: Set<number>;
  goal: number;
  movesUsed: number;
  won: boolean;
  lost: boolean;
}

function idx(r: number, c: number) { return r * GRID_SIZE + c; }
function rc(i: number) { return { r: Math.floor(i / GRID_SIZE), c: i % GRID_SIZE }; }

function step(pos: number, dir: Dir, walls: Set<number>): number {
  const [dr, dc] = DIRS[dir];
  const { r, c } = rc(pos);
  const nr = r + dr, nc = c + dc;
  if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE) return pos;
  const ni = idx(nr, nc);
  if (walls.has(ni)) return pos;
  return ni;
}

/** BFS to check if a path exists from start to goal given these walls. */
function isReachable(start: number, goal: number, walls: Set<number>): boolean {
  const visited = new Set([start]);
  const queue = [start];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    if (cur === goal) return true;
    for (const dir of Object.keys(DIRS) as Dir[]) {
      const next = step(cur, dir, walls);
      if (!visited.has(next)) { visited.add(next); queue.push(next); }
    }
  }
  return false;
}

export function createInitialState(seed: number): ShadowState {
  const rng = createRng(seed);
  const positions = seededShuffle(Array.from({ length: TOTAL }, (_, i) => i), rng);
  const start = positions[0];
  const goal  = positions[1];

  // Add walls — retry until path exists
  let walls = new Set<number>();
  for (let attempt = 0; attempt < 20; attempt++) {
    walls = new Set<number>();
    for (let i = 2; i < TOTAL; i++) {
      if (positions[i] !== start && positions[i] !== goal && rng() < 0.22) {
        walls.add(positions[i]);
      }
    }
    if (isReachable(start, goal, walls)) break;
  }

  return {
    player: start,
    ghost: null,
    ghostPending: null,
    walls,
    goal,
    movesUsed: 0,
    won: false,
    lost: false,
  };
}

export function applyMove(state: ShadowState, dir: Dir): ShadowState {
  if (state.won || state.lost) return state;

  // 1. Resolve queued ghost echo
  let ghost = state.ghost;
  if (state.ghostPending) {
    const { from, dir: gdir } = state.ghostPending;
    ghost = step(from, gdir, state.walls);
  }

  // 2. Move player
  const prevPlayer = state.player;
  const player = step(prevPlayer, dir, state.walls);

  // 3. Queue next ghost echo (from where player just landed, same dir as player just moved)
  const ghostPending: { from: number; dir: Dir } = { from: player, dir };

  const movesUsed = state.movesUsed + 1;
  const won = player === state.goal;
  const lost = !won && movesUsed >= MOVE_LIMIT;

  return { ...state, player, ghost, ghostPending, movesUsed, won, lost };
}
