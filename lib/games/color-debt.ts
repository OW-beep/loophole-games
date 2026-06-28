import { createRng, seededShuffle } from '../daily-seed';

export const GRID_SIZE = 6;
export const MOVES_LIMIT = 22;
export const TARGET_SCORE = 500;
export const DEBT_MATURITY = 3; // turns before an unconverted debt tile locks into a Bad Tile

export const NORMAL_COLORS = ['#F2A33D', '#3DA8F2', '#5FBF6A', '#E0529C'];

export type Cell =
  | { kind: 'normal'; color: string }
  | { kind: 'debt'; age: number }
  | { kind: 'bad' }
  | null;

export interface ColorDebtState {
  grid: Cell[];
  score: number;
  movesUsed: number;
  won: boolean;
  lost: boolean;
  lastClearedCount: number; // for a light "+N" flash, purely cosmetic
}

function idx(r: number, c: number) {
  return r * GRID_SIZE + c;
}
function rc(i: number) {
  return { r: Math.floor(i / GRID_SIZE), c: i % GRID_SIZE };
}

function randomColor(rng: () => number) {
  return NORMAL_COLORS[Math.floor(rng() * NORMAL_COLORS.length)];
}

function findMatchGroups(grid: Cell[]): number[][] {
  const groups: number[][] = [];

  // rows
  for (let r = 0; r < GRID_SIZE; r++) {
    let runStart = 0;
    for (let c = 1; c <= GRID_SIZE; c++) {
      const prev = c > 0 ? grid[idx(r, c - 1)] : null;
      const cur = c < GRID_SIZE ? grid[idx(r, c)] : null;
      const sameColor =
        cur && prev && cur.kind === 'normal' && prev.kind === 'normal' && cur.color === prev.color;
      if (!sameColor) {
        const runLen = c - runStart;
        if (runLen >= 3) {
          groups.push(Array.from({ length: runLen }, (_, k) => idx(r, runStart + k)));
        }
        runStart = c;
      }
    }
  }
  // columns
  for (let c = 0; c < GRID_SIZE; c++) {
    let runStart = 0;
    for (let r = 1; r <= GRID_SIZE; r++) {
      const prev = r > 0 ? grid[idx(r - 1, c)] : null;
      const cur = r < GRID_SIZE ? grid[idx(r, c)] : null;
      const sameColor =
        cur && prev && cur.kind === 'normal' && prev.kind === 'normal' && cur.color === prev.color;
      if (!sameColor) {
        const runLen = r - runStart;
        if (runLen >= 3) {
          groups.push(Array.from({ length: runLen }, (_, k) => idx(runStart + k, c)));
        }
        runStart = r;
      }
    }
  }
  return groups;
}

function neighbors(i: number): number[] {
  const { r, c } = rc(i);
  const out: number[] = [];
  if (r > 0) out.push(idx(r - 1, c));
  if (r < GRID_SIZE - 1) out.push(idx(r + 1, c));
  if (c > 0) out.push(idx(r, c - 1));
  if (c < GRID_SIZE - 1) out.push(idx(r, c + 1));
  return out;
}

/** Compacts each column downward, treating Bad Tiles as fixed anchors that never move. */
function applyGravity(grid: Cell[]): Cell[] {
  const next = [...grid];
  for (let c = 0; c < GRID_SIZE; c++) {
    let segmentStart = 0;
    for (let r = 0; r <= GRID_SIZE; r++) {
      const isAnchor = r === GRID_SIZE || next[idx(r, c)]?.kind === 'bad';
      if (isAnchor) {
        const rows = [];
        for (let rr = segmentStart; rr < r; rr++) rows.push(rr);
        const tiles = rows.map((rr) => next[idx(rr, c)]).filter((t): t is Exclude<Cell, null> => t !== null);
        for (let k = 0; k < rows.length; k++) {
          const targetRow = rows[rows.length - 1 - k];
          next[idx(targetRow, c)] = tiles[tiles.length - 1 - k] ?? null;
        }
        segmentStart = r + 1;
      }
    }
  }
  return next;
}

