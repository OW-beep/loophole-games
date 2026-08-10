'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createInitialState,
  addInk,
  clearWell,
  bottle,
  canBottle,
  currentMix,
  currentMatch,
  rgbToCss,
  INKS,
  MIX_BUDGET,
  TARGET_COUNT,
  type PigmentState,
  type InkName,
} from '@/lib/games/pigment';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { CoinLeaderboard } from '@/components/CoinLeaderboard';
import { CoinModeSection } from '@/components/CoinModeSection';
import { GAMES } from '@/lib/games/registry';
import { loadCoinBalance, saveCoinBalance, rollCoinSeed, computeCoinDelta, GLOBAL_LEADERBOARD_SLUG } from '@/lib/coin-mode';
import { getNickname, saveNickname, submitScore } from '@/lib/leaderboard-client';

const GAME_SLUG = 'pigment';

function MixerView({
  state,
  onAddInk,
  onClear,
  onBottle,
  disabled,
}: {
  state: PigmentState;
  onAddInk: (ink: InkName) => void;
  onClear: () => void;
  onBottle: () => void;
  disabled: boolean;
}) {
  const mix = currentMix(state);
  const match = currentMatch(state);
  const ready = canBottle(state);

  return (
    <div>
      <div className="stat-line flex gap-4 text-ink/50 dark:text-white/40 mb-4">
        <span>
          Target {Math.min(state.targetIndex + 1, TARGET_COUNT)} / {TARGET_COUNT}
        </span>
        <span>
          Bottled: <span className="font-mono text-ink dark:text-white">{state.bottled}</span>
        </span>
        <span>
          Taps left: <span className="font-mono text-ink dark:text-white">{MIX_BUDGET - state.tapsUsed}</span>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center">
          <p className="stat-line text-ink/40 dark:text-white/30 mb-1.5">TARGET</p>
          <div
            className="w-full aspect-square rounded-lg border-2 border-graphite dark:border-white/80"
            style={{ background: rgbToCss(state.targets[state.targetIndex]) }}
          />
        </div>
        <div className="text-center">
          <p className="stat-line text-ink/40 dark:text-white/30 mb-1.5">YOUR MIX</p>
          <div className="w-full aspect-square rounded-lg border-2 border-graphite dark:border-white/80" style={{ background: rgbToCss(mix) }} />
        </div>
      </div>

      <div className="mb-4">
        <div className="h-2 rounded-full bg-index dark:bg-index-dark overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${match}%`, background: ready ? '#4CAF7D' : '#B8862E' }} />
        </div>
        <p className="stat-line text-center mt-1.5 text-ink/50 dark:text-white/40">{match}% match</p>
      </div>

      <div className="grid grid-cols-5 gap-2 mb-4">
        {INKS.map((ink) => (
          <button
            key={ink.name}
            disabled={disabled}
            onClick={() => onAddInk(ink.name as InkName)}
            className="aspect-square rounded-lg border-2 border-graphite dark:border-white/60 disabled:opacity-30 active:scale-95 transition"
            style={{ background: rgbToCss(ink.rgb) }}
            title={ink.name}
          />
        ))}
      </div>

      <div className="flex gap-2.5">
        <button
          onClick={onClear}
          disabled={state.wellTaps.length === 0 || disabled}
          className="flex-1 rounded-lg py-2.5 text-sm font-semibold border-2 border-graphite dark:border-white/80 disabled:opacity-30"
        >
          Clear (free)
        </button>
        <button
          onClick={onBottle}
          disabled={!ready}
          className="flex-1 rounded-lg py-2.5 text-sm font-semibold border-2 border-pigment text-pigment disabled:opacity-30"
        >
          Bottle it
        </button>
      </div>
    </div>
  );
}

export function PigmentBoard({ seed, dateString, puzzleNumber }: { seed: number; dateString: string; puzzleNumber: number }) {
  const game = GAMES.find((g) => g.slug === GAME_SLUG)!;

  // --- Daily puzzle (unchanged behavior) ---
  const [state, setState] = useState<PigmentState>(() => createInitialState(seed));
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if ((state.won || state.lost) && !finishedRef.current) {
      finishedRef.current = true;
      recordResult(GAME_SLUG, {
        date: dateString,
        won: state.won,
        moves: state.tapsUsed,
        score: state.bottled,
        elapsedMs: 0,
      });
      setStreak(getStreak(GAME_SLUG).current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.tapsUsed, state.bottled, dateString]);

  const dailyFinished = state.won || state.lost;

  // --- Coin Mode ---
  const [coins, setCoins] = useState<number>(() => loadCoinBalance());
  const [coinState, setCoinState] = useState<PigmentState | null>(null);
  const [nickname, setNicknameState] = useState<string>(() => getNickname());
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const coinRoundSettledRef = useRef(false);
  const [lastCoinDelta, setLastCoinDelta] = useState(0);

  function startCoinRound() {
    coinRoundSettledRef.current = false;
    setCoinState(createInitialState(rollCoinSeed()));
  }

  useEffect(() => {
    if (!coinState || coinRoundSettledRef.current) return;
    if (!coinState.won && !coinState.lost) return;
    coinRoundSettledRef.current = true;

    const delta = computeCoinDelta({ won: coinState.won, movesUsed: coinState.tapsUsed, movesLimit: MIX_BUDGET });
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
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.tapsUsed} movesLimit={MIX_BUDGET} />

      <MixerView
        state={state}
        onAddInk={(ink) => setState((s) => addInk(s, ink))}
        onClear={() => setState(clearWell)}
        onBottle={() => setState(bottle)}
        disabled={dailyFinished}
      />

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug={GAME_SLUG}
        gameName={game.name}
        puzzleNumber={puzzleNumber}
        won={state.won}
        moves={state.tapsUsed}
        movesLimit={MIX_BUDGET}
        score={state.bottled}
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
        {coinState && (
          <MixerView
            state={coinState}
            onAddInk={(ink) => setCoinState((s) => (s ? addInk(s, ink) : s))}
            onClear={() => setCoinState((s) => (s ? clearWell(s) : s))}
            onBottle={() => setCoinState((s) => (s ? bottle(s) : s))}
            disabled={coinState.won || coinState.lost}
          />
        )}
      </CoinModeSection>

      {showLeaderboard && <CoinLeaderboard onClose={() => setShowLeaderboard(false)} />}
    </div>
  );
}
