'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createInitialState,
  tapPyramidCard,
  tapWaste,
  draw,
  isExposed,
  wasteCard,
  PYRAMID_ROWS,
  PYRAMID_CARD_COUNT,
  DRAW_BUDGET,
  TARGET_SUM,
  type CairnState,
} from '@/lib/games/cairn';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { GAMES } from '@/lib/games/registry';

function CardFace({
  value,
  suit,
  state,
}: {
  value: number;
  suit: string;
  state: 'hidden' | 'locked' | 'exposed' | 'selected';
}) {
  if (state === 'hidden') {
    return <div className="w-full h-full rounded-md bg-index dark:bg-index-dark" />;
  }
  const isRed = suit === '♥' || suit === '♦';
  return (
    <div
      className={[
        'w-full h-full rounded-md border-2 flex flex-col items-center justify-center font-mono text-sm font-semibold transition-colors',
        state === 'selected'
          ? 'border-cairn bg-cairn-soft dark:bg-cairn/20'
          : state === 'locked'
            ? 'border-graphite/30 dark:border-white/20 opacity-40'
            : 'border-graphite dark:border-white/70 bg-panel dark:bg-panel-dark',
        isRed ? 'text-debt' : 'text-ink dark:text-white',
      ].join(' ')}
    >
      <span>{value}</span>
      <span className="text-xs leading-none">{suit}</span>
    </div>
  );
}

export function CairnBoard({
  seed,
  dateString,
  puzzleNumber,
}: {
  seed: number;
  dateString: string;
  puzzleNumber: number;
}) {
  const game = GAMES.find((g) => g.slug === 'cairn')!;
  const [state, setState] = useState<CairnState>(() => createInitialState(seed));
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if ((state.won || state.lost) && !finishedRef.current) {
      finishedRef.current = true;
      recordResult('cairn', {
        date: dateString,
        won: state.won,
        moves: state.drawIndex + 1,
        score: state.removedCount,
        elapsedMs: 0,
      });
      setStreak(getStreak('cairn').current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.drawIndex, state.removedCount, dateString]);

  const waste = wasteCard(state);
  const drawsUsed = state.drawIndex + 1;

  return (
    <div>
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={drawsUsed} movesLimit={DRAW_BUDGET} />

      <p className="stat-line text-ink/50 dark:text-white/40 mb-4">
        Cleared {state.removedCount} / {PYRAMID_CARD_COUNT} · pairs must sum to{' '}
        <span className="font-mono text-ink dark:text-white">{TARGET_SUM}</span>
      </p>

      <div className="flex flex-col items-center gap-1.5 mb-6">
        {Array.from({ length: PYRAMID_ROWS }).map((_, row) => (
          <div key={row} className="flex gap-1.5">
            {Array.from({ length: row + 1 }).map((_, col) => {
              const card = state.pyramid[row][col];
              const exposed = isExposed(state, row, col);
              const isSelected = state.selected?.row === row && state.selected?.col === col;
              const cellState = card.removed
                ? 'hidden'
                : isSelected
                  ? 'selected'
                  : exposed
                    ? 'exposed'
                    : 'locked';
              return (
                <button
                  key={col}
                  onClick={() => setState((s) => tapPyramidCard(s, row, col))}
                  disabled={card.removed || !exposed || state.won || state.lost}
                  className="w-12 h-16 sm:w-14 sm:h-20"
                >
                  {card.removed ? (
                    <div className="w-full h-full" />
                  ) : (
                    <CardFace value={card.value} suit={card.suit} state={cellState} />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-4 mb-5">
        <div className="text-center">
          <p className="stat-line text-ink/40 dark:text-white/30 mb-1">WASTE</p>
          <button
            onClick={() => setState(tapWaste)}
            disabled={!waste || state.won || state.lost}
            className="w-14 h-20 block"
          >
            {waste ? (
              <CardFace value={waste.value} suit={waste.suit} state={state.wasteSelected ? 'selected' : 'exposed'} />
            ) : (
              <div className="w-full h-full rounded-md border-2 border-dashed border-graphite/30 dark:border-white/20" />
            )}
          </button>
        </div>
        <button
          onClick={() => setState(draw)}
          disabled={state.won || state.lost || state.drawIndex >= DRAW_BUDGET - 1}
          className="stat-line border-2 border-graphite dark:border-white/80 rounded-lg px-4 py-2.5 disabled:opacity-30 hover:bg-graphite hover:text-paper dark:hover:bg-white dark:hover:text-graphite transition-colors"
        >
          Draw ({DRAW_BUDGET - drawsUsed} left)
        </button>
      </div>

      <p className="stat-line text-center text-ink/40 dark:text-white/30">
        Tap two exposed cards that add up to {TARGET_SUM}. Only the bottom row and the waste card start exposed.
      </p>

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug="cairn"
        gameName={game.name}
        puzzleNumber={puzzleNumber}
        won={state.won}
        moves={drawsUsed}
        movesLimit={DRAW_BUDGET}
        score={state.removedCount}
        streak={streak}
      />
    </div>
  );
}
