import { createRng, randInt } from '../daily-seed';

export const GRID_ROWS = 10;
export const GRID_COLS = 14;
export const TRACK_HALF_WIDTH = 1.3;
export const FINISH_RADIUS = 1.6;
export const MAX_SPEED = 3;
export const MOVE_SLACK = 4;

export interface Point {
  row: number;
  col: number;
}

export interface ApexState {
  trackCells: Set<string>; // "row,col" of drivable cells
  start: Point;
  finish: Point;
  position: Point;
  velocity: { dRow: number; dCol: number };
  path: Point[]; // every position visited so far, for drawing the trail
  moveLimit: number;
  movesUsed: number;
  won: boolean;
  lost: boolean;
}

function key(p: Point): string {
  return `${p.row},${p.col}`;
}

function distToSegment(p: Point, a: Point, b: Point): number {
  const dx = b.col - a.col;
  const dy = b.row - a.row;
  const lengthSq = dx * dx + dy * dy;
  let t = lengthSq === 0 ? 0 : ((p.col - a.col) * dx + (p.row - a.row) * dy) / lengthSq;
  t = Math.max(0, Math.min(1, t));
  const closestCol = a.col + t * dx;
  const closestRow = a.row + t * dy;
  return Math.hypot(p.col - closestCol, p.row - closestRow);
}

function generateWaypoints(rng: () => number): Point[] {
  const count = randInt(rng, 5, 7);
  const points: Point[] = [];
  const marginRow = 2;
  const marginCol = 2;
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const col = marginCol + t * (GRID_COLS - 1 - 2 * marginCol);
    const row = randInt(rng, marginRow, GRID_ROWS - 1 - marginRow);
    points.push({ row, col });
  }
  return points;
}

function buildTrack(waypoints: Point[]): Set<string> {
  const track = new Set<string>();
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const p = { row, col };
      let minDist = Infinity;
      for (let i = 0; i < waypoints.length - 1; i++) {
        const d = distToSegment(p, waypoints[i], waypoints[i + 1]);
        if (d < minDist) minDist = d;
      }
      if (minDist <= TRACK_HALF_WIDTH) track.add(key(p));
    }
  }
  return track;
}

function inBounds(p: Point): boolean {
  return p.row >= 0 && p.row < GRID_ROWS && p.col >= 0 && p.col < GRID_COLS;
}

/** Samples points along the straight-line move from a to b to make sure the
 * whole path stayed on track, not just the endpoint (so high speed can't
 * "jump over" a wall). */
function pathStaysOnTrack(track: Set<string>, a: Point, b: Point): boolean {
  const steps = Math.max(Math.abs(b.row - a.row), Math.abs(b.col - a.col), 1);
  for (let s = 0; s <= steps; s++) {
    const t = s / steps;
    const row = Math.round(a.row + (b.row - a.row) * t);
    const col = Math.round(a.col + (b.col - a.col) * t);
    if (!inBounds({ row, col }) || !track.has(key({ row, col }))) return false;
  }
  return true;
}

interface RaceState {
  row: number;
  col: number;
  dRow: number;
  dCol: number;
}

function raceKey(s: RaceState): string {
  return `${s.row},${s.col},${s.dRow},${s.dCol}`;
}

function withinFinish(p: Point, finish: Point): boolean {
  return Math.hypot(p.row - finish.row, p.col - finish.col) <= FINISH_RADIUS;
}

/** BFS over (position, velocity) states — the classic way to both verify and
 * measure a vector-race track. Returns the shortest number of turns to reach
 * the finish, or null if unreachable. */
function bfsSolve(track: Set<string>, start: Point, finish: Point): number | null {
  const startState: RaceState = { row: start.row, col: start.col, dRow: 0, dCol: 0 };
  const dist = new Map<string, number>([[raceKey(startState), 0]]);
  const queue: RaceState[] = [startState];
  let head = 0;

  while (head < queue.length) {
    const cur = queue[head++];
    const d = dist.get(raceKey(cur))!;
    if (withinFinish({ row: cur.row, col: cur.col }, finish)) return d;

    for (let aRow = -1; aRow <= 1; aRow++) {
      for (let aCol = -1; aCol <= 1; aCol++) {
        const dRow = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, cur.dRow + aRow));
        const dCol = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, cur.dCol + aCol));
        const nextRow = cur.row + dRow;
        const nextCol = cur.col + dCol;
        const next: Point = { row: nextRow, col: nextCol };
        if (!pathStaysOnTrack(track, { row: cur.row, col: cur.col }, next)) continue;
        const nextState: RaceState = { row: nextRow, col: nextCol, dRow, dCol };
        const k = raceKey(nextState);
        if (dist.has(k)) continue;
        dist.set(k, d + 1);
        queue.push(nextState);
      }
    }
  }
  return null;
}

export function createInitialState(seed: number): ApexState {
  const rng = createRng(seed);

  let track: Set<string> = new Set();
  let waypoints: Point[] = [];
  let optimalMoves: number | null = null;

  for (let attempt = 0; attempt < 15 && optimalMoves === null; attempt++) {
    waypoints = generateWaypoints(rng);
    track = buildTrack(waypoints);
    optimalMoves = bfsSolve(track, waypoints[0], waypoints[waypoints.length - 1]);
  }

  if (optimalMoves === null) {
    waypoints = [
      { row: Math.floor(GRID_ROWS / 2), col: 1 },
      { row: Math.floor(GRID_ROWS / 2), col: GRID_COLS - 2 },
    ];
    track = buildTrack(waypoints);
    optimalMoves = bfsSolve(track, waypoints[0], waypoints[waypoints.length - 1]) ?? 6;
  }

  const start = waypoints[0];
  const finish = waypoints[waypoints.length - 1];

  return {
    trackCells: track,
    start,
    finish,
    position: start,
    velocity: { dRow: 0, dCol: 0 },
    path: [start],
    moveLimit: optimalMoves + MOVE_SLACK,
    movesUsed: 0,
    won: false,
    lost: false,
  };
}

export function attemptMove(state: ApexState, aRow: number, aCol: number): ApexState {
  if (state.won || state.lost) return state;

  const dRow = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, state.velocity.dRow + aRow));
  const dCol = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, state.velocity.dCol + aCol));
  const next: Point = { row: state.position.row + dRow, col: state.position.col + dCol };

  const onTrack = pathStaysOnTrack(state.trackCells, state.position, next);
  const movesUsed = state.movesUsed + 1;

  if (!onTrack) {
    return { ...state, movesUsed, lost: true };
  }

  const won = withinFinish(next, state.finish);
  const lost = !won && movesUsed >= state.moveLimit;

  return {
    ...state,
    position: next,
    velocity: { dRow, dCol },
    path: [...state.path, next],
    movesUsed,
    won,
    lost,
  };
}

export { key as pointKey };
