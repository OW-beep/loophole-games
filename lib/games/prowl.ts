import { createRng, randInt, seededShuffle } from '../daily-seed';

/**
 * PROWL — stealth-infiltration game.
 *
 * Unlike the rest of the catalog, Prowl's "board" is a city block laid out on
 * a fixed street grid (streets = every 3rd row/column, buildings fill the
 * gaps). That guarantees full connectivity for free — no reachability
 * retries needed — while still giving the 3D renderer real buildings to cast
 * line-of-sight shadows against.
 *
 * The player moves one street-cell per turn, exactly like every other game
 * (so it plugs into the same move-budget / coin-mode / leaderboard plumbing).
 * What's new: each turn, patrol guards also take a step and "look" down a
 * cone of street cells in their facing direction. If the player is standing
 * in a visible cell and has no jammer charge banked, the run ends immediately
 * — getting caught is a hard fail, not a move penalty.
 */

export const GRID_SIZE = 11;
const TOTAL = GRID_SIZE * GRID_SIZE;
export const BASE_MOVE_LIMIT = 46;

export type Dir = 'up' | 'down' | 'left' | 'right';
export const DIRS: Record<Dir, [number, number]> = {
  up: [-1, 0],
  down: [1, 0],
  left: [0, -1],
  right: [0, 1],
};
const DIR_LIST: Dir[] = ['up', 'down', 'left', 'right'];

export interface Guard {
  id: number;
  a: number; // one end of the patrol line (cell index)
  b: number; // other end of the patrol line (cell index)
  pos: number; // current cell index
  facing: Dir;
  forward: boolean; // walking a -> b
  visionRange: number;
}

export interface ProwlState {
  player: number;
  start: number;
  goal: number;
  buildings: Set<number>;
  guards: Guard[];
  jammers: Set<number>; // uncollected jammer pickups
  shards: Set<number>; // uncollected data-shard pickups
  totalShards: number;
  jamCharges: number;
  shardsCollected: number;
  visibleCells: Set<number>; // union of every guard's current vision cone
  movesUsed: number;
  moveLimit: number;
  won: boolean;
  lost: boolean;
  caught: boolean; // true if the loss was a spotting, not running out of moves
}

export function currentMoveLimit(state: ProwlState): number {
  return state.moveLimit;
}

export type ProwlDifficulty = 'easy' | 'normal' | 'hard';

function idx(r: number, c: number) {
  return r * GRID_SIZE + c;
}
function rc(i: number) {
  return { r: Math.floor(i / GRID_SIZE), c: i % GRID_SIZE };
}
function isStreet(r: number, c: number) {
  return r % 3 === 0 || c % 3 === 0;
}
function inBounds(r: number, c: number) {
  return r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE;
}

function buildStreetGrid(): { walkable: boolean[]; buildings: Set<number> } {
  const walkable = new Array(TOTAL).fill(false);
  const buildings = new Set<number>();
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const i = idx(r, c);
      if (isStreet(r, c)) walkable[i] = true;
      else buildings.add(i);
    }
  }
  return { walkable, buildings };
}

function step(pos: number, dir: Dir, walkable: boolean[]): number {
  const [dr, dc] = DIRS[dir];
  const { r, c } = rc(pos);
  const nr = r + dr,
    nc = c + dc;
  if (!inBounds(nr, nc)) return pos;
  const ni = idx(nr, nc);
  if (!walkable[ni]) return pos;
  return ni;
}

/** Longest straight open run of street cells starting at (r,c) heading dir. */
function walkRun(r: number, c: number, dir: Dir, walkable: boolean[], maxLen: number): number[] {
  const [dr, dc] = DIRS[dir];
  const cells: number[] = [];
  let cr = r,
    cc = c;
  while (cells.length < maxLen) {
    const nr = cr + dr,
      nc = cc + dc;
    if (!inBounds(nr, nc) || !walkable[idx(nr, nc)]) break;
    cells.push(idx(nr, nc));
    cr = nr;
    cc = nc;
  }
  return cells;
}

/** Ray-marched vision cone: a center ray plus two shorter flanking rays, all stopped by buildings. */
function visionCells(guard: Guard, walkable: boolean[]): Set<number> {
  const out = new Set<number>();
  const { r, c } = rc(guard.pos);
  const [dr, dc] = DIRS[guard.facing];
  // perpendicular direction for flanking rays
  const perp: [number, number] = dr !== 0 ? [0, 1] : [1, 0];

  const castRay = (startR: number, startC: number, len: number) => {
    let cr = startR,
      cc = startC;
    for (let d = 0; d < len; d++) {
      cr += dr;
      cc += dc;
      if (!inBounds(cr, cc)) break;
      const ci = idx(cr, cc);
      if (!walkable[ci]) break; // building blocks line of sight
      out.add(ci);
    }
  };

  castRay(r, c, guard.visionRange); // center
  castRay(r + perp[0], c + perp[1], Math.max(1, guard.visionRange - 2)); // left flank
  castRay(r - perp[0], c - perp[1], Math.max(1, guard.visionRange - 2)); // right flank

  return out;
}

function recomputeVisibility(state: ProwlState): Set<number> {
  const walkable = new Array(TOTAL).fill(false);
  for (let i = 0; i < TOTAL; i++) walkable[i] = !state.buildings.has(i);
  const union = new Set<number>();
  for (const g of state.guards) {
    for (const cell of visionCells(g, walkable)) union.add(cell);
  }
  return union;
}

