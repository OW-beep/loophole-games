import { createRng } from '../daily-seed';
import { isValidWord } from './word-list';

export const GRID_SIZE = 6;
export const FLIPS_LIMIT = 14;
export const TARGET_SCORE = 300;
export const MIN_WORD_LEN = 3;
const FILL_RATIO = 0.65;

export type GravityDir = 'up' | 'down' | 'left' | 'right';

const LETTER_WEIGHTS: [string, number][] = [
  ['E', 12], ['A', 9], ['I', 8], ['O', 8], ['N', 7], ['R', 7], ['T', 7],
  ['L', 5], ['S', 6], ['U', 5], ['D', 4], ['G', 3], ['M', 3], ['C', 3],
  ['P', 3], ['B', 2], ['H', 2], ['F', 2], ['Y', 2], ['W', 2], ['K', 1],
  ['V', 1], ['J', 1], ['X', 1], ['Q', 1], ['Z', 1],
];
const LETTER_POOL: string[] = LETTER_WEIGHTS.flatMap(([letter, weight]) => Array(weight).fill(letter));

function randomLetter(rng: () => number): string {
  return LETTER_POOL[Math.floor(rng() * LETTER_POOL.length)];
}

export type Cell = string | null;

export interface GravityWordState {
  grid: Cell[];
  score: number;
  flipsUsed: number;
  won: boolean;
  lost: boolean;
  lastWords: string[];
}

function idx(r: number, c: number) {
  return r * GRID_SIZE + c;
}

/** Compacts every row/column's letters toward `dir`, leaving nulls on the far side. */
function compact(grid: Cell[], dir: GravityDir): Cell[] {
  const next = new Array<Cell>(GRID_SIZE * GRID_SIZE).fill(null);

  if (dir === 'down' || dir === 'up') {
    for (let c = 0; c < GRID_SIZE; c++) {
      const letters: string[] = [];
      for (let r = 0; r < GRID_SIZE; r++) {
        const v = grid[idx(r, c)];
        if (v) letters.push(v);
      }
      if (dir === 'down') {
        const startRow = GRID_SIZE - letters.length;
        letters.forEach((v, k) => (next[idx(startRow + k, c)] = v));
      } else {
        letters.forEach((v, k) => (next[idx(k, c)] = v));
      }
    }
  } else {
    for (let r = 0; r < GRID_SIZE; r++) {
      const letters: string[] = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        const v = grid[idx(r, c)];
        if (v) letters.push(v);
      }
      if (dir === 'right') {
        const startCol = GRID_SIZE - letters.length;
        letters.forEach((v, k) => (next[idx(r, startCol + k)] = v));
      } else {
        letters.forEach((v, k) => (next[idx(r, k)] = v));
      }
    }
  }
  return next;
}

/** Fills empty cells on the edge opposite `dir` with fresh random letters. */
function refillOppositeEdge(grid: Cell[], dir: GravityDir, rng: () => number): Cell[] {
  const next = [...grid];
  if (dir === 'down') {
    for (let c = 0; c < GRID_SIZE; c++) if (!next[idx(0, c)]) next[idx(0, c)] = randomLetter(rng);
  } else if (dir === 'up') {
    for (let c = 0; c < GRID_SIZE; c++) if (!next[idx(GRID_SIZE - 1, c)]) next[idx(GRID_SIZE - 1, c)] = randomLetter(rng);
  } else if (dir === 'right') {
    for (let r = 0; r < GRID_SIZE; r++) if (!next[idx(r, 0)]) next[idx(r, 0)] = randomLetter(rng);
  } else {
    for (let r = 0; r < GRID_SIZE; r++) if (!next[idx(r, GRID_SIZE - 1)]) next[idx(r, GRID_SIZE - 1)] = randomLetter(rng);
  }
  return next;
}

interface LineMatch {
  cells: number[];
  word: string;
}

/** Greedy longest-match scan over one line (row or column), respecting gaps (nulls) as segment breaks. */
function scanLine(cellsLine: (Cell)[], indices: number[]): LineMatch[] {
  const matches: LineMatch[] = [];
  let i = 0;
  while (i < cellsLine.length) {
    if (cellsLine[i] === null) {
      i++;
      continue;
    }
    let segEnd = i;
    while (segEnd < cellsLine.length && cellsLine[segEnd] !== null) segEnd++;
    const segLen = segEnd - i;

    let pos = i;
    while (pos < segEnd) {
      let found = false;
      const maxLen = Math.min(GRID_SIZE, segEnd - pos);
      for (let len = maxLen; len >= MIN_WORD_LEN; len--) {
        const word = (cellsLine.slice(pos, pos + len) as string[]).join('');
        if (isValidWord(word)) {
          matches.push({ cells: indices.slice(pos, pos + len), word });
          pos += len;
          found = true;
          break;
        }
      }
      if (!found) pos += 1;
    }
    i = segEnd;
  }
  return matches;
}

function findMatches(grid: Cell[]): LineMatch[] {
  const matches: LineMatch[] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    const indices = Array.from({ length: GRID_SIZE }, (_, c) => idx(r, c));
    const line = indices.map((i) => grid[i]);
    matches.push(...scanLine(line, indices));
  }
  for (let c = 0; c < GRID_SIZE; c++) {
    const indices = Array.from({ length: GRID_SIZE }, (_, r) => idx(r, c));
    const line = indices.map((i) => grid[i]);
    matches.push(...scanLine(line, indices));
  }
  return matches;
}

function clearAndSettle(grid: Cell[], dir: GravityDir, rng: () => number) {
  let current = [...grid];
  let scoreGained = 0;
  const words: string[] = [];

  for (let iter = 0; iter < 8; iter++) {
    const matches = findMatches(current);
    if (matches.length === 0) break;
    const clearedSet = new Set<number>();
    for (const m of matches) {
      words.push(m.word);
      scoreGained += m.word.length * 10;
      m.cells.forEach((c) => clearedSet.add(c));
    }
    const next = [...current];
    clearedSet.forEach((i) => (next[i] = null));
    current = refillOppositeEdge(compact(next, dir), dir, rng);
  }

  return { grid: current, scoreGained, words };
}

export function createInitialState(seed: number): GravityWordState {
  const rng = createRng(seed);
  let grid: Cell[] = Array.from({ length: GRID_SIZE * GRID_SIZE }, () =>
    rng() < FILL_RATIO ? randomLetter(rng) : null
  );
  // Quietly resolve any words already present at generation time, no score awarded.
  for (let i = 0; i < 4; i++) {
    const matches = findMatches(grid);
    if (matches.length === 0) break;
    const clearedSet = new Set<number>();
    matches.forEach((m) => m.cells.forEach((c) => clearedSet.add(c)));
    grid = grid.map((cell, idx2) => (clearedSet.has(idx2) ? (rng() < FILL_RATIO ? randomLetter(rng) : null) : cell));
  }

  return { grid, score: 0, flipsUsed: 0, won: false, lost: false, lastWords: [] };
}

export function setGravity(state: GravityWordState, dir: GravityDir, rng: () => number): GravityWordState {
  if (state.won || state.lost) return state;

  const compacted = refillOppositeEdge(compact(state.grid, dir), dir, rng);
  const { grid, scoreGained, words } = clearAndSettle(compacted, dir, rng);

  const flipsUsed = state.flipsUsed + 1;
  const score = state.score + scoreGained;
  const won = score >= TARGET_SCORE;
  const lost = !won && flipsUsed >= FLIPS_LIMIT;

  return { grid, score, flipsUsed, won, lost, lastWords: words };
}
