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
  type BounceState,
  type Dir,
} from '@/lib/games/bounce';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { CoinLeaderboard } from '@/components/CoinLeaderboard';
import { CoinModeSection } from '@/components/CoinModeSection';
import { GAMES } from '@/lib/games/registry';
import { loadCoinBalance, saveCoinBalance, rollCoinSeed, computeCoinDelta, GLOBAL_LEADERBOARD_SLUG } from '@/lib/coin-mode';
import { getNickname, saveNickname, submitScore } from '@/lib/leaderboard-client';

const GAME_SLUG = 'bounce';
const OFFSET = (GRID_SIZE - 1) / 2;
const SKY_COLOR = '#BFE3F5';
const CLOUD_COLORS = ['#FFFFFF', '#FDEFF7', '#F3F0FF'];
const GOAL_COLORS = ['#FF9EC4', '#FFD36E', '#9EE6C4', '#9ECBFF'];
const HOP_DURATION_MS = 260;
// Smooth, rounded geometry throughout — deliberately higher segment counts
// than Croak's frog, so nothing here reads as faceted or low-poly.
const SEG = 32;

function cellPos(i: number): [number, number] {
  const r = Math.floor(i / GRID_SIZE);
  const c = i % GRID_SIZE;
  return [c - OFFSET, r - OFFSET];
}

function SkyField({ state }: { state: BounceState }) {
  return (
    <>
      <mesh position={[0, -0.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[GRID_SIZE + 2, GRID_SIZE + 2]} />
        <meshStandardMaterial color={SKY_COLOR} />
      </mesh>
      {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => {
        if (!state.platforms.has(i)) return null;
        const [x, z] = cellPos(i);
        const isGoal = i === state.goal;
        const color = isGoal ? GOAL_COLORS[i % GOAL_COLORS.length] : CLOUD_COLORS[i % CLOUD_COLORS.length];
        return (
          <group key={i} position={[x, 0, z]}>
            <mesh position={[0, -0.05, 0]}>
              <sphereGeometry args={[0.42, SEG, SEG]} />
              <meshStandardMaterial color={color} />
            </mesh>
            {isGoal && (
              <mesh position={[0, 0.32, 0]}>
                <torusGeometry args={[0.16, 0.045, 16, 32]} />
                <meshStandardMaterial color="#FFFFFF" emissive={color} emissiveIntensity={0.3} />
              </mesh>
            )}
          </group>
        );
      })}
    </>
  );
}

function Stars({ state }: { state: BounceState }) {
  return (
    <>
      {Array.from(state.stars).map((i) => {
        const [x, z] = cellPos(i);
        return (
          <mesh key={i} position={[x, 0.45, z]} rotation={[0, 0, Math.PI / 2]}>
            <coneGeometry args={[0.1, 0.24, 5]} />
            <meshStandardMaterial color="#FFD84A" emissive="#FFD84A" emissiveIntensity={0.7} />
          </mesh>
        );
      })}
    </>
  );
}

/** A chibi bunny: oversized round head, tiny round body, big soft ears, and
 * large glossy eyes with a sparkle highlight. Built entirely from smooth
 * primitive spheres — no imported model, matching the site's approach. */
