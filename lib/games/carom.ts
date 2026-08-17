// lib/games/carom.ts
//
// Carom: five lanes of stacked invaders. Every lane can be cleared by
// firing straight up it (Direct) — unless it's shielded, in which case
// Direct fire is wasted. A shield only stops fire coming from directly
// below, though: firing Bank from the mirror lane sends the shot in off
// the side wall instead, and it always lands regardless of shielding.
// That's the whole gimmick — no other game on the site has an attack that
// becomes *more* reliable specifically because it takes the indirect
// route.
//
// Solvable by construction, same principle as Croak/Bounce/Wiggle: since
// Bank always works no matter what, "fire Direct at every open lane and
// Bank at every shielded one" is a guaranteed clear within budget. No
// separate verification pass is needed — the rule itself guarantees it.

import { createRng } from '../daily-seed';

export const COLS = 5;
const MIN_QUEUE = 1;
const MAX_QUEUE = 3;
const SHIELD_CHANCE = 0.45;
const SHOT_SLACK = 3;

export type FireMode = 'direct' | 'bank';

export interface CaromLane {
  count: number; // invaders remaining in this lane, frontmost cleared first
  shielded: boolean;
}

export interface CaromState {
  seed: number;
  lanes: CaromLane[];
  shotBudget: number;
  shotsUsed: number;
  lastShot: { lane: number; targetLane: number; mode: FireMode; hit: boolean } | null;
  won: boolean;
  lost: boolean;
}

function mirrorLane(lane: number): number {
  return COLS - 1 - lane;
}

export function createInitialState(seed: number, shotBudget?: number): CaromState {
  const rng = createRng(seed);
  const lanes: CaromLane[] = [];
  let total = 0;
  for (let i = 0; i < COLS; i++) {
    const count = MIN_QUEUE + Math.floor(rng() * (MAX_QUEUE - MIN_QUEUE + 1));
    const shielded = rng() < SHIELD_CHANCE;
    lanes.push({ count, shielded });
    total += count;
  }

  return {
    seed,
    lanes,
    shotBudget: shotBudget ?? total + SHOT_SLACK,
    shotsUsed: 0,
    lastShot: null,
    won: false,
    lost: false,
  };
}

export function totalRemaining(state: CaromState): number {
  return state.lanes.reduce((sum, l) => sum + l.count, 0);
}

export function fire(state: CaromState, lane: number, mode: FireMode): CaromState {
  if (state.won || state.lost) return state;
  if (lane < 0 || lane >= COLS) return state;

  const targetLane = mode === 'direct' ? lane : mirrorLane(lane);
  const target = state.lanes[targetLane];
  const blocked = mode === 'direct' && target.shielded && target.count > 0;
  const hit = !blocked && target.count > 0;

  const lanes = state.lanes.map((l, i) => (i === targetLane && hit ? { ...l, count: l.count - 1 } : l));
  const shotsUsed = state.shotsUsed + 1;
  const remaining = lanes.reduce((sum, l) => sum + l.count, 0);

  const won = remaining === 0;
  const lost = !won && shotsUsed >= state.shotBudget;

  return {
    ...state,
    lanes,
    shotsUsed,
    lastShot: { lane, targetLane, mode, hit },
    won,
    lost,
  };
}
