import { createRng, randInt } from '../daily-seed';

export const GRID_SIZE = 4; // bounding box is GRID_SIZE^3
export const MIN_CUBES = 6;
export const MAX_CUBES = 34;
export const GUESS_BUDGET = 9;

export interface Voxel {
  x: number;
  y: number;
  z: number;
}

export interface VantageState {
  voxels: Voxel[];
  trueCount: number;
  guesses: { value: number; result: 'higher' | 'lower' | 'correct' }[];
  won: boolean;
  lost: boolean;
}

function key(v: Voxel): string {
  return `${v.x},${v.y},${v.z}`;
}

function neighborsOf(v: Voxel): Voxel[] {
  const deltas: [number, number, number][] = [
    [1, 0, 0],
    [-1, 0, 0],
    [0, 1, 0],
    [0, -1, 0],
    [0, 0, 1],
    [0, 0, -1],
  ];
  return deltas
    .map(([dx, dy, dz]) => ({ x: v.x + dx, y: v.y + dy, z: v.z + dz }))
    .filter((n) => n.x >= 0 && n.x < GRID_SIZE && n.y >= 0 && n.y < GRID_SIZE && n.z >= 0 && n.z < GRID_SIZE);
}

/** Grows a connected voxel cluster by repeatedly adding a random cube adjacent
 * to the current structure — guarantees every cube is face-connected to the
 * whole, so the resulting shape always reads as one coherent object. */
function generateStructure(rng: () => number): Voxel[] {
  const targetCount = randInt(rng, MIN_CUBES, MAX_CUBES);
  const start: Voxel = {
    x: randInt(rng, 1, GRID_SIZE - 2),
    y: 0,
    z: randInt(rng, 1, GRID_SIZE - 2),
  };
  const structure = new Map<string, Voxel>([[key(start), start]]);
  const frontier = new Set<string>();
  for (const n of neighborsOf(start)) frontier.add(key(n));

  let guard = 0;
  while (structure.size < targetCount && frontier.size > 0 && guard < 1000) {
    guard++;
    const candidates = Array.from(frontier);
    const chosenKey = candidates[randInt(rng, 0, candidates.length - 1)];
    frontier.delete(chosenKey);
    if (structure.has(chosenKey)) continue;
    const [x, y, z] = chosenKey.split(',').map(Number);
    const voxel = { x, y, z };
    structure.set(chosenKey, voxel);
    for (const n of neighborsOf(voxel)) {
      if (!structure.has(key(n))) frontier.add(key(n));
    }
  }

  return Array.from(structure.values());
}

export function createInitialState(seed: number): VantageState {
  const rng = createRng(seed);
  const voxels = generateStructure(rng);
  return {
    voxels,
    trueCount: voxels.length,
    guesses: [],
    won: false,
    lost: false,
  };
}

export function submitGuess(state: VantageState, value: number, budget: number = GUESS_BUDGET): VantageState {
  if (state.won || state.lost) return state;
  if (!Number.isFinite(value) || value <= 0) return state;

  const result: 'higher' | 'lower' | 'correct' =
    value === state.trueCount ? 'correct' : value < state.trueCount ? 'higher' : 'lower';
  const guesses = [...state.guesses, { value, result }];
  const won = result === 'correct';
  const lost = !won && guesses.length >= budget;

  return { ...state, guesses, won, lost };
}
