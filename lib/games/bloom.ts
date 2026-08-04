import { createRng, randInt } from '../daily-seed';

export const GRID_SIZE = 8;
export const COLOR_COUNT = 5;
export const MOVE_SLACK = 3;

export const PALETTE = ['#E14B4B', '#2D7DA8', '#4CAF7D', '#D4A017', '#8B5FBF'];

export interface BloomState {
  colors: number[]; // fixed original color index per cell, length GRID_SIZE^2
  territory: Set<number>;
  territoryColor: number;
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
  const out: number[] = [];
  if (row > 0) out.push(idx(row - 1, col));
  if (row < GRID_SIZE - 1) out.push(idx(row + 1, col));
  if (col > 0) out.push(idx(row, col - 1));
  if (col < GRID_SIZE - 1) out.push(idx(row, col + 1));
  return out;
}

/** Expands a territory outward to include every cell reachable through
 * matching-color chains once the territory itself becomes `newColor`. */
function floodExpand(colors: number[], territory: Set<number>, newColor: number): Set<number> {
  const visited = new Set(territory);
  const queue = Array.from(territory);
  let head = 0;
  while (head < queue.length) {
    const current = queue[head++];
    for (const n of neighborsOf(current)) {
      if (!visited.has(n) && colors[n] === newColor) {
        visited.add(n);
        queue.push(n);
      }
    }
  }
  return visited;
}

/** Greedy reference solver — not necessarily optimal, but always terminates
 * and gives a real, valid move count to size the daily budget from. */
function greedySolveLength(colors: number[]): number {
  let territory = floodExpand(colors, new Set([0]), colors[0]);
  let territoryColor = colors[0];
  let moves = 0;
  const total = colors.length;

  while (territory.size < total && moves < total) {
    let bestColor = -1;
    let bestGain = -1;
    for (let c = 0; c < COLOR_COUNT; c++) {
      if (c === territoryColor) continue;
      const expanded = floodExpand(colors, territory, c);
      const gain = expanded.size - territory.size;
      if (gain > bestGain) {
        bestGain = gain;
        bestColor = c;
      }
    }
    territory = floodExpand(colors, territory, bestColor);
    territoryColor = bestColor;
    moves++;
  }

  return moves;
}

export function createInitialState(seed: number): BloomState {
  const rng = createRng(seed);
  const colors: number[] = [];
  for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) colors.push(randInt(rng, 0, COLOR_COUNT - 1));

  const territoryColor = colors[0];
  const territory = floodExpand(colors, new Set([0]), territoryColor);
  const referenceMoves = greedySolveLength(colors);

  return {
    colors,
    territory,
    territoryColor,
    moveLimit: referenceMoves + MOVE_SLACK,
    movesUsed: 0,
    won: false,
    lost: false,
  };
}

export function pickColor(state: BloomState, color: number): BloomState {
  if (state.won || state.lost) return state;
  if (color === state.territoryColor) return state;

  const territory = floodExpand(state.colors, state.territory, color);
  const movesUsed = state.movesUsed + 1;
  const won = territory.size === state.colors.length;
  const lost = !won && movesUsed >= state.moveLimit;

  return { ...state, territory, territoryColor: color, movesUsed, won, lost };
}
