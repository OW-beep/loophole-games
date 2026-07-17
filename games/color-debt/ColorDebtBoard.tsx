'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createInitialState,
  trySwap,
  countBadTiles,
  GRID_SIZE,
  MOVES_LIMIT,
  TARGET_SCORE,
  DEBT_MATURITY,
  type ColorDebtState,
} from '@/lib/games/color-debt';
import { createRng } from '@/lib/daily-seed';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { GAMES } from '@/lib/games/registry';

export function ColorDebtBoard({ seed, dateString, puzzleNumber }: { seed: number; dateString: string; puzzleNumber: number }) {
  const game = GAMES.find((g) => g.slug === 'color-debt')!;
  const rngRef = useRef(createRng(seed + 31337));
  const [state, setState] = useState<ColorDebtState>(() => createInitialState(seed));
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);
  const badCount = countBadTiles(state.grid);

  function rcOf(i: number) {
    return { r: Math.floor(i / GRID_SIZE), c: i % GRID_SIZE };
  }
  function isAdjacent(a: number, b: number) {
    const ra = rcOf(a);
    const rb = rcOf(b);
    return Math.abs(ra.r - rb.r) + Math.abs(ra.c - rb.c) === 1;
  }

  function handleClick(i: number) {
    if (state.won || state.lost) return;
    const cell = state.grid[i];
    if (cell?.kind === 'bad') return;

    if (selected === null) {
      setSelected(i);
      return;
    }
    if (selected === i) {
      setSelected(null);
      return;
    }
    if (isAdjacent(selected, i)) {
      setState((prev) => trySwap(prev, selected, i, rngRef.current));
      setSelected(null);
    } else {
      setSelected(i);
    }
  }

  useEffect(() => {
    if ((state.won || state.lost) && !finishedRef.current) {
      finishedRef.current = true;
      recordResult('color-debt', {
        date: dateString,
        won: state.won,
        moves: state.movesUsed,
        score: state.score,
        elapsedMs: 0,
      });
      setStreak(getStreak('color-debt').current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.movesUsed, state.score, dateString]);

  return (
    <div>
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.movesUsed} movesLimit={MOVES_LIMIT} />

      <div className="stat-line flex justify-between text-ink/50 dark:text-white/40 mb-3">
        <span>
          Score: <span className="font-mono text-ink dark:text-white">{state.score}</span> / {TARGET_SCORE}
        </span>
        <span>
          Bad tiles: <span className="font-mono text-ink dark:text-white">{badCount}</span>
        </span>
      </div>

      <div
        className="grid gap-1 mb-5 bg-index/30 dark:bg-index-dark/30 p-1.5 border-2 border-graphite dark:border-white/80"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
      >
        {state.grid.map((cell, i) => {
          const isSelected = selected === i;
          return (
            <button
              key={i}
              onClick={() => handleClick(i)}
              disabled={cell?.kind === 'bad' || state.won || state.lost}
              aria-label={
                cell?.kind === 'normal' ? 'Color tile' : cell?.kind === 'debt' ? 'Debt tile' : 'Locked tile'
              }
              className={[
                'relative aspect-square flex items-center justify-center transition-transform',
                isSelected ? 'ring-4 ring-graphite dark:ring-white scale-90 z-10' : '',
              ].join(' ')}
              style={{
                backgroundColor:
                  cell?.kind === 'normal' ? cell.color : cell?.kind === 'debt' ? '#A9ADB4' : '#3A3E46',
              }}
            >
              {cell?.kind === 'debt' && (
                <span className="font-mono text-xs font-bold text-graphite">
                  {DEBT_MATURITY - cell.age}
                </span>
              )}
              {cell?.kind === 'bad' && <span className="text-white text-xs">🔒</span>}
            </button>
          );
        })}
      </div>

      <p className="stat-line text-ink/50 dark:text-white/40 text-center">
        Tap a tile, then tap a neighbor to swap. Gray numbers count down to lock.
      </p>

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug="color-debt"
        gameName="Color Debt"
        puzzleNumber={puzzleNumber}
        won={state.won}
        moves={state.movesUsed}
        movesLimit={MOVES_LIMIT}
        score={state.score}
        streak={streak}
      />
    </div>
  );
}
