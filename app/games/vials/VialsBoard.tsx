'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createInitialState,
  tapTube,
  NUM_COLORS,
  TUBE_CAPACITY,
  TOTAL_TUBES,
  type VialsState,
} from '@/lib/games/vials';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { CoinLeaderboard } from '@/components/CoinLeaderboard';
import { CoinModeSection } from '@/components/CoinModeSection';
import { GAMES } from '@/lib/games/registry';
import { loadCoinBalance, saveCoinBalance, rollCoinSeed, computeCoinDelta, GLOBAL_LEADERBOARD_SLUG } from '@/lib/coin-mode';
import { scaleLimit, type Difficulty } from '@/lib/difficulty';
import { getNickname, saveNickname, submitScore } from '@/lib/leaderboard-client';

const GAME_SLUG = 'vials';

const COLOR_PALETTE = ['#EF9A9A', '#90CAF9', '#A5D6A7', '#FFCC80', '#CE93D8'];

function Tube({
  tube,
  selected,
  invalid,
  solved,
  onClick,
}: {
  tube: number[];
  selected: boolean;
  invalid: boolean;
  solved: boolean;
  onClick: () => void;
}) {
  const empties = TUBE_CAPACITY - tube.length;
  return (
    <button
      onClick={onClick}
      className={[
        'relative flex flex-col-reverse items-stretch justify-start w-11 sm:w-12 h-40 sm:h-44 rounded-b-2xl rounded-t-md border-2 overflow-hidden bg-black/5 dark:bg-white/5 transition-transform',
        selected ? '-translate-y-3 border-graphite dark:border-white shadow-lg' : 'border-graphite/30 dark:border-white/30',
        invalid ? 'animate-shake' : '',
        solved ? 'ring-2 ring-offset-2 ring-green-500 dark:ring-offset-black' : '',
      ].join(' ')}
    >
      {Array.from({ length: empties }).map((_, i) => (
        <div key={`e${i}`} className="flex-1" />
      ))}
      {tube.map((color, i) => (
        <div
          key={i}
          className="flex-1 transition-all duration-200"
          style={{ backgroundColor: COLOR_PALETTE[color % COLOR_PALETTE.length] }}
        />
      ))}
    </button>
  );
}

function VialsGrid({
  state,
  onTap,
}: {
  state: VialsState;
  onTap: (i: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3 justify-center items-end mb-4 py-4">
      {state.tubes.map((tube, i) => {
        const solved = tube.length === TUBE_CAPACITY && tube.every((c) => c === tube[0]);
        return (
          <Tube
            key={i}
            tube={tube}
            selected={state.selected === i}
            invalid={state.lastInvalid === i}
            solved={solved}
            onClick={() => onTap(i)}
          />
        );
      })}
    </div>
  );
}

export function VialsBoard({ seed, dateString, puzzleNumber }: { seed: number; dateString: string; puzzleNumber: number }) {
  const game = GAMES.find((g) => g.slug === GAME_SLUG)!;

  // --- Daily puzzle ---
  const [state, setState] = useState<VialsState>(() => createInitialState(seed));
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);

  const dailyFinished = state.won || state.lost;

  function handleTap(i: number) {
    setState((prev) => tapTube(prev, i));
  }

  useEffect(() => {
    if ((state.won || state.lost) && !finishedRef.current) {
      finishedRef.current = true;
      recordResult(GAME_SLUG, {
        date: dateString,
        won: state.won,
        moves: state.movesUsed,
        score: state.movesUsed,
        elapsedMs: 0,
      });
      setStreak(getStreak(GAME_SLUG).current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.movesUsed, dateString]);

  // --- Coin Mode ---
  const [coins, setCoins] = useState<number>(() => loadCoinBalance());
  const [coinState, setCoinState] = useState<VialsState | null>(null);
  const [nickname, setNicknameState] = useState<string>(() => getNickname());
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const coinRoundSettledRef = useRef(false);
  const [lastCoinDelta, setLastCoinDelta] = useState(0);

  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const coinBudgetRef = useRef<number | undefined>(undefined);

  function startCoinRound() {
    coinRoundSettledRef.current = false;
    const seed2 = rollCoinSeed();
    const fresh = createInitialState(seed2);
    coinBudgetRef.current = scaleLimit(fresh.movesLimit, difficulty);
    setCoinState(createInitialState(seed2, coinBudgetRef.current));
  }

  function handleCoinTap(i: number) {
    if (!coinState) return;
    setCoinState((prev) => (prev ? tapTube(prev, i) : prev));
  }

  useEffect(() => {
    if (!coinState || coinRoundSettledRef.current) return;
    if (!coinState.won && !coinState.lost) return;
    coinRoundSettledRef.current = true;

    const delta = computeCoinDelta({
      won: coinState.won,
      movesUsed: coinState.movesUsed,
      movesLimit: coinState.movesLimit,
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
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.movesUsed} movesLimit={state.movesLimit} />

      <VialsGrid state={state} onTap={handleTap} />
      <p className="stat-line text-ink/50 dark:text-white/40 text-center mb-6">
        Tap a tube to pick it up, tap another to pour. Sort all {NUM_COLORS} colors into their own tube.
      </p>

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug={GAME_SLUG}
        gameName="Vials"
        puzzleNumber={puzzleNumber}
        won={state.won}
        moves={state.movesUsed}
        movesLimit={state.movesLimit}
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
        {coinState && <VialsGrid state={coinState} onTap={handleCoinTap} />}
      </CoinModeSection>

      {showLeaderboard && <CoinLeaderboard onClose={() => setShowLeaderboard(false)} />}
    </div>
  );
}
