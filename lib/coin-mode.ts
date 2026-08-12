// lib/coin-mode.ts
//
// Coin Mode: a single, site-wide coin balance shared across every game.
// Clearing a puzzle efficiently (fewer moves relative to that game's move
// budget) earns more coins; failing costs coins. Because the reward is
// based on movesUsed/movesLimit — a pair every game already passes to
// GameHeader/ResultModal — the exact same formula works for any game on
// the site without per-game tuning.
//
// The leaderboard is likewise a single global ranking by total coin
// balance (game slug 'global' on the existing generic
// /api/leaderboard/<slug> endpoint) rather than one board per game — your
// coin count is one number that follows you across the whole site.
//
// Wiring a new game in only needs, inside that game's Board component:
//   1. loadCoinBalance() / saveCoinBalance() around a "Play again for
//      Coins" round (a fresh, non-daily seed — see rollCoinSeed())
//   2. applyCoinDelta(balance, { won, movesUsed, movesLimit }) when that
//      round finishes, then submitScore(GLOBAL_LEADERBOARD_SLUG, nickname, balance)
// See app/games/fold/FoldBoard.tsx for the reference implementation.

import { DIFFICULTY_COIN_MULTIPLIER, type Difficulty } from './difficulty';

export const GLOBAL_LEADERBOARD_SLUG = 'global';
const COIN_KEY = 'loophole:coins:global';
const STARTING_COINS = 100;

// Win: flat base + an efficiency bonus that scales with how many moves
// were left unused. Lose: flat penalty. Balance never drops below 0 —
// running out of coins just means your next win starts the climb back.
export const COIN_RULES = {
  startingCoins: STARTING_COINS,
  winBase: 15,
  winEfficiencyBonusMax: 15,
  losePenalty: 10,
};

export function loadCoinBalance(): number {
  if (typeof window === 'undefined') return COIN_RULES.startingCoins;
  try {
    const raw = window.localStorage.getItem(COIN_KEY);
    if (raw === null) return COIN_RULES.startingCoins;
    const n = Number(raw);
    return Number.isFinite(n) ? n : COIN_RULES.startingCoins;
  } catch {
    return COIN_RULES.startingCoins;
  }
}

export function saveCoinBalance(balance: number) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(COIN_KEY, String(Math.max(0, Math.round(balance))));
  } catch {
    // localStorage unavailable — balance just won't persist this session
  }
}

/**
 * Coin delta for a finished Coin Mode round. `movesUsed`/`movesLimit` come
 * straight from the same props every game already feeds into GameHeader,
 * so this needs no per-game calibration: a tight, efficient clear earns
 * close to winBase + winEfficiencyBonusMax; a clear that used almost the
 * whole move budget earns close to just winBase; a loss costs losePenalty.
 */
/**
 * Coin delta for a finished Coin Mode round. `movesUsed`/`movesLimit` come
 * straight from the same props every game already feeds into GameHeader,
 * so this needs no per-game calibration: a tight, efficient clear earns
 * close to winBase + winEfficiencyBonusMax; a clear that used almost the
 * whole move budget earns close to just winBase; a loss costs losePenalty.
 * `difficulty` (optional, defaults to 'normal') scales the whole result —
 * Hard pays more on a win and costs more on a loss, a real stakes choice
 * rather than a cosmetic label.
 */
export function computeCoinDelta({
  won,
  movesUsed,
  movesLimit,
  difficulty = 'normal',
}: {
  won: boolean;
  movesUsed: number;
  movesLimit: number;
  difficulty?: Difficulty;
}): number {
  const mult = DIFFICULTY_COIN_MULTIPLIER[difficulty];
  if (!won) return -Math.round(COIN_RULES.losePenalty * mult);
  const leftoverRatio = movesLimit > 0 ? Math.max(0, (movesLimit - movesUsed) / movesLimit) : 0;
  const base = COIN_RULES.winBase + Math.round(COIN_RULES.winEfficiencyBonusMax * leftoverRatio);
  return Math.round(base * mult);
}

/** A fresh, non-daily seed for a Coin Mode round — never collides with today's daily seed. */
export function rollCoinSeed(): number {
  return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
}
