import { createRng, randInt, type DailyContext } from '../daily-seed';

export const TARGET_COUNT = 3;
export const MIX_BUDGET = 24; // total ink taps across all 3 targets
export const MATCH_THRESHOLD = 40; // RGB distance considered "close enough" to bottle
const MAX_DISTANCE = Math.sqrt(3 * 255 * 255);

export type InkName = 'Red' | 'Yellow' | 'Blue' | 'White' | 'Black';

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export const INKS: { name: InkName; rgb: RGB }[] = [
  { name: 'Red', rgb: { r: 230, g: 57, b: 70 } },
  { name: 'Yellow', rgb: { r: 255, g: 209, b: 102 } },
  { name: 'Blue', rgb: { r: 69, g: 123, b: 157 } },
  { name: 'White', rgb: { r: 255, g: 255, b: 255 } },
  { name: 'Black', rgb: { r: 30, g: 30, b: 30 } },
];

function inkRgb(name: InkName): RGB {
  return INKS.find((i) => i.name === name)!.rgb;
}

function meanColor(taps: InkName[]): RGB {
  if (taps.length === 0) return { r: 255, g: 255, b: 255 }; // empty well reads as blank white
  let r = 0,
    g = 0,
    b = 0;
  for (const t of taps) {
    const c = inkRgb(t);
    r += c.r;
    g += c.g;
    b += c.b;
  }
  return { r: r / taps.length, g: g / taps.length, b: b / taps.length };
}

export function colorDistance(a: RGB, b: RGB): number {
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}

/** 0-100, higher is closer. */
export function matchPercent(current: RGB, target: RGB): number {
  const d = colorDistance(current, target);
  return Math.max(0, Math.round(100 - (d / MAX_DISTANCE) * 100));
}

export function rgbToCss(c: RGB): string {
  return `rgb(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)})`;
}

export interface PigmentState {
  targets: RGB[]; // TARGET_COUNT recipes' resulting colors
  targetIndex: number; // which target is currently active
  wellTaps: InkName[]; // taps in the current well
  bottled: number; // how many targets have been matched so far
  tapsUsed: number;
  won: boolean;
  lost: boolean;
}

/** Builds a random-but-reachable target color from a small recipe of 2-4 ink taps. */
function randomTargetColor(rng: () => number): RGB {
  const recipeLength = randInt(rng, 2, 4);
  const taps: InkName[] = [];
  for (let i = 0; i < recipeLength; i++) {
    taps.push(INKS[randInt(rng, 0, INKS.length - 1)].name);
  }
  return meanColor(taps);
}

export function createInitialState(seed: number): PigmentState {
  const rng = createRng(seed);
  const targets: RGB[] = [];
  for (let i = 0; i < TARGET_COUNT; i++) {
    targets.push(randomTargetColor(rng));
  }
  return {
    targets,
    targetIndex: 0,
    wellTaps: [],
    bottled: 0,
    tapsUsed: 0,
    won: false,
    lost: false,
  };
}

export function currentMix(state: PigmentState): RGB {
  return meanColor(state.wellTaps);
}

export function currentMatch(state: PigmentState): number {
  return matchPercent(currentMix(state), state.targets[state.targetIndex]);
}

export function canBottle(state: PigmentState): boolean {
  if (state.won || state.lost) return false;
  return colorDistance(currentMix(state), state.targets[state.targetIndex]) <= MATCH_THRESHOLD;
}

/** Adding ink always costs one move. */
export function addInk(state: PigmentState, ink: InkName): PigmentState {
  if (state.won || state.lost) return state;
  const tapsUsed = state.tapsUsed + 1;
  const wellTaps = [...state.wellTaps, ink];
  const lost = tapsUsed >= MIX_BUDGET && !canBottle({ ...state, wellTaps, tapsUsed });
  return { ...state, wellTaps, tapsUsed, lost };
}

/** Clearing the well is free — it doesn't consume the tap budget. */
export function clearWell(state: PigmentState): PigmentState {
  if (state.won || state.lost) return state;
  return { ...state, wellTaps: [] };
}

/** Locks in the current mix for the active target and advances. Free action. */
export function bottle(state: PigmentState): PigmentState {
  if (!canBottle(state)) return state;
  const bottled = state.bottled + 1;
  const won = bottled >= TARGET_COUNT;
  return {
    ...state,
    bottled,
    targetIndex: Math.min(state.targetIndex + 1, TARGET_COUNT - 1),
    wellTaps: [],
    won,
  };
}

export type { DailyContext };
