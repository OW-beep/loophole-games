'use client';

import { useEffect, useRef, useState } from 'react';
import { createInitialState, pickColor, GRID_SIZE, COLOR_COUNT, PALETTE, type BloomState } from '@/lib/games/bloom';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { GAMES } from '@/lib/games/registry';

export function BloomBoard({
  seed,
  dateString,
  puzzleNumber,
}: {
  seed: number;
  dateString: string;
  puzzleNumber: number;
}) {
  const game = GAMES.find((g) => g.slug === 'bloom')!;
  const [state, setState] = useState<BloomState>(() => createInitialState(seed));
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if ((state.won || state.lost) && !finishedRef.current) {
      finishedRef.current = true;
      recordResult('bloom', {
        date: dateString,
        won: state.won,
        moves: state.movesUsed,
        score: state.moveLimit,
        elapsedMs: 0,
      });
      setStreak(getStreak('bloom').current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.movesUsed, state.moveLimit, dateString]);

  const coveredCount = state.territory.size;
  const totalCount = state.colors.length;

  return (
    <div>
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.movesUsed} movesLimit={state.moveLimit} />

      <p className="stat-line text-center text-ink/50 dark:text-white/40 mb-4">
        {coveredCount} / {totalCount} covered {'\u2014'} pick a color to grow your territory
      </p>

      <div
        className="grid gap-0.5 mx-auto mb-5 rounded-lg overflow-hidden border-2 border-graphite dark:border-white/70"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, maxWidth: 320 }}
      >
        {state.colors.map((colorIndex, i) => {
          const isTerritory = state.territory.has(i);
          const displayColor = isTerritory ? PALETTE[state.territoryColor] : PALETTE[colorIndex];
          return <div key={i} className="aspect-square" style={{ background: displayColor }} />;
        })}
      </div>

      <div className="flex justify-center gap-3 mb-5">
        {Array.from({ length: COLOR_COUNT }).map((_, c) => (
          <button
            key={c}
            onClick={() => setState((s) => pickColor(s, c))}
            disabled={state.won || state.lost || c === state.territoryColor}
            className="w-10 h-10 rounded-full border-2 disabled:opacity-25 transition-transform active:scale-90"
            style={{
              background: PALETTE[c],
              borderColor: c === state.territoryColor ? '#1B1D22' : 'transparent',
            }}
          />
        ))}
      </div>

      <p className="stat-line text-center text-ink/40 dark:text-white/30">
        Picking a color turns your whole territory that color, then absorbs any touching tiles that were already
        that color {'\u2014'} including chains of them.
      </p>

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug="bloom"
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
