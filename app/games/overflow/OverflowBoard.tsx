'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createInitialState, tapCell,
  GRID_SIZE, TAP_BUDGET, type OverflowState,
} from '@/lib/games/overflow';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { GAMES } from '@/lib/games/registry';

export function OverflowBoard({ seed, dateString, puzzleNumber }: { seed: number; dateString: string; puzzleNumber: number }) {
  const game = GAMES.find(g => g.slug === 'overflow')!;
  const [state, setState] = useState<OverflowState>(() => createInitialState(seed));
  const [toast, setToast] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);

  function handleTap(i: number) {
    if (state.won || state.lost) return;
    setState(prev => {
      const next = tapCell(prev, i);
      if (next.lastChainSize >= 3) setToast(`Chain ×${next.lastChainSize}!`);
      return next;
    });
  }

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1200);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if ((state.won || state.lost) && !finishedRef.current) {
      finishedRef.current = true;
      recordResult('overflow', { date: dateString, won: state.won, moves: state.tapsUsed, score: state.score, elapsedMs: 0 });
      setStreak(getStreak('overflow').current);
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
      <div className="relative">
        <div
          className="grid gap-1 mb-5 bg-index/30 dark:bg-index-dark/30 p-1.5 border-2 border-graphite dark:border-white/80"
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
        >
          {state.cells.map((cell, i) => {
            if (!cell) return <div key={i} className="aspect-square bg-panel dark:bg-panel-dark" />;
            const pct = cell.level / cell.capacity;
            const isAlmost = cell.level === cell.capacity - 1;
            return (
              <button
                key={i}
                onClick={() => handleTap(i)}
                disabled={state.won || state.lost}
                className={[
                  'aspect-square flex flex-col items-center justify-center font-mono border-2 transition-colors',
                  isAlmost
                    ? 'bg-overflow text-white border-graphite dark:border-white/80 animate-pulse'
                    : 'bg-overflow-soft text-graphite dark:bg-overflow/20 dark:text-white border-index dark:border-index-dark',
                ].join(' ')}
              >
                <span className="text-xs font-bold leading-none">{cell.level}</span>
                <span className="text-[9px] opacity-60">/{cell.capacity}</span>
              </button>
            );
          })}
        </div>
        {toast && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-overflow text-white stat-line px-3 py-1.5 animate-punch-pop">
            {toast}
          </div>
        )}
      </div>
      <p className="stat-line text-ink/50 dark:text-white/40 text-center">
        Tap a cell to add a drop. Pulsing cells are about to overflow.
      </p>
      <ResultModal
        open={showResult} onClose={() => setShowResult(false)}
        gameSlug="overflow" gameName="Overflow"
        puzzleNumber={puzzleNumber} won={state.won}
        moves={state.tapsUsed} movesLimit={TAP_BUDGET}
        score={state.score} streak={streak}
      />
    </div>
  );
}
