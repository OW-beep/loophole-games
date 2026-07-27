import { createRng, seededShuffle } from '../daily-seed';

export const POINT_VALUES = [1, 2, 3, 4] as const;
export const COPIES_PER_VALUE = 4; // 16 point cards
export const BUST_CARD_COUNT = 4;
export const DECK_SIZE = POINT_VALUES.length * COPIES_PER_VALUE + BUST_CARD_COUNT; // 20
export const TARGET_SCORE = 45;

export type Card = { kind: 'point'; value: number } | { kind: 'bust' };

export interface OverdrawState {
  deck: Card[]; // fixed draw order for the day
  drawnIndex: number; // how many cards have been drawn (0..DECK_SIZE)
  currentRun: number; // unbanked points from the current run
  runLength: number; // cards accumulated in the current run since the last bank
  bankedScore: number; // secured score
  lastCard: Card | null; // most recently drawn card, for the UI
  movesUsed: number;
  won: boolean;
  lost: boolean;
}

/** Triangular-number bonus for banking a longer streak in one go: 0, 1, 3, 6,
 * 10, 15... Banking one card at a time (length 1) always scores zero bonus,
 * which is deliberate — the safest possible play must not be able to reach
 * the target alone, or there'd be no real risk in the game at all. */
export function streakBonus(runLength: number): number {
  return (runLength * (runLength - 1)) / 2;
}

function buildDeck(rng: () => number): Card[] {
  const cards: Card[] = [];
  for (const value of POINT_VALUES) {
    for (let i = 0; i < COPIES_PER_VALUE; i++) cards.push({ kind: 'point', value });
  }
  for (let i = 0; i < BUST_CARD_COUNT; i++) cards.push({ kind: 'bust' });
  return seededShuffle(cards, rng);
}

export function createInitialState(seed: number): OverdrawState {
  const rng = createRng(seed);
  return {
    deck: buildDeck(rng),
    drawnIndex: 0,
    currentRun: 0,
    runLength: 0,
    bankedScore: 0,
    lastCard: null,
    movesUsed: 0,
    won: false,
    lost: false,
  };
}

/** How many cards remain, and how many of those are bust cards — the
 * information a player needs to reason about risk before drawing again. */
export function remainingInfo(state: OverdrawState): { remaining: number; bustsRemaining: number } {
  const remainingCards = state.deck.slice(state.drawnIndex);
  return {
    remaining: remainingCards.length,
    bustsRemaining: remainingCards.filter((c) => c.kind === 'bust').length,
  };
}

export function draw(state: OverdrawState): OverdrawState {
  if (state.won || state.lost) return state;
  if (state.drawnIndex >= DECK_SIZE) return state;

  const card = state.deck[state.drawnIndex];
  const drawnIndex = state.drawnIndex + 1;
  const movesUsed = state.movesUsed + 1;
  const currentRun = card.kind === 'bust' ? 0 : state.currentRun + card.value;
  const runLength = card.kind === 'bust' ? 0 : state.runLength + 1;

  const deckExhausted = drawnIndex >= DECK_SIZE;
  let bankedScore = state.bankedScore;
  let won = false;
  let lost = false;
  let finalCurrentRun = currentRun;
  let finalRunLength = runLength;

  if (deckExhausted) {
    // No more draws possible — resolve as if the player banks whatever's left.
    const effectiveScore = state.bankedScore + currentRun + streakBonus(runLength);
    if (effectiveScore >= TARGET_SCORE) {
      bankedScore = effectiveScore;
      won = true;
      finalCurrentRun = 0;
      finalRunLength = 0;
    } else {
      lost = true;
    }
  }

  return {
    ...state,
    drawnIndex,
    currentRun: finalCurrentRun,
    runLength: finalRunLength,
    bankedScore,
    lastCard: card,
    movesUsed,
    won,
    lost,
  };
}

/** Free — locking in the current run doesn't cost a move. */
export function bank(state: OverdrawState): OverdrawState {
  if (state.won || state.lost) return state;
  if (state.runLength === 0) return state;

  const bankedScore = state.bankedScore + state.currentRun + streakBonus(state.runLength);
  const won = bankedScore >= TARGET_SCORE;
  return { ...state, bankedScore, currentRun: 0, runLength: 0, won };
}
