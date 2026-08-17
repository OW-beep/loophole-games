'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  createInitialState,
  fire,
  totalRemaining,
  COLS,
  type CaromState,
  type FireMode,
} from '@/lib/games/carom';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { CoinLeaderboard } from '@/components/CoinLeaderboard';
import { CoinModeSection } from '@/components/CoinModeSection';
import { GAMES } from '@/lib/games/registry';
import { loadCoinBalance, saveCoinBalance, rollCoinSeed, computeCoinDelta, GLOBAL_LEADERBOARD_SLUG } from '@/lib/coin-mode';
import { getNickname, saveNickname, submitScore } from '@/lib/leaderboard-client';
import { scaleLimit, type Difficulty } from '@/lib/difficulty';

const GAME_SLUG = 'carom';
const SEG = 32;
const LANE_GAP = 1.15;
const LANE_OFFSET = ((COLS - 1) * LANE_GAP) / 2;

function lanePos(lane: number) {
  return lane * LANE_GAP - LANE_OFFSET;
}

/** A little UFO invader — same smooth, big-eyed primitive style as Bounce
 * and Croak's characters, deliberately not a harsher "space alien" look. */
function Invader({ x, y, wobbleSeed }: { x: number; y: number; wobbleSeed: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.y = y + Math.sin(clock.elapsedTime * 1.6 + wobbleSeed) * 0.05;
    ref.current.rotation.y = clock.elapsedTime * 0.5 + wobbleSeed;
  });
  return (
    <group ref={ref} position={[x, y, 0]}>
      <mesh scale={[1, 0.45, 1]}>
        <sphereGeometry args={[0.26, SEG, SEG]} />
        <meshStandardMaterial color="#4FCBBB" />
      </mesh>
      <mesh position={[0, 0.13, 0]} scale={[0.7, 0.6, 0.7]}>
        <sphereGeometry args={[0.2, SEG, SEG]} />
        <meshStandardMaterial color="#DFF7F2" transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, 0.15, 0.14]}>
        <sphereGeometry args={[0.075, SEG, SEG]} />
        <meshStandardMaterial color="#20241F" />
      </mesh>
      <mesh position={[0.022, 0.17, 0.185]}>
        <sphereGeometry args={[0.022, 10, 10]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
    </group>
  );
}

function Shield({ x }: { x: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const mat = ref.current.material as THREE.MeshStandardMaterial;
    mat.opacity = 0.35 + Math.sin(clock.elapsedTime * 2) * 0.08;
  });
  return (
    <mesh ref={ref} position={[x, -0.05, 0.32]}>
      <boxGeometry args={[0.9, 0.5, 0.06]} />
      <meshStandardMaterial color="#2FB6A8" transparent opacity={0.4} />
    </mesh>
  );
}

function Cannon({ lane, mode }: { lane: number; mode: FireMode }) {
  return (
    <group position={[lanePos(lane), -0.85, 0]}>
      <mesh>
        <cylinderGeometry args={[0.22, 0.28, 0.22, SEG]} />
        <meshStandardMaterial color={mode === 'bank' ? '#2FB6A8' : '#4A5568'} />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.3, 16]} />
        <meshStandardMaterial color="#2B2230" />
      </mesh>
    </group>
  );
}

function TrajectoryPreview({ lane, mode }: { lane: number; mode: FireMode }) {
  const targetLane = mode === 'direct' ? lane : COLS - 1 - lane;
  const start = new THREE.Vector3(lanePos(lane), -0.7, 0);
  if (mode === 'direct') {
    const end = new THREE.Vector3(lanePos(lane), 1.4, 0);
    return <Line points={[start, end]} color="#4A5568" />;
  }
  const wallX = lane < targetLane ? -LANE_OFFSET - 0.6 : LANE_OFFSET + 0.6;
  const bounce = new THREE.Vector3(wallX, 0.1, 0);
  const end = new THREE.Vector3(lanePos(targetLane), 1.4, 0);
  return <Line points={[start, bounce, end]} color="#2FB6A8" />;
}

