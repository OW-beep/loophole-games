'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import {
  createInitialState,
  applyHop,
  currentMoveLimit,
  GRID_SIZE,
  BASE_MOVE_LIMIT,
  type CroakState,
  type Dir,
} from '@/lib/games/croak';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { CoinLeaderboard } from '@/components/CoinLeaderboard';
import { CoinModeSection } from '@/components/CoinModeSection';
import { GAMES } from '@/lib/games/registry';
import { loadCoinBalance, saveCoinBalance, rollCoinSeed, computeCoinDelta, GLOBAL_LEADERBOARD_SLUG } from '@/lib/coin-mode';
import { getNickname, saveNickname, submitScore } from '@/lib/leaderboard-client';

const GAME_SLUG = 'croak';
const OFFSET = (GRID_SIZE - 1) / 2;
const WATER_COLOR = '#7FB8D9';
const PAD_COLOR = '#5CAE4E';
const GOAL_PAD_COLOR = '#E8B94A';
const HOP_DURATION_MS = 260;

function cellPos(i: number): [number, number] {
  const r = Math.floor(i / GRID_SIZE);
  const c = i % GRID_SIZE;
  return [c - OFFSET, r - OFFSET];
}

function Pond({ state }: { state: CroakState }) {
  return (
    <>
      <mesh position={[0, -0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[GRID_SIZE + 1.5, GRID_SIZE + 1.5]} />
        <meshStandardMaterial color={WATER_COLOR} />
      </mesh>
      {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => {
        if (!state.pads.has(i)) return null;
        const [x, z] = cellPos(i);
        const isGoal = i === state.goal;
        return (
          <mesh key={i} position={[x, 0, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.42, 20]} />
            <meshStandardMaterial color={isGoal ? GOAL_PAD_COLOR : PAD_COLOR} />
          </mesh>
        );
      })}
    </>
  );
}

function Fireflies({ state }: { state: CroakState }) {
  return (
    <>
      {Array.from(state.fireflies).map((i) => {
        const [x, z] = cellPos(i);
        return (
          <mesh key={i} position={[x, 0.35, z]}>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshStandardMaterial color="#F5D93A" emissive="#F5D93A" emissiveIntensity={0.9} />
          </mesh>
        );
      })}
    </>
  );
}

/** The frog itself — plain Three.js primitives, no imported model, with a
 * small hop-arc + squash animation whenever `targetCell` changes. */
