'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import {
  createInitialState,
  applyMove,
  GRID_SIZE,
  type WiggleState,
  type Dir,
} from '@/lib/games/wiggle';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { CoinLeaderboard } from '@/components/CoinLeaderboard';
import { CoinModeSection } from '@/components/CoinModeSection';
import { GAMES } from '@/lib/games/registry';
import { loadCoinBalance, saveCoinBalance, rollCoinSeed, computeCoinDelta, GLOBAL_LEADERBOARD_SLUG } from '@/lib/coin-mode';
import { scaleLimit, type Difficulty } from '@/lib/difficulty';
import { getNickname, saveNickname, submitScore } from '@/lib/leaderboard-client';

const GAME_SLUG = 'wiggle';
const OFFSET = (GRID_SIZE - 1) / 2;
const GROUND_COLOR = '#EFF6E4';
const BODY_COLORS = ['#8CC24A', '#7DB33A'];
const SEG = 32;
const HOP_DURATION_MS = 180;

function cellPos(i: number): [number, number] {
  const r = Math.floor(i / GRID_SIZE);
  const c = i % GRID_SIZE;
  return [c - OFFSET, r - OFFSET];
}

function Ground() {
  return (
    <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[GRID_SIZE + 1, GRID_SIZE + 1]} />
      <meshStandardMaterial color={GROUND_COLOR} />
    </mesh>
  );
}

function Grid() {
  const lines = [];
  for (let i = 0; i <= GRID_SIZE; i++) {
    const p = i - OFFSET - 0.5;
    lines.push(
      <mesh key={`h-${i}`} position={[0, -0.19, p]}>
        <boxGeometry args={[GRID_SIZE, 0.01, 0.02]} />
        <meshStandardMaterial color="#D7E4C4" />
      </mesh>,
      <mesh key={`v-${i}`} position={[p, -0.19, 0]}>
        <boxGeometry args={[0.02, 0.01, GRID_SIZE]} />
        <meshStandardMaterial color="#D7E4C4" />
      </mesh>
    );
  }
  return <>{lines}</>;
}

function Leaves({ leaves }: { leaves: Set<number> }) {
  return (
    <>
      {Array.from(leaves).map((i) => {
        const [x, z] = cellPos(i);
        return (
          <mesh key={i} position={[x, 0.05, z]} rotation={[-Math.PI / 2, 0, i % 2 === 0 ? 0.5 : -0.5]} scale={[1, 1.6, 1]}>
            <sphereGeometry args={[0.16, SEG, SEG]} />
            <meshStandardMaterial color="#6FBF4A" />
          </mesh>
        );
      })}
    </>
  );
}

/** The caterpillar's body IS the trail — every visited cell renders as a
 * smooth, chibi-proportioned segment, growing by one each move. The head
 * segment (the current position) gets big glossy eyes and antennae. */
