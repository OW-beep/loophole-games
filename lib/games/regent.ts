import { createRng, seededShuffle } from '../daily-seed';

export const BOARD_SIZE = 6;
export const CROWN_COUNT = BOARD_SIZE;
export const TAP_BUDGET = 16;
const CELL_COUNT = BOARD_SIZE * BOARD_SIZE;
const HILL_CLIMB_ITERS = 500;
const SOLVER_CAP = 40;
const STAGNATION_LIMIT = 25;

export interface RegentState {
  /** Region id (0..BOARD_SIZE-1) for every cell, row-major. */
  regions: number[];
  /** Whether a crown currently sits on each cell, row-major. */
  crowns: boolean[];
  tapsUsed: number;
  tapBudget: number;
  won: boolean;
  lost: boolean;
}

function rc(i: number): { r: number; c: number } {
  return { r: Math.floor(i / BOARD_SIZE), c: i % BOARD_SIZE };
}

function neighbors4(i: number): number[] {
  const { r, c } = rc(i);
  const out: number[] = [];
  if (r > 0) out.push(i - BOARD_SIZE);
  if (r < BOARD_SIZE - 1) out.push(i + BOARD_SIZE);
  if (c > 0) out.push(i - 1);
  if (c < BOARD_SIZE - 1) out.push(i + 1);
  return out;
}

/** One column choice per row, no two chosen columns in adjacent rows within distance 1. */
function buildSolutionColumns(rng: () => number): number[] {
  const rows: number[] = new Array(BOARD_SIZE).fill(-1);
  const used: boolean[] = new Array(BOARD_SIZE).fill(false);

  function backtrack(row: number): boolean {
    if (row === BOARD_SIZE) return true;
    const order = seededShuffle(
      Array.from({ length: BOARD_SIZE }, (_, i) => i),
      rng
    );
    for (const c of order) {
      if (used[c]) continue;
      if (row > 0 && Math.abs(rows[row - 1] - c) <= 1) continue;
      used[c] = true;
      rows[row] = c;
      if (backtrack(row + 1)) return true;
      used[c] = false;
      rows[row] = -1;
    }
    return false;
  }

  backtrack(0);
  return rows;
}

/** Grows BOARD_SIZE connected color regions outward from the solution's crown cells, like a randomized multi-source flood fill, until every cell is claimed. Always fully tiles the board. */
function growRegions(rng: () => number, solutionCols: number[]): number[] {
  const regionOf: number[] = new Array(CELL_COUNT).fill(-1);
  const frontiers: number[][] = solutionCols.map((col, row) => [row * BOARD_SIZE + col]);
  solutionCols.forEach((col, row) => {
    regionOf[row * BOARD_SIZE + col] = row;
  });

  let remaining = CELL_COUNT - BOARD_SIZE;
  let guard = CELL_COUNT * 6;
  while (remaining > 0 && guard-- > 0) {
    const order = seededShuffle(
      Array.from({ length: BOARD_SIZE }, (_, i) => i),
      rng
    );
    for (const region of order) {
      const candidates: number[] = [];
      for (const cell of frontiers[region]) {
        for (const nb of neighbors4(cell)) {
          if (regionOf[nb] === -1) candidates.push(nb);
        }
      }
      if (candidates.length === 0) continue;
      const pick = candidates[Math.floor(rng() * candidates.length)];
      regionOf[pick] = region;
      frontiers[region].push(pick);
      remaining--;
    }
  }
  return regionOf;
}

/** Counts solutions up to `cap`, stopping early. */
function countSolutions(regionOf: number[], cap: number): number {
  let count = 0;
  const colUsed: boolean[] = new Array(BOARD_SIZE).fill(false);
  const regionUsed: boolean[] = new Array(BOARD_SIZE).fill(false);
  const placedCols: number[] = [];

  function backtrack(row: number) {
    if (count >= cap) return;
    if (row === BOARD_SIZE) {
      count++;
      return;
    }
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (colUsed[c]) continue;
      if (placedCols.length > 0 && Math.abs(placedCols[placedCols.length - 1] - c) <= 1) continue;
      const region = regionOf[row * BOARD_SIZE + c];
      if (regionUsed[region]) continue;
      colUsed[c] = true;
      regionUsed[region] = true;
      placedCols.push(c);
      backtrack(row + 1);
      colUsed[c] = false;
      regionUsed[region] = false;
      placedCols.pop();
      if (count >= cap) return;
    }
  }

  backtrack(0);
  return count;
}

