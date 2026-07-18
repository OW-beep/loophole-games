import { createRng } from '../daily-seed';

/**
 * Twin Peek: a classic memory-match grid, the one turn-based, no-physics
 * entry among the site's newer additions. The eight symbols are small
 * portraits of the mascots from seven other games in the catalog, plus the
 * site's own mark — a quiet "whole cast" cameo rather than a new theme.
 */

export const GRID_SIZE = 16; // 4x4
export const PAIR_COUNT = GRID_SIZE / 2;
export const MOVE_BUDGET = 20; // attempts (one attempt = one pair of flips)

// Reward for a hot streak: every COMBO_BONUS_STEP consecutive matches (no
// miss in between) grants a few extra attempts, the same "skill compounds
// into breathing room" idea used elsewhere in the arcade catalog.
export const COMBO_BONUS_STEP = 3;
export const COMBO_BONUS_ATTEMPTS = 2;

export const SYMBOLS = ['ghost', 'blob', 'sprout', 'dish', 'cat', 'squirrel', 'bunny', 'star'] as const;
export type CardSymbol = (typeof SYMBOLS)[number];

/** Builds today's shuffled 4x4 layout from the daily seed — a seeded
 * Fisher-Yates shuffle of eight symbols, each appearing twice. */
export function createLayout(seed: number): CardSymbol[] {
  const rng = createRng(seed);
  const pairs = SYMBOLS.slice(0, PAIR_COUNT);
  const deck: CardSymbol[] = [...pairs, ...pairs];

  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}
