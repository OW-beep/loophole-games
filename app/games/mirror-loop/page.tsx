import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { MirrorLoopBoard } from './MirrorLoopBoard';
import { GameDetails } from '@/components/GameDetails';
import { getGame } from '@/lib/games/registry';

export const metadata: Metadata = {
  title: 'Mirror Loop — route three light beams with one shared rotation budget',
  description:
    'Rotate mirrors to send three colored beams into their matching targets, sharing one tight rotation budget. A new Mirror Loop puzzle every day.',
  openGraph: { images: ['/api/og?game=mirror-loop'] },
  twitter: { card: 'summary_large_image', images: ['/api/og?game=mirror-loop'] },
};

export default function MirrorLoopPage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('mirror-loop');
  return (
    <div>
      <MirrorLoopBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={getGame('mirror-loop')!} />
    </div>
  );
}
