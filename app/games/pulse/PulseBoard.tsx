'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createInitialState,
  applyTap,
  markerPosition,
  ATTEMPT_BUDGET,
  TARGET_HITS,
  type PulseState,
} from '@/lib/games/pulse';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { CoinLeaderboard } from '@/components/CoinLeaderboard';
import { CoinModeSection } from '@/components/CoinModeSection';
import { GAMES } from '@/lib/games/registry';
import { loadCoinBalance, saveCoinBalance, rollCoinSeed, computeCoinDelta, GLOBAL_LEADERBOARD_SLUG } from '@/lib/coin-mode';
import { scaleLimit, type Difficulty } from '@/lib/difficulty';
import { getNickname, saveNickname, submitScore } from '@/lib/leaderboard-client';

const GAME_SLUG = 'pulse';

/**
 * The live sweeping track. Runs its own rAF loop tied to the current
 * attempt's period; a tap (click/tap/space) freezes the marker's current
 * position and reports it up via onTap.
 */
function TrackView({ state, onTap, disabled }: { state: PulseState; onTap: (position: number) => void; disabled: boolean }) {
  const attempt = state.attempts[state.attemptsUsed];
  const [pos, setPos] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = null;
    if (!attempt || disabled) return;

    function frame(t: number) {
      if (startRef.current === null) startRef.current = t;
      const elapsed = t - (startRef.current ?? t);
      setPos(markerPosition(elapsed, attempt.periodMs));
      rafRef.current = requestAnimationFrame(frame);
    }
    rafRef.current = requestAnimationFrame(frame);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.attemptsUsed, disabled]);

  function tap() {
    if (disabled || !attempt) return;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    onTap(pos);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === 'Space') {
        e.preventDefault();
        tap();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  if (!attempt) return null;

  return (
    <div>
      <button
        onClick={tap}
        disabled={disabled}
        aria-label="Tap to stop the marker"
        className="relative w-full h-14 bg-index/30 dark:bg-index-dark/30 border-2 border-graphite dark:border-white/80 mb-3 overflow-hidden"
      >
        <div
          className="absolute top-0 bottom-0 bg-pulse-soft dark:bg-pulse/20"
          style={{ left: `${attempt.zoneStart}%`, width: `${attempt.zoneWidth}%` }}
        />
        <div
          className="absolute top-0 bottom-0 w-1 bg-pulse"
          style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}
        />
        {attempt.tapPosition !== null && (
          <div
            className={[
              'absolute top-0 bottom-0 w-0.5',
              attempt.hit ? 'bg-graphite dark:bg-white' : 'bg-graphite/40 dark:bg-white/40',
            ].join(' ')}
            style={{ left: `${attempt.tapPosition}%`, transform: 'translateX(-50%)' }}
          />
        )}
      </button>
      <p className="stat-line text-ink/50 dark:text-white/40 text-center">
        Tap the track (or press space) when the marker is in the highlighted zone.
      </p>
    </div>
  );
}

function ScoreRow({ state }: { state: PulseState }) {
  return (
    <div className="stat-line flex justify-between text-ink/50 dark:text-white/40 mb-3">
      <span>
        Hits: <span className="font-mono text-lg text-ink dark:text-white">{state.hits}</span> / {TARGET_HITS}
      </span>
      <span>
        Attempt: <span className="font-mono text-ink dark:text-white">{Math.min(state.attemptsUsed + 1, ATTEMPT_BUDGET)}</span> / {ATTEMPT_BUDGET}
      </span>
    </div>
  );
}

export function PulseBoard({ seed, dateString, puzzleNumber }: { seed: number; dateString: string; puzzleNumber: number }) {
  const game = GAMES.find((g) => g.slug === GAME_SLUG)!;

  // --- Daily run (unchanged behavior pattern) ---
  const [state, setState] = useState<PulseState>(() => createInitialState(seed));
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);

  function handleTap(position: number) {
    setState((prev) => applyTap(prev, position));
  }

  const dailyFinished = state.won || state.lost;

  useEffect(() => {
    if ((state.won || state.lost) && !finishedRef.current) {
      finishedRef.current = true;
      recordResult(GAME_SLUG, {
        date: dateString,
        won: state.won,
        moves: state.attemptsUsed,
        score: state.hits,
        elapsedMs: 0,
      });
      setStreak(getStreak(GAME_SLUG).current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.attemptsUsed, state.hits, dateString]);

  // --- Coin Mode: unlimited replay once today's run is done. Global
  // balance and leaderboard, shared across every game on the site. ---
  const [coins, setCoins] = useState<number>(() => loadCoinBalance());
  const [coinState, setCoinState] = useState<PulseState | null>(null);
  const [nickname, setNicknameState] = useState<string>(() => getNickname());
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const coinRoundSettledRef = useRef(false);
  const [lastCoinDelta, setLastCoinDelta] = useState(0);

  const [difficulty, setDifficulty] = useState<Difficulty>('normal');

  function startCoinRound() {
    coinRoundSettledRef.current = false;
    setCoinState(createInitialState(rollCoinSeed(), scaleLimit(ATTEMPT_BUDGET, difficulty)));
  }

  function handleCoinTap(position: number) {
    setCoinState((prev) => (prev ? applyTap(prev, position) : prev));
  }

  useEffect(() => {
    if (!coinState || coinRoundSettledRef.current) return;
    if (!coinState.won && !coinState.lost) return;
    coinRoundSettledRef.current = true;

    const delta = computeCoinDelta({
      won: coinState.won,
      movesUsed: coinState.attemptsUsed,
      movesLimit: coinState.attemptBudget,
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
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.attemptsUsed} movesLimit={ATTEMPT_BUDGET} />

      <ScoreRow state={state} />
      <TrackView state={state} onTap={handleTap} disabled={dailyFinished} />

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug={GAME_SLUG}
        gameName="Pulse"
        puzzleNumber={puzzleNumber}
        won={state.won}
        moves={state.attemptsUsed}
        movesLimit={ATTEMPT_BUDGET}
        score={state.hits}
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
          <>
            <ScoreRow state={coinState} />
            <TrackView state={coinState} onTap={handleCoinTap} disabled={coinState.won || coinState.lost} />
          </>
        )}
      </CoinModeSection>

      {showLeaderboard && <CoinLeaderboard onClose={() => setShowLeaderboard(false)} />}
    </div>
  );
}
