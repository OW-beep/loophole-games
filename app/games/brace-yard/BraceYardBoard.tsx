'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createInitialState,
  shipCrate,
  isShippable,
  GRID_SIZE,
  SHIP_BUDGET,
  type BraceYardState,
} from '@/lib/games/brace-yard';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { CoinLeaderboard } from '@/components/CoinLeaderboard';
import { CoinModeSection } from '@/components/CoinModeSection';
import { GAMES } from '@/lib/games/registry';
import { loadCoinBalance, saveCoinBalance, rollCoinSeed, computeCoinDelta, GLOBAL_LEADERBOARD_SLUG } from '@/lib/coin-mode';
import { scaleLimit, type Difficulty } from '@/lib/difficulty';
import { getNickname, saveNickname, submitScore } from '@/lib/leaderboard-client';

const GAME_SLUG = 'brace-yard';

/** The crate yard grid, shared by the daily puzzle and Coin Mode rounds. */
function YardView({ state, onTap, disabled }: { state: BraceYardState; onTap: (i: number) => void; disabled: boolean }) {
  return (
    <div>
      <div className="stat-line flex justify-between text-ink/50 dark:text-white/40 mb-3">
        <span>
          Score: <span className="font-mono text-lg text-ink dark:text-white">{state.score}</span> / {state.target}
        </span>
        <span>
          Shipments left: <span className="font-mono text-ink dark:text-white">{SHIP_BUDGET - state.shipped}</span>
        </span>
      </div>

      <div
        className="grid gap-1 mb-4 bg-index/30 dark:bg-index-dark/30 p-1.5 border-2 border-graphite dark:border-white/80"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
      >
        {state.weights.map((weight, i) => {
          if (weight === null) {
            return <div key={i} className="aspect-square bg-panel dark:bg-panel-dark" />;
          }
          const shippable = isShippable(state.weights, i);
          return (
            <button
              key={i}
              onClick={() => onTap(i)}
              disabled={disabled || !shippable}
              aria-label={`Crate weight ${weight}${shippable ? ', shippable' : ', not shippable yet'}`}
              className={[
                'aspect-square flex items-center justify-center font-mono font-bold text-sm sm:text-base border-2 transition-opacity',
                shippable
                  ? 'bg-brace-soft text-graphite dark:bg-brace/25 dark:text-white border-brace cursor-pointer hover:bg-brace hover:text-white'
                  : 'bg-panel dark:bg-panel-dark text-ink/30 dark:text-white/25 border-index dark:border-index-dark opacity-60',
              ].join(' ')}
            >
              {weight}
            </button>
          );
        })}
      </div>

      <p className="stat-line text-ink/50 dark:text-white/40 text-center">
        Highlighted crates are shippable right now. Tap one to ship it.
      </p>
    </div>
  );
}

export function BraceYardBoard({ seed, dateString, puzzleNumber }: { seed: number; dateString: string; puzzleNumber: number }) {
  const game = GAMES.find((g) => g.slug === GAME_SLUG)!;

  // --- Daily puzzle (unchanged behavior) ---
  const [state, setState] = useState<BraceYardState>(() => createInitialState(seed));
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);

  function handleTap(i: number) {
    if (state.won || state.lost) return;
    setState((prev) => shipCrate(prev, i));
  }

  useEffect(() => {
    if ((state.won || state.lost) && !finishedRef.current) {
      finishedRef.current = true;
      recordResult(GAME_SLUG, {
        date: dateString,
        won: state.won,
        moves: state.shipped,
        score: state.score,
        elapsedMs: 0,
      });
      setStreak(getStreak(GAME_SLUG).current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.shipped, state.score, dateString]);

  const dailyFinished = state.won || state.lost;

  // --- Coin Mode: unlimited replay once today's puzzle is done. Balance
  // and leaderboard are global — shared across every game on the site. ---
  const [coins, setCoins] = useState<number>(() => loadCoinBalance());
  const [coinState, setCoinState] = useState<BraceYardState | null>(null);
  const [nickname, setNicknameState] = useState<string>(() => getNickname());
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const coinRoundSettledRef = useRef(false);
  const [lastCoinDelta, setLastCoinDelta] = useState(0);

  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const coinBudgetRef = useRef(SHIP_BUDGET);

  function startCoinRound() {
    coinRoundSettledRef.current = false;
    coinBudgetRef.current = scaleLimit(SHIP_BUDGET, difficulty);
    setCoinState(createInitialState(rollCoinSeed()));
  }

  function handleCoinTap(i: number) {
    if (!coinState || coinState.won || coinState.lost) return;
    setCoinState((prev) => (prev ? shipCrate(prev, i, coinBudgetRef.current) : prev));
  }

  useEffect(() => {
    if (!coinState || coinRoundSettledRef.current) return;
    if (!coinState.won && !coinState.lost) return;
    coinRoundSettledRef.current = true;

    const delta = computeCoinDelta({
      won: coinState.won,
      movesUsed: coinState.shipped,
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
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.shipped} movesLimit={SHIP_BUDGET} />

      <YardView state={state} onTap={handleTap} disabled={dailyFinished} />

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug={GAME_SLUG}
        gameName="Brace Yard"
        puzzleNumber={puzzleNumber}
        won={state.won}
        moves={state.shipped}
        movesLimit={SHIP_BUDGET}
        score={state.score}
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
        {coinState && <YardView state={coinState} onTap={handleCoinTap} disabled={coinState.won || coinState.lost} />}
      </CoinModeSection>

      {showLeaderboard && <CoinLeaderboard onClose={() => setShowLeaderboard(false)} />}
    </div>
  );
}
