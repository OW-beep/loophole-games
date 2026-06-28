import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { GravityWordBoard } from './GravityWordBoard';
import { GameDetails } from '@/components/GameDetails';
import { getGame } from '@/lib/games/registry';

export const metadata: Metadata = {
  title: 'Gravity Word — flip gravity to spell words as letters fall',
  description:
    'Set the direction of gravity and watch letters slide across the board, spelling real words in the rows and columns. A new Gravity Word puzzle every day.',
  openGraph: { images: ['/api/og?game=gravity-word'] },
  twitter: { card: 'summary_large_image', images: ['/api/og?game=gravity-word'] },
};

export default function GravityWordPage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('gravity-word');
  return (
    <div>
      <GravityWordBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={getGame('gravity-word')!} />
    </div>
  );
}
