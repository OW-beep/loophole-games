/**
 * Deterministic daily puzzle seeding.
 *
 * Every player who opens a given game on the same UTC calendar day gets the
 * exact same puzzle, so results are comparable and shareable (the "Wordle
 * model"). The seed is derived from the UTC date string + the game slug, so
 * different games don't collide even when generated on the same day.
 */

export function utcDateString(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

// Simple, fast, deterministic string hash (djb2 variant) -> 32-bit seed.
function hashStringToSeed(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0;
}

// mulberry32 PRNG: tiny, deterministic, good enough for puzzle layouts.
export function createRng(seed: number) {
  let a = seed;
  return function rng(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface DailyContext {
  dateString: string;
  seed: number;
  rng: () => number;
  /** Day number since epoch — handy as the human-readable puzzle number, e.g. "#214" */
  puzzleNumber: number;
}

const EPOCH = new Date('2026-01-01T00:00:00Z').getTime();

export function getDailyContext(gameSlug: string, date: Date = new Date()): DailyContext {
  const dateString = utcDateString(date);
  const seed = hashStringToSeed(`${gameSlug}:${dateString}`);
  const puzzleNumber = Math.max(
    1,
    Math.floor((Date.parse(`${dateString}T00:00:00Z`) - EPOCH) / 86400000) + 1
  );
  return { dateString, seed, rng: createRng(seed), puzzleNumber };
}

/** Pick a random int in [min, max] inclusive, using a seeded rng. */
export function randInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

/** Shuffle an array in place using a seeded rng (Fisher–Yates). */
export function seededShuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Milliseconds until the next UTC midnight — used for the "resets in" countdown. */
export function msUntilNextUtcMidnight(now: Date = new Date()): number {
  const next = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0)
  );
  return next.getTime() - now.getTime();
}
