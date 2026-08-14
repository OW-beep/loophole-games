'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createInitialState,
  selectCipherLetter,
  assignLetter,
  clearLetter,
  reconstruct,
  type CipherState,
} from '@/lib/games/cipher';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { CoinLeaderboard } from '@/components/CoinLeaderboard';
import { CoinModeSection } from '@/components/CoinModeSection';
import { GAMES } from '@/lib/games/registry';
import { loadCoinBalance, saveCoinBalance, rollCoinSeed, computeCoinDelta, GLOBAL_LEADERBOARD_SLUG } from '@/lib/coin-mode';
import { scaleLimit, type Difficulty } from '@/lib/difficulty';
import { getNickname, saveNickname, submitScore } from '@/lib/leaderboard-client';

const GAME_SLUG = 'cipher';
const AZ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function CipherView({ state, onTile, onAssign, disabled }: {
  state: CipherState;
  onTile: (ch: string) => void;
  onAssign: (letter: string) => void;
  disabled: boolean;
}) {
  const usedPlainLetters = new Set(state.guesses.values());
  const reconstructed = reconstruct(state);

  return (
    <div>
      <p className="stat-line text-ink/50 dark:text-white/40 mb-4">
        {state.distinctLetters.length} letters to crack · tap a tile, then pick its real letter
      </p>

      <div className="flex flex-wrap gap-x-1.5 gap-y-4 mb-6 justify-center">
        {state.ciphertext.split('').map((ch, i) => {
          if (ch === ' ') return <div key={i} className="w-3" />;
          if (!/[A-Z]/.test(ch)) {
            return (
              <span key={i} className="font-mono text-lg self-end pb-1">
                {ch}
              </span>
            );
          }
          const guessed = state.guesses.get(ch);
          const isSelected = state.selectedCipherLetter === ch;
          return (
            <button
              key={i}
              onClick={() => onTile(ch)}
              disabled={disabled}
              className={[
                'w-7 flex flex-col items-center border-b-2 pb-0.5',
                isSelected ? 'border-cipher' : 'border-graphite/40 dark:border-white/30',
              ].join(' ')}
            >
              <span className="font-mono text-lg font-semibold h-6">{guessed ?? '\u00a0'}</span>
              <span className="font-mono text-[10px] text-ink/40 dark:text-white/30">{ch}</span>
            </button>
          );
        })}
      </div>

      {state.won && <p className="stat-line text-center text-tether mb-4">Solved — {reconstructed}</p>}

      <p className="stat-line text-ink/40 dark:text-white/30 mb-2 text-center">
        {state.selectedCipherLetter ? `Assign a letter to "${state.selectedCipherLetter}"` : 'Tap a tile above first'}
      </p>
      <div className="grid grid-cols-9 gap-1 max-w-md mx-auto">
        {AZ.map((letter) => {
          const usedElsewhere =
            usedPlainLetters.has(letter) &&
            !(state.selectedCipherLetter && state.guesses.get(state.selectedCipherLetter) === letter);
          return (
            <button
              key={letter}
              onClick={() => onAssign(letter)}
              disabled={!state.selectedCipherLetter || disabled}
              className={[
                'aspect-square rounded font-mono text-xs font-semibold border-2 disabled:opacity-30',
                usedElsewhere ? 'border-cipher/50 text-cipher' : 'border-graphite dark:border-white/70',
              ].join(' ')}
            >
              {letter}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function CipherBoard({ seed, dateString, puzzleNumber }: { seed: number; dateString: string; puzzleNumber: number }) {
  const game = GAMES.find((g) => g.slug === GAME_SLUG)!;

  // --- Daily puzzle (unchanged behavior) ---
  const [state, setState] = useState<CipherState>(() => createInitialState(seed));
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
        score: state.distinctLetters.length,
        elapsedMs: 0,
      });
      setStreak(getStreak(GAME_SLUG).current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.movesUsed, state.distinctLetters.length, dateString]);

  const dailyFinished = state.won || state.lost;

  function handleTileTap(cipherChar: string) {
    if (state.guesses.has(cipherChar)) setState((s) => clearLetter(s, cipherChar));
    else setState((s) => selectCipherLetter(s, cipherChar));
  }

  // --- Coin Mode ---
  const [coins, setCoins] = useState<number>(() => loadCoinBalance());
  const [coinState, setCoinState] = useState<CipherState | null>(null);
  const [nickname, setNicknameState] = useState<string>(() => getNickname());
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const coinRoundSettledRef = useRef(false);
  const [lastCoinDelta, setLastCoinDelta] = useState(0);

  const [difficulty, setDifficulty] = useState<Difficulty>('normal');

  function startCoinRound() {
    coinRoundSettledRef.current = false;
    const fresh = createInitialState(rollCoinSeed());
    setCoinState({ ...fresh, moveLimit: scaleLimit(fresh.moveLimit, difficulty) });
  }

  function handleCoinTileTap(cipherChar: string) {
    setCoinState((s) => (s ? (s.guesses.has(cipherChar) ? clearLetter(s, cipherChar) : selectCipherLetter(s, cipherChar)) : s));
  }

  useEffect(() => {
    if (!coinState || coinRoundSettledRef.current) return;
    if (!coinState.won && !coinState.lost) return;
    coinRoundSettledRef.current = true;

    const delta = computeCoinDelta({ won: coinState.won, movesUsed: coinState.movesUsed, movesLimit: coinState.moveLimit, difficulty });
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
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.movesUsed} movesLimit={state.moveLimit} />

      <CipherView
        state={state}
        onTile={handleTileTap}
        onAssign={(letter) => setState((s) => assignLetter(s, letter))}
        disabled={dailyFinished}
      />

      <p className="stat-line text-center text-ink/40 dark:text-white/30 mt-5">
        Each cipher letter always stands for the same real letter throughout the phrase.
      </p>

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug={GAME_SLUG}
        gameName={game.name}
        puzzleNumber={puzzleNumber}
        won={state.won}
        moves={state.movesUsed}
        movesLimit={state.moveLimit}
        score={state.distinctLetters.length}
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
          <CipherView
            state={coinState}
            onTile={handleCoinTileTap}
            onAssign={(letter) => setCoinState((s) => (s ? assignLetter(s, letter) : s))}
            disabled={coinState.won || coinState.lost}
          />
        )}
      </CoinModeSection>

      {showLeaderboard && <CoinLeaderboard onClose={() => setShowLeaderboard(false)} />}
    </div>
  );
}
