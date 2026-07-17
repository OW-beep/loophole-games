'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createInitialState,
  setGravity,
  GRID_SIZE,
  FLIPS_LIMIT,
  TARGET_SCORE,
  type GravityDir,
  type GravityWordState,
} from '@/lib/games/gravity-word';
import { createRng } from '@/lib/daily-seed';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { GAMES } from '@/lib/games/registry';

const ARROWS: { dir: GravityDir; label: string; key: string }[] = [
  { dir: 'up', label: '↑', key: 'ArrowUp' },
  { dir: 'left', label: '←', key: 'ArrowLeft' },
  { dir: 'down', label: '↓', key: 'ArrowDown' },
  { dir: 'right', label: '→', key: 'ArrowRight' },
];

export function GravityWordBoard({ seed, dateString, puzzleNumber }: { seed: number; dateString: string; puzzleNumber: number }) {
  const game = GAMES.find((g) => g.slug === 'gravity-word')!;
  const rngRef = useRef(createRng(seed + 7777));
  const [state, setState] = useState<GravityWordState>(() => createInitialState(seed));
  const [showResult, setShowResult] = useState(false);
  const [toast, setToast] = useState<string[]>([]);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);

  function flip(dir: GravityDir) {
    if (state.won || state.lost) return;
    setState((prev) => {
      const next = setGravity(prev, dir, rngRef.current);
      if (next.lastWords.length > 0) setToast(next.lastWords);
      return next;
    });
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const found = ARROWS.find((a) => a.key === e.key);
      if (found) {
        e.preventDefault();
        flip(found.dir);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  useEffect(() => {
    if (toast.length === 0) return;
    const t = setTimeout(() => setToast([]), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if ((state.won || state.lost) && !finishedRef.current) {
      finishedRef.current = true;
      recordResult('gravity-word', {
        date: dateString,
        won: state.won,
        moves: state.flipsUsed,
        score: state.score,
        elapsedMs: 0,
      });
      setStreak(getStreak('gravity-word').current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.flipsUsed, state.score, dateString]);

  return (
    <div>
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.flipsUsed} movesLimit={FLIPS_LIMIT} />

      <div className="stat-line flex justify-between text-ink/50 dark:text-white/40 mb-3">
        <span>
          Score: <span className="font-mono text-ink dark:text-white">{state.score}</span> / {TARGET_SCORE}
        </span>
        <span>Flips left: <span className="font-mono text-ink dark:text-white">{FLIPS_LIMIT - state.flipsUsed}</span></span>
      </div>

      <div className="relative">
        <div
          className="grid gap-1 mb-5 bg-index/30 dark:bg-index-dark/30 p-1.5 border-2 border-graphite dark:border-white/80"
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
        >
          {state.grid.map((letter, i) => (
            <div
              key={i}
              className={[
                'aspect-square flex items-center justify-center font-mono font-bold text-base sm:text-lg',
                letter ? 'bg-gravity-soft text-graphite dark:bg-gravity/20 dark:text-white' : 'bg-panel dark:bg-panel-dark',
              ].join(' ')}
            >
              {letter}
            </div>
          ))}
        </div>

        {toast.length > 0 && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-graphite text-paper dark:bg-white dark:text-graphite stat-line px-3 py-1.5 animate-punch-pop">
            +{toast.join(', ')}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-2">
        <p className="stat-line text-ink/50 dark:text-white/40">Set gravity direction</p>
        <div className="grid grid-cols-3 gap-2 w-40">
          <div />
          <ArrowButton arrow={ARROWS[0]} onPress={flip} />
          <div />
          <ArrowButton arrow={ARROWS[1]} onPress={flip} />
          <div />
          <ArrowButton arrow={ARROWS[3]} onPress={flip} />
          <div />
          <ArrowButton arrow={ARROWS[2]} onPress={flip} />
          <div />
        </div>
      </div>

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug="gravity-word"
        gameName="Gravity Word"
        puzzleNumber={puzzleNumber}
        won={state.won}
        moves={state.flipsUsed}
        movesLimit={FLIPS_LIMIT}
        score={state.score}
        streak={streak}
      />
    </div>
  );
}

function ArrowButton({ arrow, onPress }: { arrow: { dir: GravityDir; label: string }; onPress: (d: GravityDir) => void }) {
  return (
    <button
      onClick={() => onPress(arrow.dir)}
      className="aspect-square border-2 border-graphite dark:border-white/80 font-display font-bold text-lg hover:bg-graphite hover:text-paper dark:hover:bg-white dark:hover:text-graphite transition-colors"
    >
      {arrow.label}
    </button>
  );
}