/** Finds one valid solution different from `exclude`, or null if none exists. */
function findAlternate(regionOf: number[], exclude: number[]): number[] | null {
  const colUsed: boolean[] = new Array(BOARD_SIZE).fill(false);
  const regionUsed: boolean[] = new Array(BOARD_SIZE).fill(false);
  const placed: number[] = [];
  let result: number[] | null = null;

  function backtrack(row: number) {
    if (result) return;
    if (row === BOARD_SIZE) {
      const same = placed.every((c, i) => c === exclude[i]);
      if (!same) result = [...placed];
      return;
    }
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (result) return;
      if (colUsed[c]) continue;
      if (placed.length > 0 && Math.abs(placed[placed.length - 1] - c) <= 1) continue;
      const region = regionOf[row * BOARD_SIZE + c];
      if (regionUsed[region]) continue;
      colUsed[c] = true;
      regionUsed[region] = true;
      placed.push(c);
      backtrack(row + 1);
      colUsed[c] = false;
      regionUsed[region] = false;
      placed.pop();
    }
  }

  backtrack(0);
  return result;
}

function isRegionConnected(regionOf: number[], region: number): boolean {
  const cells: number[] = [];
  for (let i = 0; i < CELL_COUNT; i++) if (regionOf[i] === region) cells.push(i);
  if (cells.length <= 1) return true;
  const set = new Set(cells);
  const seen = new Set<number>([cells[0]]);
  const stack = [cells[0]];
  while (stack.length) {
    const cur = stack.pop()!;
    for (const nb of neighbors4(cur)) {
      if (set.has(nb) && !seen.has(nb)) {
        seen.add(nb);
        stack.push(nb);
      }
    }
  }
  return seen.size === cells.length;
}

/**
 * Bounded, connectivity-preserving local search: repeatedly finds an alternate
 * solution and reassigns one of its (non-seed) cells to a neighboring region
 * that breaks it, only accepting moves that keep both regions contiguous.
 * Tracks and returns the best (fewest-solutions) board seen, so the result is
 * never worse than the starting tiling — and is a single-solution board the
 * large majority of the time at this board size.
 */
function minimizeAlternateSolutions(rng: () => number, initialRegions: number[], solutionCols: number[]): number[] {
  let regionOf = [...initialRegions];
  let best = [...regionOf];
  let bestCount = countSolutions(regionOf, SOLVER_CAP);
  let stagnant = 0;

  for (let iter = 0; iter < HILL_CLIMB_ITERS && bestCount > 1; iter++) {
    const curCount = countSolutions(regionOf, SOLVER_CAP);
    const alt = findAlternate(regionOf, solutionCols);
    if (!alt) break; // current board is already unique

    const diffRows: number[] = [];
    for (let i = 0; i < BOARD_SIZE; i++) if (alt[i] !== solutionCols[i]) diffRows.push(i);
    const altRegionAtRow = alt.map((c, row) => regionOf[row * BOARD_SIZE + c]);

    let improved = false;
    for (const k of seededShuffle(diffRows, rng)) {
      const cellIdx = k * BOARD_SIZE + alt[k];
      const otherLabels = new Set(altRegionAtRow.filter((_, row) => row !== k));
      const candidateLabels = seededShuffle(neighbors4(cellIdx), rng)
        .map((nb) => regionOf[nb])
        .filter((label) => label !== regionOf[cellIdx] && otherLabels.has(label));

      for (const newLabel of new Set(candidateLabels)) {
        const oldLabel = regionOf[cellIdx];
        regionOf[cellIdx] = newLabel;
        if (isRegionConnected(regionOf, oldLabel) && isRegionConnected(regionOf, newLabel)) {
          const newCount = countSolutions(regionOf, SOLVER_CAP);
          if (newCount < curCount) {
            improved = true;
            if (newCount < bestCount) {
              bestCount = newCount;
              best = [...regionOf];
            }
            break;
          }
        }
        regionOf[cellIdx] = oldLabel;
      }
      if (improved) break;
    }

    if (!improved) {
      stagnant++;
      if (stagnant > STAGNATION_LIMIT) {
        regionOf = growRegions(rng, solutionCols);
        const freshCount = countSolutions(regionOf, SOLVER_CAP);
        if (freshCount < bestCount) {
          bestCount = freshCount;
          best = [...regionOf];
        }
        stagnant = 0;
      }
    } else {
      stagnant = 0;
    }
  }

  return best;
}

