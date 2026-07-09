import { createRng, seededShuffle } from '../daily-seed';

export const GRID_SIZE = 5;
const TOTAL = GRID_SIZE * GRID_SIZE;
export const SLIDE_LIMIT = 16;

export type Dir = 'up' | 'down' | 'left' | 'right';
export const DIRS: Record<Dir, [number, number]> = {
  up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1],
};

export interface DriftState {
  player: number;
  boxes: number[];   // sorted cell indices of movable objects
  walls: Set<number>;
  goal: number;
  slidesUsed: number;
  won: boolean;
  lost: boolean;
}

function idx(r: number, c: number) { return r * GRID_SIZE + c; }
function rc(i: number) { return { r: Math.floor(i / GRID_SIZE), c: i % GRID_SIZE }; }

function slideOne(
  player: number,
  boxes: number[],
  walls: Set<number>,
  dr: number,
  dc: number
): { player: number; boxes: number[] } {
  const boxSet = new Set(boxes);
  let { r, c } = rc(player);
  let newPlayer = player;
  const newBoxSet = new Set(boxes);

  while (true) {
    const nr = r + dr, nc = c + dc;
    if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE) break;
    const ni = idx(nr, nc);
    if (walls.has(ni)) break;
    if (boxSet.has(ni)) {
      const br = nr + dr, bc = nc + dc;
      if (br < 0 || br >= GRID_SIZE || bc < 0 || bc >= GRID_SIZE) break;
      const bi = idx(br, bc);
      if (walls.has(bi) || boxSet.has(bi)) break;
      newBoxSet.delete(ni);
      newBoxSet.add(bi);
      newPlayer = ni;
      break;
    }
    newPlayer = ni;
    r = nr; c = nc;
  }

  return { player: newPlayer, boxes: Array.from(newBoxSet).sort((a, b) => a - b) };
}

function stateKey(player: number, boxes: number[]) {
  return player + '|' + boxes.join(',');
}

function bfsSolvable(
  start: number, goal: number, boxes: number[], walls: Set<number>, budget: number
): boolean {
  const q: { player: number; boxes: number[]; moves: number }[] = [
    { player: start, boxes, moves: 0 },
  ];
  const seen = new Set([stateKey(start, boxes)]);
  while (q.length > 0) {
    const { player, boxes: bs, moves } = q.shift()!;
    if (player === goal) return true;
    if (moves >= budget) continue;
    for (const [dr, dc] of Object.values(DIRS)) {
      const res = slideOne(player, bs, walls, dr, dc);
      const k = stateKey(res.player, res.boxes);
      if (!seen.has(k)) {
        seen.add(k);
        q.push({ player: res.player, boxes: res.boxes, moves: moves + 1 });
      }
    }
  }
  return false;
}

export function createInitialState(seed: number): DriftState {
  const rng = createRng(seed);
  let player = 0, goal = 0, boxes: number[] = [], walls = new Set<number>();

  for (let attempt = 0; attempt < 30; attempt++) {
    const positions = seededShuffle(Array.from({ length: TOTAL }, (_, i) => i), rng);
    player = positions[0];
    goal = positions[1];
    walls = new Set<number>();
    boxes = [];
    for (let i = 2; i < TOTAL; i++) {
      const v = rng();
      if (v < 0.12) walls.add(positions[i]);
      else if (v < 0.22) boxes.push(positions[i]);
    }
    boxes.sort((a, b) => a - b);
    if (bfsSolvable(player, goal, boxes, walls, SLIDE_LIMIT)) break;
  }

  return { player, boxes, walls, goal, slidesUsed: 0, won: false, lost: false };
}

export function applySlide(state: DriftState, dir: Dir): DriftState {
  if (state.won || state.lost) return state;
  const [dr, dc] = DIRS[dir];
  const { player, boxes } = slideOne(state.player, state.boxes, state.walls, dr, dc);
  if (player === state.player && boxes.join(',') === state.boxes.join(',')) return state; // no movement

  const slidesUsed = state.slidesUsed + 1;
  const won = player === state.goal;
  const lost = !won && slidesUsed >= SLIDE_LIMIT;
  return { ...state, player, boxes, slidesUsed, won, lost };
}
