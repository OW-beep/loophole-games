import { createRng } from '../daily-seed';

export const GRID_SIZE = 7;

export type Dir = 'up' | 'down' | 'left' | 'right';
export type Orientation = '/' | '\\';

const DELTA: Record<Dir, [number, number]> = {
  up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1],
};

const REFLECT: Record<Orientation, Record<Dir, Dir>> = {
  '/':  { right: 'up',   left: 'down', up: 'right', down: 'left'  },
  '\\': { right: 'down', left: 'up',   up: 'left',  down: 'right' },
};

interface Mirror {
  pos: { r: number; c: number };
  sol: Orientation;
}

interface LaneTemplate {
  id: number;
  emitter: { r: number; c: number };
  dir: Dir;
  mirrors: Mirror[];
  target: { r: number; c: number };
}

// Each lane now has TWO mirrors. The beam must hit both in sequence.
// Cell disjointness verified by simulation — no position appears in two
// lanes, and no mirror overlaps an emitter or target.
const LANES: LaneTemplate[] = [
  {
    id: 0,
    emitter: { r: 1, c: 0 }, dir: 'right',
    mirrors: [ { pos: { r: 1, c: 2 }, sol: '\\' }, { pos: { r: 3, c: 2 }, sol: '\\' } ],
    target:  { r: 3, c: 5 },
  },
  {
    id: 1,
    emitter: { r: 0, c: 4 }, dir: 'down',
    mirrors: [ { pos: { r: 2, c: 4 }, sol: '/' }, { pos: { r: 2, c: 1 }, sol: '\\' } ],
    target:  { r: 0, c: 1 },
  },
  {
    id: 2,
    emitter: { r: 6, c: 3 }, dir: 'up',
    mirrors: [ { pos: { r: 4, c: 3 }, sol: '/' }, { pos: { r: 4, c: 5 }, sol: '\\' } ],
    target:  { r: 6, c: 5 },
  },
];

// Total mirrors = 6; rotation budget = exact number of wrongly-oriented mirrors
// on any given day (minimum 1, maximum 6, determined at generation time).
export const PALETTE = ['#F2A33D', '#3DA8F2', '#5FBF6A'];

export interface MirrorLoopState {
  // All 6 mirror orientations indexed by their cell key "r,c"
  orientations: Record<string, Orientation>;
  laneColors:   Record<number, string>;
  wrongAtStart: number; // equals the rotation budget for this puzzle
  movesUsed:    number;
  won:          boolean;
  lost:         boolean;
}

function cellKey(r: number, c: number) { return `${r},${c}`; }

function flip(o: Orientation): Orientation { return o === '/' ? '\\' : '/'; }

function inBounds(r: number, c: number) {
  return r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE;
}

export function createInitialState(seed: number): MirrorLoopState {
  const rng = createRng(seed);

  // Assign colors
  const colorOrder = [0, 1, 2].sort(() => rng() - 0.5);
  const laneColors: Record<number, string> = {};
  LANES.forEach((lane, i) => (laneColors[lane.id] = PALETTE[colorOrder[i]]));

  // Build solution map
  const solMap: Record<string, Orientation> = {};
  for (const lane of LANES) for (const m of lane.mirrors) solMap[cellKey(m.pos.r, m.pos.c)] = m.sol;

  // Scramble: flip each mirror independently with p=0.5
  const orientations: Record<string, Orientation> = { ...solMap };
  let wrongCount = 0;
  for (const lane of LANES) {
    for (const m of lane.mirrors) {
      if (rng() < 0.5) {
        orientations[cellKey(m.pos.r, m.pos.c)] = flip(m.sol);
        wrongCount++;
      }
    }
  }
  // Guarantee at least one wrong mirror
  if (wrongCount === 0) {
    const lane = LANES[Math.floor(rng() * LANES.length)];
    const m = lane.mirrors[Math.floor(rng() * lane.mirrors.length)];
    const key = cellKey(m.pos.r, m.pos.c);
    orientations[key] = flip(orientations[key]);
    wrongCount = 1;
  }

  return { orientations, laneColors, wrongAtStart: wrongCount, movesUsed: 0, won: false, lost: false };
}

export interface BeamSegment {
  from: { r: number; c: number };
  to:   { r: number; c: number };
}

export interface BeamTrace {
  laneId:   number;
  color:    string;
  /** Only the segment FROM the emitter TO the first mirror is shown.
   *  Everything beyond the first mirror is hidden — the player must reason
   *  about it rather than see it. */
  visibleSegments: BeamSegment[];
  /** Whether the beam has fully reached its target (shown on target dot). */
  success:  boolean;
}

function traceFull(lane: LaneTemplate, orient: (r: number, c: number) => Orientation): { r: number; c: number }[] {
  const path: { r: number; c: number }[] = [lane.emitter];
  let { r, c } = lane.emitter;
  let dir: Dir = lane.dir;
  const visited = new Set<string>();
  for (let step = 0; step < GRID_SIZE * GRID_SIZE * 2; step++) {
    const [dr, dc] = DELTA[dir];
    r += dr; c += dc;
    if (!inBounds(r, c)) break;
    const vkey = `${r},${c},${dir}`;
    if (visited.has(vkey)) break;
    visited.add(vkey);
    path.push({ r, c });
    const isMirror = lane.mirrors.some(m => m.pos.r === r && m.pos.c === c);
    if (isMirror) {
      dir = REFLECT[orient(r, c)][dir];
      continue;
    }
    if (r === lane.target.r && c === lane.target.c) return path;
  }
  return path;
}

export function traceBeams(state: MirrorLoopState): BeamTrace[] {
  return LANES.map(lane => {
    const orient = (r: number, c: number) => state.orientations[cellKey(r, c)];
    const fullPath = traceFull(lane, orient);

    // Visible: emitter → first mirror hit (index 0 in lane.mirrors order by path order)
    const firstMirrorIdx = fullPath.findIndex(
      pt => lane.mirrors.some(m => m.pos.r === pt.r && m.pos.c === pt.c)
    );
    const visibleEnd = firstMirrorIdx >= 1 ? firstMirrorIdx : fullPath.length - 1;
    const visiblePoints = fullPath.slice(0, visibleEnd + 1);
    const visibleSegments: BeamSegment[] = [];
    for (let i = 0; i + 1 < visiblePoints.length; i++) {
      visibleSegments.push({ from: visiblePoints[i], to: visiblePoints[i + 1] });
    }

    const last = fullPath[fullPath.length - 1];
    const success = last.r === lane.target.r && last.c === lane.target.c;

    return { laneId: lane.id, color: state.laneColors[lane.id], visibleSegments, success };
  });
}

export function rotateMirror(state: MirrorLoopState, r: number, c: number): MirrorLoopState {
  if (state.won || state.lost) return state;
  const key = cellKey(r, c);
  if (!(key in state.orientations)) return state;

  const next: MirrorLoopState = {
    ...state,
    orientations: { ...state.orientations, [key]: flip(state.orientations[key]) },
    movesUsed: state.movesUsed + 1,
  };

  const beams = traceBeams(next);
  next.won  = beams.every(b => b.success);
  next.lost = !next.won && next.movesUsed >= state.wrongAtStart;
  return next;
}

export function getLanes(): LaneTemplate[] { return LANES; }
export { cellKey };
