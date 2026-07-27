import { createRng, randInt, seededShuffle } from '../daily-seed';

// All original — written for this game, not quoted from any external source.
const PHRASES: string[] = [
  'A GOOD PUZZLE NEVER FEELS LIKE WORK',
  'PATIENCE SOLVES WHAT SPEED CANNOT',
  'EVERY CIPHER HIDES A SIMPLE IDEA',
  'SMALL CLUES ADD UP TO BIG ANSWERS',
  'THE OBVIOUS MOVE IS NOT ALWAYS THE BEST ONE',
  'CURIOSITY IS A RENEWABLE RESOURCE',
  'START WHERE YOU ARE CERTAIN NOT WHERE YOU ARE CLEVER',
  'A STREAK IS JUST A HABIT WITH A SCOREBOARD',
  'LOGIC IS PATIENCE WEARING A DISGUISE',
  'THE BEST HINT IS THE ONE YOU FIGURE OUT YOURSELF',
  'A BLANK GRID IS FULL OF QUIET INFORMATION',
  'GUESSING IS FINE AS LONG AS YOU LEARN FROM IT',
  'SHORT WORDS OFTEN HOLD THE BIGGEST CLUES',
  'DOUBLE LETTERS ARE RARELY AN ACCIDENT',
  'THE LETTER E IS HIDING IN PLAIN SIGHT',
  'A WRONG GUESS IS JUST A QUESTION ANSWERED',
  'EVERY LOCK REMEMBERS ITS OWN KEY',
  'PROGRESS HIDES INSIDE REPETITION',
  'NOTICE WHAT REPEATS BEFORE YOU GUESS WHAT IT MEANS',
  'A PUZZLE IS A CONVERSATION WITH NO WORDS YET',
  'SLOW DOWN WHEN THE ANSWER FEELS TOO EASY',
  'THE FIRST IDEA IS RARELY THE ONLY ONE',
  'CONFIDENCE GROWS ONE CORRECT LETTER AT A TIME',
  'A CODE IS A SENTENCE WEARING A MASK',
  'PATTERNS APPEAR TO THOSE WHO LOOK TWICE',
  'THE SHORTEST WORD IN A SENTENCE IS RARELY RANDOM',
  'EVERY PUZZLE REWARDS A SECOND LOOK',
  'SOLVING SOMETHING SLOWLY STILL COUNTS AS SOLVING IT',
  'A HABIT IS EASIEST TO KEEP RIGHT AFTER YOU START IT',
  'THE QUIETEST CLUE IS OFTEN THE MOST HONEST ONE',
  'REPETITION IS A CIPHER FOR PATTERNS',
  'EVERY DAY HIDES A DIFFERENT SENTENCE',
  'A GOOD GUESS NARROWS THE WORLD JUST A LITTLE',
  'THINK IN LETTERS BEFORE YOU THINK IN WORDS',
  'THE ALPHABET IS A SMALL PUZZLE ON ITS OWN',
  'NOT EVERY MYSTERY NEEDS TO BE SOLVED QUICKLY',
  'A STEADY MIND SOLVES MORE THAN A FAST ONE',
  'ONE CORRECT LETTER OFTEN UNLOCKS THREE MORE',
  'PUZZLES REWARD ATTENTION MORE THAN SPEED',
  'THE ANSWER WAS ALWAYS HERE WEARING A DISGUISE',
];

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
export const HINT_BUDGET_SLACK = 15;

export interface CipherState {
  plaintext: string; // the true phrase, uppercase
  ciphertext: string; // phrase with letters substituted
  cipherToPlain: Map<string, string>; // the true key, for win-checking
  guesses: Map<string, string>; // player's current cipherLetter -> guessedPlainLetter
  selectedCipherLetter: string | null;
  distinctLetters: string[]; // distinct cipher letters actually present in the puzzle
  movesUsed: number;
  moveLimit: number;
  won: boolean;
  lost: boolean;
}

export function createInitialState(seed: number): CipherState {
  const rng = createRng(seed);
  const plaintext = PHRASES[randInt(rng, 0, PHRASES.length - 1)];

  const shuffledAlphabet = seededShuffle(ALPHABET, rng);
  const cipherToPlain = new Map<string, string>();
  const plainToCipher = new Map<string, string>();
  ALPHABET.forEach((plain, i) => {
    const cipher = shuffledAlphabet[i];
    cipherToPlain.set(cipher, plain);
    plainToCipher.set(plain, cipher);
  });

  let ciphertext = '';
  const distinctSet = new Set<string>();
  for (const ch of plaintext) {
    if (/[A-Z]/.test(ch)) {
      const cipherChar = plainToCipher.get(ch)!;
      ciphertext += cipherChar;
      distinctSet.add(cipherChar);
    } else {
      ciphertext += ch;
    }
  }

  const distinctLetters = Array.from(distinctSet).sort();

  return {
    plaintext,
    ciphertext,
    cipherToPlain,
    guesses: new Map(),
    selectedCipherLetter: null,
    distinctLetters,
    movesUsed: 0,
    moveLimit: distinctLetters.length + HINT_BUDGET_SLACK,
    won: false,
    lost: false,
  };
}

function reconstruct(state: CipherState): string {
  let out = '';
  for (const ch of state.ciphertext) {
    if (/[A-Z]/.test(ch)) {
      out += state.guesses.get(ch) ?? '_';
    } else {
      out += ch;
    }
  }
  return out;
}

function checkWin(state: CipherState): boolean {
  return reconstruct(state) === state.plaintext;
}

export function selectCipherLetter(state: CipherState, cipherLetter: string): CipherState {
  if (state.won || state.lost) return state;
  if (!state.distinctLetters.includes(cipherLetter)) return state;
  return { ...state, selectedCipherLetter: cipherLetter };
}

/** Assigns a plaintext letter guess to the currently-selected cipher letter.
 * If that plaintext letter is already used elsewhere, it's cleared there first
 * (a substitution cipher is a one-to-one mapping). */
export function assignLetter(state: CipherState, plainLetter: string): CipherState {
  if (state.won || state.lost) return state;
  if (!state.selectedCipherLetter) return state;
  if (state.movesUsed >= state.moveLimit) return state;

  const guesses = new Map(state.guesses);
  for (const [c, p] of guesses.entries()) {
    if (p === plainLetter && c !== state.selectedCipherLetter) guesses.delete(c);
  }
  guesses.set(state.selectedCipherLetter, plainLetter);

  const movesUsed = state.movesUsed + 1;
  const next: CipherState = { ...state, guesses, movesUsed, selectedCipherLetter: null };
  next.won = checkWin(next);
  next.lost = !next.won && movesUsed >= state.moveLimit;
  return next;
}

export function clearLetter(state: CipherState, cipherLetter: string): CipherState {
  if (state.won || state.lost) return state;
  if (!state.guesses.has(cipherLetter)) return state;
  const guesses = new Map(state.guesses);
  guesses.delete(cipherLetter);
  return { ...state, guesses, selectedCipherLetter: cipherLetter };
}

export { reconstruct, checkWin };
