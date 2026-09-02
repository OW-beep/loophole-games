'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createInitialState,
  tapCell,
  getConflicts,
  correctCount,
  BOARD_SIZE,
  CROWN_COUNT,
  TAP_BUDGET,
  type RegentState,
} from '@/lib/games/regent';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { CoinLeaderboard } from '@/components/CoinLeaderboard';
import { CoinModeSection } from '@/components/CoinModeSection';
import { GAMES } from '@/lib/games/registry';
import { loadCoinBalance, saveCoinBalance, rollCoinSeed, computeCoinDelta, GLOBAL_LEADERBOARD_SLUG } from '@/lib/coin-mode';
import { scaleLimit, type Difficulty } from '@/lib/difficulty';
import { getNickname, saveNickname, submitScore } from '@/lib/leaderboard-client';

const GAME_SLUG = 'regent';

const REGION_PALETTE = ['#F6C453', '#7FB3D5', '#EF9A9A', '#A5D6A7', '#CE93D8', '#FFAB91'];

function ScoreRow({ state }: { state: RegentState }) {
  const placed = state.crowns.filter(Boolean).length;
  const correct = correctCount(state.crowns, state.regions);
  return (
    <div className="stat-line flex justify-between text-ink/50 dark:text-white/40 mb-3">
      <span>
        Crowns: <span className="font-mono text-lg text-ink dark:text-white">{placed}</span> / {CROWN_COUNT}
      </span>
      <span>
        Clean: <span className="font-mono text-ink dark:text-white">{correct}</span> / {CROWN_COUNT}
      </span>
    </div>
  );
}

function GridView({
  state,
  onTap,
  disabled,
}: {
  state: RegentState;
  onTap: (i: number) => void;
  disabled: boolean;
}) {
  const conflicts = getConflicts(state.crowns, state.regions);

  return (
    <div>
      <div
        className="grid gap-0.5 mb-4 bg-graphite dark:bg-white/80 p-1.5 border-2 border-graphite dark:border-white/80"
        style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))` }}
      >
        {state.regions.map((region, i) => {
          const hasCrown = state.crowns[i];
          const inConflict = conflicts.has(i);
          return (
            <button
              key={i}
              onClick={() => onTap(i)}
              disabled={disabled}
              aria-label={hasCrown ? 'Remove crown' : 'Place crown'}
              style={{ backgroundColor: REGION_PALETTE[region % REGION_PALETTE.length] }}
              className={[
                'aspect-square flex items-center justify-center transition-colors dark:brightness-75 dark:saturate-125',
                inConflict ? 'border-4 border-debt animate-pulse' : 'border border-graphite/20 dark:border-black/30',
              ].join(' ')}
            >
              {hasCrown && (
                <span className={['text-xl leading-none select-none', inConflict ? 'text-debt' : 'text-graphite'].join(' ')}>
                  ♛
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="stat-line text-ink/50 dark:text-white/40 text-center">
        Tap a cell to place or remove a crown. One per row, column and color — none touching.
      </p>
    </div>
  );
}

export function RegentBoard({ seed, dateString, puzzleNumber }: { seed: number; dateString: string; puzzleNumber: number }) {
  const game = GAMES.find((g) => g.slug === GAME_SLUG)!;

  // --- Daily puzzle ---
  const [state, setState] = useState<RegentState>(() => createInitialState(seed));
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);

  const dailyFinished = state.won || state.lost;

  function handleTap(i: number) {
    setState((prev) => tapCell(prev, i));
  }

  useEffect(() => {
    if ((state.won || state.lost) && !finishedRef.current) {
      finishedRef.current = true;
      recordResult(GAME_SLUG, {
        date: dateString,
        won: state.won,
        moves: state.tapsUsed,
        score: correctCount(state.crowns, state.regions),
        elapsedMs: 0,
      });
      setStreak(getStreak(GAME_SLUG).current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.tapsUsed, state.crowns, state.regions, dateString]);

  // --- Coin Mode ---
  const [coins, setCoins] = useState<number>(() => loadCoinBalance());
  const [coinState, setCoinState] = useState<RegentState | null>(null);
  const [nickname, setNicknameState] = useState<string>(() => getNickname());
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const coinRoundSettledRef = useRef(false);
  const [lastCoinDelta, setLastCoinDelta] = useState(0);

  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const coinBudgetRef = useRef(TAP_BUDGET);

  function startCoinRound() {
    coinRoundSettledRef.current = false;
    coinBudgetRef.current = scaleLimit(TAP_BUDGET, difficulty);
    setCoinState(createInitialState(rollCoinSeed(), coinBudgetRef.current));
  }

  function handleCoinTap(i: number) {
    if (!coinState) return;
    setCoinState((prev) => (prev ? tapCell(prev, i, coinBudgetRef.current) : prev));
  }

  useEffect(() => {
    if (!coinState || coinRoundSettledRef.current) return;
    if (!coinState.won && !coinState.lost) return;
    coinRoundSettledRef.current = true;

    const delta = computeCoinDelta({ won: coinState.won, movesUsed: coinState.tapsUsed, movesLimit: coinBudgetRef.current, difficulty });
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
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.tapsUsed} movesLimit={TAP_BUDGET} />

      <ScoreRow state={state} />
      <GridView state={state} onTap={handleTap} disabled={dailyFinished} />

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug={GAME_SLUG}
        gameName="Regent"
        puzzleNumber={puzzleNumber}
        won={state.won}
        moves={state.tapsUsed}
        movesLimit={TAP_BUDGET}
        score={correctCount(state.crowns, state.regions)}
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
            <GridView state={coinState} onTap={handleCoinTap} disabled={coinState.won || coinState.lost} />
          </>
        )}
      </CoinModeSection>

      {showLeaderboard && <CoinLeaderboard onClose={() => setShowLeaderboard(false)} />}
    </div>
  );
}
