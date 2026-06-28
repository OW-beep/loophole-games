'use client';

import { useState } from 'react';
import Link from 'next/link';
import { shareResult } from '@/lib/share';
import { GAMES } from '@/lib/games/registry';

interface ResultModalProps {
  open: boolean;
  onClose: () => void;
  gameSlug: string;
  gameName: string;
  puzzleNumber: number;
  won: boolean;
  moves: number;
  movesLimit: number;
  score?: number;
  streak: number;
}

export function ResultModal({
  open,
  onClose,
  gameSlug,
  gameName,
  puzzleNumber,
  won,
  moves,
  movesLimit,
  score,
  streak,
}: ResultModalProps) {
  const [shareState, setShareState] = useState<'idle' | 'shared' | 'copied' | 'failed'>('idle');

  if (!open) return null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://loophole.games';
  const otherGames = GAMES.filter((g) => g.slug !== gameSlug).slice(0, 2);

  async function handleShare() {
    const result = await shareResult({
      gameName,
      puzzleNumber,
      won,
      moves,
      movesLimit,
      score,
      url: `${siteUrl}/games/${gameSlug}`,
    });
    setShareState(result);
  }

  return (
    <div className="fixed inset-0 bg-graphite/60 dark:bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="specimen-card bg-panel dark:bg-panel-dark max-w-md w-full p-6 pl-8 animate-punch-pop">
        <span className="punch-hole" aria-hidden />
        <p className="stat-line text-ink/50 dark:text-white/40 mb-1">
          Puzzle #{puzzleNumber}
        </p>
        <h2 className="font-display font-bold text-2xl mb-4">
          {won ? 'Solved.' : 'Out of moves.'}
        </h2>

        <dl className="stat-line grid grid-cols-3 gap-3 mb-5 text-ink/60 dark:text-white/50">
          <div>
            <dt>Moves</dt>
            <dd className="font-mono text-base text-ink dark:text-white">
              {moves}/{movesLimit}
            </dd>
          </div>
          {score !== undefined && (
            <div>
              <dt>Score</dt>
              <dd className="font-mono text-base text-ink dark:text-white">{score}</dd>
            </div>
          )}
          <div>
            <dt>Streak</dt>
            <dd className="font-mono text-base text-ink dark:text-white">🔥{streak}</dd>
          </div>
        </dl>

        <button
          onClick={handleShare}
          className="stat-line w-full border-2 border-graphite dark:border-white/80 px-3 py-2.5 mb-2 hover:bg-graphite hover:text-paper dark:hover:bg-white dark:hover:text-graphite transition-colors"
        >
          {shareState === 'idle' && 'Share result'}
          {shareState === 'shared' && 'Shared ✓'}
          {shareState === 'copied' && 'Copied to clipboard ✓'}
          {shareState === 'failed' && 'Couldn\u2019t share — try again'}
        </button>

        <button
          onClick={onClose}
          className="stat-line w-full px-3 py-2.5 mb-5 text-ink/60 dark:text-white/50 hover:underline"
        >
          Close
        </button>

        {otherGames.length > 0 && (
          <div className="border-t border-index dark:border-index-dark pt-4">
            <p className="stat-line text-ink/40 dark:text-white/30 mb-2">More from the index</p>
            <div className="flex gap-2">
              {otherGames.map((g) => (
                <Link
                  key={g.slug}
                  href={`/games/${g.slug}`}
                  className="stat-line border border-graphite dark:border-white/60 px-2 py-1 hover:bg-graphite hover:text-paper dark:hover:bg-white dark:hover:text-graphite transition-colors"
                >
                  {g.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
