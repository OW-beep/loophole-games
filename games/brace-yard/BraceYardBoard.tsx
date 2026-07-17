'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createInitialState,
  shipCrate,
  isShippable,
  GRID_SIZE,
  SHIP_BUDGET,
  type BraceYardState,
} from '@/lib/games/brace-yard';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { GAMES } from '@/lib/games/registry';

export function BraceYardBoard({ seed, dateString, puzzleNumber }: { seed: number; dateString: string; puzzleNumber: number }) {
  const game = GAMES.find((g) => g.slug === 'brace-yard')!;
  const [state, setState] = useState<BraceYardState>(() => createInitialState(seed));
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);

  function handleTap(i: number) {
    if (state.won || state.lost) return;
    setState((prev) => shipCrate(prev, i));
  }

  useEffect(() => {
    if ((state.won || state.lost) && !finishedRef.current) {
      finishedRef.current = true;
      recordResult('brace-yard', {
        date: dateString,
        won: state.won,
        moves: state.shipped,
        score: state.score,
        elapsedMs: 0,
      });
      setStreak(getStreak('brace-yard').current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.shipped, state.score, dateString]);

  return (
    <div>
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.shipped} movesLimit={SHIP_BUDGET} />

      <div className="stat-line flex justify-between text-ink/50 dark:text-white/40 mb-3">
        <span>
          Score: <span className="font-mono text-lg text-ink dark:text-white">{state.score}</span> / {state.target}
        </span>
        <span>
          Shipments left: <span className="font-mono text-ink dark:text-white">{SHIP_BUDGET - state.shipped}</span>
        </span>
      </div>

      <div
        className="grid gap-1 mb-5 bg-index/30 dark:bg-index-dark/30 p-1.5 border-2 border-graphite dark:border-white/80"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
      >
        {state.weights.map((weight, i) => {
          if (weight === null) {
            return <div key={i} className="aspect-square bg-panel dark:bg-panel-dark" />;
          }
          const shippable = isShippable(state.weights, i);
          return (
            <button
              key={i}
              onClick={() => handleTap(i)}
              disabled={!shippable || state.won || state.lost}
              aria-label={`Crate weight ${weight}${shippable ? ', shippable' : ', not shippable yet'}`}
              className={[
                'aspect-square flex items-center justify-center font-mono font-bold text-sm sm:text-base border-2 transition-opacity',
                shippable
                  ? 'bg-brace-soft text-graphite dark:bg-brace/25 dark:text-white border-brace cursor-pointer hover:bg-brace hover:text-white'
                  : 'bg-panel dark:bg-panel-dark text-ink/30 dark:text-white/25 border-index dark:border-index-dark opacity-60',
              ].join(' ')}
            >
              {weight}
            </button>
          );
        })}
      </div>

      <p className="stat-line text-ink/50 dark:text-white/40 text-center">
        Highlighted crates are shippable right now. Tap one to ship it.
      </p>

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug="brace-yard"
        gameName="Brace Yard"
        puzzleNumber={puzzleNumber}
        won={state.won}
        moves={state.shipped}
        movesLimit={SHIP_BUDGET}
        score={state.score}
        streak={streak}
      />
    </div>
  );
}
