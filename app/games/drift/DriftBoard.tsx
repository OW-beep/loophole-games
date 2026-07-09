'use client';

import { useEffect, useRef, useState } from 'react';
import { createInitialState, applySlide, GRID_SIZE, SLIDE_LIMIT, type DriftState, type Dir } from '@/lib/games/drift';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { GAMES } from '@/lib/games/registry';

const DIRS: { dir: Dir; label: string; key: string }[] = [
  { dir: 'up',    label: '↑', key: 'ArrowUp'    },
  { dir: 'left',  label: '←', key: 'ArrowLeft'  },
  { dir: 'down',  label: '↓', key: 'ArrowDown'  },
  { dir: 'right', label: '→', key: 'ArrowRight' },
];

export function DriftBoard({ seed, dateString, puzzleNumber }: { seed: number; dateString: string; puzzleNumber: number }) {
  const game = GAMES.find(g => g.slug === 'drift')!;
  const [state, setState] = useState<DriftState>(() => createInitialState(seed));
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);

  function move(dir: Dir) {
    if (state.won || state.lost) return;
    setState(prev => applySlide(prev, dir));
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const d = DIRS.find(d => d.key === e.key);
      if (d) { e.preventDefault(); move(d.dir); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  useEffect(() => {
    if ((state.won || state.lost) && !finishedRef.current) {
      finishedRef.current = true;
      recordResult('drift', { date: dateString, won: state.won, moves: state.slidesUsed, score: 0, elapsedMs: 0 });
      setStreak(getStreak('drift').current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.slidesUsed, dateString]);

  const boxSet = new Set(state.boxes);

  return (
    <div>
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.slidesUsed} movesLimit={SLIDE_LIMIT} />

      <div
        className="grid gap-1 mb-5 bg-index/30 dark:bg-index-dark/30 p-1.5 border-2 border-graphite dark:border-white/80"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => {
          const isPlayer = state.player === i;
          const isBox    = boxSet.has(i);
          const isGoal   = state.goal === i;
          const isWall   = state.walls.has(i);
          return (
            <div key={i} className={[
              'aspect-square flex items-center justify-center text-lg font-bold border',
              isWall   ? 'bg-graphite dark:bg-white/20 border-transparent' :
              isPlayer ? 'bg-drift text-white border-graphite dark:border-white/80' :
              isBox    ? 'bg-drift-soft dark:bg-drift/20 text-graphite dark:text-white border-drift' :
              isGoal   ? 'border-2 border-dashed border-drift' :
                         'bg-panel dark:bg-panel-dark border-index dark:border-index-dark',
            ].join(' ')}>
              {isPlayer ? '●' : isBox ? '■' : isGoal && !isPlayer ? '✕' : ''}
            </div>
          );
        })}
      </div>

      <div className="stat-line text-ink/50 dark:text-white/40 text-center mb-3">
        ● slides until blocked · ■ shifts one step when pushed · ✕ goal
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="grid grid-cols-3 gap-2 w-36">
          <div />
          <DirBtn d={DIRS[0]} onPress={move} />
          <div />
          <DirBtn d={DIRS[1]} onPress={move} />
          <div />
          <DirBtn d={DIRS[3]} onPress={move} />
          <div />
          <DirBtn d={DIRS[2]} onPress={move} />
          <div />
        </div>
      </div>

      <ResultModal open={showResult} onClose={() => setShowResult(false)}
        gameSlug="drift" gameName="Drift" puzzleNumber={puzzleNumber}
        won={state.won} moves={state.slidesUsed} movesLimit={SLIDE_LIMIT} streak={streak} />
    </div>
  );
}

function DirBtn({ d, onPress }: { d: { dir: Dir; label: string }; onPress: (d: Dir) => void }) {
  return (
    <button onClick={() => onPress(d.dir)}
      className="aspect-square border-2 border-graphite dark:border-white/80 font-display font-bold text-lg hover:bg-graphite hover:text-paper dark:hover:bg-white dark:hover:text-graphite transition-colors">
      {d.label}
    </button>
  );
}
