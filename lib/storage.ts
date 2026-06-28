'use client';

import { utcDateString } from './daily-seed';

export interface DailyResult {
  date: string; // YYYY-MM-DD
  won: boolean;
  moves: number;
  score: number;
  elapsedMs: number;
}

const STORAGE_KEY = 'loophole:results:v1';

type ResultsStore = Record<string, Record<string, DailyResult>>; // gameSlug -> date -> result

function readStore(): ResultsStore {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ResultsStore) : {};
  } catch {
    return {};
  }
}

function writeStore(store: ResultsStore) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // localStorage unavailable (private mode / disabled) — fail silently,
    // the game still works, it just won't remember streaks.
  }
}

export function recordResult(gameSlug: string, result: DailyResult) {
  const store = readStore();
  if (!store[gameSlug]) store[gameSlug] = {};
  store[gameSlug][result.date] = result;
  writeStore(store);
}

export function getResult(gameSlug: string, date: string): DailyResult | undefined {
  return readStore()[gameSlug]?.[date];
}

export function hasPlayedToday(gameSlug: string): boolean {
  return !!getResult(gameSlug, utcDateString());
}

/** Current streak = consecutive UTC days (ending today or yesterday) with a win. */
export function getStreak(gameSlug: string): { current: number; best: number } {
  const store = readStore()[gameSlug] ?? {};
  const dates = Object.keys(store).sort(); // ascending YYYY-MM-DD
  if (dates.length === 0) return { current: 0, best: 0 };

  let best = 0;
  let running = 0;
  let prevTime: number | null = null;

  for (const d of dates) {
    if (!store[d].won) {
      running = 0;
      prevTime = null;
      continue;
    }
    const t = Date.parse(`${d}T00:00:00Z`);
    if (prevTime !== null && t - prevTime === 86400000) {
      running += 1;
    } else {
      running = 1;
    }
    prevTime = t;
    best = Math.max(best, running);
  }

  // Current streak only counts if it reaches up to today or yesterday.
  const today = utcDateString();
  const yesterday = utcDateString(new Date(Date.now() - 86400000));
  let current = 0;
  if (store[today]?.won) {
    current = 1;
    let cursor = Date.parse(`${today}T00:00:00Z`) - 86400000;
    while (store[utcDateString(new Date(cursor))]?.won) {
      current += 1;
      cursor -= 86400000;
    }
  } else if (store[yesterday]?.won) {
    current = 1;
    let cursor = Date.parse(`${yesterday}T00:00:00Z`) - 86400000;
    while (store[utcDateString(new Date(cursor))]?.won) {
      current += 1;
      cursor -= 86400000;
    }
  }

  return { current, best };
}

export function getAllStreaks(slugs: string[]): Record<string, { current: number; best: number }> {
  const out: Record<string, { current: number; best: number }> = {};
  for (const s of slugs) out[s] = getStreak(s);
  return out;
}
