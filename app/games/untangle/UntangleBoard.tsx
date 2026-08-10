'use client';

import { useEffect, useRef, useState } from 'react';
import { createInitialState, selectTile, type UntangleState } from '@/lib/games/untangle';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { CoinLeaderboard } from '@/components/CoinLeaderboard';
import { CoinModeSection } from '@/components/CoinModeSection';
import { GAMES } from '@/lib/games/registry';
import { loadCoinBalance, saveCoinBalance, rollCoinSeed, computeCoinDelta, GLOBAL_LEADERBOARD_SLUG } from '@/lib/coin-mode';
import { getNickname, saveNickname, submitScore } from '@/lib/leaderboard-client';

const GAME_SLUG = 'untangle';

function TilesView({ state, onSelect, disabled }: { state: UntangleState; onSelect: (i: number) => void; disabled: boolean }) {
  return (
    <div>
      <p className="stat-line text-center text-ink/50 dark:text-white/40 mb-5">
        {state.target.length} letters, one word — tap two tiles to swap them
      </p>

      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {state.letters.map((letter, i) => {
          const isSelected = state.selected === i;
          return (
            <button
              key={i}
              onClick={() => onSelect(i)}
              disabled={disabled}
              className={[
                'w-11 h-11 rounded-md border-2 font-mono text-lg font-semibold flex items-center justify-center transition-colors',
                isSelected ? 'border-untangle bg-untangle-soft dark:bg-untangle/20' : 'border-graphite dark:border-white/70',
              ].join(' ')}
            >
              {letter}
            </button>
          );
        })}
      </div>

      {state.won && (
        <p className="stat-line text-center text-tether mb-4">
          {state.target} — solved in {state.movesUsed} swap{state.movesUsed === 1 ? '' : 's'}
        </p>
      )}

      <p className="stat-line text-center text-ink/40 dark:text-white/30">
        Every tile belongs to exactly one hidden word. Swapping is the only move — there&rsquo;s no dictionary
        check along the way, just the final result.
      </p>
    </div>
  );
}

export function UntangleBoard({ seed, dateString, puzzleNumber }: { seed: number; dateString: string; puzzleNumber: number }) {
  const game = GAMES.find((g) => g.slug === GAME_SLUG)!;

  // --- Daily puzzle (unchanged behavior) ---
  const [state, setState] = useState<UntangleState>(() => createInitialState(seed));
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
  const [coinState, setCoinState] = useState<UntangleState | null>(null);
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

    const delta = computeCoinDelta({ won: coinState.won, movesUsed: coinState.movesUsed, movesLimit: coinState.moveLimit });
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

      <TilesView state={state} onSelect={(i) => setState((s) => selectTile(s, i))} disabled={dailyFinished} />

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
          <TilesView state={coinState} onSelect={(i) => setCoinState((s) => (s ? selectTile(s, i) : s))} disabled={coinState.won || coinState.lost} />
        )}
      </CoinModeSection>

      {showLeaderboard && <CoinLeaderboard onClose={() => setShowLeaderboard(false)} />}
    </div>
  );
}
