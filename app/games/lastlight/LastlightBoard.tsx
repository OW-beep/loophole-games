'use client';

import { useEffect, useRef, useState } from 'react';
import { createInitialState, playerMove, type LastlightState } from '@/lib/games/lastlight';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { CoinLeaderboard } from '@/components/CoinLeaderboard';
import { CoinModeSection } from '@/components/CoinModeSection';
import { GAMES } from '@/lib/games/registry';
import { loadCoinBalance, saveCoinBalance, rollCoinSeed, computeCoinDelta, GLOBAL_LEADERBOARD_SLUG } from '@/lib/coin-mode';
import { getNickname, saveNickname, submitScore } from '@/lib/leaderboard-client';

const GAME_SLUG = 'lastlight';

function PilesView({
  state,
  onTake,
  disabled,
}: {
  state: LastlightState;
  onTake: (pileIndex: number, tokenLocalIndex: number) => void;
  disabled: boolean;
}) {
  return (
    <div>
      <p className="stat-line text-center text-ink/50 dark:text-white/40 mb-2">
        Take any number of tokens from one pile. Whoever takes the last token wins.
      </p>
      {state.lastCpuMove && (
        <p className="stat-line text-center text-lastlight mb-4">
          CPU took {state.lastCpuMove.took} from pile {state.lastCpuMove.pile + 1}
        </p>
      )}

      <div className="space-y-3 mb-4 max-w-sm mx-auto">
        {state.piles.map((count, pileIndex) => (
          <div key={pileIndex} className="flex items-center gap-2">
            <span className="stat-line text-ink/40 dark:text-white/30 w-14 shrink-0">Pile {pileIndex + 1}</span>
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: count }).map((_, tokenIndex) => (
                <button
                  key={tokenIndex}
                  onClick={() => onTake(pileIndex, tokenIndex)}
                  disabled={disabled || state.turn !== 'player'}
                  title="Take this token and every token after it in this pile"
                  className="w-6 h-6 rounded-full border-2 border-lastlight bg-lastlight-soft dark:bg-lastlight/20 disabled:opacity-30 hover:bg-lastlight hover:border-lastlight transition-colors"
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="stat-line text-center text-ink/40 dark:text-white/30">
        Tapping a token takes it and every token to its right in that pile — tap the first token in a row to
        clear the whole pile.
      </p>
    </div>
  );
}

export function LastlightBoard({ seed, dateString, puzzleNumber }: { seed: number; dateString: string; puzzleNumber: number }) {
  const game = GAMES.find((g) => g.slug === GAME_SLUG)!;

  // --- Daily puzzle (unchanged behavior) ---
  const [state, setState] = useState<LastlightState>(() => createInitialState(seed));
  const [turnCount, setTurnCount] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);
  const totalTokens = useRef(state.piles.reduce((a, b) => a + b, 0)).current;

  const dailyFinished = state.won || state.lost;

  function handleTake(pileIndex: number, tokenLocalIndex: number) {
    if (state.turn !== 'player') return;
    setState((s) => playerMove(s, pileIndex, tokenLocalIndex));
    setTurnCount((c) => c + 1);
  }

  useEffect(() => {
    if ((state.won || state.lost) && !finishedRef.current) {
      finishedRef.current = true;
      recordResult(GAME_SLUG, {
        date: dateString,
        won: state.won,
        moves: turnCount,
        score: totalTokens,
        elapsedMs: 0,
      });
      setStreak(getStreak(GAME_SLUG).current);
      setShowResult(true);
    }
  }, [state.won, state.lost, turnCount, totalTokens, dateString]);

  // --- Coin Mode ---
  const [coins, setCoins] = useState<number>(() => loadCoinBalance());
  const [coinState, setCoinState] = useState<LastlightState | null>(null);
  const [coinTurnCount, setCoinTurnCount] = useState(0);
  const coinTotalTokensRef = useRef(0);
  const [nickname, setNicknameState] = useState<string>(() => getNickname());
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const coinRoundSettledRef = useRef(false);
  const [lastCoinDelta, setLastCoinDelta] = useState(0);

  function startCoinRound() {
    coinRoundSettledRef.current = false;
    setCoinTurnCount(0);
    const fresh = createInitialState(rollCoinSeed());
    coinTotalTokensRef.current = fresh.piles.reduce((a, b) => a + b, 0);
    setCoinState(fresh);
  }

  function handleCoinTake(pileIndex: number, tokenLocalIndex: number) {
    if (!coinState || coinState.turn !== 'player') return;
    setCoinState((s) => (s ? playerMove(s, pileIndex, tokenLocalIndex) : s));
    setCoinTurnCount((c) => c + 1);
  }

  useEffect(() => {
    if (!coinState || coinRoundSettledRef.current) return;
    if (!coinState.won && !coinState.lost) return;
    coinRoundSettledRef.current = true;

    const delta = computeCoinDelta({
      won: coinState.won,
      movesUsed: coinTurnCount,
      movesLimit: coinTotalTokensRef.current || 1,
    });
    setLastCoinDelta(delta);
    setCoins((prev) => {
      const next = Math.max(0, prev + delta);
      saveCoinBalance(next);
      if (nickname) submitScore(GLOBAL_LEADERBOARD_SLUG, nickname, next);
      return next;
    });
  }, [coinState, coinTurnCount, nickname]);

  function handleSaveNickname(name: string) {
    saveNickname(name);
    setNicknameState(name);
  }

  return (
    <div>
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={turnCount} movesLimit={totalTokens} />

      <PilesView state={state} onTake={handleTake} disabled={dailyFinished} />

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug={GAME_SLUG}
        gameName={game.name}
        puzzleNumber={puzzleNumber}
        won={state.won}
        moves={turnCount}
        movesLimit={totalTokens}
        score={totalTokens}
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
        {coinState && <PilesView state={coinState} onTake={handleCoinTake} disabled={coinState.won || coinState.lost} />}
      </CoinModeSection>

      {showLeaderboard && <CoinLeaderboard onClose={() => setShowLeaderboard(false)} />}
    </div>
  );
}
