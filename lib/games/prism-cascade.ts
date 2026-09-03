export const COLS = 6;
export const ROWS = 13;
export const MATCH_THRESHOLD_NORMAL = 4;
export const MATCH_THRESHOLD_OVERDRIVE = 3;
export const OVERDRIVE_METER_MAX = 100;
export const OVERDRIVE_DURATION_MS = 9000;

export const GEM_COLORS = ['#FF2E63', '#FFD400', '#00E5FF', '#7B2FF7', '#4CE0A0'] as const;
export type GemColor = (typeof GEM_COLORS)[number];

export type Cell = GemColor | null;
export type Grid = Cell[][]; // Grid[row][col], row 0 = top

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Piece {
  col: number;
  row: number;
  color: string;
  partnerDir: Direction; // where the second cell sits relative to (col,row)
  partnerColor: string;
}

export interface GameState {
  grid: Grid;
  piece: Piece | null;
  nextColors: [string, string];
  score: number;
  overdriveMeter: number;
  overdriveUntil: number; // performance.now() timestamp, 0 = not active
  chainDisplay: { chain: number; id: number } | null;
  gameOver: boolean;
}

function randomColor(rng: () => number): string {
  return GEM_COLORS[Math.floor(rng() * GEM_COLORS.length)];
}

export function createEmptyGrid(): Grid {
  return Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => null as Cell));
}

const SPAWN_COL = Math.floor(COLS / 2);

export function spawnPiece(rng: () => number, nextColors: [string, string]): { piece: Piece; nextColors: [string, string] } {
  const piece: Piece = {
    col: SPAWN_COL,
    row: 0,
    color: nextColors[0],
    // The partner cell must start in-bounds — 'down' (row+1) is on-screen
    // from row 0, whereas 'up' (row-1) would be off the top of the grid
    // and make every freshly spawned piece register as instantly stuck.
    partnerDir: 'down',
    partnerColor: nextColors[1],
  };
  return { piece, nextColors: [randomColor(rng), randomColor(rng)] };
}

function partnerCell(piece: Piece): { col: number; row: number } {
  switch (piece.partnerDir) {
    case 'up':
      return { col: piece.col, row: piece.row - 1 };
    case 'down':
      return { col: piece.col, row: piece.row + 1 };
    case 'left':
      return { col: piece.col - 1, row: piece.row };
    case 'right':
      return { col: piece.col + 1, row: piece.row };
  }
}

function inBounds(col: number, row: number): boolean {
  return col >= 0 && col < COLS && row >= 0 && row < ROWS;
}

function cellFree(grid: Grid, col: number, row: number): boolean {
  if (!inBounds(col, row)) return false;
  return grid[row][col] === null;
}

function pieceFits(grid: Grid, piece: Piece): boolean {
  const p = partnerCell(piece);
  return cellFree(grid, piece.col, piece.row) && cellFree(grid, p.col, p.row);
}

export function tryMove(grid: Grid, piece: Piece, dx: number, dy: number): Piece | null {
  const moved: Piece = { ...piece, col: piece.col + dx, row: piece.row + dy };
  return pieceFits(grid, moved) ? moved : null;
}

/** Rotates the partner cell 90° clockwise around the pivot cell. If the
 * rotated position doesn't fit, tries a small kick (shift left/right) before
 * giving up, matching the forgiving feel of most falling-block games. */
export function tryRotate(grid: Grid, piece: Piece): Piece | null {
  const order: Direction[] = ['up', 'right', 'down', 'left'];
  const nextDir = order[(order.indexOf(piece.partnerDir) + 1) % 4];
  const candidate: Piece = { ...piece, partnerDir: nextDir };
  if (pieceFits(grid, candidate)) return candidate;
  for (const kick of [-1, 1]) {
    const kicked: Piece = { ...candidate, col: candidate.col + kick };
    if (pieceFits(grid, kicked)) return kicked;
  }
  return null;
}

/** Locks the piece into the grid, returning a new grid. Caller is
 * responsible for triggering match resolution afterward. */
export function lockPiece(grid: Grid, piece: Piece): Grid {
  const next = grid.map((row) => [...row]);
  const p = partnerCell(piece);
  if (inBounds(piece.col, piece.row)) next[piece.row][piece.col] = piece.color as GemColor;
  if (inBounds(p.col, p.row)) next[p.row][p.col] = piece.partnerColor as GemColor;
  return next;
}

function floodFillGroups(grid: Grid): number[][][] {
  const seen = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  const groups: number[][][] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (seen[r][c] || grid[r][c] === null) continue;
      const color = grid[r][c];
      const stack = [[r, c]];
      const group: number[][] = [];
      seen[r][c] = true;
      while (stack.length) {
        const [cr, cc] = stack.pop()!;
        group.push([cr, cc]);
        const neighbors = [
          [cr - 1, cc],
          [cr + 1, cc],
          [cr, cc - 1],
          [cr, cc + 1],
        ];
        for (const [nr, nc] of neighbors) {
          if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
          if (seen[nr][nc] || grid[nr][nc] !== color) continue;
          seen[nr][nc] = true;
          stack.push([nr, nc]);
        }
      }
      groups.push(group);
    }
  }
  return groups;
}

function applyGravity(grid: Grid): Grid {
  const next = createEmptyGrid();
  for (let c = 0; c < COLS; c++) {
    const colCells: Cell[] = [];
    for (let r = 0; r < ROWS; r++) {
      if (grid[r][c] !== null) colCells.push(grid[r][c]);
    }
    const startRow = ROWS - colCells.length;
    colCells.forEach((cell, i) => {
      next[startRow + i][c] = cell;
    });
  }
  return next;
}

export interface CascadeStep {
  grid: Grid;
  poppedCells: [number, number][];
  chain: number;
}

/** Resolves the full cascade after a piece lock: finds matching groups,
 * removes them, drops remaining cells, and repeats as long as new matches
 * keep appearing. Returns one entry per chain step so the caller can
 * animate each pop before moving to the next (each step already has
 * gravity applied for the *next* step's matching). */
export function resolveCascade(startGrid: Grid, matchThreshold: number): CascadeStep[] {
  const steps: CascadeStep[] = [];
  let grid = startGrid;
  let chain = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const groups = floodFillGroups(grid).filter((g) => g.length >= matchThreshold);
    if (groups.length === 0) break;
    chain++;
    const popped: [number, number][] = groups.flat() as [number, number][];
    const cleared = grid.map((row) => [...row]);
    for (const [r, c] of popped) cleared[r][c] = null;
    const settled = applyGravity(cleared);
    steps.push({ grid: settled, poppedCells: popped, chain });
    grid = settled;
  }
  return steps;
}

export function isGameOver(grid: Grid, piece: Piece): boolean {
  return !pieceFits(grid, piece);
}

export function scoreForPop(cellsPopped: number, chain: number, overdrive: boolean): number {
  const base = cellsPopped * 10;
  const chainMultiplier = 1 + (chain - 1) * 0.75;
  const overdriveMultiplier = overdrive ? 2 : 1;
  return Math.round(base * chainMultiplier * overdriveMultiplier);
}

export function fallIntervalForScore(score: number): number {
  return Math.max(220, 780 - Math.floor(score / 300) * 40);
}
