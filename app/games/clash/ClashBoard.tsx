'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  createInitialState,
  applyAction,
  TURN_BUDGET,
  HERO_MAX_HP,
  SPECIAL_COOLDOWN,
  type ClashState,
  type Action,
} from '@/lib/games/clash';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { CoinLeaderboard } from '@/components/CoinLeaderboard';
import { CoinModeSection } from '@/components/CoinModeSection';
import { GAMES } from '@/lib/games/registry';
import { loadCoinBalance, saveCoinBalance, rollCoinSeed, computeCoinDelta, GLOBAL_LEADERBOARD_SLUG } from '@/lib/coin-mode';
import { getNickname, saveNickname, submitScore } from '@/lib/leaderboard-client';
import { scaleLimit, type Difficulty } from '@/lib/difficulty';

const GAME_SLUG = 'clash';
const SEG = 32;

/** Chibi knight: big round head, tiny body, a simple helmet, round
 * shield, and a stubby sword — all smooth Three.js primitives. Reacts to
 * damage with a quick red flash + squash. */
function Hero({ hitPulse }: { hitPulse: number }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(() => {
    const g = groupRef.current;
    if (!g) return;
    const age = (performance.now() - hitPulse) / 220;
    const s = age < 1 ? 1 - Math.sin(Math.min(1, age) * Math.PI) * 0.12 : 1;
    g.scale.set(1 / s, s, 1 / s);
  });
  return (
    <group ref={groupRef} position={[-1.1, 0, 0]}>
      <mesh position={[0, 0.16, 0]} scale={[0.85, 0.7, 0.85]}>
        <sphereGeometry args={[0.2, SEG, SEG]} />
        <meshStandardMaterial color="#4B5AB0" />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <sphereGeometry args={[0.28, SEG, SEG]} />
        <meshStandardMaterial color="#F3C7A0" />
      </mesh>
      {/* helmet */}
      <mesh position={[0, 0.5, -0.02]} scale={[1.05, 0.75, 1.05]}>
        <sphereGeometry args={[0.3, SEG, SEG]} />
        <meshStandardMaterial color="#8B95AE" />
      </mesh>
      {/* eyes */}
      {[-0.11, 0.11].map((x) => (
        <mesh key={x} position={[x, 0.42, 0.26]}>
          <sphereGeometry args={[0.045, 16, 16]} />
          <meshStandardMaterial color="#2B2230" />
        </mesh>
      ))}
      {/* shield */}
      <mesh position={[-0.32, 0.2, 0.1]} rotation={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.05, SEG]} />
        <meshStandardMaterial color="#D9B24C" />
      </mesh>
      {/* sword */}
      <mesh position={[0.3, 0.22, 0.12]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[0.06, 0.32, 0.06]} />
        <meshStandardMaterial color="#C7CCD6" />
      </mesh>
    </group>
  );
}

/** A round slime monster — squashes idly, flashes and shrinks as its HP
 * drops so the fight's progress reads visually, not just numerically. */
