'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import {
  createInitialState,
  attemptMove,
  pointKey,
  GRID_ROWS,
  GRID_COLS,
  type ApexState,
} from '@/lib/games/apex';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { GAMES } from '@/lib/games/registry';

const TRACK_COLOR = '#5C7A8A';
const OFF_TRACK_COLOR = '#B7D9A0';
const CAR_COLOR = '#E14B4B';
const FINISH_COLOR = '#4CAF7D';
const COL_OFFSET = (GRID_COLS - 1) / 2;
const ROW_OFFSET = (GRID_ROWS - 1) / 2;

function Track({ state }: { state: ApexState }) {
  const tiles = [];
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const onTrack = state.trackCells.has(pointKey({ row, col }));
      if (!onTrack) continue;
      const isFinish =
        Math.hypot(row - state.finish.row, col - state.finish.col) <= 1.6;
      tiles.push(
        <mesh key={`${row}-${col}`} position={[col - COL_OFFSET, -0.15, row - ROW_OFFSET]}>
          <boxGeometry args={[0.98, 0.2, 0.98]} />
          <meshStandardMaterial color={isFinish ? FINISH_COLOR : TRACK_COLOR} />
        </mesh>
      );
    }
  }
  return <>{tiles}</>;
}

function Ground() {
  return (
    <mesh position={[0, -0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[GRID_COLS + 4, GRID_ROWS + 4]} />
      <meshStandardMaterial color={OFF_TRACK_COLOR} />
    </mesh>
  );
}

function Trail({ path }: { path: { row: number; col: number }[] }) {
  return (
    <>
      {path.slice(0, -1).map((p, i) => (
        <mesh key={i} position={[p.col - COL_OFFSET, -0.02, p.row - ROW_OFFSET]}>
          <boxGeometry args={[0.3, 0.06, 0.3]} />
          <meshStandardMaterial color="#1B1D22" />
        </mesh>
      ))}
    </>
  );
}

function Car({ position }: { position: { row: number; col: number } }) {
  return (
    <mesh position={[position.col - COL_OFFSET, 0.25, position.row - ROW_OFFSET]}>
      <boxGeometry args={[0.6, 0.35, 0.9]} />
      <meshStandardMaterial color={CAR_COLOR} />
    </mesh>
  );
}

const ARROW_GRID: { label: string; aRow: number; aCol: number }[] = [
  { label: '\u2196', aRow: -1, aCol: -1 }, { label: '\u2191', aRow: -1, aCol: 0 }, { label: '\u2197', aRow: -1, aCol: 1 },
  { label: '\u2190', aRow: 0, aCol: -1 }, { label: '\u00b7', aRow: 0, aCol: 0 }, { label: '\u2192', aRow: 0, aCol: 1 },
  { label: '\u2199', aRow: 1, aCol: -1 }, { label: '\u2193', aRow: 1, aCol: 0 }, { label: '\u2198', aRow: 1, aCol: 1 },
];

export function ApexBoard({
  seed,
  dateString,
  puzzleNumber,
}: {
  seed: number;
  dateString: string;
  puzzleNumber: number;
}) {
  const game = GAMES.find((g) => g.slug === 'apex')!;
  const [state, setState] = useState<ApexState>(() => createInitialState(seed));
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if ((state.won || state.lost) && !finishedRef.current) {
      finishedRef.current = true;
      recordResult('apex', {
        date: dateString,
        won: state.won,
        moves: state.movesUsed,
        score: state.moveLimit,
        elapsedMs: 0,
      });
      setStreak(getStreak('apex').current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.movesUsed, state.moveLimit, dateString]);

  return (
    <div>
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.movesUsed} movesLimit={state.moveLimit} />

      <p className="stat-line text-center text-ink/50 dark:text-white/40 mb-3">
        Pick an acceleration each turn {'\u2014'} reach the green finish line without leaving the track
      </p>

      <div
        className="rounded-lg border-2 border-graphite dark:border-white/70 mb-4 mx-auto"
        style={{ width: '100%', maxWidth: 420, height: 300 }}
      >
        <Canvas camera={{ position: [0, 12, 9], fov: 50 }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[6, 10, 4]} intensity={0.9} />
          <Ground />
          <Track state={state} />
          <Trail path={state.path} />
          <Car position={state.position} />
          <OrbitControls enablePan={false} minDistance={6} maxDistance={22} />
        </Canvas>
      </div>

      <p className="stat-line text-center text-ink/40 dark:text-white/30 mb-3">
        Speed: {state.velocity.dRow}, {state.velocity.dCol}
      </p>

      <div className="grid grid-cols-3 gap-2 max-w-[180px] mx-auto mb-5">
        {ARROW_GRID.map(({ label, aRow, aCol }) => (
          <button
            key={label}
            onClick={() => setState((s) => attemptMove(s, aRow, aCol))}
            disabled={state.won || state.lost}
            className="aspect-square rounded-lg border-2 border-graphite dark:border-white/70 text-lg disabled:opacity-30"
          >
            {label}
          </button>
        ))}
      </div>

      <p className="stat-line text-center text-ink/40 dark:text-white/30">
        Each pick nudges your speed in that direction, then you move that many tiles in one step. Leaving the
        track ends the run.
      </p>

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug="apex"
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
