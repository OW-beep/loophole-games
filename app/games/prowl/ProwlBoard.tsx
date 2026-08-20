'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import {
  createInitialState,
  applyMove,
  currentMoveLimit,
  GRID_SIZE,
  type ProwlState,
  type ProwlDifficulty,
  type Dir,
  type Guard,
} from '@/lib/games/prowl';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { CoinLeaderboard } from '@/components/CoinLeaderboard';
import { CoinModeSection } from '@/components/CoinModeSection';
import { GAMES } from '@/lib/games/registry';
import { loadCoinBalance, saveCoinBalance, rollCoinSeed, computeCoinDelta, GLOBAL_LEADERBOARD_SLUG } from '@/lib/coin-mode';
import { type Difficulty } from '@/lib/difficulty';
import { getNickname, saveNickname, submitScore } from '@/lib/leaderboard-client';

const GAME_SLUG = 'prowl';
const OFFSET = (GRID_SIZE - 1) / 2;
const GLIDE_MS = 220;

// -- palette: a generic, no-particular-country night metropolis so the
// setting reads as "big city anywhere" rather than any one culture. --
const STREET_COLOR = '#2B2E38';
const SIDEWALK_LINE = '#565B6B';
const BUILDING_COLORS = ['#3E4458', '#4A5068', '#38405A', '#525A78', '#2E3446'];
const WINDOW_LIT = '#FFD989';
const DANGER_COLOR = '#E14B4B';

function cellPos(i: number): [number, number] {
  const r = Math.floor(i / GRID_SIZE);
  const c = i % GRID_SIZE;
  return [c - OFFSET, r - OFFSET];
}

/** Cheap deterministic hash so building height/color stay stable across renders without touching game state. */
function hash(n: number): number {
  let x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function City({ buildings }: { buildings: Set<number> }) {
  const items = useMemo(() => Array.from(buildings), [buildings]);
  return (
    <group>
      {/* street bed */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[GRID_SIZE + 1, GRID_SIZE + 1]} />
        <meshStandardMaterial color={STREET_COLOR} roughness={0.9} />
      </mesh>
      {items.map((i) => {
        const [x, z] = cellPos(i);
        const h = 1.4 + hash(i) * 3.6;
        const color = BUILDING_COLORS[Math.floor(hash(i + 99) * BUILDING_COLORS.length)];
        const lit = hash(i + 7) > 0.4;
        return (
          <group key={i} position={[x, 0, z]}>
            <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.86, h, 0.86]} />
              <meshStandardMaterial color={color} roughness={0.6} metalness={0.15} />
            </mesh>
            {lit && (
              <mesh position={[0, h * 0.62, 0.44]}>
                <planeGeometry args={[0.5, 0.16]} />
                <meshStandardMaterial color={WINDOW_LIT} emissive={WINDOW_LIT} emissiveIntensity={1.1} />
              </mesh>
            )}
          </group>
        );
      })}
      {/* sidewalk stripe accents on a couple of the long streets, purely decorative */}
      {[-OFFSET, OFFSET].map((v) => (
        <mesh key={v} position={[v, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.06, GRID_SIZE + 1]} />
          <meshStandardMaterial color={SIDEWALK_LINE} />
        </mesh>
      ))}
    </group>
  );
}

function DangerZones({ visibleCells, buildings }: { visibleCells: Set<number>; buildings: Set<number> }) {
  const cells = useMemo(() => Array.from(visibleCells).filter((i) => !buildings.has(i)), [visibleCells, buildings]);
  return (
    <>
      {cells.map((i) => {
        const [x, z] = cellPos(i);
        return (
          <mesh key={i} position={[x, 0.012, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.92, 0.92]} />
            <meshStandardMaterial color={DANGER_COLOR} emissive={DANGER_COLOR} emissiveIntensity={0.5} transparent opacity={0.32} />
          </mesh>
        );
      })}
    </>
  );
}

function Goal({ cell }: { cell: number }) {
  const [x, z] = cellPos(cell);
  const ref = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.intensity = 1.2 + Math.sin(clock.elapsedTime * 3) * 0.5;
  });
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.42, 24]} />
        <meshStandardMaterial color="#4AE07A" emissive="#4AE07A" emissiveIntensity={1} transparent opacity={0.85} />
      </mesh>
      <pointLight ref={ref} position={[0, 0.6, 0]} color="#4AE07A" intensity={1.2} distance={2.5} />
    </group>
  );
}

