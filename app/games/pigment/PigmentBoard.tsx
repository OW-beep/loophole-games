'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createInitialState,
  addInk,
  clearWell,
  bottle,
  canBottle,
  currentMix,
  currentMatch,
  rgbToCss,
  INKS,
  MIX_BUDGET,
  TARGET_COUNT,
  type PigmentState,
  type InkName,
} from '@/lib/games/pigment';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { GAMES } from '@/lib/games/registry';

export function PigmentBoard({
  seed,
  dateString,
  puzzleNumber,
}: {
  seed: number;
  dateString: string;
  puzzleNumber: number;
}) {
  const game = GAMES.find((g) => g.slug === 'pigment')!;
  const [state, setState] = useState<PigmentState>(() => createInitialState(seed));
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if ((state.won || state.lost) && !finishedRef.current) {
      finishedRef.current = true;
      recordResult('pigment', {
        date: dateString,
        won: state.won,
        moves: state.tapsUsed,
        score: state.bottled,
        elapsedMs: 0,
      });
      setStreak(getStreak('pigment').current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.tapsUsed, state.bottled, dateString]);

  const mix = currentMix(state);
  const match = currentMatch(state);
  const ready = canBottle(state);

  return (
    <div>
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.tapsUsed} movesLimit={MIX_BUDGET} />

      <div className="stat-line flex gap-4 text-ink/50 dark:text-white/40 mb-4">
        <span>
          Target {Math.min(state.targetIndex + 1, TARGET_COUNT)} / {TARGET_COUNT}
        </span>
        <span>
          Bottled: <span className="font-mono text-ink dark:text-white">{state.bottled}</span>
        </span>
        <span>
          Taps left: <span className="font-mono text-ink dark:text-white">{MIX_BUDGET - state.tapsUsed}</span>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="text-center">
          <p className="stat-line text-ink/40 dark:text-white/30 mb-1.5">TARGET</p>
          <div
            className="w-full aspect-square rounded-lg border-2 border-graphite dark:border-white/80"
            style={{ background: rgbToCss(state.targets[state.targetIndex]) }}
          />
        </div>
        <div className="text-center">
          <p className="stat-line text-ink/40 dark:text-white/30 mb-1.5">YOUR MIX</p>
          <div
            className="w-full aspect-square rounded-lg border-2 border-graphite dark:border-white/80"
            style={{ background: rgbToCss(mix) }}
          />
        </div>
      </div>

      <div className="mb-5">
        <div className="h-2 rounded-full bg-index dark:bg-index-dark overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${match}%`, background: ready ? '#4CAF7D' : '#B8862E' }}
          />
        </div>
        <p className="stat-line text-center mt-1.5 text-ink/50 dark:text-white/40">{match}% match</p>
      </div>

      <div className="grid grid-cols-5 gap-2 mb-4">
        {INKS.map((ink) => (
          <button
            key={ink.name}
            disabled={state.won || state.lost}
            onClick={() => setState((s) => addInk(s, ink.name as InkName))}
            className="aspect-square rounded-lg border-2 border-graphite dark:border-white/60 disabled:opacity-30 active:scale-95 transition"
            style={{ background: rgbToCss(ink.rgb) }}
            title={ink.name}
          />
        ))}
      </div>

      <div className="flex gap-2.5">
        <button
          onClick={() => setState(clearWell)}
          disabled={state.wellTaps.length === 0 || state.won || state.lost}
          className="flex-1 rounded-lg py-2.5 text-sm font-semibold border-2 border-graphite dark:border-white/80 disabled:opacity-30"
        >
          Clear (free)
        </button>
        <button
          onClick={() => setState(bottle)}
          disabled={!ready}
          className="flex-1 rounded-lg py-2.5 text-sm font-semibold border-2 border-pigment text-pigment disabled:opacity-30"
        >
          Bottle it
        </button>
      </div>

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug="pigment"
        gameName={game.name}
        puzzleNumber={puzzleNumber}
        won={state.won}
        moves={state.tapsUsed}
        movesLimit={MIX_BUDGET}
        score={state.bottled}
        streak={streak}
      />
    </div>
  );
}
