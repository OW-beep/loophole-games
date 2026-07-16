import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { BooRushBoard } from './BooRushBoard';
import { GameDetails } from '@/components/GameDetails';
import { getGame } from '@/lib/games/registry';
import { buildGameMetadata, type SearchParams } from '@/lib/og-metadata';
import { JsonLd } from '@/components/JsonLd';
import { buildGameJsonLd, buildBreadcrumbJsonLd } from '@/lib/structured-data';

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  return buildGameMetadata(getGame('boo-rush')!, await searchParams, {
    title: 'Boo Rush — one tap, one ghost, one course',
    description: 'Tap to flap a little ghost through a set course of gates. Same course for everyone, every day. Free to play, no download.',
  });
}

export default function BooRushPage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('boo-rush');
  const game = getGame('boo-rush')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <BooRushBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
