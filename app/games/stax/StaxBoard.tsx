'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  resolveDrop,
  speedForLevel,
  amplitudeForLevel,
  BASE_WIDTH,
  TARGET_HEIGHT,
  type StaxLayer,
} from '@/lib/games/stax';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { CoinLeaderboard } from '@/components/CoinLeaderboard';
import { CoinModeSection } from '@/components/CoinModeSection';
import { GAMES } from '@/lib/games/registry';
import { loadCoinBalance, saveCoinBalance, rollCoinSeed, computeCoinDelta, GLOBAL_LEADERBOARD_SLUG } from '@/lib/coin-mode';
import { getNickname, saveNickname, submitScore } from '@/lib/leaderboard-client';

const GAME_SLUG = 'stax';
type Status = 'ready' | 'playing' | 'won' | 'lost';
type Mode = 'daily' | 'coin';

const LAYER_HEIGHT = 0.45;
const DEPTH = 1.1;

function layerColor(level: number, hueShift: number) {
  const hue = (level * 27 + hueShift) % 360;
  return new THREE.Color(`hsl(${hue}, 72%, 58%)`).getStyle();
}

interface Chip {
  id: number;
  center: number;
  width: number;
  y: number;
  color: string;
  bornAt: number;
}

function ChipMesh({ chip }: { chip: Chip }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const m = ref.current;
    if (!m) return;
    const t = (performance.now() - chip.bornAt) / 1000;
    m.position.y = chip.y - t * t * 4;
    m.position.x = chip.center + t * 0.6;
    m.rotation.z = t * 3;
  });
  return (
    <mesh ref={ref} position={[chip.center, chip.y, 0]}>
      <boxGeometry args={[Math.max(0.05, chip.width), LAYER_HEIGHT * 0.9, DEPTH]} />
      <meshStandardMaterial color={chip.color} />
    </mesh>
  );
}

function Tower({ layers, hueShift }: { layers: StaxLayer[]; hueShift: number }) {
  return (
    <>
      {layers.map((l, i) => (
        <mesh key={i} position={[l.center, i * LAYER_HEIGHT, 0]}>
          <boxGeometry args={[Math.max(0.05, l.width), LAYER_HEIGHT * 0.9, DEPTH]} />
          <meshStandardMaterial color={layerColor(i, hueShift)} />
        </mesh>
      ))}
    </>
  );
}

