'use client';

import { useEffect, useRef, useState } from 'react';
import { createInitialState, selectTile, type UntangleState } from '@/lib/games/untangle';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { GAMES } from '@/lib/games/registry';

export function UntangleBoard({
  seed,
  dateString,
  puzzleNumber,
}: {
  seed: number;
  dateString: string;
  puzzleNumber: number;
}) {
  const game = GAMES.find((g) => g.slug === 'untangle')!;
  const [state, setState] = useState<UntangleState>(() => createInitialState(seed));
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if ((state.won || state.lost) && !finishedRef.current) {
      finishedRef.current = true;
      recordResult('untangle', {
        date: dateString,
        won: state.won,
        moves: state.movesUsed,
        score: state.moveLimit,
        elapsedMs: 0,
      });
      setStreak(getStreak('untangle').current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.movesUsed, state.moveLimit, dateString]);

  return (
    <div>
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.movesUsed} movesLimit={state.moveLimit} />

      <p className="stat-line text-center text-ink/50 dark:text-white/40 mb-5">
        {state.target.length} letters, one word {'\u2014'} tap two tiles to swap them
      </p>

      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {state.letters.map((letter, i) => {
          const isSelected = state.selected === i;
          return (
            <button
              key={i}
              onClick={() => setState((s) => selectTile(s, i))}
              disabled={state.won || state.lost}
              className={[
                'w-11 h-11 rounded-md border-2 font-mono text-lg font-semibold flex items-center justify-center transition-colors',
                isSelected
                  ? 'border-untangle bg-untangle-soft dark:bg-untangle/20'
                  : 'border-graphite dark:border-white/70',
              ].join(' ')}
            >
              {letter}
            </button>
          );
        })}
      </div>

      {state.won && (
        <p className="stat-line text-center text-tether mb-4">
          {state.target} {'\u2014'} solved in {state.movesUsed} swap{state.movesUsed === 1 ? '' : 's'}
        </p>
      )}

      <p className="stat-line text-center text-ink/40 dark:text-white/30">
        Every tile belongs to exactly one hidden word. Swapping is the only move {'\u2014'} there&rsquo;s no dictionary
        check along the way, just the final result.
      </p>

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug="untangle"
        gameName={game.name}
        puzzleNumber={puzzleNumber}
        won={state.won}
        moves={state.movesUsed}
        movesLimit={state.moveLimit}
        score={state.moveLimit}
        streak={streak}
      />
    </div>
  );
}
