'use client';

import { useEffect, useRef, useState } from 'react';
import { createInitialState, applyMove, manDist, GRID_SIZE, MOVE_LIMIT, MAX_TETHER, type TetherState, type Dir } from '@/lib/games/tether';
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

export function TetherBoard({ seed, dateString, puzzleNumber }: { seed: number; dateString: string; puzzleNumber: number }) {
  const game = GAMES.find(g => g.slug === 'tether')!;
  const [state, setState] = useState<TetherState>(() => createInitialState(seed));
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);

  function move(dir: Dir) {
    if (state.won || state.lost) return;
    setState(prev => applyMove(prev, dir));
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
      recordResult('tether', { date: dateString, won: state.won, moves: state.movesUsed, score: 0, elapsedMs: 0 });
      setStreak(getStreak('tether').current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.movesUsed, dateString]);

  const dist = manDist(state.posA, state.posB);

  return (
    <div>
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.movesUsed} movesLimit={MOVE_LIMIT} />
      <div className="stat-line flex gap-4 text-ink/50 dark:text-white/40 mb-3">
        <span>Tether: <span className="font-mono text-ink dark:text-white">{dist}/{MAX_TETHER}</span></span>
      </div>

      <div
        className="grid gap-1 mb-5 bg-index/30 dark:bg-index-dark/30 p-1.5 border-2 border-graphite dark:border-white/80"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => {
          const isA = state.posA === i;
          const isB = state.posB === i;
          const isGoalA = state.goalA === i;
          const isGoalB = state.goalB === i;
          const isWall = state.walls.has(i);
          return (
            <div key={i} className={[
              'aspect-square flex items-center justify-center text-lg font-bold border',
              isWall  ? 'bg-graphite dark:bg-white/20 border-transparent' :
              isA     ? 'bg-tether text-white border-graphite dark:border-white/80' :
              isB     ? 'bg-tether/60 text-white border-graphite dark:border-white/80' :
              isGoalA ? 'border-2 border-dashed border-tether' :
              isGoalB ? 'border-2 border-dotted border-tether/60' :
                        'bg-panel dark:bg-panel-dark border-index dark:border-index-dark',
            ].join(' ')}>
              {isA ? 'A' : isB ? 'B' : isGoalA && !isA ? 'a' : isGoalB && !isB ? 'b' : ''}
            </div>
          );
        })}
      </div>

      <div className="stat-line text-ink/50 dark:text-white/40 text-center mb-3">
        A and B move together · walls stop one while the other continues
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
        gameSlug="tether" gameName="Tether" puzzleNumber={puzzleNumber}
        won={state.won} moves={state.movesUsed} movesLimit={MOVE_LIMIT} streak={streak} />
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