export function createInitialState(seed: number, tapBudget: number = TAP_BUDGET): RegentState {
  const rng = createRng(seed);
  const solutionCols = buildSolutionColumns(rng);
  const grown = growRegions(rng, solutionCols);
  const regions = minimizeAlternateSolutions(rng, grown, solutionCols);

  return {
    regions,
    crowns: new Array(CELL_COUNT).fill(false),
    tapsUsed: 0,
    tapBudget,
    won: false,
    lost: false,
  };
}

interface CrownPos {
  idx: number;
  r: number;
  c: number;
}

function crownPositions(crowns: boolean[]): CrownPos[] {
  const out: CrownPos[] = [];
  crowns.forEach((placed, idx) => {
    if (placed) out.push({ idx, ...rc(idx) });
  });
  return out;
}

function isWinningLayout(crowns: boolean[], regions: number[]): boolean {
  const positions = crownPositions(crowns);
  if (positions.length !== BOARD_SIZE) return false;

  const rows = new Set(positions.map((p) => p.r));
  const cols = new Set(positions.map((p) => p.c));
  const regs = new Set(positions.map((p) => regions[p.idx]));
  if (rows.size !== BOARD_SIZE || cols.size !== BOARD_SIZE || regs.size !== BOARD_SIZE) return false;

  for (let a = 0; a < positions.length; a++) {
    for (let b = a + 1; b < positions.length; b++) {
      if (Math.abs(positions[a].r - positions[b].r) <= 1 && Math.abs(positions[a].c - positions[b].c) <= 1) {
        return false;
      }
    }
  }
  return true;
}

/** Every cell index currently in conflict with at least one other placed crown (same row/column/region, or touching). Used to highlight problem cells for the player. */
export function getConflicts(crowns: boolean[], regions: number[]): Set<number> {
  const positions = crownPositions(crowns);
  const bad = new Set<number>();
  for (let a = 0; a < positions.length; a++) {
    for (let b = a + 1; b < positions.length; b++) {
      const A = positions[a];
      const B = positions[b];
      const sameRow = A.r === B.r;
      const sameCol = A.c === B.c;
      const sameRegion = regions[A.idx] === regions[B.idx];
      const touching = Math.abs(A.r - B.r) <= 1 && Math.abs(A.c - B.c) <= 1;
      if (sameRow || sameCol || sameRegion || touching) {
        bad.add(A.idx);
        bad.add(B.idx);
      }
    }
  }
  return bad;
}

/** Crowns placed on the board that aren't currently conflicting with anything — used as the "score" while the puzzle is unsolved. */
export function correctCount(crowns: boolean[], regions: number[]): number {
  const conflicts = getConflicts(crowns, regions);
  return crownPositions(crowns).filter((p) => !conflicts.has(p.idx)).length;
}

export function tapCell(state: RegentState, i: number, budget: number = TAP_BUDGET): RegentState {
  if (state.won || state.lost) return state;
  const crowns = [...state.crowns];
  crowns[i] = !crowns[i];
  const tapsUsed = state.tapsUsed + 1;
  const won = isWinningLayout(crowns, state.regions);
  const lost = !won && tapsUsed >= budget;
  return { ...state, crowns, tapsUsed, won, lost };
}