function Jammers({ cells }: { cells: Set<number> }) {
  const list = Array.from(cells);
  return (
    <>
      {list.map((i) => {
        const [x, z] = cellPos(i);
        return <Bob key={i} x={x} z={z} y={0.34} color="#4AB8E0" shape="octa" scale={0.14} />;
      })}
    </>
  );
}
function Shards({ cells }: { cells: Set<number> }) {
  const list = Array.from(cells);
  return (
    <>
      {list.map((i) => {
        const [x, z] = cellPos(i);
        return <Bob key={i} x={x} z={z} y={0.32} color="#E8C74A" shape="octa" scale={0.12} spin />;
      })}
    </>
  );
}
function Bob({
  x,
  z,
  y,
  color,
  scale,
  spin,
}: {
  x: number;
  z: number;
  y: number;
  color: string;
  shape: 'octa';
  scale: number;
  spin?: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.y = y + Math.sin(clock.elapsedTime * 2.4 + x + z) * 0.08;
    if (spin) ref.current.rotation.y = clock.elapsedTime * 1.6;
  });
  return (
    <mesh ref={ref} position={[x, y, z]} scale={scale}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} />
    </mesh>
  );
}

const FACING_ANGLE: Record<Dir, number> = {
  up: Math.PI, // -z
  down: 0, // +z
  left: Math.PI / 2,
  right: -Math.PI / 2,
};

/** Cute, sleek "agent" — chibi proportions (big head, small body), trench
 * coat + beret + scarf. Plain Three.js primitives, no imported model, in
 * keeping with the rest of the catalog's house style. */
function Agent({ targetCell, facing }: { targetCell: number; facing: Dir }) {
  const groupRef = useRef<THREE.Group>(null);
  const beaconRef = useRef<THREE.Mesh>(null);
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
    const t = Math.min(1, (performance.now() - start) / GLIDE_MS);
    const eased = 1 - Math.pow(1 - t, 2);
    const x = fromX + (toX - fromX) * eased;
    const z = fromZ + (toZ - fromZ) * eased;
    const bob = Math.sin(t * Math.PI) * 0.12;
    currentRef.current = [x, z];
    g.position.set(x, bob, z);
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, FACING_ANGLE[facing], 0.35);
    if (beaconRef.current) {
      const pulse = 0.55 + Math.sin(performance.now() * 0.004) * 0.2;
      (beaconRef.current.material as THREE.MeshStandardMaterial).opacity = pulse;
    }
  });

  return (
    <group ref={groupRef}>
      {/* "you are here" locator \u2014 a ground ring plus a thin vertical beam, tall
          enough to poke above the rooftops, so the player stays findable from
          any camera angle including a straight-down bird's-eye view. */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.32, 0.4, 24]} />
        <meshStandardMaterial color="#4AD8E0" emissive="#4AD8E0" emissiveIntensity={1.2} transparent opacity={0.9} />
      </mesh>
      <mesh ref={beaconRef} position={[0, 2.2, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 4.2, 8]} />
        <meshStandardMaterial color="#4AD8E0" emissive="#4AD8E0" emissiveIntensity={1.5} transparent opacity={0.6} depthWrite={false} />
      </mesh>
      {/* coat / body */}
      <mesh position={[0, 0.24, 0]}>
        <coneGeometry args={[0.22, 0.42, 16]} />
        <meshStandardMaterial color="#7A2E3E" roughness={0.55} />
      </mesh>
      {/* scarf */}
      <mesh position={[0, 0.42, 0]}>
        <torusGeometry args={[0.15, 0.045, 10, 16]} />
        <meshStandardMaterial color="#EFE3C8" />
      </mesh>
      {/* head */}
      <mesh position={[0, 0.62, 0]}>
        <sphereGeometry args={[0.22, 20, 20]} />
        <meshStandardMaterial color="#F2C9A0" />
      </mesh>
      {/* beret */}
      <mesh position={[0, 0.77, -0.02]} rotation={[0.15, 0, 0]}>
        <sphereGeometry args={[0.17, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#2B2B33" />
      </mesh>
      {/* eyes */}
      {[-0.09, 0.09].map((ex) => (
        <group key={ex} position={[ex, 0.63, 0.19]}>
          <mesh>
            <sphereGeometry args={[0.055, 14, 14]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[0, 0, 0.035]}>
            <sphereGeometry args={[0.028, 10, 10]} />
            <meshStandardMaterial color="#20241F" />
          </mesh>
        </group>
      ))}
      {/* gloved hands */}
      {[-0.24, 0.24].map((hx) => (
        <mesh key={hx} position={[hx, 0.24, 0.02]}>
          <sphereGeometry args={[0.06, 10, 10]} />
          <meshStandardMaterial color="#2B2B33" />
        </mesh>
      ))}
    </group>
  );
}

