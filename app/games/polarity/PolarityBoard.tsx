'use client';

import { useEffect, useRef, useState } from 'react';
import { createInitialState, applySlide, getMagnetAt, GRID_SIZE, SLIDE_BUDGET, type PolarityState } from '@/lib/games/polarity';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { CoinLeaderboard } from '@/components/CoinLeaderboard';
import { CoinModeSection } from '@/components/CoinModeSection';
import { GAMES } from '@/lib/games/registry';
import { loadCoinBalance, saveCoinBalance, rollCoinSeed, computeCoinDelta, GLOBAL_LEADERBOARD_SLUG } from '@/lib/coin-mode';
import { getNickname, saveNickname, submitScore } from '@/lib/leaderboard-client';

const GAME_SLUG = 'polarity';

const DIRS: { label: string; dr: number; dc: number; key: string }[] = [
  { label: '↑', dr: -1, dc: 0, key: 'ArrowUp' },
  { label: '←', dr: 0, dc: -1, key: 'ArrowLeft' },
  { label: '↓', dr: 1, dc: 0, key: 'ArrowDown' },
  { label: '→', dr: 0, dc: 1, key: 'ArrowRight' },
];

function DirButton({ d, onPress, disabled }: { d: { label: string; dr: number; dc: number }; onPress: (dr: number, dc: number) => void; disabled: boolean }) {
  return (
    <button
      onClick={() => onPress(d.dr, d.dc)}
      disabled={disabled}
      className="aspect-square border-2 border-graphite dark:border-white/80 font-display font-bold text-lg disabled:opacity-30 hover:bg-graphite hover:text-paper dark:hover:bg-white dark:hover:text-graphite transition-colors"
    >
      {d.label}
    </button>
  );
}

