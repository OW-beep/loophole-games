'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Edges } from '@react-three/drei';
import {
  createInitialState,
  submitGuess,
  GRID_SIZE,
  GUESS_BUDGET,
  type VantageState,
} from '@/lib/games/vantage';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { GAMES } from '@/lib/games/registry';

const CUBE_COLOR = '#4A5FC1';
const OFFSET = (GRID_SIZE - 1) / 2;

function Structure({ voxels }: { voxels: { x: number; y: number; z: number }[] }) {
  return (
    <>
      {voxels.map((v, i) => (
        <mesh key={i} position={[v.x - OFFSET, v.y - OFFSET, v.z - OFFSET]}>
          <boxGeometry args={[0.92, 0.92, 0.92]} />
          <meshStandardMaterial color={CUBE_COLOR} />
          <Edges color="#12161f" />
        </mesh>
      ))}
    </>
  );
}

export function VantageBoard({
  seed,
  dateString,
  puzzleNumber,
}: {
  seed: number;
  dateString: string;
  puzzleNumber: number;
}) {
  const game = GAMES.find((g) => g.slug === 'vantage')!;
  const [state, setState] = useState<VantageState>(() => createInitialState(seed));
  const [draft, setDraft] = useState('');
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if ((state.won || state.lost) && !finishedRef.current) {
      finishedRef.current = true;
      recordResult('vantage', {
        date: dateString,
        won: state.won,
        moves: state.guesses.length,
        score: state.trueCount,
        elapsedMs: 0,
      });
      setStreak(getStreak('vantage').current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.guesses.length, state.trueCount, dateString]);

  function handleGuess() {
    const value = parseInt(draft, 10);
    if (!Number.isFinite(value)) return;
    setState((s) => submitGuess(s, value));
    setDraft('');
  }

  return (
    <div>
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.guesses.length} movesLimit={GUESS_BUDGET} />

      <p className="stat-line text-center text-ink/50 dark:text-white/40 mb-3">
        Drag to rotate, scroll to zoom {'\u2014'} how many cubes make up this shape?
      </p>

      <div
        className="rounded-lg border-2 border-graphite dark:border-white/70 mb-5 mx-auto"
        style={{ width: '100%', maxWidth: 360, height: 300 }}
      >
        <Canvas camera={{ position: [7, 6, 7], fov: 45 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[6, 10, 6]} intensity={0.9} />
          <Structure voxels={state.voxels} />
          <OrbitControls enablePan={false} minDistance={4} maxDistance={16} />
        </Canvas>
      </div>

      <div className="flex gap-2 mb-4 justify-center">
        <input
          type="number"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
          disabled={state.won || state.lost}
          placeholder="Your guess"
          className="w-32 text-center rounded-md border-2 border-graphite dark:border-white/70 bg-panel dark:bg-panel-dark py-2 disabled:opacity-30"
        />
        <button
          onClick={handleGuess}
          disabled={state.won || state.lost || draft === ''}
          className="rounded-md px-4 py-2 text-sm font-semibold border-2 border-vantage text-vantage disabled:opacity-30"
        >
          Guess
        </button>
      </div>

      {state.guesses.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {state.guesses.map((g, i) => (
            <span
              key={i}
              className="stat-line px-2 py-1 rounded"
              style={{
                color: g.result === 'correct' ? '#4CAF7D' : '#8b93a3',
                border: '1px solid currentColor',
              }}
            >
              {g.value} {g.result === 'higher' ? '\u2191' : g.result === 'lower' ? '\u2193' : '\u2713'}
            </span>
          ))}
        </div>
      )}

      <p className="stat-line text-center text-ink/40 dark:text-white/30">
        {'\u2191'} means the real count is higher, {'\u2193'} means it&rsquo;s lower. Some cubes are always hidden
        behind others {'\u2014'} rotate to check before you commit.
      </p>

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug="vantage"
        gameName={game.name}
        puzzleNumber={puzzleNumber}
        won={state.won}
        moves={state.guesses.length}
        movesLimit={GUESS_BUDGET}
        score={state.trueCount}
        streak={streak}
      />
    </div>
  );
}
