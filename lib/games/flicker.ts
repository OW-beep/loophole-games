import { createRng } from '../daily-seed';

export const GRID_SIZE = 5;
export const CELL_COUNT = GRID_SIZE * GRID_SIZE;
export const SCRAMBLE_PROBABILITY = 0.4;
export const MOVE_SLACK = 5;

export interface FlickerState {
  lights: boolean[]; // true = lit, index = row*GRID_SIZE+col
  solutionSet: Set<number>; // a known-valid set of presses that solves it (not necessarily minimal)
  moveLimit: number;
  movesUsed: number;
  won: boolean;
  lost: boolean;
}

function idx(row: number, col: number): number {
  return row * GRID_SIZE + col;
}

function neighborsOf(index: number): number[] {
  const row = Math.floor(index / GRID_SIZE);
  const col = index % GRID_SIZE;
  const out = [index];
  if (row > 0) out.push(idx(row - 1, col));
  if (row < GRID_SIZE - 1) out.push(idx(row + 1, col));
  if (col > 0) out.push(idx(row, col - 1));
  if (col < GRID_SIZE - 1) out.push(idx(row, col + 1));
  return out;
}

function press(lights: boolean[], index: number): boolean[] {
  const next = [...lights];
  for (const n of neighborsOf(index)) next[n] = !next[n];
  return next;
}

function checkWin(lights: boolean[]): boolean {
  return lights.every((l) => !l);
}

export function createInitialState(seed: number): FlickerState {
  const rng = createRng(seed);

  let solutionSet: Set<number>;
  let lights: boolean[];
  let attempts = 0;
  do {
    solutionSet = new Set<number>();
    for (let i = 0; i < CELL_COUNT; i++) {
      if (rng() < SCRAMBLE_PROBABILITY) solutionSet.add(i);
    }
    lights = new Array(CELL_COUNT).fill(false);
    for (const i of solutionSet) lights = press(lights, i);
    attempts++;
  } while ((solutionSet.size === 0 || checkWin(lights)) && attempts < 20);

  return {
    lights,
    solutionSet,
    moveLimit: solutionSet.size + MOVE_SLACK,
    movesUsed: 0,
    won: false,
    lost: false,
  };
}

export function tapCell(state: FlickerState, index: number): FlickerState {
  if (state.won || state.lost) return state;
  const lights = press(state.lights, index);
  const movesUsed = state.movesUsed + 1;
  const won = checkWin(lights);
  const lost = !won && movesUsed >= state.moveLimit;
  return { ...state, lights, movesUsed, won, lost };
}