function Line({ points, color }: { points: THREE.Vector3[]; color: string }) {
  const geomRef = useRef<THREE.BufferGeometry>(null);
  useEffect(() => {
    geomRef.current?.setFromPoints(points);
  }, [points]);
  return (
    <line>
      <bufferGeometry ref={geomRef} />
      <lineDashedMaterial color={color} dashSize={0.12} gapSize={0.08} linewidth={1} />
    </line>
  );
}

function ArenaScene({ state, aimLane, aimMode }: { state: CaromState; aimLane: number; aimMode: FireMode }) {
  return (
    <Canvas camera={{ position: [0, 1.2, 4.6], fov: 42 }}>
      <ambientLight intensity={0.95} />
      <directionalLight position={[4, 6, 4]} intensity={0.85} />
      {state.lanes.map((l, lane) => (
        <group key={lane}>
          {Array.from({ length: l.count }).map((_, row) => (
            <Invader key={row} x={lanePos(lane)} y={0.9 - row * 0.5} wobbleSeed={lane * 3 + row} />
          ))}
          {l.shielded && l.count > 0 && <Shield x={lanePos(lane)} />}
        </group>
      ))}
      {!state.won && !state.lost && <TrajectoryPreview lane={aimLane} mode={aimMode} />}
      <Cannon lane={aimLane} mode={aimMode} />
    </Canvas>
  );
}

