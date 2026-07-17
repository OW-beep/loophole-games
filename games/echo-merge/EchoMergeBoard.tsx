'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  applyMove,
  createInitialState,
  GRID_SIZE,
  TARGET_VALUE,
  MOVES_LIMIT,
  type Direction,
  type EchoMergeState,
} from '@/lib/games/echo-merge';
import { createRng } from '@/lib/daily-seed';
import { recordResult } from '@/lib/storage';
import { getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { GAMES } from '@/lib/games/registry';

const VALUE_STYLES: Record<number, string> = {
  2: 'bg-echo-soft text-echo dark:bg-echo/15 dark:text-echo',
  4: 'bg-echo/30 text-graphite dark:bg-echo/30 dark:text-white',
  8: 'bg-echo/50 text-white',
  16: 'bg-echo/70 text-white',
  32: 'bg-echo text-white',
  64: 'bg-violet-700 text-white',
  128: 'bg-violet-900 text-white',
};

const ARROWS: { dir: Direction; label: string; key: string }[] = [
  { dir: 'up', label: '↑', key: 'ArrowUp' },
  { dir: 'left', label: '←', key: 'ArrowLeft' },
  { dir: 'down', label: '↓', key: 'ArrowDown' },
  { dir: 'right', label: '→', key: 'ArrowRight' },
];

export function EchoMergeBoard({ seed, dateString, puzzleNumber }: { seed: number; dateString: string; puzzleNumber: number }) {
  const game = GAMES.find((g) => g.slug === 'echo-merge')!;
  const rngRef = useRef(createRng(seed + 99991)); // separate stream from layout rng, deterministic per day
  const [state, setState] = useState<EchoMergeState>(() => createInitialState(seed));
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);

  const echoTrackIdx = useMemo(() => {
    if (!state.pendingEcho) return -1;
    return state.board.findIndex((t) => t?.id === state.pendingEcho!.trackId);
  }, [state]);

  function move(dir: Direction) {
    if (selected === null || state.won || state.lost) return;
    setState((prev) => applyMove(prev, selected, dir, rngRef.current));
    setSelected(null);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const found = ARROWS.find((a) => a.key === e.key);
      if (found) {
        e.preventDefault();
        move(found.dir);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  useEffect(() => {
    if ((state.won || state.lost) && !finishedRef.current) {
      finishedRef.current = true;
      recordResult('echo-merge', {
        date: dateString,
        won: state.won,
        moves: state.movesUsed,
        score: state.score,
        elapsedMs: 0,
      });
      setStreak(getStreak('echo-merge').current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.movesUsed, state.score, dateString]);

  return (
    <div>
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.movesUsed} movesLimit={MOVES_LIMIT} />

      <div className="stat-line flex justify-between text-ink/50 dark:text-white/40 mb-3">
        <span>Score: <span className="font-mono text-ink dark:text-white">{state.score}</span></span>
        <span>Target: <span className="font-mono text-ink dark:text-white">{TARGET_VALUE}</span></span>
      </div>

      <div
        className="grid gap-1.5 mb-5 bg-index/30 dark:bg-index-dark/30 p-1.5 border-2 border-graphite dark:border-white/80"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
      >
        {state.board.map((tile, idx) => {
          const isSelected = selected === idx;
          const isEcho = echoTrackIdx === idx;
          return (
            <button
              key={idx}
              onClick={() => tile && setSelected(isSelected ? null : idx)}
              disabled={!tile || state.won || state.lost}
              aria-label={tile ? `Tile ${tile.value}` : 'Empty cell'}
              className={[
                'relative aspect-square flex items-center justify-center font-mono font-bold text-sm sm:text-base transition-transform',
                tile ? (VALUE_STYLES[tile.value] ?? 'bg-violet-950 text-white') : 'bg-panel dark:bg-panel-dark',
                isSelected ? 'ring-4 ring-graphite dark:ring-white scale-95' : '',
              ].join(' ')}
            >
              {tile?.value}
              {isEcho && (
                <span className="absolute top-0.5 right-0.5 text-[10px] leading-none">🔁</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-2">
        <p className="stat-line text-ink/50 dark:text-white/40">
          {selected === null ? 'Tap a tile, then pick a direction' : 'Slide it →'}
        </p>
        <div className="grid grid-cols-3 gap-2 w-40">
          <div />
          <ArrowButton arrow={ARROWS[0]} onPress={move} disabled={selected === null} />
          <div />
          <ArrowButton arrow={ARROWS[1]} onPress={move} disabled={selected === null} />
          <div />
          <ArrowButton arrow={ARROWS[3]} onPress={move} disabled={selected === null} />
          <div />
          <ArrowButton arrow={ARROWS[2]} onPress={move} disabled={selected === null} />
          <div />
        </div>
      </div>

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug="echo-merge"
        gameName="Echo Merge"
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

function ArrowButton({ arrow, onPress, disabled }: { arrow: { dir: Direction; label: string }; onPress: (d: Direction) => void; disabled: boolean }) {
  return (
    <button
      onClick={() => onPress(arrow.dir)}
      disabled={disabled}
      className="aspect-square border-2 border-graphite dark:border-white/80 font-display font-bold text-lg disabled:opacity-30 hover:bg-graphite hover:text-paper dark:hover:bg-white dark:hover:text-graphite transition-colors"
    >
      {arrow.label}
    </button>
  );
}
