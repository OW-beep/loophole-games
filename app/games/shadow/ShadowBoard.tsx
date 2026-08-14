'use client';

import { useEffect, useRef, useState } from 'react';
import { createInitialState, applyMove, GRID_SIZE, MOVE_LIMIT, type ShadowState, type Dir } from '@/lib/games/shadow';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { CoinLeaderboard } from '@/components/CoinLeaderboard';
import { CoinModeSection } from '@/components/CoinModeSection';
import { GAMES } from '@/lib/games/registry';
import { loadCoinBalance, saveCoinBalance, rollCoinSeed, computeCoinDelta, GLOBAL_LEADERBOARD_SLUG } from '@/lib/coin-mode';
import { scaleLimit, type Difficulty } from '@/lib/difficulty';
import { getNickname, saveNickname, submitScore } from '@/lib/leaderboard-client';

const GAME_SLUG = 'shadow';

const DIRS: { dir: Dir; label: string; key: string }[] = [
  { dir: 'up', label: '↑', key: 'ArrowUp' },
  { dir: 'left', label: '←', key: 'ArrowLeft' },
  { dir: 'down', label: '↓', key: 'ArrowDown' },
  { dir: 'right', label: '→', key: 'ArrowRight' },
];

function DirBtn({ d, onPress }: { d: { dir: Dir; label: string }; onPress: (d: Dir) => void }) {
  return (
    <button
      onClick={() => onPress(d.dir)}
      className="aspect-square border-2 border-graphite dark:border-white/80 font-display font-bold text-lg hover:bg-graphite hover:text-paper dark:hover:bg-white dark:hover:text-graphite transition-colors"
    >
      {d.label}
    </button>
  );
}

function ShadowView({ state, onMove, disabled }: { state: ShadowState; onMove: (d: Dir) => void; disabled: boolean }) {
  return (
    <div>
      <div
        className="grid gap-1 mb-4 bg-index/30 dark:bg-index-dark/30 p-1.5 border-2 border-graphite dark:border-white/80"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => {
          const isPlayer = state.player === i;
          const isGhost = state.ghost === i && state.ghost !== state.player;
          const isGoal = state.goal === i;
          const isWall = state.walls.has(i);
          return (
            <div
              key={i}
              className={[
                'aspect-square flex items-center justify-center text-xl font-bold border',
                isWall
                  ? 'bg-graphite dark:bg-white/20 border-transparent'
                  : isPlayer
                    ? 'bg-shadow text-white border-graphite dark:border-white/80'
                    : isGhost
                      ? 'bg-shadow-soft dark:bg-shadow/20 border-shadow'
                      : isGoal
                        ? 'border-2 border-dashed border-shadow'
                        : 'bg-panel dark:bg-panel-dark border-index dark:border-index-dark',
              ].join(' ')}
            >
              {isPlayer ? '●' : isGhost ? '○' : isGoal && !isPlayer ? '✕' : ''}
            </div>
          );
        })}
      </div>

      <div className="stat-line text-ink/50 dark:text-white/40 text-center mb-3">
        ● you · ○ ghost (your last move) · ✕ goal
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="grid grid-cols-3 gap-2 w-36">
          <div />
          <DirBtn d={DIRS[0]} onPress={onMove} />
          <div />
          <DirBtn d={DIRS[1]} onPress={onMove} />
          <div />
          <DirBtn d={DIRS[3]} onPress={onMove} />
          <div />
          <DirBtn d={DIRS[2]} onPress={onMove} />
          <div />
        </div>
      </div>
    </div>
  );
}

export function ShadowBoard({ seed, dateString, puzzleNumber }: { seed: number; dateString: string; puzzleNumber: number }) {
  const game = GAMES.find((g) => g.slug === GAME_SLUG)!;

  // --- Daily puzzle (unchanged behavior) ---
  const [state, setState] = useState<ShadowState>(() => createInitialState(seed));
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);

  const dailyFinished = state.won || state.lost;

  function move(dir: Dir) {
    if (dailyFinished) return;
    setState((prev) => applyMove(prev, dir));
  }

  // --- Coin Mode ---
  const [coins, setCoins] = useState<number>(() => loadCoinBalance());
  const [coinState, setCoinState] = useState<ShadowState | null>(null);
  const [nickname, setNicknameState] = useState<string>(() => getNickname());
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const coinRoundSettledRef = useRef(false);
  const [lastCoinDelta, setLastCoinDelta] = useState(0);

  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const coinBudgetRef = useRef(MOVE_LIMIT);

  function startCoinRound() {
    coinRoundSettledRef.current = false;
    coinBudgetRef.current = scaleLimit(MOVE_LIMIT, difficulty);
    setCoinState(createInitialState(rollCoinSeed()));
  }

  function coinMove(dir: Dir) {
    if (!coinState || coinState.won || coinState.lost) return;
    setCoinState((prev) => (prev ? applyMove(prev, dir, coinBudgetRef.current) : prev));
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const d = DIRS.find((d) => d.key === e.key);
      if (!d) return;
      e.preventDefault();
      if (!dailyFinished) move(d.dir);
      else coinMove(d.dir);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  useEffect(() => {
    if ((state.won || state.lost) && !finishedRef.current) {
      finishedRef.current = true;
      recordResult(GAME_SLUG, { date: dateString, won: state.won, moves: state.movesUsed, score: 0, elapsedMs: 0 });
      setStreak(getStreak(GAME_SLUG).current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.movesUsed, dateString]);

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
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.movesUsed} movesLimit={MOVE_LIMIT} />

      <ShadowView state={state} onMove={move} disabled={dailyFinished} />

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug={GAME_SLUG}
        gameName="Shadow"
        puzzleNumber={puzzleNumber}
        won={state.won}
        moves={state.movesUsed}
        movesLimit={MOVE_LIMIT}
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
        {coinState && <ShadowView state={coinState} onMove={coinMove} disabled={coinState.won || coinState.lost} />}
      </CoinModeSection>

      {showLeaderboard && <CoinLeaderboard onClose={() => setShowLeaderboard(false)} />}
    </div>
  );
}
