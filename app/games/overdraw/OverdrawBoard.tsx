'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createInitialState,
  draw,
  bank,
  remainingInfo,
  streakBonus,
  DECK_SIZE,
  TARGET_SCORE,
  type OverdrawState,
} from '@/lib/games/overdraw';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { CoinLeaderboard } from '@/components/CoinLeaderboard';
import { CoinModeSection } from '@/components/CoinModeSection';
import { GAMES } from '@/lib/games/registry';
import { loadCoinBalance, saveCoinBalance, rollCoinSeed, computeCoinDelta, GLOBAL_LEADERBOARD_SLUG } from '@/lib/coin-mode';
import { getNickname, saveNickname, submitScore } from '@/lib/leaderboard-client';

const GAME_SLUG = 'overdraw';

function DeckView({
  state,
  onDraw,
  onBank,
  disabled,
}: {
  state: OverdrawState;
  onDraw: () => void;
  onBank: () => void;
  disabled: boolean;
}) {
  const { remaining, bustsRemaining } = remainingInfo(state);
  const riskPct = remaining > 0 ? Math.round((bustsRemaining / remaining) * 100) : 0;
  const pendingBonus = streakBonus(state.runLength);
  const cardLabel = state.lastCard === null ? null : state.lastCard.kind === 'bust' ? 'BUST' : `+${state.lastCard.value}`;

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 mb-4 text-center">
        <div className="border-2 border-graphite dark:border-white/70 rounded-lg p-3">
          <p className="stat-line text-ink/40 dark:text-white/30 mb-1">BANKED</p>
          <p className="font-mono text-2xl font-semibold">{state.bankedScore}</p>
          <p className="stat-line text-ink/40 dark:text-white/30">of {TARGET_SCORE}</p>
        </div>
        <div className="border-2 border-overdraw rounded-lg p-3 bg-overdraw-soft dark:bg-overdraw/10">
          <p className="stat-line text-ink/40 dark:text-white/30 mb-1">CURRENT RUN</p>
          <p className="font-mono text-2xl font-semibold">
            {state.currentRun}
            {pendingBonus > 0 && <span className="text-sm text-overdraw"> +{pendingBonus}</span>}
          </p>
          <p className="stat-line text-ink/40 dark:text-white/30">{state.runLength} card(s) held</p>
        </div>
      </div>

      <div className="text-center mb-4">
        <div
          className="w-24 h-32 mx-auto rounded-lg border-2 border-graphite dark:border-white/70 flex items-center justify-center font-mono text-2xl font-bold mb-2"
          style={{
            background: !cardLabel ? 'transparent' : state.lastCard?.kind === 'bust' ? '#F7DFDA' : '#fff',
            color: state.lastCard?.kind === 'bust' ? '#C6432E' : undefined,
          }}
        >
          {cardLabel ?? '?'}
        </div>
        <p className="stat-line text-ink/50 dark:text-white/40">
          {remaining} cards left in the deck &middot; {bustsRemaining} are bust cards ({riskPct}% risk on your next draw)
        </p>
      </div>

      <div className="flex gap-2.5">
        <button
          onClick={onDraw}
          disabled={disabled}
          className="flex-1 rounded-lg py-3 text-sm font-semibold border-2 border-overdraw text-overdraw disabled:opacity-30"
        >
          Draw
        </button>
        <button
          onClick={onBank}
          disabled={disabled || state.runLength === 0}
          className="flex-1 rounded-lg py-3 text-sm font-semibold border-2 border-graphite dark:border-white/80 disabled:opacity-30"
        >
          Bank ({state.currentRun + pendingBonus})
        </button>
      </div>
    </div>
  );
}

export function OverdrawBoard({ seed, dateString, puzzleNumber }: { seed: number; dateString: string; puzzleNumber: number }) {
  const game = GAMES.find((g) => g.slug === GAME_SLUG)!;

  // --- Daily puzzle (unchanged behavior) ---
  const [state, setState] = useState<OverdrawState>(() => createInitialState(seed));
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if ((state.won || state.lost) && !finishedRef.current) {
      finishedRef.current = true;
      recordResult(GAME_SLUG, {
        date: dateString,
        won: state.won,
        moves: state.movesUsed,
        score: state.bankedScore,
        elapsedMs: 0,
      });
      setStreak(getStreak(GAME_SLUG).current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.movesUsed, state.bankedScore, dateString]);

  const dailyFinished = state.won || state.lost;

  // --- Coin Mode ---
  const [coins, setCoins] = useState<number>(() => loadCoinBalance());
  const [coinState, setCoinState] = useState<OverdrawState | null>(null);
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

    const delta = computeCoinDelta({ won: coinState.won, movesUsed: coinState.movesUsed, movesLimit: DECK_SIZE });
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
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.movesUsed} movesLimit={DECK_SIZE} />

      <DeckView state={state} onDraw={() => setState(draw)} onBank={() => setState(bank)} disabled={dailyFinished} />

      <p className="stat-line text-center text-ink/40 dark:text-white/30 mt-5">
        Longer runs bank a bigger bonus, but a bust card wipes the whole unbanked run. Draws are free to think
        about; only drawing itself uses up the deck.
      </p>

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug={GAME_SLUG}
        gameName={game.name}
        puzzleNumber={puzzleNumber}
        won={state.won}
        moves={state.movesUsed}
        movesLimit={DECK_SIZE}
        score={state.bankedScore}
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
          <DeckView
            state={coinState}
            onDraw={() => setCoinState((s) => (s ? draw(s) : s))}
            onBank={() => setCoinState((s) => (s ? bank(s) : s))}
            disabled={coinState.won || coinState.lost}
          />
        )}
      </CoinModeSection>

      {showLeaderboard && <CoinLeaderboard onClose={() => setShowLeaderboard(false)} />}
    </div>
  );
}
