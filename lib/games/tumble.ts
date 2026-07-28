import { createRng, randInt } from '../daily-seed';

export const BOARD_ROWS = 7;
export const BOARD_COLS = 7;
export const GAP_FRACTION = 0.32; // roughly this share of off-path cells become gaps
export const MOVE_SLACK = 6;

export type Orientation = 'standing' | 'lying-x' | 'lying-y';

export interface BlockState {
  orientation: Orientation;
  row: number; // anchor cell
  col: number;
}

export type Direction = 'up' | 'down' | 'left' | 'right';

function occupiedCells(b: BlockState): { row: number; col: number }[] {
  if (b.orientation === 'standing') return [{ row: b.row, col: b.col }];
  if (b.orientation === 'lying-x') return [{ row: b.row, col: b.col }, { row: b.row, col: b.col + 1 }];
  return [{ row: b.row, col: b.col }, { row: b.row + 1, col: b.col }];
}

function inBounds(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_ROWS && col >= 0 && col < BOARD_COLS;
}

/** Rolls a block one step, per classic Bloxorz rules — does not check tiles,
 * only geometry; bounds/gap validity is checked separately. */
function roll(b: BlockState, dir: Direction): BlockState {
  if (b.orientation === 'standing') {
    if (dir === 'left') return { orientation: 'lying-x', row: b.row, col: b.col - 2 };
    if (dir === 'right') return { orientation: 'lying-x', row: b.row, col: b.col + 1 };
    if (dir === 'up') return { orientation: 'lying-y', row: b.row - 2, col: b.col };
    return { orientation: 'lying-y', row: b.row + 1, col: b.col };
  }
  if (b.orientation === 'lying-x') {
    if (dir === 'left') return { orientation: 'standing', row: b.row, col: b.col - 1 };
    if (dir === 'right') return { orientation: 'standing', row: b.row, col: b.col + 2 };
    if (dir === 'up') return { orientation: 'lying-x', row: b.row - 1, col: b.col };
    return { orientation: 'lying-x', row: b.row + 1, col: b.col };
  }
  // lying-y
  if (dir === 'up') return { orientation: 'standing', row: b.row - 1, col: b.col };
  if (dir === 'down') return { orientation: 'standing', row: b.row + 2, col: b.col };
  if (dir === 'left') return { orientation: 'lying-y', row: b.row, col: b.col - 1 };
  return { orientation: 'lying-y', row: b.row, col: b.col + 1 };
}

function blockKey(b: BlockState): string {
  return `${b.orientation}:${b.row},${b.col}`;
}

function validOnFullBoard(b: BlockState): boolean {
  return occupiedCells(b).every((c) => inBounds(c.row, c.col));
}

function validOnBoard(b: BlockState, gaps: Set<string>): boolean {
  return occupiedCells(b).every((c) => inBounds(c.row, c.col) && !gaps.has(`${c.row},${c.col}`));
}

const BASE_DIRECTIONS: Direction[] = ['up', 'down', 'left', 'right'];

/** BFS over all block states reachable on a board (with the given gap set —
 * pass an empty set to solve on a "full" board). Returns distance/parent maps
 * keyed by blockKey, for path reconstruction. The direction order affects
 * which of several equally-short paths gets recorded when there are ties, so
 * it's shuffled per day — otherwise every day's "guaranteed safe route" would
 * be the exact same shape, with only the decorative gaps varying. */
function bfsSolve(startCell: { row: number; col: number }, gaps: Set<string>, directionOrder: Direction[]) {
  const start: BlockState = { orientation: 'standing', row: startCell.row, col: startCell.col };
  const dist = new Map<string, number>([[blockKey(start), 0]]);
  const parent = new Map<string, { state: BlockState; dir: Direction }>();
  const queue: BlockState[] = [start];
  let head = 0;

  while (head < queue.length) {
    const current = queue[head++];
    const d = dist.get(blockKey(current))!;
    for (const dir of directionOrder) {
      const next = roll(current, dir);
      if (!validOnBoard(next, gaps)) continue;
      const k = blockKey(next);
      if (dist.has(k)) continue;
      dist.set(k, d + 1);
      parent.set(k, { state: current, dir });
      queue.push(next);
    }
  }

  return { dist, parent };
}

