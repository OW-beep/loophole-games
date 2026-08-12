// lib/difficulty.ts
//
// A difficulty picker for Coin Mode only. The daily puzzle deliberately
// stays untouched by this — everyone should still get the same shareable
// challenge each day. Coin Mode rounds are personal and unlimited, so
// that's where a difficulty choice actually makes sense.
//
// This is designed to be adopted by one game at a time without touching
// anything that already works: a game opts in by (1) accepting an optional
// budget/limit override in its pure logic functions, defaulting to the
// existing constant so the daily puzzle's behavior never changes, and
// (2) reading `difficulty` from CoinModeSection's onDifficultyChange to
// scale that limit via scaleLimit() before starting a Coin Mode round.
// See app/games/fold/FoldBoard.tsx and app/games/croak/CroakBoard.tsx for
// reference implementations.

export type Difficulty = 'easy' | 'normal' | 'hard';

export const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'normal', 'hard'];

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: 'Easy',
  normal: 'Normal',
  hard: 'Hard',
};

const LIMIT_MULTIPLIER: Record<Difficulty, number> = {
  easy: 1.35,
  normal: 1,
  hard: 0.75,
};

// Harder rounds pay out (and risk) more coins for the same relative
// performance — a real stakes choice, not just a cosmetic label.
export const DIFFICULTY_COIN_MULTIPLIER: Record<Difficulty, number> = {
  easy: 0.75,
  normal: 1,
  hard: 1.5,
};

/** Scales a move/attempt/hop budget for the chosen difficulty, never below `min`. */
export function scaleLimit(baseLimit: number, difficulty: Difficulty, min = 3): number {
  return Math.max(min, Math.round(baseLimit * LIMIT_MULTIPLIER[difficulty]));
}
