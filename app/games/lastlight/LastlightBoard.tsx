'use client';

import { useEffect, useRef, useState } from 'react';
import { createInitialState, playerMove, type LastlightState } from '@/lib/games/lastlight';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { GAMES } from '@/lib/games/registry';

export function LastlightBoard({
  seed,
  dateString,
  puzzleNumber,
}: {
  seed: number;
  dateString: string;
  puzzleNumber: number;
}) {
  const game = GAMES.find((g) => g.slug === 'lastlight')!;
  const [state, setState] = useState<LastlightState>(() => createInitialState(seed));
  const [turnCount, setTurnCount] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);

  const totalTokens = useRef(state.piles.reduce((a, b) => a + b, 0)).current;

  useEffect(() => {
    if ((state.won || state.lost) && !finishedRef.current) {
      finishedRef.current = true;
      recordResult('lastlight', {
        date: dateString,
        won: state.won,
        moves: turnCount,
        score: totalTokens,
        elapsedMs: 0,
      });
      setStreak(getStreak('lastlight').current);
      setShowResult(true);
    }
  }, [state.won, state.lost, turnCount, totalTokens, dateString]);

  function handleTake(pileIndex: number, tokenLocalIndex: number) {
    if (state.turn !== 'player') return;
    setState((s) => playerMove(s, pileIndex, tokenLocalIndex));
    setTurnCount((c) => c + 1);
  }

  return (
    <div>
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={turnCount} movesLimit={totalTokens} />

      <p className="stat-line text-center text-ink/50 dark:text-white/40 mb-2">
        Take any number of tokens from one pile. Whoever takes the last token wins.
      </p>
      {state.lastCpuMove && (
        <p className="stat-line text-center text-lastlight mb-4">
          CPU took {state.lastCpuMove.took} from pile {state.lastCpuMove.pile + 1}
        </p>
      )}

      <div className="space-y-3 mb-5 max-w-sm mx-auto">
        {state.piles.map((count, pileIndex) => (
          <div key={pileIndex} className="flex items-center gap-2">
            <span className="stat-line text-ink/40 dark:text-white/30 w-14 shrink-0">Pile {pileIndex + 1}</span>
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: count }).map((_, tokenIndex) => (
                <button
                  key={tokenIndex}
                  onClick={() => handleTake(pileIndex, tokenIndex)}
                  disabled={state.turn !== 'player'}
                  title="Take this token and every token after it in this pile"
                  className="w-6 h-6 rounded-full border-2 border-lastlight bg-lastlight-soft dark:bg-lastlight/20 disabled:opacity-30 hover:bg-lastlight hover:border-lastlight transition-colors"
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="stat-line text-center text-ink/40 dark:text-white/30">
        Tapping a token takes it and every token to its right in that pile {'\u2014'} tap the first token in a row to
        clear the whole pile.
      </p>

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug="lastlight"
        gameName={game.name}
        puzzleNumber={puzzleNumber}
        won={state.won}
        moves={turnCount}
        movesLimit={totalTokens}
        score={totalTokens}
        streak={streak}
      />
    </div>
  );
}
