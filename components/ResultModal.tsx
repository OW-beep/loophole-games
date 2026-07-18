'use client';

import { useMemo, useState } from 'react';
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

// Affiliate banners — shown one at a time, chosen at random each time the
// modal opens. Displayed at 150×125 (half the original 300×250) so they
// sit comfortably inside the modal without dominating the layout.
const BANNERS = [
  {
    label: 'Server',
    href: 'https://px.a8.net/svt/ejp?a8mat=3TNLL7+D8W8C2+348+6NETT',
    img:  'https://www26.a8.net/svt/bgt?aid=231208459801&wid=001&eno=01&mid=s00000000404001117000&mc=1',
    pixel:'https://www11.a8.net/0.gif?a8mat=3TNLL7+D8W8C2+348+6NETT',
  },
  {
    label: 'Anime',
    href: 'https://px.a8.net/svt/ejp?a8mat=4B7VL8+BAN3Q2+5R76+5YZ75',
    img:  'https://www22.a8.net/svt/bgt?aid=260708012683&wid=002&eno=01&mid=s00000026853001003000&mc=1',
    pixel:'https://www12.a8.net/0.gif?a8mat=4B7VL8+BAN3Q2+5R76+5YZ75',
  },
  {
    label: 'Goods',
    href: 'https://px.a8.net/svt/ejp?a8mat=4B7VL8+AWY4T6+5ERO+5YZ75',
    img:  'https://www25.a8.net/svt/bgt?aid=260708012660&wid=002&eno=01&mid=s00000025242001003000&mc=1',
    pixel:'https://www18.a8.net/0.gif?a8mat=4B7VL8+AWY4T6+5ERO+5YZ75',
  },
  {
    label: 'PC',
    href: 'https://px.a8.net/svt/ejp?a8mat=4B7VL8+AWCP7E+XTI+15RZIP',
    img:  'https://www26.a8.net/svt/bgt?aid=260708012659&wid=002&eno=01&mid=s00000004383007017000&mc=1',
    pixel:'https://www19.a8.net/0.gif?a8mat=4B7VL8+AWCP7E+XTI+15RZIP',
  },
];

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

  // Pick one banner randomly when the modal first renders (stable for the
  // lifetime of this modal instance via useMemo).
  const banner = useMemo(
    () => BANNERS[Math.floor(Math.random() * BANNERS.length)],
    []
  );

  if (!open) return null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://loophole.games';
  const otherGames = GAMES.filter((g) => g.slug !== gameSlug).slice(0, 2);

  async function handleShare() {
    const result = await shareResult({
      gameName, puzzleNumber, won, moves, movesLimit, score,
      url: `${siteUrl}/games/${gameSlug}`,
    });
    setShareState(result);
  }

  return (
    <div className="fixed inset-0 bg-graphite/60 dark:bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="specimen-card bg-panel dark:bg-panel-dark max-w-md w-full p-6 pl-8 animate-punch-pop">
        <span className="punch-hole" aria-hidden />

        <p className="stat-line text-ink/50 dark:text-white/40 mb-1">Puzzle #{puzzleNumber}</p>
        <h2 className="font-display font-bold text-2xl mb-4">
          {won ? 'Solved.' : 'Out of moves.'}
        </h2>

        <dl className="stat-line grid grid-cols-3 gap-3 mb-5 text-ink/60 dark:text-white/50">
          <div>
            <dt>Moves</dt>
            <dd className="font-mono text-base text-ink dark:text-white">{moves}/{movesLimit}</dd>
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
          className="stat-line w-full border-2 border-graphite dark:border-white/80 px-3 py-2.5 mb-4 hover:bg-graphite hover:text-paper dark:hover:bg-white dark:hover:text-graphite transition-colors"
        >
          {shareState === 'idle' && 'Share result'}
          {shareState === 'shared' && 'Shared ✓'}
          {shareState === 'copied' && 'Copied to clipboard ✓'}
          {shareState === 'failed' && "Couldn't share — try again"}
        </button>

        {/* Affiliate banner — 150×125, centered, clearly labelled as an ad */}
        <div className="relative border border-index dark:border-index-dark mb-4">
          <div className="stat-line flex items-center gap-1.5 px-2 py-1 border-b border-index dark:border-index-dark text-ink/50 dark:text-white/40">
            <span className="border border-ink/30 dark:border-white/30 px-1 rounded-sm">PR</span>
            <span>広告 / Advertisement</span>
          </div>
          <div className="p-2 flex justify-center">
            <a href={banner.href} rel="nofollow sponsored noopener" target="_blank">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={banner.img}
                width={150}
                height={125}
                alt={banner.label}
                style={{ display: 'block' }}
              />
            </a>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img width={1} height={1} src={banner.pixel} alt="" />
        </div>

        <button
          onClick={onClose}
          className="stat-line w-full px-3 py-2.5 mb-4 text-ink/60 dark:text-white/50 hover:underline"
        >
          Close
        </button>

        {otherGames.length > 0 && (
          <div className="border-t border-index dark:border-index-dark pt-4">
            <p className="stat-line text-ink/40 dark:text-white/30 mb-2">More from the index</p>
            <div className="flex gap-2 flex-wrap">
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