function PolarityView({
  state,
  selected,
  onCellTap,
  onDir,
  disabled,
}: {
  state: PolarityState;
  selected: number | null;
  onCellTap: (cellIdx: number) => void;
  onDir: (dr: number, dc: number) => void;
  disabled: boolean;
}) {
  return (
    <div>
      <div className="stat-line flex gap-4 text-ink/50 dark:text-white/40 mb-3">
        <span>
          Goal: <span className="text-polarity font-bold">+</span> left · <span className="font-bold" style={{ color: '#C23B8E' }}>−</span> right
        </span>
        <span>
          Slides left: <span className="font-mono text-ink dark:text-white">{SLIDE_BUDGET - state.slidesUsed}</span>
        </span>
      </div>

      <div className="border-2 border-graphite dark:border-white/80 mb-4 relative overflow-hidden">
        <div className="absolute top-0 bottom-0 left-1/2 border-l-2 border-dashed border-graphite/30 dark:border-white/20 pointer-events-none" />
        <div className="grid gap-1 bg-index/30 dark:bg-index-dark/30 p-1.5" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}>
          {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, cellIdx) => {
            const mag = getMagnetAt(state.positions, cellIdx);
            const isSelected = mag !== null && mag === selected;
            const pol = mag !== null ? state.polarities[mag] : null;
            return (
              <button
                key={cellIdx}
                onClick={() => onCellTap(cellIdx)}
                disabled={disabled}
                className={[
                  'aspect-square flex items-center justify-center font-mono font-bold text-xl border-2 transition-colors',
                  mag !== null
                    ? pol === '+'
                      ? isSelected
                        ? 'bg-polarity text-white border-graphite dark:border-white/80 scale-90'
                        : 'bg-polarity-soft text-polarity dark:bg-polarity/20 dark:text-white border-polarity'
                      : isSelected
                        ? 'bg-splice text-white border-graphite dark:border-white/80 scale-90'
                        : 'bg-splice-soft text-splice dark:bg-splice/20 dark:text-white border-splice'
                    : 'bg-panel dark:bg-panel-dark border-transparent',
                ].join(' ')}
              >
                {pol === '+' ? '+' : pol === '-' ? '−' : ''}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <p className="stat-line text-ink/50 dark:text-white/40">
          {selected === null ? 'Tap a magnet to select it' : `${state.polarities[selected]} magnet selected — choose direction`}
        </p>
        <div className="grid grid-cols-3 gap-2 w-36">
          <div />
          <DirButton d={DIRS[0]} onPress={onDir} disabled={selected === null} />
          <div />
          <DirButton d={DIRS[1]} onPress={onDir} disabled={selected === null} />
          <div />
          <DirButton d={DIRS[3]} onPress={onDir} disabled={selected === null} />
          <div />
          <DirButton d={DIRS[2]} onPress={onDir} disabled={selected === null} />
          <div />
        </div>
      </div>
    </div>
  );
}

export function PolarityBoard({ seed, dateString, puzzleNumber }: { seed: number; dateString: string; puzzleNumber: number }) {
  const game = GAMES.find((g) => g.slug === GAME_SLUG)!;

  // --- Daily puzzle (unchanged behavior) ---
  const [state, setState] = useState<PolarityState>(() => createInitialState(seed));
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);

  const dailyFinished = state.won || state.lost;

  function handleCellTap(cellIdx: number) {
    if (dailyFinished) return;
    const mag = getMagnetAt(state.positions, cellIdx);
    if (mag === null) {
      setSelected(null);
      return;
    }
    setSelected((s) => (s === mag ? null : mag));
  }

  function handleDir(dr: number, dc: number) {
    if (selected === null || dailyFinished) return;
    setState((prev) => applySlide(prev, selected, dr, dc));
  }

  // --- Coin Mode ---
  const [coins, setCoins] = useState<number>(() => loadCoinBalance());
  const [coinState, setCoinState] = useState<PolarityState | null>(null);
  const [coinSelected, setCoinSelected] = useState<number | null>(null);
  const [nickname, setNicknameState] = useState<string>(() => getNickname());
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const coinRoundSettledRef = useRef(false);
  const [lastCoinDelta, setLastCoinDelta] = useState(0);

  function startCoinRound() {
    coinRoundSettledRef.current = false;
    setCoinSelected(null);
    setCoinState(createInitialState(rollCoinSeed()));
  }

  function handleCoinCellTap(cellIdx: number) {
    if (!coinState || coinState.won || coinState.lost) return;
    const mag = getMagnetAt(coinState.positions, cellIdx);
    if (mag === null) {
      setCoinSelected(null);
      return;
    }
    setCoinSelected((s) => (s === mag ? null : mag));
  }

  function handleCoinDir(dr: number, dc: number) {
    if (coinSelected === null || !coinState || coinState.won || coinState.lost) return;
    setCoinState((prev) => (prev ? applySlide(prev, coinSelected, dr, dc) : prev));
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const d = DIRS.find((d) => d.key === e.key);
      if (!d) return;
      e.preventDefault();
      if (!dailyFinished) handleDir(d.dr, d.dc);
      else handleCoinDir(d.dr, d.dc);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  useEffect(() => {
    if ((state.won || state.lost) && !finishedRef.current) {
      finishedRef.current = true;
      recordResult(GAME_SLUG, { date: dateString, won: state.won, moves: state.slidesUsed, score: 0, elapsedMs: 0 });
      setStreak(getStreak(GAME_SLUG).current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.slidesUsed, dateString]);

  useEffect(() => {
    if (!coinState || coinRoundSettledRef.current) return;
    if (!coinState.won && !coinState.lost) return;
    coinRoundSettledRef.current = true;

    const delta = computeCoinDelta({ won: coinState.won, movesUsed: coinState.slidesUsed, movesLimit: SLIDE_BUDGET });
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
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.slidesUsed} movesLimit={SLIDE_BUDGET} />

      <PolarityView state={state} selected={selected} onCellTap={handleCellTap} onDir={handleDir} disabled={dailyFinished} />

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug={GAME_SLUG}
        gameName="Polarity"
        puzzleNumber={puzzleNumber}
        won={state.won}
        moves={state.slidesUsed}
        movesLimit={SLIDE_BUDGET}
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
          <PolarityView
            state={coinState}
            selected={coinSelected}
            onCellTap={handleCoinCellTap}
            onDir={handleCoinDir}
            disabled={coinState.won || coinState.lost}
          />
        )}
      </CoinModeSection>

      {showLeaderboard && <CoinLeaderboard onClose={() => setShowLeaderboard(false)} />}
    </div>
  );
}
