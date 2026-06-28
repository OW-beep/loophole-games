import { createRng, randInt, seededShuffle } from '../daily-seed';

export const GRID_SIZE = 5;
export const MOVES_LIMIT = 16;
export const TARGET_VALUE = 128;
export const INITIAL_TILE_COUNT = 6;

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Tile {
  id: number;
  value: number;
}

export type Board = (Tile | null)[]; // length GRID_SIZE * GRID_SIZE

export interface PendingEcho {
  trackId: number;
  direction: Direction;
}

export interface EchoMergeState {
  board: Board;
  score: number;
  movesUsed: number;
  pendingEcho: PendingEcho | null;
  won: boolean;
  lost: boolean;
  nextTileId: number;
  lastEvents: MoveEvent[]; // for animation hints, cleared each render cycle by caller
}

export interface MoveEvent {
  type: 'slide' | 'merge' | 'spawn' | 'echo-fizzle';
  fromIdx?: number;
  toIdx?: number;
  value?: number;
}

const DIRECTION_DELTA: Record<Direction, { dr: number; dc: number }> = {
  up: { dr: -1, dc: 0 },
  down: { dr: 1, dc: 0 },
  left: { dr: 0, dc: -1 },
  right: { dr: 0, dc: 1 },
};

function idxToRC(idx: number) {
  return { r: Math.floor(idx / GRID_SIZE), c: idx % GRID_SIZE };
}
function rcToIdx(r: number, c: number) {
  return r * GRID_SIZE + c;
}
function inBounds(r: number, c: number) {
  return r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE;
}

export function createInitialState(seed: number): EchoMergeState {
  const rng = createRng(seed);
  const board: Board = new Array(GRID_SIZE * GRID_SIZE).fill(null);
  const positions = seededShuffle(
    Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => i),
    rng
  ).slice(0, INITIAL_TILE_COUNT);

  let nextTileId = 1;
  for (const pos of positions) {
    const value = rng() < 0.8 ? 2 : 4;
    board[pos] = { id: nextTileId++, value };
  }

  return {
    board,
    score: 0,
    movesUsed: 0,
    pendingEcho: null,
    won: false,
    lost: false,
    nextTileId,
    lastEvents: [],
  };
}

/**
 * Slides the tile at fromIdx in the given direction as far as it can go,
 * merging with an equal-value tile if it lands on one. Returns the updated
 * board plus metadata about what happened (for scoring + animation).
 */
function slideTile(
  board: Board,
  fromIdx: number,
  dir: Direction
): { board: Board; toIdx: number; merged: boolean; mergedValue?: number; survivorId?: number } {
  const tile = board[fromIdx];
  if (!tile) return { board, toIdx: fromIdx, merged: false };

  const { dr, dc } = DIRECTION_DELTA[dir];
  const { r, c } = idxToRC(fromIdx);
  let lastEmpty = fromIdx;
  let cur = { r: r + dr, c: c + dc };

  while (inBounds(cur.r, cur.c)) {
    const idx = rcToIdx(cur.r, cur.c);
    const occupant = board[idx];
    if (!occupant) {
      lastEmpty = idx;
      cur = { r: cur.r + dr, c: cur.c + dc };
      continue;
    }
    if (occupant.value === tile.value) {
      // merge: tile moves into occupant's cell, value doubles, mover's id survives
      const newBoard = [...board];
      newBoard[fromIdx] = null;
      const mergedValue = tile.value * 2;
      newBoard[idx] = { id: tile.id, value: mergedValue };
      return { board: newBoard, toIdx: idx, merged: true, mergedValue, survivorId: tile.id };
    }
    // different value: blocked, stop at lastEmpty
    break;
  }

  if (lastEmpty === fromIdx) {
    // couldn't move at all
    return { board, toIdx: fromIdx, merged: false };
  }
  const newBoard = [...board];
  newBoard[fromIdx] = null;
  newBoard[lastEmpty] = tile;
  return { board: newBoard, toIdx: lastEmpty, merged: false };
}

function findTileIndexById(board: Board, id: number): number {
  return board.findIndex((t) => t?.id === id);
}

function spawnRandomTile(board: Board, rng: () => number, nextTileId: number): { board: Board; nextTileId: number; spawnedAt: number | null } {
  const emptyCells = board.reduce<number[]>((acc, t, i) => {
    if (!t) acc.push(i);
    return acc;
  }, []);
  if (emptyCells.length === 0) return { board, nextTileId, spawnedAt: null };
  const pos = emptyCells[randInt(rng, 0, emptyCells.length - 1)];
  const value = rng() < 0.85 ? 2 : 4;
  const newBoard = [...board];
  newBoard[pos] = { id: nextTileId, value };
  return { board: newBoard, nextTileId: nextTileId + 1, spawnedAt: pos };
}

/**
 * Applies one full player turn: the manual move, then the echo of the
 * previous turn, then a random tile spawn. `rng` should be a state-local
 * seeded generator so replays of the same puzzle stay deterministic only
 * up to player choices (the spawn rng advances each call, so pass a single
 * rng instance you keep across the whole game session).
 */
export function applyMove(
  state: EchoMergeState,
  fromIdx: number,
  dir: Direction,
  rng: () => number
): EchoMergeState {
  if (state.won || state.lost) return state;
  const tile = state.board[fromIdx];
  if (!tile) return state;

  const events: MoveEvent[] = [];

  // 1. Manual move
  const manualResult = slideTile(state.board, fromIdx, dir);
  if (manualResult.toIdx === fromIdx) {
    // The tile is already blocked in that direction — nothing happened,
    // so don't burn a move or advance the echo queue.
    return state;
  }
  let board = manualResult.board;
  let score = state.score;
  events.push({ type: manualResult.merged ? 'merge' : 'slide', fromIdx, toIdx: manualResult.toIdx, value: manualResult.mergedValue });
  if (manualResult.merged && manualResult.mergedValue) score += manualResult.mergedValue;

  // The id to track for the echo this move creates is the surviving tile's id
  // (if a merge happened, that's survivorId; otherwise it's the same tile id).
  const movedTileId = manualResult.survivorId ?? tile.id;

  // 2. Resolve the echo queued from the *previous* turn
  if (state.pendingEcho) {
    const trackIdx = findTileIndexById(board, state.pendingEcho.trackId);
    if (trackIdx === -1) {
      events.push({ type: 'echo-fizzle' });
    } else {
      const echoResult = slideTile(board, trackIdx, state.pendingEcho.direction);
      board = echoResult.board;
      if (echoResult.toIdx !== trackIdx) {
        events.push({
          type: echoResult.merged ? 'merge' : 'slide',
          fromIdx: trackIdx,
          toIdx: echoResult.toIdx,
          value: echoResult.mergedValue,
        });
        if (echoResult.merged && echoResult.mergedValue) score += echoResult.mergedValue;
      } else {
        events.push({ type: 'echo-fizzle' });
      }
    }
  }

  // 3. Spawn a new tile
  const spawnResult = spawnRandomTile(board, rng, state.nextTileId);
  board = spawnResult.board;
  if (spawnResult.spawnedAt !== null) {
    events.push({ type: 'spawn', toIdx: spawnResult.spawnedAt });
  }

  const movesUsed = state.movesUsed + 1;
  const won = board.some((t) => t && t.value >= TARGET_VALUE);
  const lost = !won && movesUsed >= MOVES_LIMIT;

  return {
    board,
    score,
    movesUsed,
    pendingEcho: { trackId: movedTileId, direction: dir },
    won,
    lost,
    nextTileId: spawnResult.nextTileId,
    lastEvents: events,
  };
}
