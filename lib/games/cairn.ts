import { createRng, seededShuffle } from '../daily-seed';

export const PYRAMID_ROWS = 5; // rows 0 (top, 1 card) .. 4 (bottom, 5 cards) = 15 cards
export const PYRAMID_CARD_COUNT = (PYRAMID_ROWS * (PYRAMID_ROWS + 1)) / 2; // 15
export const VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
export const COPIES_PER_VALUE = 4; // 36-card deck, like 4 suits of 1-9
export const TARGET_SUM = 10;
export const DRAW_BUDGET = 21; // total cards in the reserve — one draw each, no redeal

export type Suit = '♠' | '♥' | '♦' | '♣';
const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];

export interface Card {
  value: number;
  suit: Suit;
  removed: boolean;
}

export interface CairnState {
  pyramid: Card[][]; // pyramid[row][i], row 0 = top (1 card) .. row 4 = bottom (5 cards)
  reserve: Card[]; // remaining face-down reserve, in draw order
  drawIndex: number; // how many reserve cards have been drawn (-1 = none drawn yet)
  selected: { row: number; col: number } | null; // a selected pyramid card awaiting a pair
  wasteSelected: boolean; // whether the current waste (top drawn) card is selected
  removedCount: number;
  won: boolean;
  lost: boolean;
}

function buildDeck(rng: () => number): Card[] {
  const deck: Card[] = [];
  for (const value of VALUES) {
    for (let i = 0; i < COPIES_PER_VALUE; i++) {
      deck.push({ value, suit: SUITS[i % SUITS.length], removed: false });
    }
  }
  return seededShuffle(deck, rng);
}

export function createInitialState(seed: number): CairnState {
  const rng = createRng(seed);
  const deck = buildDeck(rng);

  const pyramid: Card[][] = [];
  let cursor = 0;
  for (let row = 0; row < PYRAMID_ROWS; row++) {
    const rowCards: Card[] = [];
    for (let i = 0; i <= row; i++) {
      rowCards.push(deck[cursor]);
      cursor++;
    }
    pyramid.push(rowCards);
  }

  const reserve = deck.slice(cursor); // remaining cards after the pyramid

  return {
    pyramid,
    reserve,
    drawIndex: -1,
    selected: null,
    wasteSelected: false,
    removedCount: 0,
    won: false,
    lost: false,
  };
}

export function wasteCard(state: CairnState): Card | null {
  if (state.drawIndex < 0 || state.drawIndex >= state.reserve.length) return null;
  const card = state.reserve[state.drawIndex];
  return card.removed ? null : card;
}

/** A pyramid card is exposed once both cards directly beneath it are removed
 * (the bottom row has no covering cards and is exposed from the start). */
export function isExposed(state: CairnState, row: number, col: number): boolean {
  if (state.pyramid[row][col].removed) return false;
  if (row === PYRAMID_ROWS - 1) return true;
  const left = state.pyramid[row + 1][col];
  const right = state.pyramid[row + 1][col + 1];
  return left.removed && right.removed;
}

function checkWin(state: CairnState): boolean {
  return state.removedCount >= PYRAMID_CARD_COUNT;
}

function exposedCells(state: CairnState): { row: number; col: number }[] {
  const cells: { row: number; col: number }[] = [];
  for (let row = 0; row < PYRAMID_ROWS; row++) {
    for (let col = 0; col <= row; col++) {
      if (isExposed(state, row, col)) cells.push({ row, col });
    }
  }
  return cells;
}

/** Whether the player still has any way to make progress: a draw still available,
 * or a valid pair (pyramid-pyramid or pyramid-waste) sitting right now. */
function hasAnyValidMove(state: CairnState): boolean {
  if (state.drawIndex < DRAW_BUDGET - 1) return true; // drawing could still refresh the waste card

  const cells = exposedCells(state);
  const waste = wasteCard(state);

  if (waste) {
    for (const { row, col } of cells) {
      if (state.pyramid[row][col].value + waste.value === TARGET_SUM) return true;
    }
  }
  for (let i = 0; i < cells.length; i++) {
    for (let j = i + 1; j < cells.length; j++) {
      const a = state.pyramid[cells[i].row][cells[i].col];
      const b = state.pyramid[cells[j].row][cells[j].col];
      if (a.value + b.value === TARGET_SUM) return true;
    }
  }
  return false;
}

function checkLoss(state: CairnState): boolean {
  if (checkWin(state)) return false;
  return !hasAnyValidMove(state);
}

/** Draws the next reserve card, replacing whatever was in the waste slot. Costs one move. */
export function draw(state: CairnState): CairnState {
  if (state.won || state.lost) return state;
  if (state.drawIndex >= DRAW_BUDGET - 1) return state;
  const next: CairnState = {
    ...state,
    drawIndex: state.drawIndex + 1,
    selected: null,
    wasteSelected: false,
  };
  next.lost = checkLoss(next);
  return next;
}

/** Taps a pyramid card. Free — selecting or pairing costs nothing. */
export function tapPyramidCard(state: CairnState, row: number, col: number): CairnState {
  if (state.won || state.lost) return state;
  if (!isExposed(state, row, col)) return state;

  // Tapping the same card again just deselects it.
  if (state.selected && state.selected.row === row && state.selected.col === col) {
    return { ...state, selected: null };
  }

  const waste = wasteCard(state);

  // Pair with the currently-selected waste card.
  if (state.wasteSelected && waste) {
    const card = state.pyramid[row][col];
    if (card.value + waste.value === TARGET_SUM) {
      return removePair(state, [{ row, col }], true);
    }
    return { ...state, wasteSelected: false, selected: { row, col } };
  }

  // Pair with another already-selected pyramid card.
  if (state.selected) {
    const a = state.pyramid[state.selected.row][state.selected.col];
    const b = state.pyramid[row][col];
    if (a.value + b.value === TARGET_SUM) {
      return removePair(state, [state.selected, { row, col }], false);
    }
    return { ...state, selected: { row, col } };
  }

  return { ...state, selected: { row, col }, wasteSelected: false };
}

/** Taps the waste (top reserve) card. Free. */
export function tapWaste(state: CairnState): CairnState {
  if (state.won || state.lost) return state;
  const waste = wasteCard(state);
  if (!waste) return state;

  if (state.wasteSelected) {
    return { ...state, wasteSelected: false };
  }

  if (state.selected) {
    const card = state.pyramid[state.selected.row][state.selected.col];
    if (card.value + waste.value === TARGET_SUM) {
      return removePair(state, [state.selected], true);
    }
    return { ...state, selected: null, wasteSelected: true };
  }

  return { ...state, wasteSelected: true, selected: null };
}

function removePair(
  state: CairnState,
  pyramidCells: { row: number; col: number }[],
  alsoRemoveWaste: boolean
): CairnState {
  const pyramid = state.pyramid.map((r) => r.map((c) => ({ ...c })));
  for (const { row, col } of pyramidCells) {
    pyramid[row][col].removed = true;
  }

  let reserve = state.reserve;
  if (alsoRemoveWaste) {
    reserve = state.reserve.map((c, i) => (i === state.drawIndex ? { ...c, removed: true } : c));
  }

  const removedCount = state.removedCount + pyramidCells.length;
  const next: CairnState = {
    ...state,
    pyramid,
    reserve,
    removedCount,
    selected: null,
    wasteSelected: false,
  };
  next.won = checkWin(next);
  next.lost = !next.won && checkLoss(next);
  return next;
}
