import { createRng } from '../daily-seed';

/**
 * Noodle Cat: mash taps to clear a bowl of noodles before its timer runs
 * out, then the next (harder) bowl arrives. No physics, no timing window —
 * this is the index's one pure-reflex entry.
 */

export const BOWL_COUNT = 5;
const BASE_TARGET_TAPS = 14;
const BASE_TIME_MS = 6000;

export interface BowlConfig {
  targetTaps: number;
  timeMs: number;
}

/** Generates today's bowls from the daily seed. Tap targets rise and time
 * budgets shrink across the run, with a little seeded variance per bowl so
 * the exact numbers aren't identical every day even at the same difficulty. */
export function createBowls(seed: number): BowlConfig[] {
  const rng = createRng(seed);
  const bowls: BowlConfig[] = [];
  for (let i = 0; i < BOWL_COUNT; i++) {
    const progress = BOWL_COUNT > 1 ? i / (BOWL_COUNT - 1) : 0;
    const targetTaps = Math.round(BASE_TARGET_TAPS + progress * 10 + rng() * 4);
    const timeMs = Math.round(BASE_TIME_MS - progress * 1400 + rng() * 400);
    bowls.push({ targetTaps, timeMs });
  }
  return bowls;
}
