import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { CaromBoard } from './CaromBoard';
import { GameDetails } from '@/components/GameDetails';
import { getGame } from '@/lib/games/registry';
import { buildGameMetadata, type SearchParams } from '@/lib/og-metadata';
import { JsonLd } from '@/components/JsonLd';
import { buildGameJsonLd, buildBreadcrumbJsonLd } from '@/lib/structured-data';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  return buildGameMetadata(getGame('carom')!, await searchParams, {
    title: 'Carom \u2014 clear invader lanes with direct fire and bank shots',
    description:
      'Five lanes of stacked invaders. Direct fire clears an open lane; shielded lanes need a Bank shot fired from the mirror lane instead, which always gets through.',
  });
}

export default function CaromPage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('carom');
  const game = getGame('carom')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <CaromBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
