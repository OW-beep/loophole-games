'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { GameMeta } from '@/lib/games/registry';

const TEXT_CLASS: Record<string, string> = {
  echo: 'text-echo', mirror: 'text-mirror', debt: 'text-debt', gravity: 'text-gravity',
  fold: 'text-fold', carry: 'text-carry', brace: 'text-brace', splice: 'text-splice',
  heat: 'text-heat', oneline: 'text-oneline', overflow: 'text-overflow', polarity: 'text-polarity',
};

interface GameHeaderProps {
  game: GameMeta;
  puzzleNumber: number;
  movesUsed: number;
  movesLimit: number;
}

export function GameHeader({ game, puzzleNumber, movesUsed, movesLimit }: GameHeaderProps) {
  const [open, setOpen] = useState(false);
  const movesLeft = Math.max(movesLimit - movesUsed, 0);

  return (
    <>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <Link href="/" className="stat-line text-ink/40 dark:text-white/30 hover:underline">
            ← Index
          </Link>
          <h1 className={`font-display font-bold text-3xl mt-1 ${TEXT_CLASS[game.color]}`}>
            {game.name}
          </h1>
          <p className="stat-line text-ink/50 dark:text-white/40">
            Puzzle #{puzzleNumber} · {game.difficulty}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="stat-line text-ink/40 dark:text-white/30">Moves left</p>
            <p className="font-mono text-2xl font-medium tabular-nums leading-none">{movesLeft}</p>
          </div>
          <button
            onClick={() => setOpen(true)}
            aria-label="How to play"
            className="w-9 h-9 border-2 border-graphite dark:border-white/80 rounded-full font-display font-bold hover:bg-graphite hover:text-paper dark:hover:bg-white dark:hover:text-graphite transition-colors"
          >
            ?
          </button>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 bg-graphite/60 dark:bg-black/70 flex items-center justify-center p-4 z-50"
          onClick={() => setOpen(false)}
        >
          <div
            className="specimen-card bg-panel dark:bg-panel-dark max-w-md w-full p-6 pl-8 animate-punch-pop"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="punch-hole" aria-hidden />
            <h2 className="font-display font-bold text-xl mb-3">How to play {game.name}</h2>
            <ol className="space-y-2 text-sm text-ink/80 dark:text-white/70 list-decimal list-inside">
              {game.howToPlay.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
            <button
              onClick={() => setOpen(false)}
              className="stat-line mt-5 border-2 border-graphite dark:border-white/80 px-3 py-1.5 hover:bg-graphite hover:text-paper dark:hover:bg-white dark:hover:text-graphite transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
