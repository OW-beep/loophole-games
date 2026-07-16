import { createRng } from '../daily-seed';

/**
 * Wobble Chef: drop today's dishes, one at a time, onto a single growing
 * tower. Each dish free-falls under gravity (real, if minimal, physics);
 * whether it *joins* the tower is a plain distance-from-center check rather
 * than full stacking physics — that single check is what gives the tower
 * its "wobble."
 */

export const CANVAS_WIDTH = 360;
export const CANVAS_HEIGHT = 480;
export const GROUND_Y = CANVAS_HEIGHT - 20;

export const GRAVITY = 1400;
export const MENU_LENGTH = 12;

export const SWING_AMPLITUDE = 110;
export const SWING_SPEED = 1.7; // radians / s

export interface FoodType {
  name: string;
  w: number;
  h: number;
  color: string;
}

export const FOOD_TYPES: FoodType[] = [
  { name: 'onigiri', w: 46, h: 34, color: '#F4E7C9' },
  { name: 'tomato', w: 40, h: 40, color: '#E2793D' },
  { name: 'bun', w: 50, h: 30, color: '#E8C39E' },
  { name: 'mochi', w: 44, h: 32, color: '#FDFDFD' },
  { name: 'egg', w: 36, h: 30, color: '#F7D65B' },
];

/** Today's dish order — a fixed sequence generated from the daily seed, the
 * same for every player. */
export function createMenu(seed: number): number[] {
  const rng = createRng(seed);
  return Array.from({ length: MENU_LENGTH }, () => Math.floor(rng() * FOOD_TYPES.length));
}

export interface FallingItem {
  x: number;
  y: number;
  vy: number;
  typeIndex: number;
}

export function createFallingItem(typeIndex: number, x: number): FallingItem {
  return { x, y: 34, vy: 0, typeIndex };
}

export function stepFalling(item: FallingItem, dt: number): FallingItem {
  const vy = item.vy + GRAVITY * dt;
  return { ...item, vy, y: item.y + vy * dt };
}

export interface TowerState {
  topY: number; // world y of the tower's current top surface
  centerX: number; // x of the current top dish
}

export function createInitialTower(): TowerState {
  return { topY: GROUND_Y, centerX: CANVAS_WIDTH / 2 };
}

export interface DropResult {
  success: boolean;
  tower: TowerState;
}

/** A dish joins the tower if it lands close enough to the current center;
 * otherwise it overhangs too far and the tower topples. Landing shifts the
 * tower's effective center a bit toward where the dish actually landed, so
 * a run of slightly-off placements compounds, the way a real stack leans. */
export function evaluateDrop(tower: TowerState, dropX: number, typeIndex: number): DropResult {
  const t = FOOD_TYPES[typeIndex];
  const offset = Math.abs(dropX - tower.centerX);
  const tolerance = t.w * 0.5 + 10;

  if (offset > tolerance) {
    return { success: false, tower };
  }

  return {
    success: true,
    tower: {
      topY: tower.topY - t.h,
      centerX: (tower.centerX + dropX) / 2,
    },
  };
}
