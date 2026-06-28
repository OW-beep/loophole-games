import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { EchoMergeBoard } from './EchoMergeBoard';
import { GameDetails } from '@/components/GameDetails';
import { getGame } from '@/lib/games/registry';

export const metadata: Metadata = {
  title: 'Echo Merge — a tile puzzle where your last move replays itself',
  description:
    'Slide and merge numbered tiles, but every move echoes automatically one turn later. A new Echo Merge puzzle every day.',
  openGraph: { images: ['/api/og?game=echo-merge'] },
  twitter: { card: 'summary_large_image', images: ['/api/og?game=echo-merge'] },
};

export default function EchoMergePage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('echo-merge');
  return (
    <div>
      <EchoMergeBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={getGame('echo-merge')!} />
    </div>
  );
}
