'use client';

import { useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { AnimalCharacter } from './AnimalCharacter';
import { BridgeWorld, generateBridge, LANE_X, ROW_SPACING, TOTAL_ROWS, type BridgeRow } from './BridgeWorld';

const HIGH_SCORE_KEY = 'loophole:arcade:yokai-bridge:best-hops-ms';

function loadBest(): number | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(HIGH_SCORE_KEY);
  return raw ? Number(raw) : null;
}
function saveBest(ms: number) {
  try {
    window.localStorage.setItem(HIGH_SCORE_KEY, String(ms));
  } catch {
    // ignore
  }
}

type Status = 'ready' | 'playing' | 'fallen' | 'won';

interface HopState {
  row: number;
  lane: number;
  fromRow: number;
  fromLane: number;
  progress: number; // 0..1 of the current hop animation, 1 = settled
}

function Firefly({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.12;
      ref.current.position.x = position[0] + Math.cos(state.clock.elapsedTime * 1.4 + position[2]) * 0.08;
    }
  });
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.045, 16, 16]} />
      <meshStandardMaterial color="#D8F7A0" emissive="#D8F7A0" emissiveIntensity={1.6} toneMapped={false} />
      <pointLight color="#D8F7A0" intensity={0.35} distance={0.9} />
    </mesh>
  );
}

function PlayerAndCamera({
  hop,
  status,
  fallStartRef,
}: {
  hop: HopState;
  status: Status;
  fallStartRef: React.MutableRefObject<number | null>;
}) {
  const group = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const speedRef = useRef(0);

  useFrame((_, delta) => {
    if (!group.current) return;

    if (status === 'fallen') {
      if (fallStartRef.current === null) fallStartRef.current = performance.now();
      const elapsed = (performance.now() - fallStartRef.current) / 1000;
      group.current.position.y = -elapsed * elapsed * 2.2;
      group.current.rotation.x += delta * 2;
      speedRef.current = 0;
    } else {
      const fromX = LANE_X[hop.fromLane];
      const toX = LANE_X[hop.lane];
      const fromZ = -(hop.fromRow * ROW_SPACING);
      const toZ = -(hop.row * ROW_SPACING);
      const p = hop.progress;
      group.current.position.x = THREE.MathUtils.lerp(fromX, toX, p);
      group.current.position.z = THREE.MathUtils.lerp(fromZ, toZ, p);
      group.current.position.y = Math.sin(Math.PI * p) * 0.28;
      speedRef.current = p < 1 ? 1 : 0;
    }

    const behind = new THREE.Vector3(group.current.position.x * 0.4, 2.6, group.current.position.z + 3.4);
    camera.position.lerp(behind, Math.min(1, delta * 5));
    camera.lookAt(group.current.position.x * 0.4, 0.4, group.current.position.z - 1.2);
  });

  return (
    <group ref={group}>
      <AnimalCharacterSpeedWrapper speedRef={speedRef} />
    </group>
  );
}

function AnimalCharacterSpeedWrapper({ speedRef }: { speedRef: React.MutableRefObject<number> }) {
  const [, force] = useState(0);
  useFrame(() => force((v) => (v + 1) % 1000000));
  return <AnimalCharacter species="tanuki" speed={speedRef.current} />;
}

function Scene({
  rows,
  hop,
  status,
  fallStartRef,
  fireflies,
}: {
  rows: BridgeRow[];
  hop: HopState;
  status: Status;
  fallStartRef: React.MutableRefObject<number | null>;
  fireflies: [number, number, number][];
}) {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 3]} intensity={0.4} color="#BFD0FF" castShadow />
      <fog attach="fog" args={['#1c2438', 8, 24]} />
      <Environment preset="night" environmentIntensity={0.3} />
      <ContactShadows position={[0, 0.001, 0]} opacity={0.4} scale={20} blur={2} far={3} />
      <BridgeWorld rows={rows} />
      {fireflies.map((pos, i) => (
        <Firefly key={i} position={pos} />
      ))}
      <Suspense fallback={null}>
        <PlayerAndCamera hop={hop} status={status} fallStartRef={fallStartRef} />
      </Suspense>
    </>
  );
}

