// lib/games/blip.ts
//
// Blip: a spatial-recognition reflex game, deliberately different from
// Pulse (single continuous timing track) and Sprout (radial timing dial).
// Each attempt lights up one cell in a 3x3 grid for a shrinking window —
// tap that exact cell before it fades. Tap the wrong cell, or tap nothing
// in time, and the attempt is a miss.
//
// Same shape as every other game on the site: createInitialState(seed) is
// fully deterministic, and progress is tracked as attemptsUsed/ATTEMPT_BUDGET
// — the same pattern GameHeader, ResultModal, and computeCoinDelta expect.

import { createRng } from '../daily-seed';

export const GRID_SIZE = 3;
export const CELL_COUNT = GRID_SIZE * GRID_SIZE;
export const ATTEMPT_BUDGET = 8;
export const TARGET_HITS = 6;

// The lit window shrinks from attempt 0 to the last attempt, so the run
// gets harder as it goes rather than being uniformly easy or hard.
const BASE_WINDOW_MS = 900;
const MIN_WINDOW_MS = 380;

export interface BlipAttempt {
  targetCell: number; // 0-8
  windowMs: number;
  result: 'hit' | 'miss' | null; // null = not attempted yet
  tappedCell: number | null; // null if it timed out with no tap
}

export interface BlipState {
  seed: number;
  attempts: BlipAttempt[];
  attemptsUsed: number;
  hits: number;
  won: boolean;
  lost: boolean;
}

function attemptDifficulty(rng: () => number, index: number): Pick<BlipAttempt, 'targetCell' | 'windowMs'> {
  const progress = index / Math.max(1, ATTEMPT_BUDGET - 1); // 0 → 1 across the run
  const windowMs = BASE_WINDOW_MS - (BASE_WINDOW_MS - MIN_WINDOW_MS) * progress;
  const targetCell = Math.floor(rng() * CELL_COUNT);
  return { targetCell, windowMs };
}

export function createInitialState(seed: number): BlipState {
  const rng = createRng(seed);
  const attempts: BlipAttempt[] = [];
  for (let i = 0; i < ATTEMPT_BUDGET; i++) {
    attempts.push({ ...attemptDifficulty(rng, i), result: null, tappedCell: null });
  }
  return { seed, attempts, attemptsUsed: 0, hits: 0, won: false, lost: false };
}

function settleAttempt(state: BlipState, result: 'hit' | 'miss', tappedCell: number | null): BlipState {
  if (state.won || state.lost) return state;
  const i = state.attemptsUsed;
  const attempt = state.attempts[i];
  if (!attempt) return state;

  const attempts = state.attempts.map((a, idx) => (idx === i ? { ...a, result, tappedCell } : a));
  const attemptsUsed = state.attemptsUsed + 1;
  const hits = state.hits + (result === 'hit' ? 1 : 0);

  const won = hits >= TARGET_HITS;
  const remaining = ATTEMPT_BUDGET - attemptsUsed;
  const lost = !won && hits + remaining < TARGET_HITS;

  return { ...state, attempts, attemptsUsed, hits, won, lost };
}

/** Player tapped a cell while the target was still lit. */
export function applyTap(state: BlipState, cell: number): BlipState {
  const attempt = state.attempts[state.attemptsUsed];
  if (!attempt) return state;
  return settleAttempt(state, cell === attempt.targetCell ? 'hit' : 'miss', cell);
}

/** The lit window ran out with no tap at all. */
export function applyTimeout(state: BlipState): BlipState {
  return settleAttempt(state, 'miss', null);
}
