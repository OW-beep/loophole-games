'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createInitialState,
  applyTap,
  applyTimeout,
  ATTEMPT_BUDGET,
  TARGET_HITS,
  CELL_COUNT,
  type BlipState,
} from '@/lib/games/blip';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { CoinLeaderboard } from '@/components/CoinLeaderboard';
import { CoinModeSection } from '@/components/CoinModeSection';
import { GAMES } from '@/lib/games/registry';
import { loadCoinBalance, saveCoinBalance, rollCoinSeed, computeCoinDelta, GLOBAL_LEADERBOARD_SLUG } from '@/lib/coin-mode';
import { getNickname, saveNickname, submitScore } from '@/lib/leaderboard-client';

const GAME_SLUG = 'blip';

/** The 3x3 grid for the current attempt. Times itself out via setTimeout and reports via onResolve. */
function GridView({
  state,
  onTap,
  onTimeout,
  disabled,
}: {
  state: BlipState;
  onTap: (cell: number) => void;
  onTimeout: () => void;
  disabled: boolean;
}) {
  const attempt = state.attempts[state.attemptsUsed];
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!attempt || disabled) return;
    timerRef.current = setTimeout(onTimeout, attempt.windowMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.attemptsUsed, disabled]);

  if (!attempt) return null;

  function handleTap(cell: number) {
    if (timerRef.current) clearTimeout(timerRef.current);
    onTap(cell);
  }

  return (
    <div className="grid grid-cols-3 gap-2 w-56 sm:w-64 mx-auto mb-4">
      {Array.from({ length: CELL_COUNT }).map((_, cell) => {
        const isLit = attempt.result === null && cell === attempt.targetCell;
        const wasTapped = attempt.tappedCell === cell;
        return (
          <button
            key={cell}
            onClick={() => handleTap(cell)}
            disabled={disabled || attempt.result !== null}
            aria-label={`Cell ${cell + 1}`}
            className={[
              'aspect-square border-2 border-graphite dark:border-white/80 transition-colors',
              isLit ? 'bg-blip' : 'bg-blip-soft dark:bg-blip/10',
              attempt.result === 'hit' && wasTapped ? 'bg-graphite dark:bg-white' : '',
              attempt.result === 'miss' && wasTapped ? 'bg-graphite/30 dark:bg-white/20' : '',
            ].join(' ')}
          />
        );
      })}
    </div>
  );
}

function ScoreRow({ state }: { state: BlipState }) {
  return (
    <div className="stat-line flex justify-between text-ink/50 dark:text-white/40 mb-3">
      <span>
        Hits: <span className="font-mono text-lg text-ink dark:text-white">{state.hits}</span> / {TARGET_HITS}
      </span>
      <span>
        Attempt:{' '}
        <span className="font-mono text-ink dark:text-white">{Math.min(state.attemptsUsed + 1, ATTEMPT_BUDGET)}</span> /{' '}
        {ATTEMPT_BUDGET}
      </span>
    </div>
  );
}

export function BlipBoard({ seed, dateString, puzzleNumber }: { seed: number; dateString: string; puzzleNumber: number }) {
  const game = GAMES.find((g) => g.slug === GAME_SLUG)!;

  // --- Daily run ---
  const [state, setState] = useState<BlipState>(() => createInitialState(seed));
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);

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
  const [coinState, setCoinState] = useState<BlipState | null>(null);
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
      movesUsed: coinState.attemptsUsed,
      movesLimit: ATTEMPT_BUDGET,
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
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.attemptsUsed} movesLimit={ATTEMPT_BUDGET} />

      <ScoreRow state={state} />
      <GridView
        state={state}
        onTap={(cell) => setState((prev) => applyTap(prev, cell))}
        onTimeout={() => setState((prev) => applyTimeout(prev))}
        disabled={dailyFinished}
      />
      <p className="stat-line text-ink/50 dark:text-white/40 text-center">
        Tap the lit cell before it fades.
      </p>

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug={GAME_SLUG}
        gameName="Blip"
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
      >
        {coinState && (
          <>
            <ScoreRow state={coinState} />
            <GridView
              state={coinState}
              onTap={(cell) => setCoinState((prev) => (prev ? applyTap(prev, cell) : prev))}
              onTimeout={() => setCoinState((prev) => (prev ? applyTimeout(prev) : prev))}
              disabled={coinState.won || coinState.lost}
            />
          </>
        )}
      </CoinModeSection>

      {showLeaderboard && <CoinLeaderboard onClose={() => setShowLeaderboard(false)} />}
    </div>
  );
}