export function difficultyParams(difficulty: ProwlDifficulty): { guardCount: number; visionRange: number; moveLimit: number } {
  switch (difficulty) {
    case 'easy':
      return { guardCount: 2, visionRange: 2, moveLimit: BASE_MOVE_LIMIT + 10 };
    case 'hard':
      return { guardCount: 5, visionRange: 4, moveLimit: BASE_MOVE_LIMIT - 6 };
    case 'normal':
    default:
      return { guardCount: 3, visionRange: 3, moveLimit: BASE_MOVE_LIMIT };
  }
}

export function createInitialState(seed: number, difficulty: ProwlDifficulty = 'normal'): ProwlState {
  const rng = createRng(seed);
  const { walkable, buildings } = buildStreetGrid();
  const streetCells = Array.from({ length: TOTAL }, (_, i) => i).filter((i) => walkable[i]);
  const shuffled = seededShuffle(streetCells.slice(), rng);

  // Start near one corner, goal near the opposite corner (both are street cells by construction).
  const start = shuffled.find((i) => {
    const { r, c } = rc(i);
    return r <= 2 && c <= 2;
  })!;
  const goal = shuffled.find((i) => {
    const { r, c } = rc(i);
    return r >= GRID_SIZE - 3 && c >= GRID_SIZE - 3;
  })!;

  const { guardCount, visionRange, moveLimit } = difficultyParams(difficulty);

  // Build patrol candidates: straight open runs of length >= 3 along streets.
  const guards: Guard[] = [];
  let guardId = 0;
  let attempts = 0;
  const usedCells = new Set<number>([start, goal]);
  while (guards.length < guardCount && attempts < 200) {
    attempts++;
    const originCell = streetCells[randInt(rng, 0, streetCells.length - 1)];
    const { r, c } = rc(originCell);
    const dir = DIR_LIST[randInt(rng, 0, 3)];
    const run = walkRun(r, c, dir, walkable, 5);
    if (run.length < 3) continue;
    const a = originCell;
    const b = run[run.length - 1];
    if (usedCells.has(a) || usedCells.has(b)) continue;
    guards.push({
      id: guardId++,
      a,
      b,
      pos: a,
      facing: dir,
      forward: true,
      visionRange,
    });
    usedCells.add(a);
    usedCells.add(b);
  }

  // Pickups on remaining street cells.
  const pickupPool = shuffled.filter((i) => i !== start && i !== goal && !usedCells.has(i));
  const jammers = new Set(pickupPool.slice(0, 4));
  const shards = new Set(pickupPool.slice(4, 10));

  const state: ProwlState = {
    player: start,
    start,
    goal,
    buildings,
    guards,
    jammers,
    shards,
    totalShards: shards.size,
    jamCharges: 0,
    shardsCollected: 0,
    visibleCells: new Set(),
    movesUsed: 0,
    moveLimit,
    won: false,
    lost: false,
    caught: false,
  };
  state.visibleCells = recomputeVisibility(state);
  return state;
}

function advanceGuard(g: Guard, walkable: boolean[]): Guard {
  const target = g.forward ? g.b : g.a;
  if (g.pos === target) {
    // reverse direction at the end of the patrol line
    const forward = !g.forward;
    const nextTarget = forward ? g.b : g.a;
    const facing = facingTowards(g.pos, nextTarget);
    return { ...g, forward, facing };
  }
  const facing = facingTowards(g.pos, target);
  const pos = step(g.pos, facing, walkable);
  return { ...g, pos, facing };
}

function facingTowards(from: number, to: number): Dir {
  const a = rc(from);
  const b = rc(to);
  if (b.r < a.r) return 'up';
  if (b.r > a.r) return 'down';
  if (b.c < a.c) return 'left';
  return 'right';
}

export function applyMove(state: ProwlState, dir: Dir): ProwlState {
  const moveLimit = state.moveLimit;
  if (state.won || state.lost) return state;

  const walkable = new Array(TOTAL).fill(false);
  for (let i = 0; i < TOTAL; i++) walkable[i] = !state.buildings.has(i);

  // 1. Move the player.
  const player = step(state.player, dir, walkable);

  // 2. Collect pickups on the new cell.
  let jammers = state.jammers;
  let shards = state.shards;
  let jamCharges = state.jamCharges;
  let shardsCollected = state.shardsCollected;
  if (jammers.has(player)) {
    jammers = new Set(jammers);
    jammers.delete(player);
    jamCharges += 1;
  }
  if (shards.has(player)) {
    shards = new Set(shards);
    shards.delete(player);
    shardsCollected += 1;
  }

  // 3. Advance every guard one patrol step.
  const guards = state.guards.map((g) => advanceGuard(g, walkable));

  const movesUsed = state.movesUsed + 1;
  const won = player === state.goal;

  // 4. Check detection against the guards' new vision cones.
  const nextState: ProwlState = {
    ...state,
    player,
    jammers,
    shards,
    jamCharges,
    shardsCollected,
    guards,
    movesUsed,
    won,
    lost: false,
    caught: false,
  };
  const visibleCells = recomputeVisibility(nextState);
  nextState.visibleCells = visibleCells;

  if (!won && visibleCells.has(player)) {
    if (jamCharges > 0) {
      // spend a charge to slip past unnoticed this turn
      nextState.jamCharges = jamCharges - 1;
    } else {
      nextState.lost = true;
      nextState.caught = true;
    }
  }

  if (!nextState.won && !nextState.lost && movesUsed >= moveLimit) {
    nextState.lost = true;
    nextState.caught = false;
  }

  return nextState;
}
