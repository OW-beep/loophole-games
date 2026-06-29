import { createRng, randInt, seededShuffle } from '../daily-seed';

export const STRAND_LENGTH = 8;
const MIN_SCRAMBLE_SWAPS = 4;
const MAX_SCRAMBLE_SWAPS = 6;
export const SWAP_BUDGET = MAX_SCRAMBLE_SWAPS + 1; // construction guarantees solvability within the max scramble count, plus one for comfort

export interface SpliceState {
  top: number[];
  bottom: number[];
  swapsUsed: number;
  won: boolean;
  lost: boolean;
}

/** Swaps the [start, end] (inclusive) column range between the two strands. Self-inverse: applying the same swap twice undoes it. */
export function swapRange(top: number[], bottom: number[], start: number, end: number): { top: number[]; bottom: number[] } {
  const newTop = [...top];
  const newBottom = [...bottom];
  for (let i = start; i <= end; i++) {
    newTop[i] = bottom[i];
    newBottom[i] = top[i];
  }
  return { top: newTop, bottom: newBottom };
}

export function createInitialState(seed: number): SpliceState {
  const rng = createRng(seed);

  // Start from a solved reference state: top holds 1..8, bottom holds 9..16,
  // each independently shuffled internally (order within a strand never
  // matters for the win condition, only which strand a value sits in).
  const low = seededShuffle(Array.from({ length: STRAND_LENGTH }, (_, i) => i + 1), rng);
  const high = seededShuffle(Array.from({ length: STRAND_LENGTH }, (_, i) => i + 1 + STRAND_LENGTH), rng);

  let top = low;
  let bottom = high;

  // Scramble with a few random self-inverse range-swaps — guarantees the
  // puzzle is solvable within that many moves, since redoing the exact same
  // swaps undoes them.
  const numSwaps = randInt(rng, MIN_SCRAMBLE_SWAPS, MAX_SCRAMBLE_SWAPS);
  for (let i = 0; i < numSwaps; i++) {
    const a = randInt(rng, 0, STRAND_LENGTH - 1);
    const b = randInt(rng, 0, STRAND_LENGTH - 1);
    const start = Math.min(a, b);
    const end = Math.max(a, b);
    const result = swapRange(top, bottom, start, end);
    top = result.top;
    bottom = result.bottom;
  }

  // Don't hand out an already-solved puzzle.
  const isSolved = top.every((v) => v <= STRAND_LENGTH) && bottom.every((v) => v > STRAND_LENGTH);
  if (isSolved) {
    const mid = Math.floor(STRAND_LENGTH / 2);
    const result = swapRange(top, bottom, mid, mid);
    top = result.top;
    bottom = result.bottom;
  }

  return { top, bottom, swapsUsed: 0, won: false, lost: false };
}

function checkWon(top: number[], bottom: number[]): boolean {
  return top.every((v) => v <= STRAND_LENGTH) && bottom.every((v) => v > STRAND_LENGTH);
}

export function applySplice(state: SpliceState, start: number, end: number): SpliceState {
  if (state.won || state.lost) return state;
  const lo = Math.min(start, end);
  const hi = Math.max(start, end);
  if (lo < 0 || hi >= state.top.length) return state;

  const { top, bottom } = swapRange(state.top, state.bottom, lo, hi);
  const swapsUsed = state.swapsUsed + 1;
  const won = checkWon(top, bottom);
  const lost = !won && swapsUsed >= SWAP_BUDGET;

  return { top, bottom, swapsUsed, won, lost };
}
