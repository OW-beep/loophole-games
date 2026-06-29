'use client';

import { useEffect, useRef, useState } from 'react';
import { createInitialState, applyMerge, MERGE_BUDGET, type CarryChainState } from '@/lib/games/carry-chain';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { GAMES } from '@/lib/games/registry';

export function CarryChainBoard({ seed, dateString, puzzleNumber }: { seed: number; dateString: string; puzzleNumber: number }) {
  const game = GAMES.find((g) => g.slug === 'carry-chain')!;
  const [state, setState] = useState<CarryChainState>(() => createInitialState(seed));
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);

  function handleTap(i: number) {
    if (state.won || state.lost) return;
    if (selected === null) {
      setSelected(i);
      return;
    }
    if (selected === i) {
      setSelected(null);
      return;
    }
    if (Math.abs(selected - i) === 1) {
      const left = Math.min(selected, i);
      setState((prev) => applyMerge(prev, left));
      setSelected(null);
    } else {
      setSelected(i);
    }
  }

  useEffect(() => {
    if ((state.won || state.lost) && !finishedRef.current) {
      finishedRef.current = true;
      recordResult('carry-chain', {
        date: dateString,
        won: state.won,
        moves: state.mergesUsed,
        score: state.total,
        elapsedMs: 0,
      });
      setStreak(getStreak('carry-chain').current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.mergesUsed, state.total, dateString]);

  return (
    <div>
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.mergesUsed} movesLimit={MERGE_BUDGET} />

      <div className="stat-line flex justify-between text-ink/50 dark:text-white/40 mb-3">
        <span>
          Total: <span className="font-mono text-lg text-ink dark:text-white">{state.total}</span>
        </span>
        <span>
          Target: <span className="font-mono text-lg text-ink dark:text-white">{state.target}</span>
        </span>
      </div>

      <div className="flex items-center justify-center gap-1.5 mb-8 flex-wrap py-4">
        {state.row.map((value, i) => (
          <button
            key={i}
            onClick={() => handleTap(i)}
            disabled={state.won || state.lost}
            aria-label={`Token ${value}`}
            className={[
              'w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center font-mono font-bold text-base sm:text-lg border-2 border-graphite dark:border-white/80 transition-transform',
              selected === i ? 'bg-carry text-white scale-90' : 'bg-carry-soft text-graphite dark:bg-carry/20 dark:text-white',
            ].join(' ')}
          >
            {value}
          </button>
        ))}
      </div>

      <p className="stat-line text-ink/50 dark:text-white/40 text-center">
        {selected === null
          ? 'Tap a token, then tap its neighbor to merge them.'
          : 'Tap the token next to it to merge — or tap it again to deselect.'}
      </p>

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug="carry-chain"
        gameName="Carry Chain"
        puzzleNumber={puzzleNumber}
        won={state.won}
        moves={state.mergesUsed}
        movesLimit={MERGE_BUDGET}
        score={state.total}
        streak={streak}
      />
    </div>
  );
}
