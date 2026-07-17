import { createRng } from '../daily-seed';

/**
 * Cloud Hop: a bunny bounces automatically upward, off one cloud after
 * another, forever — the only input is steering it left or right onto the
 * next cloud before gravity brings it back down. No tap-to-jump; the bounce
 * is constant, the same "gravity in, velocity out" integrator as everything
 * else real-time in this index.
 */

export const CANVAS_WIDTH = 360;
export const CANVAS_HEIGHT = 480;

export const GRAVITY = 1300; // px/s^2
export const BOUNCE_VELOCITY = 760; // px/s, upward speed on every landing
export const BOOST_MULTIPLIER = 1.3; // applied to the bounce right after a rainbow cloud
export const MAX_JUMP_HEIGHT = (BOUNCE_VELOCITY * BOUNCE_VELOCITY) / (2 * GRAVITY);

export const CLOUD_COUNT = 28;
export const CLOUD_HALF_WIDTH = 37; // visual half-width
export const LANDING_TOLERANCE = 34; // horizontal tolerance for a successful landing
export const BUNNY_RADIUS = 16;

export const GAP_MIN = 120;
const GAP_EARLY_FRACTION = 0.8;
const GAP_LATE_FRACTION = 0.94;

export const MOVING_CHANCE = 0.22;
export const RAINBOW_CHANCE = 0.1;
export const DRIFT_AMP_MAX = 48;
export const DRIFT_FREQ_MIN = 1.0;
export const DRIFT_FREQ_MAX = 2.1;

export const BUNNY_KEY_SPEED = 300; // px/s, arrow-key nudging
export const BUNNY_SMOOTHING = 10; // higher = snappier drag-follow

export const REFERENCE_SCREEN_Y = 200; // where the bunny visually settles once climbing
export const GROUND_MARGIN = 40; // screen-space margin above the bottom edge for the start cloud

const EDGE_MARGIN = 42;

export type CloudType = 'safe' | 'moving' | 'rainbow';

export interface Cloud {
  type: CloudType;
  height: number; // cumulative world height above the start, always increasing
  baseX: number;
  driftAmp: number;
  driftFreq: number;
  driftPhase: number;
}

/** Builds today's fixed sequence of clouds from the daily seed. Every gap
 * between consecutive clouds stays under MAX_JUMP_HEIGHT, so a landing is
 * always physically reachable — later gaps just use a bigger share of that
 * maximum, which is what actually ramps the difficulty. */
export function createClouds(seed: number): Cloud[] {
  const rng = createRng(seed);
  const clouds: Cloud[] = [
    { type: 'safe', height: 0, baseX: CANVAS_WIDTH / 2, driftAmp: 0, driftFreq: 0, driftPhase: 0 },
  ];
  let height = 0;
  for (let i = 1; i < CLOUD_COUNT; i++) {
    const progress = (i - 1) / Math.max(1, CLOUD_COUNT - 2);
    const fraction = GAP_EARLY_FRACTION + progress * (GAP_LATE_FRACTION - GAP_EARLY_FRACTION);
    const gap = GAP_MIN + rng() * (MAX_JUMP_HEIGHT * fraction - GAP_MIN);
    height += gap;

    const roll = rng();
    const type: CloudType =
      roll < RAINBOW_CHANCE ? 'rainbow' : roll < RAINBOW_CHANCE + MOVING_CHANCE ? 'moving' : 'safe';
    const baseX = EDGE_MARGIN + rng() * (CANVAS_WIDTH - 2 * EDGE_MARGIN);
    const driftAmp = type === 'moving' ? rng() * DRIFT_AMP_MAX : 0;
    const driftFreq = DRIFT_FREQ_MIN + rng() * (DRIFT_FREQ_MAX - DRIFT_FREQ_MIN);
    const driftPhase = rng() * Math.PI * 2;

    clouds.push({ type, height, baseX, driftAmp, driftFreq, driftPhase });
  }
  return clouds;
}

/** A cloud's actual on-screen x at a given moment — static for safe and
 * rainbow clouds, swaying for moving ones. */
export function cloudX(cloud: Cloud, elapsedSec: number): number {
  if (cloud.driftAmp === 0) return cloud.baseX;
  const raw = cloud.baseX + Math.sin(elapsedSec * cloud.driftFreq + cloud.driftPhase) * cloud.driftAmp;
  return Math.max(EDGE_MARGIN * 0.5, Math.min(CANVAS_WIDTH - EDGE_MARGIN * 0.5, raw));
}

export function isOverlappingCloud(bunnyX: number, cloudXValue: number): boolean {
  return Math.abs(bunnyX - cloudXValue) <= LANDING_TOLERANCE;
}

/** Smoothly moves the bunny toward targetX — an exponential ease rather
 * than an instant snap, matching the same soft "alive" follow used for
 * Acorn Dash's basket. */
export function stepBunnyX(x: number, targetX: number, dt: number): number {
  const t = Math.min(1, BUNNY_SMOOTHING * dt);
  return x + (targetX - x) * t;
}

/** Screen edges wrap around rather than clamp — a classic touch for this
 * genre, and a kinder one than a hard wall when a cloud sits near the edge. */
export function wrapX(x: number): number {
  if (x < 0) return x + CANVAS_WIDTH;
  if (x > CANVAS_WIDTH) return x - CANVAS_WIDTH;
  return x;
}

/** Converts a cloud/bunny's world height into a screen y, given the peak
 * height reached so far. The camera only ever follows the peak — never the
 * bunny's current (possibly falling) height — which is what lets a fall
 * actually carry the bunny down and off the bottom of the screen. */
export function screenYForHeight(height: number, maxHeightReached: number): number {
  const cameraOffset = Math.max(0, maxHeightReached - (CANVAS_HEIGHT - GROUND_MARGIN - REFERENCE_SCREEN_Y));
  return CANVAS_HEIGHT - GROUND_MARGIN - height + cameraOffset;
}
