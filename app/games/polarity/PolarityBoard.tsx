'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createInitialState, applySlide, getMagnetAt,
  GRID_SIZE, SLIDE_BUDGET, type PolarityState,
} from '@/lib/games/polarity';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { GAMES } from '@/lib/games/registry';

const DIRS: { label: string; dr: number; dc: number; key: string }[] = [
  { label: '↑', dr: -1, dc: 0, key: 'ArrowUp' },
  { label: '←', dr: 0, dc: -1, key: 'ArrowLeft' },
  { label: '↓', dr: 1, dc: 0, key: 'ArrowDown' },
  { label: '→', dr: 0, dc: 1, key: 'ArrowRight' },
];

export function PolarityBoard({ seed, dateString, puzzleNumber }: { seed: number; dateString: string; puzzleNumber: number }) {
  const game = GAMES.find(g => g.slug === 'polarity')!;
  const [state, setState] = useState<PolarityState>(() => createInitialState(seed));
  const [selected, setSelected] = useState<number | null>(null); // magnet index
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);

  function handleCellTap(cellIdx: number) {
    if (state.won || state.lost) return;
    const mag = getMagnetAt(state.positions, cellIdx);
    if (mag === null) { setSelected(null); return; }
    setSelected(selected === mag ? null : mag);
  }

  function handleDir(dr: number, dc: number) {
    if (selected === null || state.won || state.lost) return;
    setState(prev => applySlide(prev, selected, dr, dc));
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const d = DIRS.find(d => d.key === e.key);
      if (d) { e.preventDefault(); handleDir(d.dr, d.dc); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  useEffect(() => {
    if ((state.won || state.lost) && !finishedRef.current) {
      finishedRef.current = true;
      recordResult('polarity', { date: dateString, won: state.won, moves: state.slidesUsed, score: 0, elapsedMs: 0 });
      setStreak(getStreak('polarity').current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.slidesUsed, dateString]);

  const HALF = GRID_SIZE / 2;

  return (
    <div>
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.slidesUsed} movesLimit={SLIDE_BUDGET} />
      <div className="stat-line flex gap-4 text-ink/50 dark:text-white/40 mb-3">
        <span>Goal: <span className="text-polarity font-bold">+</span> left · <span className="font-bold" style={{color:'#C23B8E'}}>−</span> right</span>
        <span>Slides left: <span className="font-mono text-ink dark:text-white">{SLIDE_BUDGET - state.slidesUsed}</span></span>
      </div>

      {/* Grid with half-markers */}
      <div className="border-2 border-graphite dark:border-white/80 mb-5 relative overflow-hidden">
        <div className="absolute top-0 bottom-0 left-1/2 border-l-2 border-dashed border-graphite/30 dark:border-white/20 pointer-events-none" />
        <div
          className="grid gap-1 bg-index/30 dark:bg-index-dark/30 p-1.5"
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, cellIdx) => {
            const mag = getMagnetAt(state.positions, cellIdx);
            const isSelected = mag !== null && mag === selected;
            const pol = mag !== null ? state.polarities[mag] : null;
            return (
              <button
                key={cellIdx}
                onClick={() => handleCellTap(cellIdx)}
                disabled={state.won || state.lost}
                className={[
                  'aspect-square flex items-center justify-center font-mono font-bold text-xl border-2 transition-colors',
                  mag !== null
                    ? pol === '+'
                      ? isSelected
                        ? 'bg-polarity text-white border-graphite dark:border-white/80 scale-90'
                        : 'bg-polarity-soft text-polarity dark:bg-polarity/20 dark:text-white border-polarity'
                      : isSelected
                        ? 'bg-splice text-white border-graphite dark:border-white/80 scale-90'
                        : 'bg-splice-soft text-splice dark:bg-splice/20 dark:text-white border-splice'
                    : 'bg-panel dark:bg-panel-dark border-transparent',
                ].join(' ')}
              >
                {pol === '+' ? '+' : pol === '-' ? '−' : ''}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <p className="stat-line text-ink/50 dark:text-white/40">
          {selected === null ? 'Tap a magnet to select it' : `${state.polarities[selected]} magnet selected — choose direction`}
        </p>
        <div className="grid grid-cols-3 gap-2 w-36">
          <div />
          <DirButton d={DIRS[0]} onPress={handleDir} disabled={selected === null} />
          <div />
          <DirButton d={DIRS[1]} onPress={handleDir} disabled={selected === null} />
          <div />
          <DirButton d={DIRS[3]} onPress={handleDir} disabled={selected === null} />
          <div />
          <DirButton d={DIRS[2]} onPress={handleDir} disabled={selected === null} />
          <div />
        </div>
      </div>

      <ResultModal
        open={showResult} onClose={() => setShowResult(false)}
        gameSlug="polarity" gameName="Polarity"
        puzzleNumber={puzzleNumber} won={state.won}
        moves={state.slidesUsed} movesLimit={SLIDE_BUDGET}
        streak={streak}
      />
    </div>
  );
}

function DirButton({ d, onPress, disabled }: { d: { label: string; dr: number; dc: number }; onPress: (dr: number, dc: number) => void; disabled: boolean }) {
  return (
    <button
      onClick={() => onPress(d.dr, d.dc)}
      disabled={disabled}
      className="aspect-square border-2 border-graphite dark:border-white/80 font-display font-bold text-lg disabled:opacity-30 hover:bg-graphite hover:text-paper dark:hover:bg-white dark:hover:text-graphite transition-colors"
    >
      {d.label}
    </button>
  );
}