function MovingBlock({
  y,
  width,
  speed,
  amplitude,
  color,
  spawnAt,
  centerRef,
}: {
  y: number;
  width: number;
  speed: number;
  amplitude: number;
  color: string;
  spawnAt: number;
  centerRef: React.MutableRefObject<number>;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const t = (performance.now() - spawnAt) / 1000;
    const x = Math.sin(t * speed) * amplitude;
    centerRef.current = x;
    if (ref.current) ref.current.position.set(x, y, 0);
  });
  return (
    <mesh ref={ref} position={[0, y, 0]}>
      <boxGeometry args={[Math.max(0.05, width), LAYER_HEIGHT * 0.9, DEPTH]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function CameraRig({ targetHeight }: { targetHeight: number }) {
  const { camera } = useThree();
  useFrame(() => {
    const desiredY = 1.6 + targetHeight * LAYER_HEIGHT;
    camera.position.y += (desiredY - camera.position.y) * 0.08;
    camera.position.x += (3.6 - camera.position.x) * 0.08;
    camera.position.z += (3.8 - camera.position.z) * 0.08;
    camera.lookAt(0, targetHeight * LAYER_HEIGHT * 0.7, 0);
  });
  return null;
}

export function StaxBoard({ seed, dateString, puzzleNumber }: { seed: number; dateString: string; puzzleNumber: number }) {
  const game = GAMES.find((g) => g.slug === GAME_SLUG)!;
  const hueShift = seed % 360;

  const modeRef = useRef<Mode>('daily');
  const activeSeedRef = useRef(seed);
  const statusRef = useRef<Status>('ready');
  const finishedRef = useRef(false);
  const movingCenterRef = useRef(0);
  const spawnAtRef = useRef(performance.now());
  const chipIdRef = useRef(0);

  const [status, setStatus] = useState<Status>('ready');
  const [layers, setLayers] = useState<StaxLayer[]>([{ center: 0, width: BASE_WIDTH }]);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [chips, setChips] = useState<Chip[]>([]);
  const [popText, setPopText] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [streak, setStreak] = useState(0);

  // --- Coin Mode ---
  const [coins, setCoins] = useState<number>(() => loadCoinBalance());
  const [dailyDone, setDailyDone] = useState(false);
  const [coinRoundActive, setCoinRoundActive] = useState(false);
  const [lastCoinDelta, setLastCoinDelta] = useState(0);
  const [nickname, setNicknameState] = useState<string>(() => getNickname());
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  function handleSaveNickname(name: string) {
    saveNickname(name);
    setNicknameState(name);
  }

  const level = layers.length - 1;
  const topLayer = layers[layers.length - 1];
  const movingWidth = topLayer.width;
  const speed = speedForLevel(level);
  const amplitude = amplitudeForLevel(level);
  const movingY = level * LAYER_HEIGHT;
  const movingColor = layerColor(level, hueShift);

  const resetRun = useCallback(() => {
    finishedRef.current = false;
    setLayers([{ center: 0, width: BASE_WIDTH }]);
    setCombo(0);
    setChips([]);
    setPopText(null);
    setShowResult(false);
    spawnAtRef.current = performance.now();
    statusRef.current = 'ready';
    setStatus('ready');
  }, []);

  const startCoinRound = useCallback(() => {
    activeSeedRef.current = rollCoinSeed();
    modeRef.current = 'coin';
    setCoinRoundActive(true);
    resetRun();
  }, [resetRun]);

  const finish = useCallback(
    (won: boolean, finalLevel: number) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      statusRef.current = won ? 'won' : 'lost';
      setStatus(statusRef.current);

      if (modeRef.current === 'daily') {
        recordResult(GAME_SLUG, {
          date: dateString,
          won,
          moves: finalLevel,
          score: finalLevel,
          elapsedMs: 0,
        });
        setStreak(getStreak(GAME_SLUG).current);
        setShowResult(true);
        setDailyDone(true);
      } else {
        const delta = computeCoinDelta({ won, movesUsed: finalLevel, movesLimit: TARGET_HEIGHT });
        setLastCoinDelta(delta);
        setCoins((prev) => {
          const next = Math.max(0, prev + delta);
          saveCoinBalance(next);
          if (nickname) submitScore(GLOBAL_LEADERBOARD_SLUG, nickname, next);
          return next;
        });
      }
    },
    [dateString, nickname]
  );

  const handleDrop = useCallback(() => {
    if (statusRef.current === 'ready') {
      statusRef.current = 'playing';
      setStatus('playing');
      spawnAtRef.current = performance.now();
      return;
    }
    if (statusRef.current !== 'playing') return;

    const outcome = resolveDrop(topLayer, movingCenterRef.current, movingWidth, combo);

    if (outcome.cutWidth > 0.001) {
      const id = chipIdRef.current++;
      const chip: Chip = {
        id,
        center: outcome.cutCenter,
        width: outcome.cutWidth,
        y: movingY,
        color: movingColor,
        bornAt: performance.now(),
      };
      setChips((prev) => [...prev, chip]);
      setTimeout(() => setChips((prev) => prev.filter((c) => c.id !== id)), 900);
    }

    if (!outcome.layer) {
      finish(false, level);
      return;
    }

    setCombo(outcome.combo);
    setBestCombo((b) => Math.max(b, outcome.combo));
    if (outcome.perfect && outcome.combo >= 2) {
      setPopText(outcome.combo >= 5 ? 'AMAZING!' : 'PERFECT!');
      setTimeout(() => setPopText(null), 700);
    }

    const nextLayers = [...layers, outcome.layer];
    setLayers(nextLayers);
    spawnAtRef.current = performance.now();

    if (nextLayers.length - 1 >= TARGET_HEIGHT) {
      finish(true, nextLayers.length - 1);
    }
  }, [topLayer, movingWidth, combo, layers, level, movingY, movingColor, finish]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === 'Space') {
        e.preventDefault();
        handleDrop();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleDrop]);

  return (
    <div>
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={level} movesLimit={TARGET_HEIGHT} />

      <p className="stat-line text-center text-ink/50 dark:text-white/40 mb-3">
        Tap, click, or press space to drop the block. Perfect landings build a combo.
      </p>

      <div className="relative">
        <div
          onClick={handleDrop}
          className="rounded-lg border-2 border-graphite dark:border-white/70 mb-2 mx-auto cursor-pointer overflow-hidden"
          style={{ width: '100%', maxWidth: 380, height: 320, background: 'linear-gradient(to top, #FFE3DB, #BFE3F5)' }}
        >
          <Canvas camera={{ position: [3.6, 2, 3.8], fov: 42 }}>
            <ambientLight intensity={0.9} />
            <directionalLight position={[5, 8, 4]} intensity={0.85} />
            <CameraRig targetHeight={level} />
            <Tower layers={layers} hueShift={hueShift} />
            {chips.map((c) => (
              <ChipMesh key={c.id} chip={c} />
            ))}
            {status !== 'won' && status !== 'lost' && (
              <MovingBlock
                y={movingY}
                width={movingWidth}
                speed={speed}
                amplitude={amplitude}
                color={movingColor}
                spawnAt={spawnAtRef.current}
                centerRef={movingCenterRef}
              />
            )}
          </Canvas>
        </div>

        {popText && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 font-display font-bold text-2xl text-white drop-shadow-lg animate-punch-pop pointer-events-none">
            {popText}
          </div>
        )}

        {status === 'ready' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="stat-line text-white bg-graphite/80 px-3 py-2 rounded">Tap to drop the first block</p>
          </div>
        )}
      </div>

      <div className="stat-line flex justify-center gap-5 text-ink/50 dark:text-white/40 mb-3">
        <span>
          Height: <span className="font-mono text-ink dark:text-white">{level}</span>/{TARGET_HEIGHT}
        </span>
        <span>
          Combo: <span className="font-mono text-ink dark:text-white">{combo}</span>
        </span>
        <span>
          Best: <span className="font-mono text-ink dark:text-white">{bestCombo}</span>
        </span>
      </div>

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug={GAME_SLUG}
        gameName="Stax"
        puzzleNumber={puzzleNumber}
        won={status === 'won'}
        moves={level}
        movesLimit={TARGET_HEIGHT}
        score={level}
        streak={streak}
      />

      {dailyDone && (
        <CoinModeSection
          coins={coins}
          nickname={nickname}
          onSaveNickname={handleSaveNickname}
          roundActive={coinRoundActive}
          roundFinished={coinRoundActive && modeRef.current === 'coin' && (status === 'won' || status === 'lost')}
          roundWon={status === 'won'}
          lastDelta={lastCoinDelta}
          onStart={startCoinRound}
          onShowLeaderboard={() => setShowLeaderboard(true)}
        />
      )}

      {showLeaderboard && <CoinLeaderboard onClose={() => setShowLeaderboard(false)} />}
    </div>
  );
}
