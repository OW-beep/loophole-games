import { createRng, randInt, seededShuffle } from '../daily-seed';

export const GRID_SIZE = 4;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;
const MAGNET_COUNT = 8; // 4 positive + 4 negative
export const SLIDE_BUDGET = 8;

export type MagnetPolarity = '+' | '-';

export interface PolarityState {
  /** Cell index for each magnet (0..MAGNET_COUNT-1). */
  positions: number[];
  /** Polarity for each magnet. First 4 are '+', last 4 are '-'. */
  polarities: MagnetPolarity[];
  slidesUsed: number;
  won: boolean;
  lost: boolean;
}

function idx(r: number, c: number) { return r * GRID_SIZE + c; }
function rc(i: number) { return { r: Math.floor(i / GRID_SIZE), c: i % GRID_SIZE }; }

function buildGrid(positions: number[]): (number | null)[] {
  const grid: (number | null)[] = Array(TOTAL_CELLS).fill(null);
  positions.forEach((p, i) => { if (p !== null) grid[p] = i; });
  return grid;
}

/** Slides magnet `mag` in direction [dr, dc]. Returns new positions array (same reference if no move). */
function slide(positions: number[], polarities: MagnetPolarity[], mag: number, dr: number, dc: number): number[] {
  const grid = buildGrid(positions);
  const { r: fr, c: fc } = rc(positions[mag]);
  let r = fr + dr, c = fc + dc;
  let lastValid = positions[mag];

  while (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
    const ni = idx(r, c);
    const occupant = grid[ni];
    if (occupant !== null) {
      // Same pole: stop before (lastValid is already the previous empty cell)
      if (polarities[occupant] === polarities[mag]) break;
      // Opposite pole: attracted, stop here (in the occupied cell — meaning adjacent to it)
      lastValid = idx(r - dr, c - dc);
      break;
    }
    lastValid = ni;
    r += dr;
    c += dc;
  }

  if (lastValid === positions[mag]) return positions; // no movement
  const next = [...positions];
  next[mag] = lastValid;
  return next;
}

/** Win: all + magnets in left half (c < GRID_SIZE/2), all - magnets in right half (c >= GRID_SIZE/2). */
function checkWon(positions: number[], polarities: MagnetPolarity[]): boolean {
  for (let i = 0; i < MAGNET_COUNT; i++) {
    const { c } = rc(positions[i]);
    if (polarities[i] === '+' && c >= GRID_SIZE / 2) return false;
    if (polarities[i] === '-' && c < GRID_SIZE / 2) return false;
  }
  return true;
}

export function createInitialState(seed: number): PolarityState {
  const rng = createRng(seed);
  const polarities: MagnetPolarity[] = [...Array(4).fill('+'), ...Array(4).fill('-')] as MagnetPolarity[];

  const leftCells = [0, 1, 4, 5, 8, 9, 12, 13]; // col 0 and 1
  const rightCells = [2, 3, 6, 7, 10, 11, 14, 15]; // col 2 and 3
  let positions = [
    ...seededShuffle(leftCells, rng).slice(0, 4),
    ...seededShuffle(rightCells, rng).slice(0, 4),
  ];

  // Scramble from solved state with random slides
  const DIRS: [number, number][] = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  const scrambleSteps = randInt(rng, 12, 20);
  for (let s = 0; s < scrambleSteps; s++) {
    const mag = randInt(rng, 0, MAGNET_COUNT - 1);
    const [dr, dc] = DIRS[randInt(rng, 0, 3)];
    positions = slide(positions, polarities, mag, dr, dc);
  }

  // If already solved (can happen after scramble), force a displacement
  if (checkWon(positions, polarities)) {
    const mag = 0; // first + magnet
    positions = slide(positions, polarities, mag, 0, 1);
  }

  return { positions, polarities, slidesUsed: 0, won: false, lost: false };
}

export function applySlide(
  state: PolarityState,
  mag: number,
  dr: number,
  dc: number
): PolarityState {
  if (state.won || state.lost) return state;
  const next = slide(state.positions, state.polarities, mag, dr, dc);
  if (next === state.positions) return state; // no movement — free, no cost

  const slidesUsed = state.slidesUsed + 1;
  const won = checkWon(next, state.polarities);
  const lost = !won && slidesUsed >= SLIDE_BUDGET;

  return { ...state, positions: next, slidesUsed, won, lost };
}

export function getMagnetAt(positions: number[], cellIdx: number): number | null {
  const i = positions.indexOf(cellIdx);
  return i === -1 ? null : i;
}

export { idx, rc, buildGrid };
