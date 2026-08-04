'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Edges } from '@react-three/drei';
import {
  createInitialState,
  toggleVoxel,
  computeViews,
  voxelKey,
  GRID_SIZE,
  type BlueprintState,
  type ViewGrid,
} from '@/lib/games/blueprint';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { GAMES } from '@/lib/games/registry';

const CUBE_COLOR = '#6B8E4E';
const OFFSET = (GRID_SIZE - 1) / 2;

function MiniView({ label, grid }: { label: string; grid: ViewGrid }) {
  return (
    <div className="text-center">
      <p className="stat-line text-ink/40 dark:text-white/30 mb-1">{label}</p>
      <div
        className="grid gap-0.5 mx-auto"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, width: 54 }}
      >
        {grid.flatMap((row, i) =>
          row.map((filled, j) => (
            <div
              key={`${i}-${j}`}
              className="aspect-square rounded-sm"
              style={{ background: filled ? CUBE_COLOR : '#EFE7DA', border: '1px solid #1B1D22' }}
            />
          ))
        )}
      </div>
    </div>
  );
}

export function BlueprintBoard({
  seed,
  dateString,
  puzzleNumber,
}: {
  seed: number;
  dateString: string;
  puzzleNumber: number;
}) {
  const game = GAMES.find((g) => g.slug === 'blueprint')!;
  const [state, setState] = useState<BlueprintState>(() => createInitialState(seed));
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if ((state.won || state.lost) && !finishedRef.current) {
      finishedRef.current = true;
      recordResult('blueprint', {
        date: dateString,
        won: state.won,
        moves: state.movesUsed,
        score: state.targetCubeCount,
        elapsedMs: 0,
      });
      setStreak(getStreak('blueprint').current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.movesUsed, state.targetCubeCount, dateString]);

  const currentViews = computeViews(state.voxels);

  function handleToggle(x: number, y: number, z: number) {
    setState((s) => toggleVoxel(s, { x, y, z }));
  }

  return (
    <div>
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.movesUsed} movesLimit={state.moveLimit} />

      <p className="stat-line text-center text-ink/50 dark:text-white/40 mb-4">
        Build the shape whose top, front, and side views match the blueprint below
      </p>

      <div className="flex justify-center gap-6 mb-5">
        <MiniView label="TARGET \u2014 TOP" grid={state.targetViews.top} />
        <MiniView label="TARGET \u2014 FRONT" grid={state.targetViews.front} />
        <MiniView label="TARGET \u2014 SIDE" grid={state.targetViews.side} />
      </div>

      <div
        className="rounded-lg border-2 border-graphite dark:border-white/70 mb-5 mx-auto"
        style={{ width: '100%', maxWidth: 340, height: 300 }}
      >
        <Canvas camera={{ position: [6, 6, 7], fov: 45 }}>
          <ambientLight intensity={0.75} />
          <directionalLight position={[6, 10, 6]} intensity={0.9} />
          {Array.from({ length: GRID_SIZE }).map((_, x) =>
            Array.from({ length: GRID_SIZE }).map((_, y) =>
              Array.from({ length: GRID_SIZE }).map((_, z) => {
                const filled = state.voxels.has(voxelKey({ x, y, z }));
                return (
                  <mesh
                    key={`${x},${y},${z}`}
                    position={[x - OFFSET, y - OFFSET, z - OFFSET]}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(x, y, z);
                    }}
                  >
                    <boxGeometry args={[filled ? 0.85 : 0.5, filled ? 0.85 : 0.5, filled ? 0.85 : 0.5]} />
                    <meshStandardMaterial
                      color={filled ? CUBE_COLOR : '#cfd3d8'}
                      transparent={!filled}
                      opacity={filled ? 1 : 0.15}
                    />
                    {filled && <Edges color="#12161f" />}
                  </mesh>
                );
              })
            )
          )}
          <OrbitControls enablePan={false} minDistance={4} maxDistance={16} />
        </Canvas>
      </div>

      <div className="flex justify-center gap-6 mb-5">
        <MiniView label="YOUR \u2014 TOP" grid={currentViews.top} />
        <MiniView label="YOUR \u2014 FRONT" grid={currentViews.front} />
        <MiniView label="YOUR \u2014 SIDE" grid={currentViews.side} />
      </div>

      <p className="stat-line text-center text-ink/40 dark:text-white/30">
        Click an empty slot to add a cube, or click a solid cube to remove it. Rotate the view to check every
        angle before placing.
      </p>

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug="blueprint"
        gameName={game.name}
        puzzleNumber={puzzleNumber}
        won={state.won}
        moves={state.movesUsed}
        movesLimit={state.moveLimit}
        score={state.targetCubeCount}
        streak={streak}
      />
    </div>
  );
}