function refill(grid: Cell[], rng: () => number, debtToSpawn: number, affectedCols: Set<number>): Cell[] {
  const next = [...grid];
  const cols = affectedCols.size > 0 ? Array.from(affectedCols) : Array.from({ length: GRID_SIZE }, (_, i) => i);
  const shuffledCols = seededShuffle(cols, rng);
  let debtLeft = debtToSpawn;

  for (let c = 0; c < GRID_SIZE; c++) {
    for (let r = 0; r < GRID_SIZE; r++) {
      if (next[idx(r, c)] !== null) continue;
      const wantDebtHere = debtLeft > 0 && shuffledCols.includes(c);
      if (wantDebtHere) {
        next[idx(r, c)] = { kind: 'debt', age: 0 };
        debtLeft--;
      } else {
        next[idx(r, c)] = { kind: 'normal', color: randomColor(rng) };
      }
    }
  }
  return next;
}

function settleCascade(
  grid: Cell[],
  rng: () => number
): { grid: Cell[]; scoreGained: number; clearedCount: number } {
  let current = [...grid];
  let scoreGained = 0;
  let clearedCount = 0;

  for (let iteration = 0; iteration < 12; iteration++) {
    const groups = findMatchGroups(current);
    if (groups.length === 0) break;

    const clearedSet = new Set<number>();
    let debtToSpawn = 0;
    const affectedCols = new Set<number>();
    for (const group of groups) {
      debtToSpawn += Math.max(group.length - 2, 0);
      for (const i of group) {
        clearedSet.add(i);
        affectedCols.add(rc(i).c);
      }
    }

    scoreGained += clearedSet.size * 10;
    clearedCount += clearedSet.size;

    const next = [...current];
    for (const i of clearedSet) next[i] = null;

    // adjacency conversion: debt -> random color, bad -> removed
    for (const i of clearedSet) {
      for (const n of neighbors(i)) {
        if (clearedSet.has(n)) continue;
        const cell = next[n];
        if (cell?.kind === 'debt') {
          next[n] = { kind: 'normal', color: randomColor(rng) };
        } else if (cell?.kind === 'bad') {
          next[n] = null;
        }
      }
    }

    const gravity = applyGravity(next);
    current = refill(gravity, rng, debtToSpawn, affectedCols);
  }

  return { grid: current, scoreGained, clearedCount };
}

export function createInitialState(seed: number): ColorDebtState {
  const rng = createRng(seed);
  let grid: Cell[];
  // Generate a starting board with no pre-existing matches.
  do {
    grid = Array.from({ length: GRID_SIZE * GRID_SIZE }, () => ({
      kind: 'normal' as const,
      color: randomColor(rng),
    }));
  } while (findMatchGroups(grid).length > 0);

  return { grid, score: 0, movesUsed: 0, won: false, lost: false, lastClearedCount: 0 };
}

function countBadTiles(grid: Cell[]): number {
  return grid.filter((c) => c?.kind === 'bad').length;
}

function isSwappable(cell: Cell): boolean {
  return cell !== null && cell.kind !== 'bad';
}

export function trySwap(state: ColorDebtState, aIdx: number, bIdx: number, rng: () => number): ColorDebtState {
  if (state.won || state.lost) return state;
  const a = state.grid[aIdx];
  const b = state.grid[bIdx];
  if (!isSwappable(a) || !isSwappable(b)) return state;

  const swapped = [...state.grid];
  swapped[aIdx] = b;
  swapped[bIdx] = a;

  const wouldMatch = findMatchGroups(swapped).length > 0;
  if (!wouldMatch) {
    // Invalid move — bounce back, no cost to the player.
    return state;
  }

  const { grid: settled, scoreGained, clearedCount } = settleCascade(swapped, rng);

  // age every remaining debt tile once per completed player turn
  const aged = settled.map((cell) => {
    if (cell?.kind !== 'debt') return cell;
    const nextAge = cell.age + 1;
    if (nextAge >= DEBT_MATURITY) return { kind: 'bad' as const };
    return { kind: 'debt' as const, age: nextAge };
  });

  const movesUsed = state.movesUsed + 1;
  const score = state.score + scoreGained;
  const badCount = countBadTiles(aged);
  const won = score >= TARGET_SCORE && badCount === 0;
  const lost = !won && movesUsed >= MOVES_LIMIT;

  return { grid: aged, score, movesUsed, won, lost, lastClearedCount: clearedCount };
}

export { countBadTiles, idx as cellIndex, rc as cellRC };