/** Patrol guard — same chibi scale, darker silhouette, plus its vision cone. */
function Sentinel({ guard }: { guard: Guard }) {
  const [x, z] = cellPos(guard.pos);
  const groupRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (groupRef.current) groupRef.current.position.y = Math.sin(clock.elapsedTime * 3 + guard.id) * 0.03;
  });

  const coneGeom = useMemo(() => {
    const shape = new THREE.Shape();
    const range = guard.visionRange;
    const spread = 0.62; // radians half-angle
    shape.moveTo(0, 0);
    const steps = 10;
    for (let s = 0; s <= steps; s++) {
      const a = -spread + (2 * spread * s) / steps;
      shape.lineTo(Math.sin(a) * range, Math.cos(a) * range);
    }
    shape.lineTo(0, 0);
    return new THREE.ShapeGeometry(shape);
  }, [guard.visionRange]);

  return (
    <group>
      <group position={[x, 0, z]} rotation={[0, FACING_ANGLE[guard.facing], 0]}>
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <primitive object={coneGeom} attach="geometry" />
          <meshStandardMaterial color="#F5C24A" emissive="#F5C24A" emissiveIntensity={0.6} transparent opacity={0.28} side={THREE.DoubleSide} />
        </mesh>
      </group>
      <group ref={groupRef} position={[x, 0, z]} rotation={[0, FACING_ANGLE[guard.facing], 0]}>
        <mesh position={[0, 0.26, 0]}>
          <cylinderGeometry args={[0.16, 0.22, 0.44, 14]} />
          <meshStandardMaterial color="#1F2430" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.6, 0]}>
          <sphereGeometry args={[0.2, 18, 18]} />
          <meshStandardMaterial color="#E0A574" />
        </mesh>
        {/* sunglasses */}
        <mesh position={[0, 0.62, 0.18]}>
          <boxGeometry args={[0.26, 0.06, 0.05]} />
          <meshStandardMaterial color="#101114" />
        </mesh>
        {/* hat */}
        <mesh position={[0, 0.76, 0]}>
          <cylinderGeometry args={[0.19, 0.19, 0.08, 16]} />
          <meshStandardMaterial color="#14161C" />
        </mesh>
        <mesh position={[0, 0.71, 0]}>
          <cylinderGeometry args={[0.12, 0.14, 0.1, 16]} />
          <meshStandardMaterial color="#14161C" />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Follows the player by moving OrbitControls' orbit *target* only \u2014 it never
 * touches camera.position directly. Steering the camera by hand and letting
 * it re-center on the player used to fight each other (both were writing to
 * camera.position every frame, so a drag would immediately get pulled back).
 * With damping enabled, OrbitControls recomputes position from
 * target + the player's own orbit angles each frame, so dragging to look
 * around now stays smooth and never snaps back \u2014 the camera just orbits
 * around wherever the player currently is.
 */
function CameraRig({ controlsRef, playerCell }: { controlsRef: React.RefObject<any>; playerCell: number }) {
  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const [x, z] = cellPos(playerCell);
    controls.target.lerp(new THREE.Vector3(x, 0.4, z), 0.08);
  });
  return null;
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

