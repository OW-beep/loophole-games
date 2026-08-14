'use client';

import { useEffect, useRef, useState } from 'react';
import { createInitialState, guessNext, GRID_SIZE, CELL_COUNT, MOVE_BUDGET, type WaypointState } from '@/lib/games/waypoint';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { CoinLeaderboard } from '@/components/CoinLeaderboard';
import { CoinModeSection } from '@/components/CoinModeSection';
import { GAMES } from '@/lib/games/registry';
import { loadCoinBalance, saveCoinBalance, rollCoinSeed, computeCoinDelta, GLOBAL_LEADERBOARD_SLUG } from '@/lib/coin-mode';
import { scaleLimit, type Difficulty } from '@/lib/difficulty';
import { getNickname, saveNickname, submitScore } from '@/lib/leaderboard-client';

const GAME_SLUG = 'waypoint';

function BoardView({ state, onTap, disabled }: { state: WaypointState; onTap: (cellIndex: number) => void; disabled: boolean }) {
  return (
    <div>
      <p className="stat-line text-ink/50 dark:text-white/40 mb-4">
        Filled {state.current} / {CELL_COUNT} · next up:{' '}
        <span className="font-mono text-ink dark:text-white">{state.current + 1 <= CELL_COUNT ? state.current + 1 : '—'}</span>
      </p>

      <div className="grid gap-1.5 mb-4 max-w-sm mx-auto" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}>
        {Array.from({ length: CELL_COUNT }).map((_, cellIndex) => {
          const value = state.filled.get(cellIndex);
          const isClue = state.clueValues.has(cellIndex);
          const isCurrentHead = value === state.current && value !== undefined;
          const isWrongFlash = state.lastWrongCell === cellIndex;

          return (
            <button
              key={cellIndex}
              onClick={() => onTap(cellIndex)}
              disabled={disabled || value !== undefined}
              className={[
                'aspect-square rounded-md border-2 flex items-center justify-center font-mono text-sm font-semibold transition-colors',
                isWrongFlash
                  ? 'border-debt bg-debt/20'
                  : isCurrentHead
                    ? 'border-waypoint bg-waypoint-soft dark:bg-waypoint/20'
                    : isClue
                      ? 'border-graphite dark:border-white/70 bg-index dark:bg-index-dark'
                      : 'border-graphite/40 dark:border-white/30',
              ].join(' ')}
            >
              {value ?? ''}
            </button>
          );
        })}
      </div>

      <p className="stat-line text-center text-ink/40 dark:text-white/30">
        Tap the cell adjacent to your current number to continue the path. Fixed numbers (shaded) can&rsquo;t move.
      </p>
    </div>
  );
}

export function WaypointBoard({ seed, dateString, puzzleNumber }: { seed: number; dateString: string; puzzleNumber: number }) {
  const game = GAMES.find((g) => g.slug === GAME_SLUG)!;

  // --- Daily puzzle (unchanged behavior) ---
  const [state, setState] = useState<WaypointState>(() => createInitialState(seed));
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
        score: state.current,
        elapsedMs: 0,
      });
      setStreak(getStreak(GAME_SLUG).current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.movesUsed, state.current, dateString]);

  useEffect(() => {
    if (state.lastWrongCell === null) return;
    const t = setTimeout(() => {
      setState((s) => (s.lastWrongCell === null ? s : { ...s, lastWrongCell: null }));
    }, 350);
    return () => clearTimeout(t);
  }, [state.lastWrongCell]);

  const dailyFinished = state.won || state.lost;

  // --- Coin Mode ---
  const [coins, setCoins] = useState<number>(() => loadCoinBalance());
  const [coinState, setCoinState] = useState<WaypointState | null>(null);
  const [nickname, setNicknameState] = useState<string>(() => getNickname());
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const coinRoundSettledRef = useRef(false);
  const [lastCoinDelta, setLastCoinDelta] = useState(0);

  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const coinBudgetRef = useRef(MOVE_BUDGET);

  function startCoinRound() {
    coinRoundSettledRef.current = false;
    coinBudgetRef.current = scaleLimit(MOVE_BUDGET, difficulty);
    setCoinState(createInitialState(rollCoinSeed()));
  }

  useEffect(() => {
    if (!coinState || coinState.lastWrongCell === null) return;
    const t = setTimeout(() => {
      setCoinState((s) => (s && s.lastWrongCell !== null ? { ...s, lastWrongCell: null } : s));
    }, 350);
    return () => clearTimeout(t);
  }, [coinState]);

  useEffect(() => {
    if (!coinState || coinRoundSettledRef.current) return;
    if (!coinState.won && !coinState.lost) return;
    coinRoundSettledRef.current = true;

    const delta = computeCoinDelta({ won: coinState.won, movesUsed: coinState.movesUsed, movesLimit: coinBudgetRef.current, difficulty });
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
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.movesUsed} movesLimit={MOVE_BUDGET} />

      <BoardView state={state} onTap={(i) => setState((s) => guessNext(s, i))} disabled={dailyFinished} />

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug={GAME_SLUG}
        gameName={game.name}
        puzzleNumber={puzzleNumber}
        won={state.won}
        moves={state.movesUsed}
        movesLimit={MOVE_BUDGET}
        score={state.current}
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
          <BoardView
            state={coinState}
            onTap={(i) => setCoinState((s) => (s ? guessNext(s, i, coinBudgetRef.current) : s))}
            disabled={coinState.won || coinState.lost}
          />
        )}
      </CoinModeSection>

      {showLeaderboard && <CoinLeaderboard onClose={() => setShowLeaderboard(false)} />}
    </div>
  );
}
