'use client';

import { useEffect, useRef, useState } from 'react';
import { createInitialState, applyMove, isGhostPhase, GRID_SIZE, MOVE_LIMIT, type PhaseState, type Dir } from '@/lib/games/phase';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { CoinLeaderboard } from '@/components/CoinLeaderboard';
import { CoinModeSection } from '@/components/CoinModeSection';
import { GAMES } from '@/lib/games/registry';
import { loadCoinBalance, saveCoinBalance, rollCoinSeed, computeCoinDelta, GLOBAL_LEADERBOARD_SLUG } from '@/lib/coin-mode';
import { getNickname, saveNickname, submitScore } from '@/lib/leaderboard-client';

const GAME_SLUG = 'phase';

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

function PhaseView({ state, onMove, disabled }: { state: PhaseState; onMove: (d: Dir) => void; disabled: boolean }) {
  const ghost = isGhostPhase(state.stepCount + 1);

  return (
    <div>
      <div
        className={[
          'stat-line text-center py-2 mb-3 border-2 font-bold transition-colors',
          ghost
            ? 'border-phase/50 text-phase bg-phase-soft dark:bg-phase/10'
            : 'border-graphite dark:border-white/80 text-ink dark:text-white',
        ].join(' ')}
      >
        Next move: {ghost ? '👻 Ghost phase — passes walls, falls through holes' : '⬛ Solid phase — blocked by walls'}
      </div>

      <div
        className="grid gap-1 mb-4 bg-index/30 dark:bg-index-dark/30 p-1.5 border-2 border-graphite dark:border-white/80"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => {
          const isPlayer = state.player === i;
          const isGoal = state.goal === i;
          const isWall = state.walls.has(i);
          const isHole = state.holes.has(i);
          return (
            <div
              key={i}
              className={[
                'aspect-square flex items-center justify-center text-lg font-bold border',
                isWall
                  ? 'bg-graphite dark:bg-white/20 border-transparent'
                  : isHole
                    ? 'bg-index/60 dark:bg-index-dark/60 border-transparent'
                    : isPlayer
                      ? 'bg-phase text-white border-graphite dark:border-white/80'
                      : isGoal
                        ? 'border-2 border-dashed border-phase'
                        : 'bg-panel dark:bg-panel-dark border-index dark:border-index-dark',
              ].join(' ')}
            >
              {isPlayer ? (ghost ? '👻' : '●') : isHole && !isPlayer ? '▽' : isGoal && !isPlayer ? '✕' : ''}
            </div>
          );
        })}
      </div>

      <div className="stat-line text-ink/50 dark:text-white/40 text-center mb-3">
        ▽ hole (fall through in ghost phase) · ✕ goal · ■ wall
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

export function PhaseBoard({ seed, dateString, puzzleNumber }: { seed: number; dateString: string; puzzleNumber: number }) {
  const game = GAMES.find((g) => g.slug === GAME_SLUG)!;

  // --- Daily puzzle (unchanged behavior) ---
  const [state, setState] = useState<PhaseState>(() => createInitialState(seed));
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
  const [coinState, setCoinState] = useState<PhaseState | null>(null);
  const [nickname, setNicknameState] = useState<string>(() => getNickname());
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const coinRoundSettledRef = useRef(false);
  const [lastCoinDelta, setLastCoinDelta] = useState(0);

  function startCoinRound() {
    coinRoundSettledRef.current = false;
    setCoinState(createInitialState(rollCoinSeed()));
  }

  function coinMove(dir: Dir) {
    if (!coinState || coinState.won || coinState.lost) return;
    setCoinState((prev) => (prev ? applyMove(prev, dir) : prev));
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

    const delta = computeCoinDelta({ won: coinState.won, movesUsed: coinState.movesUsed, movesLimit: MOVE_LIMIT });
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
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.movesUsed} movesLimit={MOVE_LIMIT} />

      <PhaseView state={state} onMove={move} disabled={dailyFinished} />

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug={GAME_SLUG}
        gameName="Phase"
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
      >
        {coinState && <PhaseView state={coinState} onMove={coinMove} disabled={coinState.won || coinState.lost} />}
      </CoinModeSection>

      {showLeaderboard && <CoinLeaderboard onClose={() => setShowLeaderboard(false)} />}
    </div>
  );
}
