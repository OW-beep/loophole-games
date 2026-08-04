import { createRng, randInt } from '../daily-seed';

export const GRID_SIZE = 3;
export const MIN_CUBES = 6;
export const MAX_CUBES = 9;
export const MOVE_SLACK = 6;

export interface Voxel {
  x: number;
  y: number;
  z: number;
}

export type ViewGrid = boolean[][]; // [row][col], GRID_SIZE x GRID_SIZE

export interface Views {
  top: ViewGrid; // looking down -Y, indexed [z][x]
  front: ViewGrid; // looking along -Z, indexed [y][x]
  side: ViewGrid; // looking along -X, indexed [y][z]
}

export interface BlueprintState {
  targetViews: Views;
  targetCubeCount: number;
  voxels: Set<string>; // player's current build, "x,y,z"
  moveLimit: number;
  movesUsed: number;
  won: boolean;
  lost: boolean;
}

function key(v: Voxel): string {
  return `${v.x},${v.y},${v.z}`;
}

function neighborsOf(v: Voxel): Voxel[] {
  const deltas: [number, number, number][] = [
    [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1],
  ];
  return deltas
    .map(([dx, dy, dz]) => ({ x: v.x + dx, y: v.y + dy, z: v.z + dz }))
    .filter((n) => n.x >= 0 && n.x < GRID_SIZE && n.y >= 0 && n.y < GRID_SIZE && n.z >= 0 && n.z < GRID_SIZE);
}

/** Grows a connected voxel cluster, same technique as Vantage — guarantees
 * every cube is face-connected to the whole. */
function generateStructure(rng: () => number): Voxel[] {
  const targetCount = randInt(rng, MIN_CUBES, MAX_CUBES);
  const start: Voxel = {
    x: randInt(rng, 0, GRID_SIZE - 1),
    y: 0,
    z: randInt(rng, 0, GRID_SIZE - 1),
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

function emptyGrid(): ViewGrid {
  return Array.from({ length: GRID_SIZE }, () => new Array(GRID_SIZE).fill(false));
}

export function computeViews(voxelKeys: Set<string> | Voxel[]): Views {
  const voxels: Voxel[] =
    voxelKeys instanceof Set
      ? Array.from(voxelKeys).map((k) => {
          const [x, y, z] = k.split(',').map(Number);
          return { x, y, z };
        })
      : voxelKeys;

  const top = emptyGrid();
  const front = emptyGrid();
  const side = emptyGrid();

  for (const v of voxels) {
    top[v.z][v.x] = true;
    front[v.y][v.x] = true;
    side[v.y][v.z] = true;
  }

  return { top, front, side };
}

function viewsEqual(a: Views, b: Views): boolean {
  const gridsEqual = (g1: ViewGrid, g2: ViewGrid) => g1.every((row, i) => row.every((cell, j) => cell === g2[i][j]));
  return gridsEqual(a.top, b.top) && gridsEqual(a.front, b.front) && gridsEqual(a.side, b.side);
}

export function createInitialState(seed: number): BlueprintState {
  const rng = createRng(seed);
  const structure = generateStructure(rng);
  const targetViews = computeViews(structure);

  return {
    targetViews,
    targetCubeCount: structure.length,
    voxels: new Set(),
    moveLimit: structure.length + MOVE_SLACK,
    movesUsed: 0,
    won: false,
    lost: false,
  };
}

export function toggleVoxel(state: BlueprintState, v: Voxel): BlueprintState {
  if (state.won || state.lost) return state;
  const k = key(v);
  const voxels = new Set(state.voxels);
  if (voxels.has(k)) voxels.delete(k);
  else voxels.add(k);

  const movesUsed = state.movesUsed + 1;
  const won = viewsEqual(computeViews(voxels), state.targetViews);
  const lost = !won && movesUsed >= state.moveLimit;

  return { ...state, voxels, movesUsed, won, lost };
}

export { key as voxelKey };