function Caterpillar({ trail }: { trail: number[] }) {
  const headRef = useRef<THREE.Group>(null);
  const animRef = useRef({ fromX: 0, fromZ: 0, toX: 0, toZ: 0, start: 0 });
  const currentRef = useRef<[number, number]>([0, 0]);

  useEffect(() => {
    const headCell = trail[trail.length - 1];
    const [x, z] = cellPos(headCell);
    const [fromX, fromZ] = currentRef.current;
    animRef.current = { fromX, fromZ, toX: x, toZ: z, start: performance.now() };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trail.length]);

  useFrame(() => {
    const g = headRef.current;
    if (!g) return;
    const { fromX, fromZ, toX, toZ, start } = animRef.current;
    const t = Math.min(1, (performance.now() - start) / HOP_DURATION_MS);
    const eased = 1 - Math.pow(1 - t, 2);
    const x = fromX + (toX - fromX) * eased;
    const z = fromZ + (toZ - fromZ) * eased;
    const bob = Math.sin(t * Math.PI) * 0.12;
    currentRef.current = [x, z];
    g.position.set(x, 0.22 + bob, z);
  });

  return (
    <>
      {trail.map((cell, i) => {
        if (i === trail.length - 1) return null; // head rendered separately, animated
        const [x, z] = cellPos(cell);
        return (
          <mesh key={cell} position={[x, 0.2, z]}>
            <sphereGeometry args={[0.24, SEG, SEG]} />
            <meshStandardMaterial color={BODY_COLORS[i % 2]} />
          </mesh>
        );
      })}
      <group ref={headRef}>
        <mesh>
          <sphereGeometry args={[0.27, SEG, SEG]} />
          <meshStandardMaterial color="#9ED658" />
        </mesh>
        {/* eyes */}
        {[-0.1, 0.1].map((x) => (
          <group key={x} position={[x, 0.06, 0.22]}>
            <mesh>
              <sphereGeometry args={[0.07, SEG, SEG]} />
              <meshStandardMaterial color="#2B2230" />
            </mesh>
            <mesh position={[0.02, 0.025, 0.05]}>
              <sphereGeometry args={[0.02, 10, 10]} />
              <meshStandardMaterial color="#FFFFFF" />
            </mesh>
          </group>
        ))}
        {/* antennae */}
        {[-0.13, 0.13].map((x) => (
          <group key={x} position={[x, 0.2, 0.1]} rotation={[0.6, 0, x > 0 ? -0.3 : 0.3]}>
            <mesh position={[0, 0.14, 0]}>
              <capsuleGeometry args={[0.02, 0.16, 6, 12]} />
              <meshStandardMaterial color="#7DB33A" />
            </mesh>
            <mesh position={[0, 0.24, 0]}>
              <sphereGeometry args={[0.035, 12, 12]} />
              <meshStandardMaterial color="#FFD84A" />
            </mesh>
          </group>
        ))}
      </group>
    </>
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

function WiggleView({ state, onMove, disabled }: { state: WiggleState; onMove: (d: Dir) => void; disabled: boolean }) {
  return (
    <div>
      <div className="stat-line flex justify-between text-ink/50 dark:text-white/40 mb-3">
        <span>
          Leaves left: <span className="font-mono text-ink dark:text-white">{state.leaves.size}</span> / {state.totalLeaves}
        </span>
        <span>
          Length: <span className="font-mono text-ink dark:text-white">{state.trail.length}</span>
        </span>
      </div>

      <div
        className="rounded-lg border-2 border-graphite dark:border-white/70 mb-4 mx-auto"
        style={{ width: '100%', maxWidth: 380, height: 300 }}
      >
        <Canvas camera={{ position: [0, 8, 6.5], fov: 45 }}>
          <ambientLight intensity={0.95} />
          <directionalLight position={[6, 10, 4]} intensity={0.85} />
          <Ground />
          <Grid />
          <Leaves leaves={state.leaves} />
          <Caterpillar trail={state.trail} />
          <OrbitControls enablePan={false} minDistance={4} maxDistance={16} />
        </Canvas>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="grid grid-cols-3 gap-2 w-36">
          <div />
          <DirBtn d={ARROWS[0]} onPress={onMove} disabled={disabled} />
          <div />
          <DirBtn d={ARROWS[1]} onPress={onMove} disabled={disabled} />
          <div />
          <DirBtn d={ARROWS[3]} onPress={onMove} disabled={disabled} />
          <div />
          <DirBtn d={ARROWS[2]} onPress={onMove} disabled={disabled} />
          <div />
        </div>
      </div>
    </div>
  );
}

export function WiggleBoard({ seed, dateString, puzzleNumber }: { seed: number; dateString: string; puzzleNumber: number }) {
  const game = GAMES.find((g) => g.slug === GAME_SLUG)!;

  // --- Daily puzzle (unchanged behavior) ---
  const [state, setState] = useState<WiggleState>(() => createInitialState(seed));
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);

  const dailyFinished = state.won || state.lost;

  function move(dir: Dir) {
    if (dailyFinished) return;
    setState((prev) => applyMove(prev, dir));
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const found = ARROWS.find((a) => a.key === e.key);
      if (!found || dailyFinished) return;
      e.preventDefault();
      move(found.dir);
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
        score: state.totalLeaves - state.leaves.size,
        elapsedMs: 0,
      });
      setStreak(getStreak(GAME_SLUG).current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.movesUsed, state.leaves, state.totalLeaves, dateString]);

  // --- Coin Mode ---
  const [coins, setCoins] = useState<number>(() => loadCoinBalance());
  const [coinState, setCoinState] = useState<WiggleState | null>(null);
  const [nickname, setNicknameState] = useState<string>(() => getNickname());
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const coinRoundSettledRef = useRef(false);
  const [lastCoinDelta, setLastCoinDelta] = useState(0);

  const [difficulty, setDifficulty] = useState<Difficulty>('normal');

  function startCoinRound() {
    coinRoundSettledRef.current = false;
    const fresh = createInitialState(rollCoinSeed());
    setCoinState({ ...fresh, moveLimit: scaleLimit(fresh.moveLimit, difficulty) });
  }

  function coinMove(dir: Dir) {
    if (!coinState || coinState.won || coinState.lost) return;
    setCoinState((prev) => (prev ? applyMove(prev, dir) : prev));
  }

  useEffect(() => {
    if (!coinState || coinRoundSettledRef.current) return;
    if (!coinState.won && !coinState.lost) return;
    coinRoundSettledRef.current = true;

    const delta = computeCoinDelta({ won: coinState.won, movesUsed: coinState.movesUsed, movesLimit: coinState.moveLimit, difficulty });
    setLastCoinDelta(delta);
    setCoins((prev) => {
      const next = Math.max(0, prev + delta);
      saveCoinBalance(next);
      if (nickname) submitScore(GLOBAL_LEADERBOARD_SLUG, nickname, next);
      return next;
    });
  }, [coinState, nickname, difficulty]);

  function handleSaveNickname(name: string) {
    saveNickname(name);
    setNicknameState(name);
  }

  return (
    <div>
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.movesUsed} movesLimit={state.moveLimit} />

      <p className="stat-line text-center text-ink/50 dark:text-white/40 mb-3">
        Eat every leaf. Your own trail is the only wall on the board.
      </p>

      <WiggleView state={state} onMove={move} disabled={dailyFinished} />

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug={GAME_SLUG}
        gameName="Wiggle"
        puzzleNumber={puzzleNumber}
        won={state.won}
        moves={state.movesUsed}
        movesLimit={state.moveLimit}
        score={state.totalLeaves - state.leaves.size}
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
        onDifficultyChange={setDifficulty}
      >
        {coinState && <WiggleView state={coinState} onMove={coinMove} disabled={coinState.won || coinState.lost} />}
      </CoinModeSection>

      {showLeaderboard && <CoinLeaderboard onClose={() => setShowLeaderboard(false)} />}
    </div>
  );
}
