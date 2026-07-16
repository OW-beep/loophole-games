import { createRng } from '../daily-seed';

/**
 * Sprout: a needle sweeps around a dial; tap it while it's inside the
 * (seeded) target arc to grow the sprout one stage. Pure timing, no physics.
 */

export const STAGE_COUNT = 6;
export const MAX_MISSES = 3;

export interface StageConfig {
  durationMs: number; // one full needle revolution
  windowStart: number; // 0..1, where the target arc begins
  windowWidth: number; // 0..1, how wide the target arc is
}

/** Generates today's growth stages from the daily seed. Difficulty ramps up
 * across the run — faster revolutions, narrower windows — while the
 * window's *position* each stage is random, so the run isn't memorizable
 * from difficulty alone. */
export function createStages(seed: number): StageConfig[] {
  const rng = createRng(seed);
  const stages: StageConfig[] = [];
  for (let i = 0; i < STAGE_COUNT; i++) {
    const progress = STAGE_COUNT > 1 ? i / (STAGE_COUNT - 1) : 0;
    const durationMs = 2200 - progress * 900; // 2200ms -> 1300ms
    const windowWidth = 0.26 - progress * 0.12; // 0.26 -> 0.14
    const windowStart = rng() * (1 - windowWidth);
    stages.push({ durationMs, windowStart, windowWidth });
  }
  return stages;
}

/** Current position of the needle around the dial (0..1) given how long the
 * stage's cycle has been running. */
export function gaugePhase(stage: StageConfig, elapsedMs: number): number {
  const m = elapsedMs % stage.durationMs;
  return m < 0 ? (m + stage.durationMs) / stage.durationMs : m / stage.durationMs;
}

export function isInWindow(stage: StageConfig, phase: number): boolean {
  return phase >= stage.windowStart && phase <= stage.windowStart + stage.windowWidth;
}
