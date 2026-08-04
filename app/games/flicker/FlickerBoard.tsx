'use client';

import { useEffect, useRef, useState } from 'react';
import { createInitialState, tapCell, GRID_SIZE, type FlickerState } from '@/lib/games/flicker';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { GAMES } from '@/lib/games/registry';

export function FlickerBoard({
  seed,
  dateString,
  puzzleNumber,
}: {
  seed: number;
  dateString: string;
  puzzleNumber: number;
}) {
  const game = GAMES.find((g) => g.slug === 'flicker')!;
  const [state, setState] = useState<FlickerState>(() => createInitialState(seed));
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if ((state.won || state.lost) && !finishedRef.current) {
      finishedRef.current = true;
      recordResult('flicker', {
        date: dateString,
        won: state.won,
        moves: state.movesUsed,
        score: state.moveLimit,
        elapsedMs: 0,
      });
      setStreak(getStreak('flicker').current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.movesUsed, state.moveLimit, dateString]);

  const litCount = state.lights.filter(Boolean).length;

  return (
    <div>
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.movesUsed} movesLimit={state.moveLimit} />

      <p className="stat-line text-center text-ink/50 dark:text-white/40 mb-4">
        {litCount} light{litCount === 1 ? '' : 's'} still on {'\u2014'} tap to turn off all of them
      </p>

      <div
        className="grid gap-1.5 mx-auto mb-5"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, maxWidth: 280 }}
      >
        {state.lights.map((lit, i) => (
          <button
            key={i}
            onClick={() => setState((s) => tapCell(s, i))}
            disabled={state.won || state.lost}
            className="aspect-square rounded-md border-2 transition-colors"
            style={{
              background: lit ? '#D4A017' : '#EFE7DA',
              borderColor: lit ? '#8a6a10' : '#1B1D22',
            }}
          />
        ))}
      </div>

      <p className="stat-line text-center text-ink/40 dark:text-white/30">
        Tapping a tile flips it and every tile directly next to it (not diagonally). Every tap counts as a move.
      </p>

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug="flicker"
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
