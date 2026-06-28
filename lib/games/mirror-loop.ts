import { createRng, seededShuffle } from '../daily-seed';

export const GRID_SIZE = 7;

export type Dir = 'up' | 'down' | 'left' | 'right';
export type Orientation = '/' | '\\';

const DELTA: Record<Dir, { dr: number; dc: number }> = {
  up: { dr: -1, dc: 0 },
  down: { dr: 1, dc: 0 },
  left: { dr: 0, dc: -1 },
  right: { dr: 0, dc: 1 },
};

// Reflection table: REFLECT[orientation][incomingDir] = outgoingDir
const REFLECT: Record<Orientation, Record<Dir, Dir>> = {
  '/': { right: 'up', left: 'down', up: 'right', down: 'left' },
  '\\': { right: 'down', left: 'up', up: 'left', down: 'right' },
};

interface LaneTemplate {
  id: number;
  emitterPos: { r: number; c: number };
  emitterDir: Dir;
  mirrorPos: { r: number; c: number };
  solution: Orientation;
  targetPos: { r: number; c: number };
}

// Fixed, hand-designed, cell-disjoint lanes — geometry never changes day to
// day, which is what guarantees every daily puzzle is solvable. Only the
// starting mirror orientations and the color assigned to each lane change.
const LANES: LaneTemplate[] = [
  {
    id: 0,
    emitterPos: { r: 1, c: 0 },
    emitterDir: 'right',
    mirrorPos: { r: 1, c: 2 },
    solution: '\\',
    targetPos: { r: 4, c: 2 },
  },
  {
    id: 1,
    emitterPos: { r: 0, c: 4 },
    emitterDir: 'down',
    mirrorPos: { r: 2, c: 4 },
    solution: '/',
    targetPos: { r: 2, c: 1 },
  },
  {
    id: 2,
    emitterPos: { r: 5, c: 6 },
    emitterDir: 'left',
    mirrorPos: { r: 5, c: 1 },
    solution: '\\',
    targetPos: { r: 3, c: 1 },
  },
];

export const ROTATION_BUDGET = LANES.length;

const PALETTE = ['#F2A33D', '#E0529C', '#3DA8F2'];

export interface MirrorLoopState {
  orientations: Record<number, Orientation>; // mirrorIdx -> orientation
  laneColors: Record<number, string>; // laneId -> hex color
  movesUsed: number;
  won: boolean;
  lost: boolean;
}

function idx(r: number, c: number) {
  return r * GRID_SIZE + c;
}

export function createInitialState(seed: number): MirrorLoopState {
  const rng = createRng(seed);
  const colors = seededShuffle(PALETTE, rng);
  const laneColors: Record<number, string> = {};
  LANES.forEach((lane, i) => (laneColors[lane.id] = colors[i]));

  const orientations: Record<number, Orientation> = {};
  let wrongCount = 0;
  for (const lane of LANES) {
    const flip = rng() < 0.5;
    const other: Orientation = lane.solution === '/' ? '\\' : '/';
    orientations[idx(lane.mirrorPos.r, lane.mirrorPos.c)] = flip ? other : lane.solution;
    if (flip) wrongCount++;
  }
  if (wrongCount === 0) {
    // Don't hand out a pre-solved puzzle — flip one lane at random.
    const lane = LANES[Math.floor(rng() * LANES.length)];
    const mIdx = idx(lane.mirrorPos.r, lane.mirrorPos.c);
    orientations[mIdx] = lane.solution === '/' ? '\\' : '/';
  }

  return { orientations, laneColors, movesUsed: 0, won: false, lost: false };
}

export interface BeamTrace {
  laneId: number;
  color: string;
  points: { r: number; c: number }[];
  success: boolean;
}

function inBounds(r: number, c: number) {
  return r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE;
}

export function traceBeams(state: MirrorLoopState): BeamTrace[] {
  return LANES.map((lane) => {
    const points: { r: number; c: number }[] = [lane.emitterPos];
    let { r, c } = lane.emitterPos;
    let dir = lane.emitterDir;
    let success = false;
    const visited = new Set<string>();

    for (let step = 0; step < GRID_SIZE * GRID_SIZE; step++) {
      const { dr, dc } = DELTA[dir];
      r += dr;
      c += dc;
      if (!inBounds(r, c)) break;

      const key = `${r},${c},${dir}`;
      if (visited.has(key)) break;
      visited.add(key);

      const cellIdx = idx(r, c);
      const isThisLanesMirror = r === lane.mirrorPos.r && c === lane.mirrorPos.c;
      const isThisLanesTarget = r === lane.targetPos.r && c === lane.targetPos.c;

      if (isThisLanesMirror) {
        const orientation = state.orientations[cellIdx];
        points.push({ r, c });
        dir = REFLECT[orientation][dir];
        continue;
      }
      if (isThisLanesTarget) {
        points.push({ r, c });
        success = true;
        break;
      }
      // empty pass-through cell (may belong to another lane's corridor) — continue
    }

    return { laneId: lane.id, color: state.laneColors[lane.id], points, success };
  });
}

export function rotateMirror(state: MirrorLoopState, cellIdx: number): MirrorLoopState {
  if (state.won || state.lost) return state;
  if (!(cellIdx in state.orientations)) return state;

  const next: MirrorLoopState = {
    ...state,
    orientations: {
      ...state.orientations,
      [cellIdx]: state.orientations[cellIdx] === '/' ? '\\' : '/',
    },
    movesUsed: state.movesUsed + 1,
  };

  const beams = traceBeams(next);
  next.won = beams.every((b) => b.success);
  next.lost = !next.won && next.movesUsed >= ROTATION_BUDGET;
  return next;
}

export function getLanes() {
  return LANES;
}

export { idx as cellIndex };
