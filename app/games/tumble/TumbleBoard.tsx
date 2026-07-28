'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Edges } from '@react-three/drei';
import {
  createInitialState,
  attemptRoll,
  occupiedCells,
  BOARD_ROWS,
  BOARD_COLS,
  type TumbleState,
  type Direction,
} from '@/lib/games/tumble';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { GAMES } from '@/lib/games/registry';

const TILE_COLOR = '#EFE7DA';
const GOAL_COLOR = '#4CAF7D';
const BLOCK_COLOR = '#B8622E';
const ROW_OFFSET = (BOARD_ROWS - 1) / 2;
const COL_OFFSET = (BOARD_COLS - 1) / 2;

function Board({ state }: { state: TumbleState }) {
  const tiles: React.ReactNode[] = [];
  for (let row = 0; row < BOARD_ROWS; row++) {
    for (let col = 0; col < BOARD_COLS; col++) {
      if (state.gaps.has(`${row},${col}`)) continue;
      const isGoal = row === state.goal.row && col === state.goal.col;
      tiles.push(
        <mesh key={`${row}-${col}`} position={[col - COL_OFFSET, -0.55, row - ROW_OFFSET]}>
          <boxGeometry args={[0.95, 0.3, 0.95]} />
          <meshStandardMaterial color={isGoal ? GOAL_COLOR : TILE_COLOR} />
          <Edges color="#1B1D22" />
        </mesh>
      );
    }
  }
  return <>{tiles}</>;
}

function Block({ state }: { state: TumbleState }) {
  const cells = occupiedCells(state.block);
  const rows = cells.map((c) => c.row);
  const cols = cells.map((c) => c.col);
  const centerRow = (Math.min(...rows) + Math.max(...rows)) / 2;
  const centerCol = (Math.min(...cols) + Math.max(...cols)) / 2;

  const sizeX = state.block.orientation === 'lying-x' ? 1.9 : 0.9;
  const sizeZ = state.block.orientation === 'lying-y' ? 1.9 : 0.9;
  const sizeY = state.block.orientation === 'standing' ? 1.9 : 0.9;

  return (
    <mesh position={[centerCol - COL_OFFSET, sizeY / 2 - 0.4, centerRow - ROW_OFFSET]}>
      <boxGeometry args={[sizeX, sizeY, sizeZ]} />
      <meshStandardMaterial color={BLOCK_COLOR} />
      <Edges color="#1B1D22" />
    </mesh>
  );
}

export function TumbleBoard({
  seed,
  dateString,
  puzzleNumber,
}: {
  seed: number;
  dateString: string;
  puzzleNumber: number;
}) {
  const game = GAMES.find((g) => g.slug === 'tumble')!;
  const [state, setState] = useState<TumbleState>(() => createInitialState(seed));
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if ((state.won || state.lost) && !finishedRef.current) {
      finishedRef.current = true;
      recordResult('tumble', {
        date: dateString,
        won: state.won,
        moves: state.movesUsed,
        score: state.moveLimit,
        elapsedMs: 0,
      });
      setStreak(getStreak('tumble').current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.movesUsed, state.moveLimit, dateString]);

  function handleRoll(dir: Direction) {
    setState((s) => attemptRoll(s, dir));
  }

  return (
    <div>
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.movesUsed} movesLimit={state.moveLimit} />

      <p className="stat-line text-center text-ink/50 dark:text-white/40 mb-3">
        Roll the block onto the green tile {'\u2014'} standing up, not lying down
      </p>

      <div
        className="rounded-lg border-2 border-graphite dark:border-white/70 mb-4 mx-auto"
        style={{ width: '100%', maxWidth: 380, height: 320 }}
      >
        <Canvas camera={{ position: [6, 7, 9], fov: 45 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[6, 10, 4]} intensity={0.9} />
          <Board state={state} />
          <Block state={state} />
          <OrbitControls enablePan={false} minDistance={5} maxDistance={18} />
        </Canvas>
      </div>

      <div className="grid grid-cols-3 gap-2 max-w-[220px] mx-auto mb-5">
        <div />
        <button
          onClick={() => handleRoll('up')}
          disabled={state.won || state.lost}
          className="rounded-lg border-2 border-graphite dark:border-white/70 py-2 disabled:opacity-30"
        >
          {'\u2191'}
        </button>
        <div />
        <button
          onClick={() => handleRoll('left')}
          disabled={state.won || state.lost}
          className="rounded-lg border-2 border-graphite dark:border-white/70 py-2 disabled:opacity-30"
        >
          {'\u2190'}
        </button>
        <button
          onClick={() => handleRoll('down')}
          disabled={state.won || state.lost}
          className="rounded-lg border-2 border-graphite dark:border-white/70 py-2 disabled:opacity-30"
        >
          {'\u2193'}
        </button>
        <button
          onClick={() => handleRoll('right')}
          disabled={state.won || state.lost}
          className="rounded-lg border-2 border-graphite dark:border-white/70 py-2 disabled:opacity-30"
        >
          {'\u2192'}
        </button>
      </div>

      <p className="stat-line text-center text-ink/40 dark:text-white/30">
        Rolling off the edge of a tile, or off a gap, ends the run immediately. Drag the view to check your
        landing before you commit to a direction.
      </p>

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug="tumble"
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