function Frog({ targetCell }: { targetCell: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const animRef = useRef({ fromX: 0, fromZ: 0, toX: 0, toZ: 0, start: 0 });
  const currentRef = useRef<[number, number]>([0, 0]);

  useEffect(() => {
    const [x, z] = cellPos(targetCell);
    const [fromX, fromZ] = currentRef.current;
    animRef.current = { fromX, fromZ, toX: x, toZ: z, start: performance.now() };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetCell]);

  useFrame(() => {
    const g = groupRef.current;
    if (!g) return;
    const { fromX, fromZ, toX, toZ, start } = animRef.current;
    const t = Math.min(1, (performance.now() - start) / HOP_DURATION_MS);
    const eased = 1 - Math.pow(1 - t, 2);
    const x = fromX + (toX - fromX) * eased;
    const z = fromZ + (toZ - fromZ) * eased;
    const arc = Math.sin(t * Math.PI) * 0.5;
    const squash = 1 - Math.sin(t * Math.PI) * 0.25;
    currentRef.current = [x, z];
    g.position.set(x, arc, z);
    g.scale.set(1 / squash, squash, 1 / squash);
  });

  return (
    <group ref={groupRef}>
      {/* body */}
      <mesh position={[0, 0.22, 0]}>
        <sphereGeometry args={[0.26, 20, 20]} />
        <meshStandardMaterial color="#5CAE4E" />
      </mesh>
      {/* belly */}
      <mesh position={[0, 0.1, 0.14]} scale={[0.8, 0.6, 0.7]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#E9F2DA" />
      </mesh>
      {/* eyes */}
      <mesh position={[-0.11, 0.42, 0.12]}>
        <sphereGeometry args={[0.09, 14, 14]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[0.11, 0.42, 0.12]}>
        <sphereGeometry args={[0.09, 14, 14]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[-0.11, 0.44, 0.19]}>
        <sphereGeometry args={[0.045, 10, 10]} />
        <meshStandardMaterial color="#20241F" />
      </mesh>
      <mesh position={[0.11, 0.44, 0.19]}>
        <sphereGeometry args={[0.045, 10, 10]} />
        <meshStandardMaterial color="#20241F" />
      </mesh>
      {/* stumpy legs */}
      {[-0.2, 0.2].map((x) => (
        <mesh key={x} position={[x, 0.04, -0.1]} scale={[0.7, 0.4, 0.9]}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshStandardMaterial color="#4C9640" />
        </mesh>
      ))}
    </group>
  );
}

const ARROWS: { dir: Dir; label: string; key: string }[] = [
  { dir: 'up', label: '↑', key: 'ArrowUp' },
  { dir: 'left', label: '←', key: 'ArrowLeft' },
  { dir: 'down', label: '↓', key: 'ArrowDown' },
  { dir: 'right', label: '→', key: 'ArrowRight' },
];

function DirBtn({ d, onPress, disabled }: { d: { dir: Dir; label: string }; onPress: (d: Dir) => void; disabled: boolean }) {
  return (
    <button
      onClick={() => onPress(d.dir)}
      disabled={disabled}
      className="aspect-square border-2 border-graphite dark:border-white/80 font-display font-bold text-lg disabled:opacity-30 hover:bg-graphite hover:text-paper dark:hover:bg-white dark:hover:text-graphite transition-colors"
    >
      {d.label}
    </button>
  );
}

function PondView({ state, onHop, disabled }: { state: CroakState; onHop: (d: Dir) => void; disabled: boolean }) {
  const limit = currentMoveLimit(state);
  return (
    <div>
      <div className="stat-line flex justify-between text-ink/50 dark:text-white/40 mb-3">
        <span>
          Hops left: <span className="font-mono text-ink dark:text-white">{limit - state.movesUsed}</span>
        </span>
        <span>
          Fireflies: <span className="font-mono text-ink dark:text-white">{3 - state.fireflies.size} caught</span>
        </span>
      </div>

      <div
        className="rounded-lg border-2 border-graphite dark:border-white/70 mb-4 mx-auto"
        style={{ width: '100%', maxWidth: 380, height: 300 }}
      >
        <Canvas camera={{ position: [0, 6.5, 6], fov: 45 }}>
          <ambientLight intensity={0.85} />
          <directionalLight position={[6, 10, 4]} intensity={0.9} />
          <Pond state={state} />
          <Fireflies state={state} />
          <Frog targetCell={state.player} />
          <OrbitControls enablePan={false} minDistance={4} maxDistance={14} />
        </Canvas>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="grid grid-cols-3 gap-2 w-36">
          <div />
          <DirBtn d={ARROWS[0]} onPress={onHop} disabled={disabled} />
          <div />
          <DirBtn d={ARROWS[1]} onPress={onHop} disabled={disabled} />
          <div />
          <DirBtn d={ARROWS[3]} onPress={onHop} disabled={disabled} />
          <div />
          <DirBtn d={ARROWS[2]} onPress={onHop} disabled={disabled} />
          <div />
        </div>
      </div>
    </div>
  );
}

export function CroakBoard({ seed, dateString, puzzleNumber }: { seed: number; dateString: string; puzzleNumber: number }) {
  const game = GAMES.find((g) => g.slug === GAME_SLUG)!;

  // --- Daily puzzle (unchanged behavior) ---
  const [state, setState] = useState<CroakState>(() => createInitialState(seed));
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);

  const dailyFinished = state.won || state.lost;
  const dailyLimit = currentMoveLimit(state);

  function hop(dir: Dir) {
    if (dailyFinished) return;
    setState((prev) => applyHop(prev, dir));
  }

  // Arrow-key support alongside the on-screen pad.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const found = ARROWS.find((a) => a.key === e.key);
      if (!found || dailyFinished) return;
      e.preventDefault();
      hop(found.dir);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  useEffect(() => {
    if ((state.won || state.lost) && !finishedRef.current) {
      finishedRef.current = true;
      recordResult(GAME_SLUG, {
        date: dateString,
        won: state.won,
        moves: state.movesUsed,
        score: 3 - state.fireflies.size,
        elapsedMs: 0,
      });
      setStreak(getStreak(GAME_SLUG).current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.movesUsed, state.fireflies, dateString]);

  // --- Coin Mode ---
  const [coins, setCoins] = useState<number>(() => loadCoinBalance());
  const [coinState, setCoinState] = useState<CroakState | null>(null);
  const [nickname, setNicknameState] = useState<string>(() => getNickname());
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const coinRoundSettledRef = useRef(false);
  const [lastCoinDelta, setLastCoinDelta] = useState(0);

  function startCoinRound() {
    coinRoundSettledRef.current = false;
    setCoinState(createInitialState(rollCoinSeed()));
  }

  function coinHop(dir: Dir) {
    if (!coinState || coinState.won || coinState.lost) return;
    setCoinState((prev) => (prev ? applyHop(prev, dir) : prev));
  }

  useEffect(() => {
    if (!coinState || coinRoundSettledRef.current) return;
    if (!coinState.won && !coinState.lost) return;
    coinRoundSettledRef.current = true;

    const delta = computeCoinDelta({
      won: coinState.won,
      movesUsed: coinState.movesUsed,
      movesLimit: currentMoveLimit(coinState),
    });
    setLastCoinDelta(delta);
    setCoins((prev) => {
      const next = Math.max(0, prev + delta);
      saveCoinBalance(next);
      if (nickname) submitScore(GLOBAL_LEADERBOARD_SLUG, nickname, next);
      return next;
    });
  }, [coinState, nickname]);

  function handleSaveNickname(name: string) {
    saveNickname(name);
    setNicknameState(name);
  }

  return (
    <div>
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.movesUsed} movesLimit={dailyLimit} />

      <p className="stat-line text-center text-ink/50 dark:text-white/40 mb-3">
        Hop the frog to the gold lily pad. Catch a firefly along the way for a bonus hop.
      </p>

      <PondView state={state} onHop={hop} disabled={dailyFinished} />

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug={GAME_SLUG}
        gameName="Croak"
        puzzleNumber={puzzleNumber}
        won={state.won}
        moves={state.movesUsed}
        movesLimit={dailyLimit}
        score={3 - state.fireflies.size}
        streak={streak}
      />

      <CoinModeSection
        coins={coins}
        nickname={nickname}
        onSaveNickname={handleSaveNickname}
        roundActive={!!coinState}
        roundFinished={!!coinState && (coinState.won || coinState.lost)}
        roundWon={!!coinState?.won}
        lastDelta={lastCoinDelta}
        onStart={startCoinRound}
        onShowLeaderboard={() => setShowLeaderboard(true)}
      >
        {coinState && <PondView state={coinState} onHop={coinHop} disabled={coinState.won || coinState.lost} />}
      </CoinModeSection>

      {showLeaderboard && <CoinLeaderboard onClose={() => setShowLeaderboard(false)} />}
    </div>
  );
}
