import { createRng } from '../daily-seed';

/**
 * Acorn Dash: drag a squirrel left and right to catch a fixed daily sequence
 * of falling acorns while letting spiky burrs fall past. One item falls at
 * a time — no physics engine needed, just a y-position advancing at a
 * constant speed and a simple line-crossing + horizontal-overlap check.
 */

export const CANVAS_WIDTH = 360;
export const CANVAS_HEIGHT = 480;

export const BASKET_Y = CANVAS_HEIGHT - 46;
export const BASKET_HALF_WIDTH = 30;
export const ITEM_RADIUS = 12;

export const DROP_COUNT = 26;
export const ACORN_RATIO = 0.7;
export const MISS_BUDGET = 4;

export const SPAWN_Y = 26;
export const BASE_FALL_SPEED = 190; // px/s
export const FALL_SPEED_RAMP = 110; // added across the run as it progresses
export const FALL_SPEED_JITTER = 35;

export const BASKET_KEY_SPEED = 340; // px/s, arrow-key nudging
export const BASKET_SMOOTHING = 12; // higher = snappier drag-follow

const EDGE_MARGIN = 30;

export interface DropItem {
  type: 'acorn' | 'burr';
  x: number;
  speed: number;
}

/** Builds today's fixed sequence of drops from the daily seed. Difficulty
 * ramps up gradually — later drops fall faster — but the good/bad mix and
 * horizontal placement stay randomized throughout. */
export function createHarvest(seed: number): DropItem[] {
  const rng = createRng(seed);
  const items: DropItem[] = [];
  for (let i = 0; i < DROP_COUNT; i++) {
    const progress = DROP_COUNT > 1 ? i / (DROP_COUNT - 1) : 0;
    const type: DropItem['type'] = rng() < ACORN_RATIO ? 'acorn' : 'burr';
    const x = EDGE_MARGIN + rng() * (CANVAS_WIDTH - 2 * EDGE_MARGIN);
    const speed = BASE_FALL_SPEED + progress * FALL_SPEED_RAMP + rng() * FALL_SPEED_JITTER;
    items.push({ type, x, speed });
  }
  return items;
}

export function countAcorns(items: DropItem[]): number {
  return items.filter((i) => i.type === 'acorn').length;
}

/** True if the item's y crossed the catch line between the previous and
 * current frame — checked this way (rather than a range) so a fast-falling
 * item can't skip past the line undetected between frames. */
export function hasCrossedLine(prevY: number, nextY: number): boolean {
  return prevY < BASKET_Y && nextY >= BASKET_Y;
}

export function isOverlapping(itemX: number, basketX: number): boolean {
  return Math.abs(itemX - basketX) <= BASKET_HALF_WIDTH + ITEM_RADIUS;
}

export type CrossingOutcome = 'caught-acorn' | 'caught-burr' | 'missed-acorn' | 'avoided-burr';

export function resolveCrossing(item: DropItem, basketX: number): CrossingOutcome {
  const caught = isOverlapping(item.x, basketX);
  if (item.type === 'acorn') return caught ? 'caught-acorn' : 'missed-acorn';
  return caught ? 'caught-burr' : 'avoided-burr';
}

/** Smoothly moves the basket toward targetX — an exponential ease rather
 * than an instant snap, which is what gives the squirrel its slightly
 * bouncy, alive feel instead of feeling like a mouse cursor. */
export function stepBasket(basketX: number, targetX: number, dt: number): number {
  const t = Math.min(1, BASKET_SMOOTHING * dt);
  const clampedTarget = Math.max(BASKET_HALF_WIDTH, Math.min(CANVAS_WIDTH - BASKET_HALF_WIDTH, targetX));
  return basketX + (clampedTarget - basketX) * t;
}
