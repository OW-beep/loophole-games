'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { GameMeta } from '@/lib/games/registry';

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
      {/* Marquee: a small nod to an arcade cabinet's lit-up header sign —
          solid color band, bold white type, "bolt" dots at the corners —
          rather than a plain text title like the rest of the site's pages. */}
      <div className={`relative rounded-t-lg px-4 py-2.5 mb-0 bg-${game.color} overflow-hidden`}>
        <span className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-bolt-yellow animate-marquee-glow" aria-hidden />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-bolt-yellow animate-marquee-glow" style={{ animationDelay: '0.7s' }} aria-hidden />
        <Link
          href="/"
          className="stat-line text-white/70 hover:text-white hover:underline transition-colors"
        >
          ← Index
        </Link>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight">
          {game.name}
        </h1>
      </div>

      <div className="flex items-center justify-between gap-4 mb-6 border-2 border-t-0 border-graphite dark:border-white/80 rounded-b-lg px-4 py-2.5 bg-panel dark:bg-panel-dark">
        <p className="stat-line text-ink/50 dark:text-white/40">
          Puzzle #{puzzleNumber} · {game.difficulty}
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 bg-graphite dark:bg-black/40 rounded px-2.5 py-1 border border-bolt-yellow/40">
            <span className="stat-line text-white/50">MOVES</span>
            <span className="font-mono text-lg font-bold tabular-nums leading-none text-bolt-yellow">
              {String(movesLeft).padStart(2, '0')}
            </span>
          </div>
          <button
            onClick={() => setOpen(true)}
            aria-label="How to play"
            className="w-9 h-9 border-2 border-graphite dark:border-white/80 rounded-full font-display font-bold shadow-tag dark:shadow-tag-dark hover:shadow-pop hover:border-bolt-pink hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all"
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
