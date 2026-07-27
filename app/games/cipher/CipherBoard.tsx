'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createInitialState,
  selectCipherLetter,
  assignLetter,
  clearLetter,
  reconstruct,
  type CipherState,
} from '@/lib/games/cipher';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { GAMES } from '@/lib/games/registry';

const AZ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function CipherBoard({
  seed,
  dateString,
  puzzleNumber,
}: {
  seed: number;
  dateString: string;
  puzzleNumber: number;
}) {
  const game = GAMES.find((g) => g.slug === 'cipher')!;
  const [state, setState] = useState<CipherState>(() => createInitialState(seed));
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if ((state.won || state.lost) && !finishedRef.current) {
      finishedRef.current = true;
      recordResult('cipher', {
        date: dateString,
        won: state.won,
        moves: state.movesUsed,
        score: state.distinctLetters.length,
        elapsedMs: 0,
      });
      setStreak(getStreak('cipher').current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.movesUsed, state.distinctLetters.length, dateString]);

  const usedPlainLetters = new Set(state.guesses.values());
  const reconstructed = reconstruct(state);

  function handleTileTap(cipherChar: string) {
    if (state.guesses.has(cipherChar)) {
      setState((s) => clearLetter(s, cipherChar));
    } else {
      setState((s) => selectCipherLetter(s, cipherChar));
    }
  }

  return (
    <div>
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.movesUsed} movesLimit={state.moveLimit} />

      <p className="stat-line text-ink/50 dark:text-white/40 mb-4">
        {state.distinctLetters.length} letters to crack {'\u00b7'} tap a tile, then pick its real letter
      </p>

      <div className="flex flex-wrap gap-x-1.5 gap-y-4 mb-6 justify-center">
        {state.ciphertext.split('').map((ch, i) => {
          if (ch === ' ') return <div key={i} className="w-3" />;
          if (!/[A-Z]/.test(ch)) {
            return (
              <span key={i} className="font-mono text-lg self-end pb-1">
                {ch}
              </span>
            );
          }
          const guessed = state.guesses.get(ch);
          const isSelected = state.selectedCipherLetter === ch;
          return (
            <button
              key={i}
              onClick={() => handleTileTap(ch)}
              disabled={state.won || state.lost}
              className={[
                'w-7 flex flex-col items-center border-b-2 pb-0.5',
                isSelected ? 'border-cipher' : 'border-graphite/40 dark:border-white/30',
              ].join(' ')}
            >
              <span className="font-mono text-lg font-semibold h-6">{guessed ?? '\u00a0'}</span>
              <span className="font-mono text-[10px] text-ink/40 dark:text-white/30">{ch}</span>
            </button>
          );
        })}
      </div>

      {state.won && (
        <p className="stat-line text-center text-tether mb-4">Solved {'\u2014'} {reconstructed}</p>
      )}

      <p className="stat-line text-ink/40 dark:text-white/30 mb-2 text-center">
        {state.selectedCipherLetter ? `Assign a letter to "${state.selectedCipherLetter}"` : 'Tap a tile above first'}
      </p>
      <div className="grid grid-cols-9 gap-1 max-w-md mx-auto mb-5">
        {AZ.map((letter) => {
          const usedElsewhere =
            usedPlainLetters.has(letter) &&
            !(state.selectedCipherLetter && state.guesses.get(state.selectedCipherLetter) === letter);
          return (
            <button
              key={letter}
              onClick={() => setState((s) => assignLetter(s, letter))}
              disabled={!state.selectedCipherLetter || state.won || state.lost}
              className={[
                'aspect-square rounded font-mono text-xs font-semibold border-2 disabled:opacity-30',
                usedElsewhere
                  ? 'border-cipher/50 text-cipher'
                  : 'border-graphite dark:border-white/70',
              ].join(' ')}
            >
              {letter}
            </button>
          );
        })}
      </div>

      <p className="stat-line text-center text-ink/40 dark:text-white/30">
        Each cipher letter always stands for the same real letter throughout the phrase.
      </p>

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug="cipher"
        gameName={game.name}
        puzzleNumber={puzzleNumber}
        won={state.won}
        moves={state.movesUsed}
        movesLimit={state.moveLimit}
        score={state.distinctLetters.length}
        streak={streak}
      />
    </div>
  );
}