function CityView({ state, onMove, disabled }: { state: ProwlState; onMove: (d: Dir) => void; disabled: boolean }) {
  const limit = currentMoveLimit(state);
  const lastFacingRef = useRef<Dir>('down');
  const controlsRef = useRef<any>(null);

  return (
    <div>
      <div className="stat-line flex flex-wrap justify-between gap-x-4 gap-y-1 text-ink/50 dark:text-white/40 mb-3">
        <span>
          Moves left: <span className="font-mono text-ink dark:text-white">{Math.max(limit - state.movesUsed, 0)}</span>
        </span>
        <span>
          Shards: <span className="font-mono text-ink dark:text-white">{state.shardsCollected}/{state.totalShards}</span>
        </span>
        <span>
          Jammers: <span className="font-mono text-ink dark:text-white">{state.jamCharges}</span>
        </span>
      </div>

      <div
        className="rounded-lg border-2 border-graphite dark:border-white/70 mb-4 mx-auto overflow-hidden"
        style={{ width: '100%', maxWidth: 420, height: 340, background: '#12141C' }}
      >
        <Canvas camera={{ position: [0, 8.5, 8.5], fov: 50 }} shadows>
          <fog attach="fog" args={['#12141C', 8, 20]} />
          <ambientLight intensity={0.45} />
          <directionalLight position={[4, 8, 3]} intensity={0.6} color="#AEC6FF" />
          <pointLight position={[0, 3, 0]} intensity={0.3} color="#F5C24A" />
          <City buildings={state.buildings} />
          <DangerZones visibleCells={state.visibleCells} buildings={state.buildings} />
          <Jammers cells={state.jammers} />
          <Shards cells={state.shards} />
          <Goal cell={state.goal} />
          {state.guards.map((g) => (
            <Sentinel key={g.id} guard={g} />
          ))}
          <Agent targetCell={state.player} facing={lastFacingRef.current} />
          <CameraRig controlsRef={controlsRef} playerCell={state.player} />
          <OrbitControls
            ref={controlsRef}
            enablePan={false}
            enableDamping
            dampingFactor={0.12}
            rotateSpeed={0.7}
            minDistance={3}
            maxDistance={18}
            minPolarAngle={0.05}
            maxPolarAngle={Math.PI / 2.05}
          />
        </Canvas>
      </div>
      <p className="stat-line text-center text-ink/40 dark:text-white/30 mb-2">
        Drag to look around \u2014 the cyan beacon marks your position. Scroll or pinch to zoom.
      </p>

      <div className="flex flex-col items-center gap-2">
        <div className="grid grid-cols-3 gap-2 w-36">
          <div />
          <DirBtn
            d={ARROWS[0]}
            onPress={(d) => {
              lastFacingRef.current = d;
              onMove(d);
            }}
            disabled={disabled}
          />
          <div />
          <DirBtn
            d={ARROWS[1]}
            onPress={(d) => {
              lastFacingRef.current = d;
              onMove(d);
            }}
            disabled={disabled}
          />
          <div />
          <DirBtn
            d={ARROWS[3]}
            onPress={(d) => {
              lastFacingRef.current = d;
              onMove(d);
            }}
            disabled={disabled}
          />
          <div />
          <DirBtn
            d={ARROWS[2]}
            onPress={(d) => {
              lastFacingRef.current = d;
              onMove(d);
            }}
            disabled={disabled}
          />
          <div />
        </div>
      </div>
    </div>
  );
}

export function ProwlBoard({ seed, dateString, puzzleNumber }: { seed: number; dateString: string; puzzleNumber: number }) {
  const game = GAMES.find((g) => g.slug === GAME_SLUG)!;

  // --- Daily puzzle (fixed Normal difficulty, like the rest of the site's dailies) ---
  const [state, setState] = useState<ProwlState>(() => createInitialState(seed, 'normal'));
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);

  const dailyFinished = state.won || state.lost;
  const dailyLimit = currentMoveLimit(state);

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
        score: state.shardsCollected,
        elapsedMs: 0,
      });
      setStreak(getStreak(GAME_SLUG).current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.movesUsed, state.shardsCollected, dateString]);

  // --- Coin Mode ---
  const [coins, setCoins] = useState<number>(() => loadCoinBalance());
  const [coinState, setCoinState] = useState<ProwlState | null>(null);
  const [nickname, setNicknameState] = useState<string>(() => getNickname());
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const coinRoundSettledRef = useRef(false);
  const [lastCoinDelta, setLastCoinDelta] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');

  function startCoinRound() {
    coinRoundSettledRef.current = false;
    setCoinState(createInitialState(rollCoinSeed(), difficulty as ProwlDifficulty));
  }

  function coinMove(dir: Dir) {
    if (!coinState || coinState.won || coinState.lost) return;
    setCoinState((prev) => (prev ? applyMove(prev, dir) : prev));
  }

  useEffect(() => {
    if (!coinState || coinRoundSettledRef.current) return;
    if (!coinState.won && !coinState.lost) return;
    coinRoundSettledRef.current = true;

    const delta = computeCoinDelta({
      won: coinState.won,
      movesUsed: coinState.movesUsed,
      movesLimit: currentMoveLimit(coinState),
      difficulty,
    });
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

  const resultMessage = state.caught ? 'Spotted — the run ends here.' : undefined;

  return (
    <div>
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.movesUsed} movesLimit={dailyLimit} />

      <p className="stat-line text-center text-ink/50 dark:text-white/40 mb-3">
        Slip through the city to the green marker. Red tiles are where a guard would spot you right now — step
        through a blue jammer first if you need to risk it.
      </p>
      {resultMessage && <p className="stat-line text-center text-debt mb-2">{resultMessage}</p>}

      <CityView state={state} onMove={move} disabled={dailyFinished} />

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug={GAME_SLUG}
        gameName="Prowl"
        puzzleNumber={puzzleNumber}
        won={state.won}
        moves={state.movesUsed}
        movesLimit={dailyLimit}
        score={state.shardsCollected}
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
        {coinState && <CityView state={coinState} onMove={coinMove} disabled={coinState.won || coinState.lost} />}
      </CoinModeSection>

      {showLeaderboard && <CoinLeaderboard onClose={() => setShowLeaderboard(false)} />}
    </div>
  );
}
