import { createRng, randInt } from '../daily-seed';

export const STRIP_LENGTH = 12;
export const FOLD_BUDGET = 6;
const MIN_CELL_VALUE = 1;
const MAX_CELL_VALUE = 9;
const MIN_CONSTRUCTION_FOLDS = 2;
const MAX_CONSTRUCTION_FOLDS = 4;

export interface FoldState {
  strip: number[];
  foldsUsed: number;
  target: number;
  won: boolean;
  lost: boolean;
}

interface FoldResult {
  strip: number[];
  /** Marks which output cells were actually produced by this fold (vs. passed through untouched). */
  fresh: boolean[];
}

/**
 * Folds `strip` at `creaseIndex` (a value between 1 and strip.length - 1).
 * The shorter side always folds onto the longer side, mirrored, with
 * overlapping cells summed — exactly like folding a real strip of paper.
 */
function foldWithFreshness(strip: number[], freshIn: boolean[], creaseIndex: number): FoldResult {
  const n = strip.length;
  if (creaseIndex <= 0 || creaseIndex >= n) return { strip, fresh: freshIn };

  const left = strip.slice(0, creaseIndex);
  const right = strip.slice(creaseIndex);
  const freshLeft = freshIn.slice(0, creaseIndex);
  const freshRight = freshIn.slice(creaseIndex);
  const leftLen = left.length;
  const rightLen = right.length;

  if (leftLen <= rightLen) {
    const revLeft = [...left].reverse();
    const overlap = revLeft.map((v, i) => v + right[i]);
    const overlapFresh = overlap.map(() => true);
    return {
      strip: [...overlap, ...right.slice(leftLen)],
      fresh: [...overlapFresh, ...freshRight.slice(leftLen)],
    };
  } else {
    const revRight = [...right].reverse();
    const overlapStart = leftLen - rightLen;
    const overlap = revRight.map((v, i) => v + left[overlapStart + i]);
    const overlapFresh = overlap.map(() => true);
    return {
      strip: [...left.slice(0, overlapStart), ...overlap],
      fresh: [...freshLeft.slice(0, overlapStart), ...overlapFresh],
    };
  }
}

/** Public fold function used by the UI — same physics, freshness tracking hidden. */
export function fold(strip: number[], creaseIndex: number): number[] {
  return foldWithFreshness(strip, strip.map(() => false), creaseIndex).strip;
}

export function createInitialState(seed: number): FoldState {
  const rng = createRng(seed);
  const strip = Array.from({ length: STRIP_LENGTH }, () => randInt(rng, MIN_CELL_VALUE, MAX_CELL_VALUE));

  // Construct a guaranteed-reachable target: apply a few random folds and
  // sample the target from a cell that was actually produced by a fold
  // (never from a cell that simply passed through untouched), so the
  // target can never be "already there" before the player does anything.
  const numConstructionFolds = randInt(rng, MIN_CONSTRUCTION_FOLDS, MAX_CONSTRUCTION_FOLDS);
  let current = strip;
  let fresh = strip.map(() => false);
  for (let i = 0; i < numConstructionFolds; i++) {
    const crease = randInt(rng, 1, current.length - 1);
    const result = foldWithFreshness(current, fresh, crease);
    current = result.strip;
    fresh = result.fresh;
  }

  const freshIndices = fresh.reduce<number[]>((acc, isFresh, i) => {
    if (isFresh) acc.push(i);
    return acc;
  }, []);
  const targetIdx = freshIndices[randInt(rng, 0, freshIndices.length - 1)];
  const target = current[targetIdx];

  return { strip, foldsUsed: 0, target, won: false, lost: false };
}

export function applyFold(state: FoldState, creaseIndex: number): FoldState {
  if (state.won || state.lost) return state;
  if (state.strip.length <= 1) return state;

  const nextStrip = fold(state.strip, creaseIndex);
  if (nextStrip.length === state.strip.length) return state; // invalid crease, no-op

  const foldsUsed = state.foldsUsed + 1;
  const won = nextStrip.includes(state.target);
  const lost = !won && (foldsUsed >= FOLD_BUDGET || nextStrip.length === 1);

  return { strip: nextStrip, foldsUsed, target: state.target, won, lost };
}
