'use client';

import { useEffect, useRef, useState } from 'react';
import { createInitialState, pickColor, GRID_SIZE, COLOR_COUNT, PALETTE, type BloomState } from '@/lib/games/bloom';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { CoinLeaderboard } from '@/components/CoinLeaderboard';
import { CoinModeSection } from '@/components/CoinModeSection';
import { GAMES } from '@/lib/games/registry';
import { loadCoinBalance, saveCoinBalance, rollCoinSeed, computeCoinDelta, GLOBAL_LEADERBOARD_SLUG } from '@/lib/coin-mode';
import { getNickname, saveNickname, submitScore } from '@/lib/leaderboard-client';

const GAME_SLUG = 'bloom';

function BloomView({ state, onPick, disabled }: { state: BloomState; onPick: (c: number) => void; disabled: boolean }) {
  const coveredCount = state.territory.size;
  const totalCount = state.colors.length;

  return (
    <div>
      <p className="stat-line text-center text-ink/50 dark:text-white/40 mb-4">
        {coveredCount} / {totalCount} covered — pick a color to grow your territory
      </p>

      <div
        className="grid gap-0.5 mx-auto mb-5 rounded-lg overflow-hidden border-2 border-graphite dark:border-white/70"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, maxWidth: 320 }}
      >
        {state.colors.map((colorIndex, i) => {
          const isTerritory = state.territory.has(i);
          const displayColor = isTerritory ? PALETTE[state.territoryColor] : PALETTE[colorIndex];
          return <div key={i} className="aspect-square" style={{ background: displayColor }} />;
        })}
      </div>

      <div className="flex justify-center gap-3">
        {Array.from({ length: COLOR_COUNT }).map((_, c) => (
          <button
            key={c}
            onClick={() => onPick(c)}
            disabled={disabled || c === state.territoryColor}
            className="w-10 h-10 rounded-full border-2 disabled:opacity-25 transition-transform active:scale-90"
            style={{
              background: PALETTE[c],
              borderColor: c === state.territoryColor ? '#1B1D22' : 'transparent',
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function BloomBoard({ seed, dateString, puzzleNumber }: { seed: number; dateString: string; puzzleNumber: number }) {
  const game = GAMES.find((g) => g.slug === GAME_SLUG)!;

  // --- Daily puzzle (unchanged behavior) ---
  const [state, setState] = useState<BloomState>(() => createInitialState(seed));
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
        score: state.moveLimit,
        elapsedMs: 0,
      });
      setStreak(getStreak(GAME_SLUG).current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.movesUsed, state.moveLimit, dateString]);

  const dailyFinished = state.won || state.lost;

  // --- Coin Mode ---
  const [coins, setCoins] = useState<number>(() => loadCoinBalance());
  const [coinState, setCoinState] = useState<BloomState | null>(null);
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

    const delta = computeCoinDelta({
      won: coinState.won,
      movesUsed: coinState.movesUsed,
      movesLimit: coinState.moveLimit,
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
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.movesUsed} movesLimit={state.moveLimit} />

      <BloomView state={state} onPick={(c) => setState((s) => pickColor(s, c))} disabled={dailyFinished} />

      <p className="stat-line text-center text-ink/40 dark:text-white/30 mt-5">
        Picking a color turns your whole territory that color, then absorbs any touching tiles that were already
        that color — including chains of them.
      </p>

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug={GAME_SLUG}
        gameName={game.name}
        puzzleNumber={puzzleNumber}
        won={state.won}
        moves={state.movesUsed}
        movesLimit={state.moveLimit}
        score={state.moveLimit}
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
          <BloomView
            state={coinState}
            onPick={(c) => setCoinState((s) => (s ? pickColor(s, c) : s))}
            disabled={coinState.won || coinState.lost}
          />
        )}
      </CoinModeSection>

      {showLeaderboard && <CoinLeaderboard onClose={() => setShowLeaderboard(false)} />}
    </div>
  );
}