function reconstructMoves(
  parent: Map<string, { state: BlockState; dir: Direction }>,
  goalKey: string
): Direction[] {
  const moves: Direction[] = [];
  let currentKey = goalKey;
  while (parent.has(currentKey)) {
    const { state, dir } = parent.get(currentKey)!;
    moves.push(dir);
    currentKey = blockKey(state);
  }
  return moves.reverse();
}

export interface TumbleState {
  gaps: Set<string>;
  start: { row: number; col: number };
  goal: { row: number; col: number };
  block: BlockState;
  moveLimit: number;
  movesUsed: number;
  won: boolean;
  lost: boolean;
}

export function createInitialState(seed: number): TumbleState {
  const rng = createRng(seed);

  // Randomize start/goal within the interior (so the block always has room
  // to roll in every direction from both), with a minimum distance apart so
  // the puzzle isn't trivially short.
  let start = { row: 1, col: 1 };
  let goal = { row: BOARD_ROWS - 2, col: BOARD_COLS - 2 };
  for (let attempt = 0; attempt < 20; attempt++) {
    const candidateStart = { row: randInt(rng, 1, BOARD_ROWS - 2), col: randInt(rng, 1, BOARD_COLS - 2) };
    const candidateGoal = { row: randInt(rng, 1, BOARD_ROWS - 2), col: randInt(rng, 1, BOARD_COLS - 2) };
    const manhattan = Math.abs(candidateStart.row - candidateGoal.row) + Math.abs(candidateStart.col - candidateGoal.col);
    if (manhattan >= 5) {
      start = candidateStart;
      goal = candidateGoal;
      break;
    }
  }

  // Shuffle direction order too, so BFS tie-breaking among equally-short
  // paths between the same start/goal also varies.
  const directionOrder = [...BASE_DIRECTIONS];
  for (let i = directionOrder.length - 1; i > 0; i--) {
    const j = randInt(rng, 0, i);
    [directionOrder[i], directionOrder[j]] = [directionOrder[j], directionOrder[i]];
  }

  // 1. Solve on a full (gapless) board to get a guaranteed-valid solution path.
  const fullGaps = new Set<string>();
  const { dist: fullDist, parent: fullParent } = bfsSolve(start, fullGaps, directionOrder);
  const goalStanding = blockKey({ orientation: 'standing', row: goal.row, col: goal.col });
  const optimalMoves = fullDist.get(goalStanding) ?? 0;
  const solutionMoves = reconstructMoves(fullParent, goalStanding);

  // 2. Walk the solution to find every cell it ever touches — protect those.
  const onPath = new Set<string>();
  let cursor: BlockState = { orientation: 'standing', row: start.row, col: start.col };
  for (const c of occupiedCells(cursor)) onPath.add(`${c.row},${c.col}`);
  for (const dir of solutionMoves) {
    cursor = roll(cursor, dir);
    for (const c of occupiedCells(cursor)) onPath.add(`${c.row},${c.col}`);
  }

  // 3. Randomly remove some off-path cells as gaps.
  const candidates: string[] = [];
  for (let row = 0; row < BOARD_ROWS; row++) {
    for (let col = 0; col < BOARD_COLS; col++) {
      const k = `${row},${col}`;
      if (!onPath.has(k)) candidates.push(k);
    }
  }
  const shuffled = [...candidates];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = randInt(rng, 0, i);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const gapCount = Math.round(candidates.length * GAP_FRACTION);
  const gaps = new Set(shuffled.slice(0, gapCount));

  return {
    gaps,
    start,
    goal,
    block: { orientation: 'standing', row: start.row, col: start.col },
    moveLimit: optimalMoves + MOVE_SLACK,
    movesUsed: 0,
    won: false,
    lost: false,
  };
}

export function attemptRoll(state: TumbleState, dir: Direction): TumbleState {
  if (state.won || state.lost) return state;
  const next = roll(state.block, dir);
  if (!validOnFullBoard(next)) return state; // off the grid entirely — ignored, not a move

  const movesUsed = state.movesUsed + 1;
  const fellOff = !validOnBoard(next, state.gaps);
  const won = !fellOff && next.orientation === 'standing' && next.row === state.goal.row && next.col === state.goal.col;
  const lost = !won && (fellOff || movesUsed >= state.moveLimit);

  return { ...state, block: next, movesUsed, won, lost };
}

export { occupiedCells, blockKey };
