'use client';

import { useEffect, useRef, useState } from 'react';
import { createInitialState, applyFold, FOLD_BUDGET, type FoldState } from '@/lib/games/fold';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { CoinLeaderboard } from '@/components/CoinLeaderboard';
import { CoinModeSection } from '@/components/CoinModeSection';
import { GAMES } from '@/lib/games/registry';
import { loadCoinBalance, saveCoinBalance, rollCoinSeed, computeCoinDelta, GLOBAL_LEADERBOARD_SLUG } from '@/lib/coin-mode';
import { getNickname, saveNickname, submitScore } from '@/lib/leaderboard-client';

const GAME_SLUG = 'fold';

/** The strip + fold-line UI, shared by the daily puzzle and Coin Mode rounds. */
function StripView({ state, onCrease, disabled }: { state: FoldState; onCrease: (i: number) => void; disabled: boolean }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-6 overflow-x-auto py-4">
      {state.strip.map((value, i) => (
        <div key={i} className="flex items-center">
          <div
            className={[
              'w-10 h-14 sm:w-12 sm:h-16 flex items-center justify-center font-mono font-bold text-sm sm:text-base shrink-0 border-2 border-graphite dark:border-white/80',
              value === state.target ? 'bg-fold text-white' : 'bg-fold-soft text-graphite dark:bg-fold/20 dark:text-white',
            ].join(' ')}
          >
            {value}
          </div>
          {i < state.strip.length - 1 && (
            <button
              onClick={() => onCrease(i + 1)}
              disabled={disabled}
              aria-label={`Fold here, between cell ${i + 1} and ${i + 2}`}
              className="w-5 h-14 sm:h-16 flex items-center justify-center shrink-0 group disabled:opacity-30"
            >
              <span className="w-px h-full border-l-2 border-dashed border-fold group-hover:border-graphite dark:group-hover:border-white transition-colors" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export function FoldBoard({ seed, dateString, puzzleNumber }: { seed: number; dateString: string; puzzleNumber: number }) {
  const game = GAMES.find((g) => g.slug === GAME_SLUG)!;

  // --- Daily puzzle (unchanged behavior) ---
  const [state, setState] = useState<FoldState>(() => createInitialState(seed));
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);

  function handleCrease(creaseIndex: number) {
    if (state.won || state.lost) return;
    setState((prev) => applyFold(prev, creaseIndex));
  }

  useEffect(() => {
    if ((state.won || state.lost) && !finishedRef.current) {
      finishedRef.current = true;
      recordResult(GAME_SLUG, {
        date: dateString,
        won: state.won,
        moves: state.foldsUsed,
        score: state.target,
        elapsedMs: 0,
      });
      setStreak(getStreak(GAME_SLUG).current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.foldsUsed, state.target, dateString]);

  const dailyFinished = state.won || state.lost;

  // --- Coin Mode: unlimited replay once today's puzzle is done. Balance
  // and leaderboard are global — shared across every game on the site. ---
  const [coins, setCoins] = useState<number>(() => loadCoinBalance());
  const [coinState, setCoinState] = useState<FoldState | null>(null);
  const [nickname, setNicknameState] = useState<string>(() => getNickname());
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const coinRoundSettledRef = useRef(false);
  const [lastCoinDelta, setLastCoinDelta] = useState(0);

  function startCoinRound() {
    coinRoundSettledRef.current = false;
    setCoinState(createInitialState(rollCoinSeed()));
  }

  function handleCoinCrease(creaseIndex: number) {
    if (!coinState || coinState.won || coinState.lost) return;
    setCoinState((prev) => (prev ? applyFold(prev, creaseIndex) : prev));
  }

  useEffect(() => {
    if (!coinState || coinRoundSettledRef.current) return;
    if (!coinState.won && !coinState.lost) return;
    coinRoundSettledRef.current = true;

    const delta = computeCoinDelta({
      won: coinState.won,
      movesUsed: coinState.foldsUsed,
      movesLimit: FOLD_BUDGET,
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
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.foldsUsed} movesLimit={FOLD_BUDGET} />

      <div className="stat-line flex justify-between text-ink/50 dark:text-white/40 mb-6">
        <span>
          Target: <span className="font-mono text-lg text-ink dark:text-white">{state.target}</span>
        </span>
        <span>
          Cells: <span className="font-mono text-ink dark:text-white">{state.strip.length}</span>
        </span>
      </div>

      <StripView state={state} onCrease={handleCrease} disabled={dailyFinished} />

      <p className="stat-line text-ink/50 dark:text-white/40 text-center">
        Tap between two cells to fold the strip there.
      </p>

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug={GAME_SLUG}
        gameName="Fold"
        puzzleNumber={puzzleNumber}
        won={state.won}
        moves={state.foldsUsed}
        movesLimit={FOLD_BUDGET}
        score={state.target}
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
          <>
            <div className="stat-line flex justify-between text-ink/50 dark:text-white/40 mb-4">
              <span>
                Target: <span className="font-mono text-lg text-ink dark:text-white">{coinState.target}</span>
              </span>
              <span>
                Cells: <span className="font-mono text-ink dark:text-white">{coinState.strip.length}</span>
              </span>
            </div>
            <StripView state={coinState} onCrease={handleCoinCrease} disabled={coinState.won || coinState.lost} />
          </>
        )}
      </CoinModeSection>

      {showLeaderboard && <CoinLeaderboard onClose={() => setShowLeaderboard(false)} />}
    </div>
  );
}
