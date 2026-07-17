'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createInitialState, tapCell, canTap,
  GRID_SIZE, TAP_BUDGET, type HeatmapState,
} from '@/lib/games/heatmap';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { GAMES } from '@/lib/games/registry';

const TOTAL = GRID_SIZE * GRID_SIZE;

export function HeatmapBoard({ seed, dateString, puzzleNumber }: { seed: number; dateString: string; puzzleNumber: number }) {
  const game = GAMES.find(g => g.slug === 'heatmap')!;
  const [state, setState] = useState<HeatmapState>(() => createInitialState(seed));
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);

  function handleTap(i: number) {
    if (state.won || state.lost) return;
    setState(prev => tapCell(prev, i));
  }

  useEffect(() => {
    if ((state.won || state.lost) && !finishedRef.current) {
      finishedRef.current = true;
      recordResult('heatmap', {
        date: dateString,
        won: state.won,
        moves: state.tapsUsed,
        score: state.score,
        elapsedMs: 0,
      });
      setStreak(getStreak('heatmap').current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.tapsUsed, state.score, dateString]);

  return (
    <div>
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.tapsUsed} movesLimit={TAP_BUDGET} />

      <div className="stat-line flex justify-between text-ink/50 dark:text-white/40 mb-3">
        <span>Score: <span className="font-mono text-lg text-ink dark:text-white">{state.score}</span> / {state.target}</span>
        <span>Taps left: <span className="font-mono text-ink dark:text-white">{TAP_BUDGET - state.tapsUsed}</span></span>
      </div>

      <div
        className="grid gap-1 mb-5 bg-index/30 dark:bg-index-dark/30 p-1.5 border-2 border-graphite dark:border-white/80"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
      >
        {state.values.map((value, i) => {
          const isTapped = state.tapped[i];
          const isReady = !isTapped && canTap(state.values, state.tapped, i);
          const heat = value / 9; // 0-1 for color intensity
          return (
            <button
              key={i}
              onClick={() => handleTap(i)}
              disabled={!isReady || state.won || state.lost}
              aria-label={isTapped ? 'Tapped' : `Value ${value}${isReady ? ', ready' : ', not ready yet'}`}
              className={[
                'aspect-square flex items-center justify-center font-mono font-bold text-base border-2 transition-all',
                isTapped
                  ? 'bg-index/40 dark:bg-index-dark/40 text-ink/30 dark:text-white/20 border-transparent'
                  : isReady
                  ? 'border-heat cursor-pointer scale-95'
                  : 'border-index dark:border-index-dark opacity-70',
              ].join(' ')}
              style={
                !isTapped
                  ? {
                      backgroundColor: `hsl(${30 - heat * 30}, ${60 + heat * 40}%, ${isReady ? 50 : 75}%)`,
                      color: heat > 0.5 ? 'white' : '#1B1D22',
                    }
                  : undefined
              }
            >
              {isTapped ? '' : value}
            </button>
          );
        })}
      </div>

      <p className="stat-line text-ink/50 dark:text-white/40 text-center">
        Tap a cell to score its value — but only when its active neighbors support it.
      </p>

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug="heatmap"
        gameName="Heatmap"
        puzzleNumber={puzzleNumber}
        won={state.won}
        moves={state.tapsUsed}
        movesLimit={TAP_BUDGET}
        score={state.score}
        streak={streak}
      />
    </div>
  );
}