export function YokaiBridgeGame() {
  const [seed] = useState(() => Math.floor(Math.random() * 1_000_000));
  const rows = useMemo(() => generateBridge(seed), [seed]);
  const fireflies = useMemo(() => {
    const rng = (() => {
      let a = seed + 555;
      return () => {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    })();
    return Array.from({ length: 8 }, () => {
      const row = 4 + Math.floor(rng() * (TOTAL_ROWS - 8));
      const side = rng() > 0.5 ? 1 : -1;
      return [side * 1.0, 0.5 + rng() * 0.3, -(row * ROW_SPACING)] as [number, number, number];
    });
  }, [seed]);

  const [status, setStatus] = useState<Status>('ready');
  const [hop, setHop] = useState<HopState>({ row: 0, lane: 1, fromRow: 0, fromLane: 1, progress: 1 });
  const [hops, setHops] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [finalTimeMs, setFinalTimeMs] = useState(0);
  const [best, setBest] = useState<number | null>(null);
  const fallStartRef = useRef<number | null>(null);
  const busyRef = useRef(false);

  function startGame() {
    setHop({ row: 0, lane: 1, fromRow: 0, fromLane: 1, progress: 1 });
    setHops(0);
    setStatus('playing');
    setStartTime(Date.now());
    setBest(loadBest());
    fallStartRef.current = null;
    busyRef.current = false;
  }

  function shiftLane(dir: -1 | 1) {
    if (status !== 'playing' || busyRef.current) return;
    setHop((prev) => {
      const nextLane = Math.min(2, Math.max(0, prev.lane + dir));
      return { ...prev, fromLane: prev.lane, lane: nextLane, fromRow: prev.row, progress: 1 };
    });
  }

  function hopForward() {
    if (status !== 'playing' || busyRef.current) return;
    setHop((prev) => {
      const nextRow = Math.min(rows.length - 1, prev.row + 1);
      if (nextRow === prev.row) return prev;
      busyRef.current = true;
      return { row: nextRow, lane: prev.lane, fromRow: prev.row, fromLane: prev.lane, progress: 0 };
    });
  }

  // animate the current hop's progress toward 1, then resolve fall/landing/win
  useEffect(() => {
    if (hop.progress >= 1) return;
    let raf: number;
    const start = performance.now();
    const duration = 260;
    function tick(now: number) {
      const p = Math.min(1, (now - start) / duration);
      setHop((prev) => ({ ...prev, progress: p }));
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        busyRef.current = false;
        const landedRow = rows[hop.row];
        setHops((h) => h + 1);
        if (!landedRow.lanes[hop.lane]) {
          setStatus('fallen');
        } else if (hop.row === rows.length - 1) {
          const elapsed = Date.now() - startTime;
          setFinalTimeMs(elapsed);
          const prevBest = loadBest();
          if (prevBest === null || elapsed < prevBest) saveBest(elapsed);
          setStatus('won');
        }
      }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hop.row, hop.lane]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') shiftLane(-1);
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') shiftLane(1);
      if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w' || e.key === ' ') hopForward();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative rounded-2xl overflow-hidden border-4 border-black" style={{ height: 520, background: '#1c2438' }}>
        <Canvas shadows camera={{ position: [0, 2.6, 3.4], fov: 50 }} dpr={[1, 2]}>
          <Scene rows={rows} hop={hop} status={status} fallStartRef={fallStartRef} fireflies={fireflies} />
        </Canvas>

        <div className="absolute top-3 left-3 arcade-stat-panel px-3 py-1.5 rounded text-xs">
          STEP <span className="text-lg ml-1" style={{ color: 'var(--arcade-yellow)' }}>{hop.row}</span>/{rows.length - 1}
        </div>

        {status === 'playing' && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
            <button
              onClick={() => shiftLane(-1)}
              className="w-12 h-12 rounded-full bg-white/15 border-2 border-white/40 text-white text-xl font-bold active:scale-90 transition-transform"
            >
              ←
            </button>
            <button
              onClick={hopForward}
              className="px-6 h-12 rounded-full font-black active:scale-95 transition-transform"
              style={{ background: 'var(--arcade-yellow)', color: '#141018' }}
            >
              HOP
            </button>
            <button
              onClick={() => shiftLane(1)}
              className="w-12 h-12 rounded-full bg-white/15 border-2 border-white/40 text-white text-xl font-bold active:scale-90 transition-transform"
            >
              →
            </button>
          </div>
        )}
        {status === 'playing' && (
          <p className="absolute top-3 right-3 text-white/40 text-xs hidden sm:block">←/→ shift · ↑ or space to hop</p>
        )}

        {status !== 'playing' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/75 text-center px-6">
            {status === 'ready' && (
              <>
                <p className="text-white/80 text-sm max-w-xs">
                  A little tanuki-yokai has to cross the old bridge tonight. Some planks are missing — shift lanes
                  and hop your way across to the torii on the far side.
                </p>
                <button
                  onClick={startGame}
                  className="arcade-cta px-8 py-3 rounded-full font-black text-lg"
                  style={{ background: 'var(--arcade-yellow)', color: '#141018' }}
                >
                  START CROSSING
                </button>
              </>
            )}
            {status === 'fallen' && (
              <>
                <p className="text-2xl font-black" style={{ color: 'var(--arcade-pink)' }}>
                  INTO THE MIST!
                </p>
                <p className="text-white/70 text-sm max-w-xs">
                  No harm done — the mist is soft. You made it {hop.row} step{hop.row === 1 ? '' : 's'} before a
                  gap caught you.
                </p>
                <button
                  onClick={startGame}
                  className="arcade-cta px-6 py-2.5 rounded-full font-black mt-2"
                  style={{ background: 'var(--arcade-yellow)', color: '#141018' }}
                >
                  TRY AGAIN
                </button>
              </>
            )}
            {status === 'won' && (
              <>
                <p className="text-2xl font-black" style={{ color: 'var(--arcade-yellow)' }}>
                  YOU REACHED THE SHRINE!
                </p>
                <p className="text-white/90">
                  Time: <span className="font-black text-xl">{(finalTimeMs / 1000).toFixed(1)}s</span> in{' '}
                  <span className="font-black">{hops}</span> hops
                </p>
                {best !== null && (
                  <p className="text-white/50 text-xs">Best: {(Math.min(best, finalTimeMs) / 1000).toFixed(1)}s</p>
                )}
                <button
                  onClick={startGame}
                  className="arcade-cta px-6 py-2.5 rounded-full font-black mt-2"
                  style={{ background: 'var(--arcade-yellow)', color: '#141018' }}
                >
                  CROSS AGAIN
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
