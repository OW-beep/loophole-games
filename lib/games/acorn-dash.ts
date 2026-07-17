import { createRng } from '../daily-seed';

/**
 * Acorn Dash: drag a squirrel left and right to catch a fixed daily sequence
 * of falling acorns while letting spiky burrs fall past. One item falls at
 * a time — no physics engine needed, just a y-position advancing at a
 * constant speed, plus a horizontal sine-wave drift that makes the catch
 * point a genuine read-and-react moment instead of a straight vertical drop.
 */

export const CANVAS_WIDTH = 360;
export const CANVAS_HEIGHT = 480;

export const BASKET_Y = CANVAS_HEIGHT - 46;
export const BASKET_HALF_WIDTH = 24; // narrower than early builds — this is the tightest catch window
export const ITEM_RADIUS = 12;
export const BURR_RADIUS_SCALE = 1.45; // burrs read as bigger and genuinely are harder to dodge

export const DROP_COUNT = 34;
export const ACORN_RATIO = 0.62; // more burrs mixed in than acorns-only difficulty would suggest
export const MISS_BUDGET = 3;
export const GOLDEN_CHANCE = 0.16; // share of acorns that are golden — catching one refunds a miss

export const SPAWN_Y = 26;
export const BASE_FALL_SPEED = 215; // px/s
export const FALL_SPEED_RAMP = 175; // added across the run as it progresses — later drops are noticeably faster
export const FALL_SPEED_JITTER = 45;

export const DRIFT_AMP_MAX = 46; // px, how far an item can sway from its base line
export const DRIFT_FREQ_MIN = 1.4; // rad/s
export const DRIFT_FREQ_MAX = 3.0; // rad/s

export const BASKET_KEY_SPEED = 340; // px/s, arrow-key nudging
export const BASKET_SMOOTHING = 12; // higher = snappier drag-follow

// "Focus" reward: stringing together consecutive catches temporarily widens
// the catch window, so a hot streak earns a bit of breathing room against
// the bigger burrs and the sway, rather than just producing a higher number.
export const FOCUS_COMBO_STEP = 5; // grant focus every N-catch combo
export const FOCUS_BONUS_WIDTH = 11; // px added to the catch window while focused
export const FOCUS_DROPS_GRANTED = 3; // how many upcoming drops the bonus covers

const EDGE_MARGIN = 30;

export interface DropItem {
  type: 'acorn' | 'burr';
  golden: boolean;
  baseX: number;
  speed: number;
  driftAmp: number;
  driftFreq: number;
  driftPhase: number;
}

/** Builds today's fixed sequence of drops from the daily seed. Difficulty
 * ramps up gradually — later drops fall faster and drift further sideways —
 * but the good/bad mix, golden acorns, and horizontal placement stay
 * randomized throughout, so the run can't be solved by pattern alone. */
export function createHarvest(seed: number): DropItem[] {
  const rng = createRng(seed);
  const items: DropItem[] = [];
  for (let i = 0; i < DROP_COUNT; i++) {
    const progress = DROP_COUNT > 1 ? i / (DROP_COUNT - 1) : 0;
    const type: DropItem['type'] = rng() < ACORN_RATIO ? 'acorn' : 'burr';
    const golden = type === 'acorn' && rng() < GOLDEN_CHANCE;
    const baseX = EDGE_MARGIN + rng() * (CANVAS_WIDTH - 2 * EDGE_MARGIN);
    const speed = BASE_FALL_SPEED + progress * FALL_SPEED_RAMP + rng() * FALL_SPEED_JITTER;
    const driftAmp = rng() * DRIFT_AMP_MAX * (0.35 + 0.65 * progress);
    const driftFreq = DRIFT_FREQ_MIN + rng() * (DRIFT_FREQ_MAX - DRIFT_FREQ_MIN);
    const driftPhase = rng() * Math.PI * 2;
    items.push({ type, golden, baseX, speed, driftAmp, driftFreq, driftPhase });
  }
  return items;
}

export function countAcorns(items: DropItem[]): number {
  return items.filter((i) => i.type === 'acorn').length;
}

/** The item's actual on-screen x at a given time since it spawned — its
 * base line plus a sine sway, clamped so it never drifts off-canvas. */
export function currentX(item: DropItem, elapsedSec: number): number {
  const raw = item.baseX + Math.sin(elapsedSec * item.driftFreq + item.driftPhase) * item.driftAmp;
  return Math.max(EDGE_MARGIN * 0.6, Math.min(CANVAS_WIDTH - EDGE_MARGIN * 0.6, raw));
}

/** True if the item's y crossed the catch line between the previous and
 * current frame — checked this way (rather than a range) so a fast-falling
 * item can't skip past the line undetected between frames. */
export function hasCrossedLine(prevY: number, nextY: number): boolean {
  return prevY < BASKET_Y && nextY >= BASKET_Y;
}

/** Burrs use a larger effective radius than acorns — bigger to look at,
 * and genuinely more likely to clip the basket if you drift too close. */
export function radiusFor(item: DropItem): number {
  return item.type === 'burr' ? ITEM_RADIUS * BURR_RADIUS_SCALE : ITEM_RADIUS;
}

export function isOverlapping(itemX: number, basketX: number, itemRadius: number, basketHalfWidth: number): boolean {
  return Math.abs(itemX - basketX) <= basketHalfWidth + itemRadius;
}

export type CrossingOutcome = 'caught-acorn' | 'caught-golden' | 'caught-burr' | 'missed-acorn' | 'avoided-burr';

export function resolveCrossing(
  item: DropItem,
  itemX: number,
  basketX: number,
  basketHalfWidth: number = BASKET_HALF_WIDTH
): CrossingOutcome {
  const caught = isOverlapping(itemX, basketX, radiusFor(item), basketHalfWidth);
  if (item.type === 'acorn') {
    if (!caught) return 'missed-acorn';
    return item.golden ? 'caught-golden' : 'caught-acorn';
  }
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