function BattleView({
  state,
  aimLane,
  aimMode,
  onAimLane,
  onAimMode,
  onFire,
  disabled,
}: {
  state: CaromState;
  aimLane: number;
  aimMode: FireMode;
  onAimLane: (lane: number) => void;
  onAimMode: (mode: FireMode) => void;
  onFire: () => void;
  disabled: boolean;
}) {
  const remaining = totalRemaining(state);
  return (
    <div>
      <div className="stat-line flex justify-between text-ink/50 dark:text-white/40 mb-3">
        <span>
          Invaders left: <span className="font-mono text-ink dark:text-white">{remaining}</span>
        </span>
        <span>
          Shots: <span className="font-mono text-ink dark:text-white">{state.shotBudget - state.shotsUsed}</span> left
        </span>
      </div>

      <div
        className="rounded-lg border-2 border-graphite dark:border-white/70 mb-3 mx-auto"
        style={{ width: '100%', maxWidth: 380, height: 260 }}
      >
        <ArenaScene state={state} aimLane={aimLane} aimMode={aimMode} />
      </div>

      {state.lastShot && (
        <p className="stat-line text-center mb-3" style={{ color: state.lastShot.hit ? '#2FB6A8' : '#B23B3B' }}>
          {state.lastShot.mode === 'bank' ? 'Bank' : 'Direct'} from lane {state.lastShot.lane + 1} \u2192 lane{' '}
          {state.lastShot.targetLane + 1}: {state.lastShot.hit ? 'Hit' : state.lastShot.mode === 'direct' ? 'Blocked by shield' : 'Empty lane'}
        </p>
      )}

      <div className="flex justify-center gap-1.5 mb-3">
        {state.lanes.map((l, lane) => (
          <button
            key={lane}
            onClick={() => onAimLane(lane)}
            disabled={disabled}
            className={[
              'w-12 h-12 rounded-md border-2 flex flex-col items-center justify-center font-mono text-xs disabled:opacity-30 transition-colors',
              aimLane === lane ? 'border-carom bg-carom-soft dark:bg-carom/20' : 'border-graphite/40 dark:border-white/25',
            ].join(' ')}
          >
            <span>{l.count}</span>
            {l.shielded && <span className="text-[9px]">🛡</span>}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <button
          onClick={() => onAimMode('direct')}
          disabled={disabled}
          className={[
            'stat-line border-2 rounded-lg py-2 disabled:opacity-30 transition-colors',
            aimMode === 'direct' ? 'border-graphite dark:border-white/80 bg-graphite text-paper dark:bg-white dark:text-graphite' : 'border-graphite/40 dark:border-white/25',
          ].join(' ')}
        >
          Direct
        </button>
        <button
          onClick={() => onAimMode('bank')}
          disabled={disabled}
          className={[
            'stat-line border-2 rounded-lg py-2 disabled:opacity-30 transition-colors',
            aimMode === 'bank' ? 'border-carom bg-carom text-white' : 'border-graphite/40 dark:border-white/25',
          ].join(' ')}
        >
          Bank
        </button>
      </div>

      <button
        onClick={onFire}
        disabled={disabled}
        className="stat-line w-full border-2 border-graphite dark:border-white/80 rounded-lg py-2.5 disabled:opacity-30 hover:bg-graphite hover:text-paper dark:hover:bg-white dark:hover:text-graphite transition-colors"
      >
        Fire
      </button>
    </div>
  );
}

export function CaromBoard({ seed, dateString, puzzleNumber }: { seed: number; dateString: string; puzzleNumber: number }) {
  const game = GAMES.find((g) => g.slug === GAME_SLUG)!;

  // --- Daily battle (unchanged behavior) ---
  const [state, setState] = useState<CaromState>(() => createInitialState(seed));
  const [aimLane, setAimLane] = useState(0);
  const [aimMode, setAimMode] = useState<FireMode>('direct');
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);

  const dailyFinished = state.won || state.lost;

  function handleFire() {
    if (dailyFinished) return;
    setState((prev) => fire(prev, aimLane, aimMode));
  }

  useEffect(() => {
    if ((state.won || state.lost) && !finishedRef.current) {
      finishedRef.current = true;
      recordResult(GAME_SLUG, {
        date: dateString,
        won: state.won,
        moves: state.shotsUsed,
        score: state.shotBudget - state.shotsUsed,
        elapsedMs: 0,
      });
      setStreak(getStreak(GAME_SLUG).current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.shotsUsed, state.shotBudget, dateString]);

  // --- Coin Mode ---
  const [coins, setCoins] = useState<number>(() => loadCoinBalance());
  const [coinState, setCoinState] = useState<CaromState | null>(null);
  const [coinAimLane, setCoinAimLane] = useState(0);
  const [coinAimMode, setCoinAimMode] = useState<FireMode>('direct');
  const [nickname, setNicknameState] = useState<string>(() => getNickname());
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const coinRoundSettledRef = useRef(false);
  const [lastCoinDelta, setLastCoinDelta] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');

  function startCoinRound() {
    coinRoundSettledRef.current = false;
    setCoinAimLane(0);
    setCoinAimMode('direct');
    const fresh = createInitialState(rollCoinSeed());
    setCoinState({ ...fresh, shotBudget: scaleLimit(fresh.shotBudget, difficulty, totalRemaining(fresh)) });
  }

  function coinFire() {
    if (!coinState || coinState.won || coinState.lost) return;
    setCoinState((prev) => (prev ? fire(prev, coinAimLane, coinAimMode) : prev));
  }

  useEffect(() => {
    if (!coinState || coinRoundSettledRef.current) return;
    if (!coinState.won && !coinState.lost) return;
    coinRoundSettledRef.current = true;

    const delta = computeCoinDelta({
      won: coinState.won,
      movesUsed: coinState.shotsUsed,
      movesLimit: coinState.shotBudget,
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

  return (
    <div>
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.shotsUsed} movesLimit={state.shotBudget} />

      <p className="stat-line text-center text-ink/50 dark:text-white/40 mb-3">
        Shielded lanes block Direct fire. Bank fire from the mirror lane gets through anyway.
      </p>

      <BattleView
        state={state}
        aimLane={aimLane}
        aimMode={aimMode}
        onAimLane={setAimLane}
        onAimMode={setAimMode}
        onFire={handleFire}
        disabled={dailyFinished}
      />

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug={GAME_SLUG}
        gameName="Carom"
        puzzleNumber={puzzleNumber}
        won={state.won}
        moves={state.shotsUsed}
        movesLimit={state.shotBudget}
        score={state.shotBudget - state.shotsUsed}
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
        {coinState && (
          <BattleView
            state={coinState}
            aimLane={coinAimLane}
            aimMode={coinAimMode}
            onAimLane={setCoinAimLane}
            onAimMode={setCoinAimMode}
            onFire={coinFire}
            disabled={coinState.won || coinState.lost}
          />
        )}
      </CoinModeSection>

      {showLeaderboard && <CoinLeaderboard onClose={() => setShowLeaderboard(false)} />}
    </div>
  );
}