function Bunny({ targetCell }: { targetCell: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const earLeftRef = useRef<THREE.Group>(null);
  const earRightRef = useRef<THREE.Group>(null);
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
    const arc = Math.sin(t * Math.PI) * 0.55;
    const squash = 1 - Math.sin(t * Math.PI) * 0.28;
    currentRef.current = [x, z];
    g.position.set(x, arc, z);
    g.scale.set(1 / squash, squash, 1 / squash);

    // ears flop back mid-hop, then spring forward on landing — a small
    // secondary-motion touch that reads as "soft" rather than rigid.
    const earFlop = Math.sin(t * Math.PI) * 0.6;
    if (earLeftRef.current) earLeftRef.current.rotation.z = 0.18 + earFlop;
    if (earRightRef.current) earRightRef.current.rotation.z = -0.18 - earFlop;
  });

  return (
    <group ref={groupRef}>
      {/* body — small, tucked behind/under the head, chibi proportions */}
      <mesh position={[0, 0.16, -0.02]} scale={[0.85, 0.75, 0.85]}>
        <sphereGeometry args={[0.2, SEG, SEG]} />
        <meshStandardMaterial color="#FF9EC4" />
      </mesh>
      {/* head — oversized relative to the body */}
      <mesh position={[0, 0.42, 0.04]}>
        <sphereGeometry args={[0.3, SEG, SEG]} />
        <meshStandardMaterial color="#FFB6D5" />
      </mesh>
      {/* muzzle patch */}
      <mesh position={[0, 0.33, 0.28]} scale={[0.8, 0.6, 0.5]}>
        <sphereGeometry args={[0.16, SEG, SEG]} />
        <meshStandardMaterial color="#FFF3F8" />
      </mesh>
      {/* cheeks (blush) */}
      <mesh position={[-0.2, 0.36, 0.2]} rotation={[0, 0.3, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#FF6FA0" transparent opacity={0.55} />
      </mesh>
      <mesh position={[0.2, 0.36, 0.2]} rotation={[0, -0.3, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#FF6FA0" transparent opacity={0.55} />
      </mesh>
      {/* eyes — large and glossy with a sparkle highlight */}
      {[-0.12, 0.12].map((x) => (
        <group key={x} position={[x, 0.45, 0.27]}>
          <mesh>
            <sphereGeometry args={[0.075, SEG, SEG]} />
            <meshStandardMaterial color="#2B2230" />
          </mesh>
          <mesh position={[0.025, 0.03, 0.055]}>
            <sphereGeometry args={[0.022, 12, 12]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
        </group>
      ))}
      {/* nose */}
      <mesh position={[0, 0.34, 0.36]}>
        <sphereGeometry args={[0.028, 12, 12]} />
        <meshStandardMaterial color="#E0559B" />
      </mesh>
      {/* ears */}
      <group ref={earLeftRef} position={[-0.15, 0.62, -0.02]} rotation={[0, 0, 0.18]}>
        <mesh position={[0, 0.22, 0]}>
          <capsuleGeometry args={[0.08, 0.32, 8, SEG]} />
          <meshStandardMaterial color="#FFB6D5" />
        </mesh>
        <mesh position={[0, 0.22, 0.045]}>
          <capsuleGeometry args={[0.045, 0.22, 8, 16]} />
          <meshStandardMaterial color="#FFE1EE" />
        </mesh>
      </group>
      <group ref={earRightRef} position={[0.15, 0.62, -0.02]} rotation={[0, 0, -0.18]}>
        <mesh position={[0, 0.22, 0]}>
          <capsuleGeometry args={[0.08, 0.32, 8, SEG]} />
          <meshStandardMaterial color="#FFB6D5" />
        </mesh>
        <mesh position={[0, 0.22, 0.045]}>
          <capsuleGeometry args={[0.045, 0.22, 8, 16]} />
          <meshStandardMaterial color="#FFE1EE" />
        </mesh>
      </group>
      {/* stubby feet */}
      {[-0.14, 0.14].map((x) => (
        <mesh key={x} position={[x, 0.02, 0.06]} scale={[0.8, 0.5, 1]}>
          <sphereGeometry args={[0.1, SEG, SEG]} />
          <meshStandardMaterial color="#FF9EC4" />
        </mesh>
      ))}
      {/* fluffy tail */}
      <mesh position={[0, 0.18, -0.24]}>
        <sphereGeometry args={[0.09, SEG, SEG]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
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

function SkyView({ state, onHop, disabled }: { state: BounceState; onHop: (d: Dir) => void; disabled: boolean }) {
  const limit = currentMoveLimit(state);
  return (
    <div>
      <div className="stat-line flex justify-between text-ink/50 dark:text-white/40 mb-3">
        <span>
          Hops left: <span className="font-mono text-ink dark:text-white">{limit - state.movesUsed}</span>
        </span>
        <span>
          Stars: <span className="font-mono text-ink dark:text-white">{3 - state.stars.size} caught</span>
        </span>
      </div>

      <div
        className="rounded-lg border-2 border-graphite dark:border-white/70 mb-4 mx-auto"
        style={{ width: '100%', maxWidth: 380, height: 300 }}
      >
        <Canvas camera={{ position: [0, 6.5, 6], fov: 45 }}>
          <ambientLight intensity={0.95} />
          <directionalLight position={[6, 10, 4]} intensity={0.85} />
          <SkyField state={state} />
          <Stars state={state} />
          <Bunny targetCell={state.player} />
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

export function BounceBoard({ seed, dateString, puzzleNumber }: { seed: number; dateString: string; puzzleNumber: number }) {
  const game = GAMES.find((g) => g.slug === GAME_SLUG)!;

  // --- Daily puzzle (unchanged behavior) ---
  const [state, setState] = useState<BounceState>(() => createInitialState(seed));
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);

  const dailyFinished = state.won || state.lost;
  const dailyLimit = currentMoveLimit(state);

  function hop(dir: Dir) {
    if (dailyFinished) return;
    setState((prev) => applyHop(prev, dir));
  }

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
        score: 3 - state.stars.size,
        elapsedMs: 0,
      });
      setStreak(getStreak(GAME_SLUG).current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.movesUsed, state.stars, dateString]);

  // --- Coin Mode ---
  const [coins, setCoins] = useState<number>(() => loadCoinBalance());
  const [coinState, setCoinState] = useState<BounceState | null>(null);
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
        Hop the bunny to the rainbow cloud. Catch a star along the way for a bonus hop.
      </p>

      <SkyView state={state} onHop={hop} disabled={dailyFinished} />

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug={GAME_SLUG}
        gameName="Bounce"
        puzzleNumber={puzzleNumber}
        won={state.won}
        moves={state.movesUsed}
        movesLimit={dailyLimit}
        score={3 - state.stars.size}
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
        {coinState && <SkyView state={coinState} onHop={coinHop} disabled={coinState.won || coinState.lost} />}
      </CoinModeSection>

      {showLeaderboard && <CoinLeaderboard onClose={() => setShowLeaderboard(false)} />}
    </div>
  );
}
