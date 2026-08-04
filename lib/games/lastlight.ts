import { createRng, randInt } from '../daily-seed';

export const PILE_COUNT = 4;
export const MIN_PILE = 1;
export const MAX_PILE = 7;

export interface LastlightState {
  piles: number[];
  turn: 'player' | 'cpu' | 'done';
  lastCpuMove: { pile: number; took: number } | null;
  won: boolean;
  lost: boolean;
}

function nimSum(piles: number[]): number {
  return piles.reduce((acc, p) => acc ^ p, 0);
}

export function createInitialState(seed: number): LastlightState {
  const rng = createRng(seed);
  const piles: number[] = [];
  for (let i = 0; i < PILE_COUNT; i++) piles.push(randInt(rng, MIN_PILE, MAX_PILE));

  // Guarantee the player (moving first) starts in a winning position —
  // a nim-sum of zero would mean the position already favors whoever moves
  // second, which would make the daily puzzle unwinnable no matter how well
  // the player plays.
  if (nimSum(piles) === 0) {
    const bump = randInt(rng, 0, PILE_COUNT - 1);
    piles[bump] += 1;
  }

  return { piles, turn: 'player', lastCpuMove: null, won: false, lost: false };
}

/** The standard optimal Nim move: find a pile where reducing it would zero
 * out the overall nim-sum. If the position is already a loss (nim-sum 0),
 * there is no such move — fall back to any legal move. */
function bestCpuMove(piles: number[]): { pile: number; target: number } {
  const sum = nimSum(piles);
  if (sum !== 0) {
    for (let i = 0; i < piles.length; i++) {
      const target = piles[i] ^ sum;
      if (target < piles[i]) return { pile: i, target };
    }
  }
  // Losing position for the CPU — no move preserves it, just take one token
  // from the first non-empty pile.
  const i = piles.findIndex((p) => p > 0);
  return { pile: i, target: piles[i] - 1 };
}

/** Player removes tokens from `pileIndex`, leaving `remaining` tokens in it.
 * The CPU's response (if the game isn't already over) is resolved in the
 * same step, since there's nothing to wait on between plies. */
export function playerMove(state: LastlightState, pileIndex: number, remaining: number): LastlightState {
  if (state.turn !== 'player') return state;
  if (pileIndex < 0 || pileIndex >= state.piles.length) return state;
  if (remaining < 0 || remaining >= state.piles[pileIndex]) return state;

  const afterPlayer = [...state.piles];
  afterPlayer[pileIndex] = remaining;

  if (afterPlayer.every((p) => p === 0)) {
    return { piles: afterPlayer, turn: 'done', lastCpuMove: null, won: true, lost: false };
  }

  const { pile, target } = bestCpuMove(afterPlayer);
  const afterCpu = [...afterPlayer];
  const took = afterCpu[pile] - target;
  afterCpu[pile] = target;

  if (afterCpu.every((p) => p === 0)) {
    return { piles: afterCpu, turn: 'done', lastCpuMove: { pile, took }, won: false, lost: true };
  }

  return { piles: afterCpu, turn: 'player', lastCpuMove: { pile, took }, won: false, lost: false };
}
