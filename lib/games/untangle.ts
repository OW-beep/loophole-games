import { createRng, randInt } from '../daily-seed';

// All common English words — no copyright concern, just a curated bank for
// good daily variety (lengths 6-8 keep the tile row easy to scan).
const WORDS: string[] = [
  'GARDEN', 'WINDOW', 'GALAXY', 'MELODY', 'PLANET', 'CASTLE', 'FOREST', 'ISLAND', 'SILVER', 'BRIDGE',
  'HARBOR', 'CRYSTAL', 'THUNDER', 'COMPASS', 'MYSTERY', 'JOURNEY', 'FESTIVAL', 'CHIMNEY', 'BALANCE', 'FREEDOM',
  'SILENCE', 'TEXTURE', 'HORIZON', 'DOLPHIN', 'PENGUIN', 'VOLCANO', 'KITCHEN', 'ORCHARD', 'VOYAGE', 'WHISPER',
  'LANTERN', 'MUSEUM', 'CANDLE', 'MOUNTAIN', 'SANDWICH', 'TRIANGLE', 'UMBRELLA', 'CALENDAR', 'ELEPHANT', 'PARADISE',
];

export const MOVE_SLACK = 4;

export interface UntangleState {
  target: string; // the solved word
  letters: string[]; // current arrangement
  permutation: number[]; // permutation[i] = which target index this tile originally came from
  moveLimit: number;
  movesUsed: number;
  selected: number | null;
  won: boolean;
  lost: boolean;
}

/** Minimum number of transpositions needed to sort a permutation:
 * n minus the number of cycles. */
function minSwapsForPermutation(perm: number[]): number {
  const n = perm.length;
  const visited = new Array(n).fill(false);
  let cycles = 0;
  for (let i = 0; i < n; i++) {
    if (visited[i]) continue;
    cycles++;
    let j = i;
    while (!visited[j]) {
      visited[j] = true;
      j = perm[j];
    }
  }
  return n - cycles;
}

export function createInitialState(seed: number): UntangleState {
  const rng = createRng(seed);
  const target = WORDS[randInt(rng, 0, WORDS.length - 1)];
  const n = target.length;

  let permutation: number[];
  let letters: string[];
  let attempts = 0;
  do {
    permutation = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) {
      const j = randInt(rng, 0, i);
      [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
    }
    letters = permutation.map((sourceIdx) => target[sourceIdx]);
    attempts++;
  } while (letters.join('') === target && attempts < 20);

  const optimalSwaps = minSwapsForPermutation(permutation);

  return {
    target,
    letters,
    permutation,
    moveLimit: Math.max(optimalSwaps, 1) + MOVE_SLACK,
    movesUsed: 0,
    selected: null,
    won: false,
    lost: false,
  };
}

export function selectTile(state: UntangleState, index: number): UntangleState {
  if (state.won || state.lost) return state;
  if (state.selected === index) return { ...state, selected: null };
  if (state.selected === null) return { ...state, selected: index };

  // Two tiles selected — swap them.
  const letters = [...state.letters];
  const permutation = [...state.permutation];
  [letters[state.selected], letters[index]] = [letters[index], letters[state.selected]];
  [permutation[state.selected], permutation[index]] = [permutation[index], permutation[state.selected]];

  const movesUsed = state.movesUsed + 1;
  const won = letters.join('') === state.target;
  const lost = !won && movesUsed >= state.moveLimit;

  return { ...state, letters, permutation, movesUsed, selected: null, won, lost };
}