function Slime({ hpRatio, hitPulse }: { hpRatio: number; hitPulse: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const idleRef = useRef(0);
  useFrame((_, delta) => {
    const g = groupRef.current;
    if (!g) return;
    idleRef.current += delta;
    const idle = 1 + Math.sin(idleRef.current * 2.2) * 0.03;
    const age = (performance.now() - hitPulse) / 220;
    const hitSquash = age < 1 ? 1 - Math.sin(Math.min(1, age) * Math.PI) * 0.18 : 1;
    const s = idle * hitSquash;
    g.scale.set((1 / s) * hpScale(hpRatio), s * hpScale(hpRatio), (1 / s) * hpScale(hpRatio));
  });
  return (
    <group ref={groupRef} position={[1.1, 0, 0]}>
      <mesh position={[0, 0.22, 0]}>
        <sphereGeometry args={[0.32, SEG, SEG]} />
        <meshStandardMaterial color="#6FBF6F" transparent opacity={0.92} />
      </mesh>
      {[-0.1, 0.1].map((x) => (
        <group key={x} position={[x, 0.3, 0.24]}>
          <mesh>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial color="#20241F" />
          </mesh>
          <mesh position={[0.015, 0.02, 0.04]}>
            <sphereGeometry args={[0.018, 10, 10]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function hpScale(ratio: number) {
  return 0.65 + 0.35 * Math.max(0, ratio);
}

function BattleScene({ state }: { state: ClashState }) {
  const heroHitRef = useRef(0);
  const slimeHitRef = useRef(0);
  const prevTurnRef = useRef(state.turnIndex);

  useEffect(() => {
    if (state.turnIndex !== prevTurnRef.current) {
      const lastLog = state.log[state.log.length - 1];
      if (lastLog) {
        if (lastLog.taken > 0) heroHitRef.current = performance.now();
        if (lastLog.dealt > 0) slimeHitRef.current = performance.now();
      }
      prevTurnRef.current = state.turnIndex;
    }
  }, [state.turnIndex, state.log]);

  return (
    <Canvas camera={{ position: [0, 1.4, 3.2], fov: 42 }}>
      <ambientLight intensity={0.95} />
      <directionalLight position={[4, 6, 4]} intensity={0.85} />
      <Hero hitPulse={heroHitRef.current} />
      <Slime hpRatio={state.enemyHp / state.enemyMaxHp} hitPulse={slimeHitRef.current} />
    </Canvas>
  );
}

function HpBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="flex-1">
      <p className="stat-line text-ink/40 dark:text-white/30 mb-1">
        {label} {value}/{max}
      </p>
      <div className="h-2.5 rounded-full bg-index dark:bg-index-dark overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function SequenceRow({ state, turnBudget }: { state: ClashState; turnBudget: number }) {
  return (
    <div className="flex gap-1.5 justify-center flex-wrap mb-4">
      {state.incoming.map((hit, i) => {
        const resolved = i < state.turnIndex;
        const isNext = i === state.turnIndex;
        return (
          <div
            key={i}
            className={[
              'w-9 h-9 rounded-md flex items-center justify-center font-mono text-sm font-bold border-2',
              resolved
                ? 'border-index dark:border-index-dark text-ink/25 dark:text-white/20 line-through'
                : isNext
                  ? 'border-clash bg-clash-soft dark:bg-clash/20 text-clash'
                  : 'border-graphite/30 dark:border-white/20 text-ink/60 dark:text-white/50',
            ].join(' ')}
          >
            {hit}
          </div>
        );
      })}
      {Array.from({ length: Math.max(0, turnBudget - state.incoming.length) }).map((_, i) => (
        <div key={`pad-${i}`} className="w-9 h-9" />
      ))}
    </div>
  );
}

function BattleView({
  state,
  turnBudget,
  onAction,
  disabled,
}: {
  state: ClashState;
  turnBudget: number;
  onAction: (a: Action) => void;
  disabled: boolean;
}) {
  const nextHit = state.incoming[state.turnIndex];
  return (
    <div>
      <div className="flex gap-4 mb-3">
        <HpBar label="YOU" value={state.heroHp} max={HERO_MAX_HP} color="#5A6ACF" />
        <HpBar label="SLIME" value={state.enemyHp} max={state.enemyMaxHp} color="#6FBF6F" />
      </div>

      <div
        className="rounded-lg border-2 border-graphite dark:border-white/70 mb-3 mx-auto"
        style={{ width: '100%', maxWidth: 380, height: 220 }}
      >
        <BattleScene state={state} />
      </div>

      <p className="stat-line text-center text-ink/40 dark:text-white/30 mb-1">Incoming this battle</p>
      <SequenceRow state={state} turnBudget={turnBudget} />

      {!state.won && !state.lost && (
        <p className="stat-line text-center text-ink/50 dark:text-white/40 mb-3">
          Next hit: <span className="font-mono text-ink dark:text-white">{nextHit}</span>
        </p>
      )}

      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => onAction('attack')}
          disabled={disabled}
          className="stat-line border-2 border-graphite dark:border-white/80 rounded-lg py-2.5 disabled:opacity-30 hover:bg-graphite hover:text-paper dark:hover:bg-white dark:hover:text-graphite transition-colors"
        >
          Attack
        </button>
        <button
          onClick={() => onAction('defend')}
          disabled={disabled}
          className="stat-line border-2 border-graphite dark:border-white/80 rounded-lg py-2.5 disabled:opacity-30 hover:bg-graphite hover:text-paper dark:hover:bg-white dark:hover:text-graphite transition-colors"
        >
          Defend
        </button>
        <button
          onClick={() => onAction('special')}
          disabled={disabled || state.specialCooldown > 0}
          className="stat-line border-2 border-clash text-clash rounded-lg py-2.5 disabled:opacity-30 hover:bg-clash hover:text-white transition-colors"
        >
          {state.specialCooldown > 0 ? `Special (${state.specialCooldown})` : 'Special'}
        </button>
      </div>
    </div>
  );
}

export function ClashBoard({ seed, dateString, puzzleNumber }: { seed: number; dateString: string; puzzleNumber: number }) {
  const game = GAMES.find((g) => g.slug === GAME_SLUG)!;

  // --- Daily battle (unchanged behavior) ---
  const [state, setState] = useState<ClashState>(() => createInitialState(seed));
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);

  const dailyFinished = state.won || state.lost;

  function act(action: Action) {
    if (dailyFinished) return;
    setState((prev) => applyAction(prev, action));
  }

  useEffect(() => {
    if ((state.won || state.lost) && !finishedRef.current) {
      finishedRef.current = true;
      recordResult(GAME_SLUG, {
        date: dateString,
        won: state.won,
        moves: state.turnIndex,
        score: state.enemyMaxHp - state.enemyHp,
        elapsedMs: 0,
      });
      setStreak(getStreak(GAME_SLUG).current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.turnIndex, state.enemyMaxHp, state.enemyHp, dateString]);

  // --- Coin Mode ---
  const [coins, setCoins] = useState<number>(() => loadCoinBalance());
  const [coinState, setCoinState] = useState<ClashState | null>(null);
  const [nickname, setNicknameState] = useState<string>(() => getNickname());
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const coinRoundSettledRef = useRef(false);
  const [lastCoinDelta, setLastCoinDelta] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const coinBudgetRef = useRef(TURN_BUDGET);

  function startCoinRound() {
    coinRoundSettledRef.current = false;
    coinBudgetRef.current = scaleLimit(TURN_BUDGET, difficulty, 4);
    setCoinState(createInitialState(rollCoinSeed(), coinBudgetRef.current));
  }

  function coinAct(action: Action) {
    if (!coinState || coinState.won || coinState.lost) return;
    setCoinState((prev) => (prev ? applyAction(prev, action) : prev));
  }

  useEffect(() => {
    if (!coinState || coinRoundSettledRef.current) return;
    if (!coinState.won && !coinState.lost) return;
    coinRoundSettledRef.current = true;

    const delta = computeCoinDelta({
      won: coinState.won,
      movesUsed: coinState.turnIndex,
      movesLimit: coinBudgetRef.current,
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
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.turnIndex} movesLimit={TURN_BUDGET} />

      <p className="stat-line text-center text-ink/50 dark:text-white/40 mb-3">
        Every incoming hit is shown before you act. Plan the whole fight, not just this turn.
      </p>

      <BattleView state={state} turnBudget={TURN_BUDGET} onAction={act} disabled={dailyFinished} />

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug={GAME_SLUG}
        gameName="Clash"
        puzzleNumber={puzzleNumber}
        won={state.won}
        moves={state.turnIndex}
        movesLimit={TURN_BUDGET}
        score={state.enemyMaxHp - state.enemyHp}
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
          <BattleView state={coinState} turnBudget={coinBudgetRef.current} onAction={coinAct} disabled={coinState.won || coinState.lost} />
        )}
      </CoinModeSection>

      {showLeaderboard && <CoinLeaderboard onClose={() => setShowLeaderboard(false)} />}
    </div>
  );
}
