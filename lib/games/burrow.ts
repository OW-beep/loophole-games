import { createRng, randInt } from '../daily-seed';

export const GRID_ROWS = 6;
export const GRID_COLS = 6;
export const TRAP_COUNT = 6;
export const MOVE_SLACK = 8;

export interface Cell {
  row: number;
  col: number;
}

function cellKey(c: Cell): string {
  return `${c.row},${c.col}`;
}

function edgeKey(a: Cell, b: Cell): string {
  const ka = cellKey(a);
  const kb = cellKey(b);
  return ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`;
}

function gridNeighbors(c: Cell): Cell[] {
  const out: Cell[] = [];
  if (c.row > 0) out.push({ row: c.row - 1, col: c.col });
  if (c.row < GRID_ROWS - 1) out.push({ row: c.row + 1, col: c.col });
  if (c.col > 0) out.push({ row: c.row, col: c.col - 1 });
  if (c.col < GRID_COLS - 1) out.push({ row: c.row, col: c.col + 1 });
  return out;
}

/** Randomized recursive-backtracker maze carve. Produces a perfect maze: a
 * spanning tree over every cell, so there is exactly one simple path between
 * any two cells — which is what makes this guaranteed-solvable without a
 * separate solver. */
function carveMaze(rng: () => number): Set<string> {
  const start: Cell = { row: 0, col: 0 };
  const visited = new Set<string>([cellKey(start)]);
  const edges = new Set<string>();
  const stack: Cell[] = [start];

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const unvisitedNeighbors = gridNeighbors(current).filter((n) => !visited.has(cellKey(n)));
    if (unvisitedNeighbors.length === 0) {
      stack.pop();
      continue;
    }
    const next = unvisitedNeighbors[randInt(rng, 0, unvisitedNeighbors.length - 1)];
    edges.add(edgeKey(current, next));
    visited.add(cellKey(next));
    stack.push(next);
  }

  return edges;
}

function canMoveBetween(edges: Set<string>, a: Cell, b: Cell): boolean {
  return edges.has(edgeKey(a, b));
}

/** BFS over the maze tree from `from`, returning distance-to and parent-of
 * every reachable cell (all cells, since it's a spanning tree). */
function bfs(edges: Set<string>, from: Cell): { dist: Map<string, number>; parent: Map<string, Cell> } {
  const dist = new Map<string, number>([[cellKey(from), 0]]);
  const parent = new Map<string, Cell>();
  const queue: Cell[] = [from];
  let head = 0;
  while (head < queue.length) {
    const current = queue[head++];
    const d = dist.get(cellKey(current))!;
    for (const n of gridNeighbors(current)) {
      if (!canMoveBetween(edges, current, n)) continue;
      if (dist.has(cellKey(n))) continue;
      dist.set(cellKey(n), d + 1);
      parent.set(cellKey(n), current);
      queue.push(n);
    }
  }
  return { dist, parent };
}

function reconstructPath(parent: Map<string, Cell>, from: Cell, to: Cell): Cell[] {
  const path: Cell[] = [to];
  let current = to;
  while (cellKey(current) !== cellKey(from)) {
    const p = parent.get(cellKey(current));
    if (!p) break;
    path.push(p);
    current = p;
  }
  return path.reverse();
}

function farthestCell(dist: Map<string, number>): Cell {
  let best: Cell = { row: 0, col: 0 };
  let bestDist = -1;
  for (const [key, d] of dist.entries()) {
    if (d > bestDist) {
      bestDist = d;
      const [row, col] = key.split(',').map(Number);
      best = { row, col };
    }
  }
  return best;
}

export interface BurrowState {
  edges: Set<string>;
  start: Cell;
  key: Cell;
  exit: Cell;
  traps: Set<string>;
  position: Cell;
  hasKey: boolean;
  moveLimit: number;
  movesUsed: number;
  won: boolean;
  lost: boolean;
}

export function createInitialState(seed: number): BurrowState {
  const rng = createRng(seed);
  const edges = carveMaze(rng);
  const start: Cell = { row: 0, col: 0 };

  const fromStart = bfs(edges, start);
  const keyCell = farthestCell(fromStart.dist);
  const pathToKey = reconstructPath(fromStart.parent, start, keyCell);

  const fromKey = bfs(edges, keyCell);
  const exitCell = farthestCell(fromKey.dist);
  const pathToExit = reconstructPath(fromKey.parent, keyCell, exitCell);

  const onSolutionPath = new Set<string>([...pathToKey, ...pathToExit].map(cellKey));

  const trapCandidates: string[] = [];
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const k = cellKey({ row, col });
      if (!onSolutionPath.has(k)) trapCandidates.push(k);
    }
  }
  const shuffledCandidates = [...trapCandidates];
  for (let i = shuffledCandidates.length - 1; i > 0; i--) {
    const j = randInt(rng, 0, i);
    [shuffledCandidates[i], shuffledCandidates[j]] = [shuffledCandidates[j], shuffledCandidates[i]];
  }
  const traps = new Set(shuffledCandidates.slice(0, Math.min(TRAP_COUNT, shuffledCandidates.length)));

  const optimalMoves = (fromStart.dist.get(cellKey(keyCell)) ?? 0) + (fromKey.dist.get(cellKey(exitCell)) ?? 0);

  return {
    edges,
    start,
    key: keyCell,
    exit: exitCell,
    traps,
    position: start,
    hasKey: false,
    moveLimit: optimalMoves + MOVE_SLACK,
    movesUsed: 0,
    won: false,
    lost: false,
  };
}

export function canStepTo(state: BurrowState, target: Cell): boolean {
  return canMoveBetween(state.edges, state.position, target);
}

export function stepTo(state: BurrowState, target: Cell): BurrowState {
  if (state.won || state.lost) return state;
  if (!canStepTo(state, target)) return state;

  const movesUsed = state.movesUsed + 1;
  const hasKey = state.hasKey || cellKey(target) === cellKey(state.key);
  const isTrap = state.traps.has(cellKey(target));
  const reachedExit = cellKey(target) === cellKey(state.exit);

  const won = !isTrap && reachedExit && hasKey;
  const lost = !won && (isTrap || movesUsed >= state.moveLimit);

  return { ...state, position: target, hasKey, movesUsed, won, lost };
}

export { cellKey, gridNeighbors };
