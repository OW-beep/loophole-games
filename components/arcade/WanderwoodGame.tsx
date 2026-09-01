'use client';

import { useMemo, useRef, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { CharacterSelect } from './CharacterSelect';
import { PlayerRig, VirtualJoystick, useMoveInput, type PlayableCharacter } from './PlayerController';
import { Ground, WorldDecor, WorldAtmosphere, Gem, SparkleBurst, generateCollectibles, type Collectible } from './ExploreWorld';

const TOTAL_GEMS = 20;
const HIGH_SCORE_KEY = 'loophole:arcade:wanderwood:best-time-ms';

function loadBestTime(): number | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(HIGH_SCORE_KEY);
  return raw ? Number(raw) : null;
}
function saveBestTime(ms: number) {
  try {
    window.localStorage.setItem(HIGH_SCORE_KEY, String(ms));
  } catch {
    // ignore
  }
}

type Status = 'select' | 'playing' | 'won';

function Scene({
  character,
  seed,
  collectibles,
  onCollect,
  joystickRef,
}: {
  character: PlayableCharacter;
  seed: number;
  collectibles: Collectible[];
  onCollect: (id: number) => void;
  joystickRef: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const playerPos = useRef(new THREE.Vector3(0, 0, 4));

  function checkPickups(pos: THREE.Vector3) {
    playerPos.current.copy(pos);
    for (const item of collectibles) {
      const dx = pos.x - item.position[0];
      const dz = pos.z - item.position[2];
      if (Math.hypot(dx, dz) < 0.55) {
        onCollect(item.id);
      }
    }
  }

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[8, 12, 6]} intensity={0.6} castShadow />
      <fog attach="fog" args={['#bfe8d8', 12, 26]} />
      <WorldAtmosphere />
      <Ground />
      <WorldDecor seed={seed} />
      {collectibles.map((item) => (
        <Gem key={item.id} item={item} onCollect={onCollect} />
      ))}
      <Suspense fallback={null}>
        <PlayerRig character={character} onMove={checkPickups} joystickRef={joystickRef} />
      </Suspense>
    </>
  );
}

export function WanderwoodGame() {
  const [status, setStatus] = useState<Status>('select');
  const [character, setCharacter] = useState<PlayableCharacter | null>(null);
  const [seed] = useState(() => Math.floor(Math.random() * 1_000_000));
  const [collectibles, setCollectibles] = useState<Collectible[]>([]);
  const [collectedCount, setCollectedCount] = useState(0);
  const [bursts, setBursts] = useState<{ id: number; position: [number, number, number]; color: string }[]>([]);
  const [startTime, setStartTime] = useState(0);
  const [finalTimeMs, setFinalTimeMs] = useState(0);
  const [bestTimeMs, setBestTimeMs] = useState<number | null>(null);
  const { setJoystick, joystickRef } = useMoveInput();

  function startGame(chosen: PlayableCharacter) {
    setCharacter(chosen);
    const gems = generateCollectibles(seed, TOTAL_GEMS);
    setCollectibles(gems);
    setCollectedCount(0);
    setBursts([]);
    setStartTime(Date.now());
    setBestTimeMs(loadBestTime());
    setStatus('playing');
  }

  function handleCollect(id: number) {
    setCollectibles((prev) => {
      const found = prev.find((g) => g.id === id);
      if (!found) return prev;
      setBursts((b) => [...b, { id: found.id, position: found.position, color: found.color }]);
      setTimeout(() => setBursts((b) => b.filter((x) => x.id !== found.id)), 700);
      const remaining = prev.filter((g) => g.id !== id);
      setCollectedCount(TOTAL_GEMS - remaining.length);
      if (remaining.length === 0) {
        const elapsed = Date.now() - startTime;
        setFinalTimeMs(elapsed);
        const prevBest = loadBestTime();
        if (prevBest === null || elapsed < prevBest) saveBestTime(elapsed);
        setStatus('won');
      }
      return remaining;
    });
  }

  const seconds = ((Date.now() - startTime) / 1000).toFixed(0);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {status === 'select' && <CharacterSelect onConfirm={startGame} />}

      {status !== 'select' && character && (
        <div className="relative rounded-2xl overflow-hidden border-4 border-black" style={{ height: 520, background: '#bfe8d8' }}>
          <Canvas shadows camera={{ position: [0, 3.4, 8], fov: 55 }} dpr={[1, 2]}>
            <Scene character={character} seed={seed} collectibles={collectibles} onCollect={handleCollect} joystickRef={joystickRef} />
            {bursts.map((b) => (
              <SparkleBurst key={b.id} position={b.position} color={b.color} />
            ))}
          </Canvas>

          {status === 'playing' && (
            <>
              <div className="absolute top-3 left-3 arcade-stat-panel px-3 py-1.5 rounded text-xs">
                GEMS <span className="text-lg ml-1" style={{ color: 'var(--arcade-yellow)' }}>{collectedCount}</span>/{TOTAL_GEMS}
              </div>
              <VirtualJoystick onChange={setJoystick} />
              <p className="absolute bottom-3 right-3 text-white/50 text-xs hidden sm:block">Arrow keys / WASD to move</p>
            </>
          )}

          {status === 'won' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/75 text-center px-6">
              <p className="text-2xl font-black" style={{ color: 'var(--arcade-yellow)' }}>
                GLADE CLEARED!
              </p>
              <p className="text-white/90">
                Time: <span className="font-black text-xl">{(finalTimeMs / 1000).toFixed(1)}s</span>
              </p>
              {bestTimeMs !== null && (
                <p className="text-white/50 text-xs">
                  Best: {(Math.min(bestTimeMs, finalTimeMs) / 1000).toFixed(1)}s
                </p>
              )}
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setStatus('select')}
                  className="arcade-cta px-6 py-2.5 rounded-full font-black"
                  style={{ background: 'var(--arcade-yellow)', color: '#141018' }}
                >
                  PLAY AGAIN
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
