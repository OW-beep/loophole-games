// lib/games/pulse.ts
//
// Pulse: the site's first pure-reflex arcade game. A marker sweeps back
// and forth across a track; tap to stop it inside the target zone. The
// zone gets narrower and the sweep gets faster as attempts go on. Land
// enough hits within the attempt budget to win.
//
// Same shape as every other game on the site: createInitialState(seed)
// is fully deterministic (so today's daily run is identical for everyone
// and Coin Mode rounds just use a different seed), and progress is
// tracked as attemptsUsed / ATTEMPT_BUDGET — the same movesUsed/movesLimit
// pattern GameHeader, ResultModal, and computeCoinDelta already expect.

import { createRng } from '../daily-seed';

export const ATTEMPT_BUDGET = 8;
export const TARGET_HITS = 6;

export const TRACK_MIN = 0;
export const TRACK_MAX = 100;

// Sweep speed and target-zone width both ramp with attempt index, so the
// run gets harder as you go rather than being uniformly easy or hard.
const BASE_PERIOD_MS = 1400; // full back-and-forth sweep at attempt 0
const MIN_PERIOD_MS = 650; // sweep never gets faster than this
const BASE_ZONE_WIDTH = 26; // % of track width at attempt 0
const MIN_ZONE_WIDTH = 10; // zone never gets narrower than this

export interface PulseAttempt {
  zoneStart: number; // % along the track, 0-100
  zoneWidth: number; // %
  periodMs: number; // full sweep cycle time in ms
  hit: boolean | null; // null = not attempted yet
  tapPosition: number | null; // where the marker was when tapped
}

export interface PulseState {
  seed: number;
  attempts: PulseAttempt[];
  attemptBudget: number;
  attemptsUsed: number;
  hits: number;
  won: boolean;
  lost: boolean;
}

function attemptDifficulty(rng: () => number, index: number, attemptBudget: number): Pick<PulseAttempt, 'zoneStart' | 'zoneWidth' | 'periodMs'> {
  const progress = index / Math.max(1, attemptBudget - 1); // 0 → 1 across the run
  const zoneWidth = BASE_ZONE_WIDTH - (BASE_ZONE_WIDTH - MIN_ZONE_WIDTH) * progress;
  const periodMs = BASE_PERIOD_MS - (BASE_PERIOD_MS - MIN_PERIOD_MS) * progress;
  const zoneStart = rng() * (TRACK_MAX - TRACK_MIN - zoneWidth);
  return { zoneStart, zoneWidth, periodMs };
}

export function createInitialState(seed: number, attemptBudget: number = ATTEMPT_BUDGET): PulseState {
  const rng = createRng(seed);
  const attempts: PulseAttempt[] = [];
  for (let i = 0; i < attemptBudget; i++) {
    attempts.push({ ...attemptDifficulty(rng, i, attemptBudget), hit: null, tapPosition: null });
  }
  return { seed, attempts, attemptBudget, attemptsUsed: 0, hits: 0, won: false, lost: false };
}

/** The marker's position (0-100) at a given elapsed time, for the given attempt's sweep period. */
export function markerPosition(elapsedMs: number, periodMs: number): number {
  const phase = (elapsedMs % periodMs) / periodMs; // 0-1
  // Triangle wave: 0 → 100 → 0 over one full period, so the marker
  // reverses direction smoothly at both ends of the track.
  const tri = phase < 0.5 ? phase * 2 : 2 - phase * 2;
  return TRACK_MIN + tri * (TRACK_MAX - TRACK_MIN);
}

/** Resolves one tap: was the marker inside this attempt's target zone? */
export function applyTap(state: PulseState, position: number): PulseState {
  if (state.won || state.lost) return state;
  const i = state.attemptsUsed;
  const attempt = state.attempts[i];
  if (!attempt) return state;

  const hit = position >= attempt.zoneStart && position <= attempt.zoneStart + attempt.zoneWidth;
  const attempts = state.attempts.map((a, idx) => (idx === i ? { ...a, hit, tapPosition: position } : a));
  const attemptsUsed = state.attemptsUsed + 1;
  const hits = state.hits + (hit ? 1 : 0);

  const won = hits >= TARGET_HITS;
  const remaining = state.attemptBudget - attemptsUsed;
  const lost = !won && hits + remaining < TARGET_HITS;

  return { ...state, attempts, attemptsUsed, hits, won, lost };
}
