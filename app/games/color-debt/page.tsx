import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { ColorDebtBoard } from './ColorDebtBoard';

export const metadata: Metadata = {
  title: 'Color Debt — a match-3 where every match leaves something behind',
  description:
    'Match tiles to clear them, but every match spawns debt tiles that lock the board if you ignore them too long. A new Color Debt puzzle every day.',
  openGraph: { images: ['/api/og?game=color-debt'] },
  twitter: { card: 'summary_large_image', images: ['/api/og?game=color-debt'] },
};

export default function ColorDebtPage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('color-debt');
  return <ColorDebtBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />;
}
