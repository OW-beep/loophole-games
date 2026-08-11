// lib/games/stax.ts
//
// Stax: drop a sliding block onto the tower below. Perfect landings keep
// the tower at full width and build a combo; a partial landing slices the
// block down to the overlap; missing entirely ends the run. This is the
// site's first game where the daily "puzzle" isn't a fixed layout at
// all — the target height and speed ramp are the same for everyone, but
// the outcome is pure reflex, same spirit as Boo Rush or Cloud Hop.
//
// All the geometry/scoring math lives here as pure, seed-free functions so
// it can be unit tested without touching Three.js or the DOM.

export const TARGET_HEIGHT = 14;
export const BASE_WIDTH = 1.5;
export const MIN_SURVIVABLE_WIDTH = 0.14;
export const PERFECT_TOLERANCE = 0.05;
export const COMBO_WIDEN_STREAK = 3;
export const COMBO_WIDEN_AMOUNT = 0.15;
export const BASE_SPEED = 1.5;
export const MAX_SPEED = 3.4;
export const SPEED_STEP = 0.09;

export interface StaxLayer {
  center: number;
  width: number;
}

export interface DropOutcome {
  layer: StaxLayer | null; // null means the drop missed entirely — run over
  perfect: boolean;
  combo: number;
  cutWidth: number; // how much was sliced off (0 for a perfect drop) — used to place the falling chip
  cutCenter: number;
}

/**
 * Resolves one drop: does the moving block (at movingCenter, movingWidth)
 * land on the layer below (prev)? A drop is "perfect" when almost nothing
 * gets cut off — that keeps the tower at full width and builds combo,
 * which every COMBO_WIDEN_STREAK perfects in a row also widens the tower
 * back toward BASE_WIDTH as a small comeback mechanic.
 */
export function resolveDrop(prev: StaxLayer, movingCenter: number, movingWidth: number, combo: number): DropOutcome {
  const prevStart = prev.center - prev.width / 2;
  const prevEnd = prev.center + prev.width / 2;
  const moveStart = movingCenter - movingWidth / 2;
  const moveEnd = movingCenter + movingWidth / 2;
  const overlapStart = Math.max(prevStart, moveStart);
  const overlapEnd = Math.min(prevEnd, moveEnd);
  const overlapWidth = overlapEnd - overlapStart;

  if (overlapWidth <= MIN_SURVIVABLE_WIDTH) {
    return { layer: null, perfect: false, combo: 0, cutWidth: movingWidth, cutCenter: movingCenter };
  }

  const cutWidth = movingWidth - overlapWidth;
  const isPerfect = cutWidth <= PERFECT_TOLERANCE;

  if (isPerfect) {
    const nextCombo = combo + 1;
    let width = prev.width;
    if (nextCombo % COMBO_WIDEN_STREAK === 0) {
      width = Math.min(BASE_WIDTH, width + COMBO_WIDEN_AMOUNT);
    }
    return { layer: { center: prev.center, width }, perfect: true, combo: nextCombo, cutWidth: 0, cutCenter: movingCenter };
  }

  const center = (overlapStart + overlapEnd) / 2;
  // The cut chip sits on whichever side got sliced off.
  const cutOnLeftSide = moveStart < overlapStart;
  const cutCenter = cutOnLeftSide ? (moveStart + overlapStart) / 2 : (overlapEnd + moveEnd) / 2;
  return { layer: { center, width: overlapWidth }, perfect: false, combo: 0, cutWidth, cutCenter };
}

export function speedForLevel(level: number): number {
  return Math.min(MAX_SPEED, BASE_SPEED + level * SPEED_STEP);
}

export function amplitudeForLevel(level: number): number {
  // Swing range also grows a little with height, capped, so later drops
  // demand a slightly wider read on timing without becoming impossible.
  return Math.min(1.8, 1.1 + level * 0.03);
}
