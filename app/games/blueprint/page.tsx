import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { BlueprintBoard } from './BlueprintBoard';
import { GameDetails } from '@/components/GameDetails';
import { getGame } from '@/lib/games/registry';
import { buildGameMetadata, type SearchParams } from '@/lib/og-metadata';
import { JsonLd } from '@/components/JsonLd';
import { buildGameJsonLd, buildBreadcrumbJsonLd } from '@/lib/structured-data';

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  return buildGameMetadata(getGame('blueprint')!, await searchParams, {
    title: 'Blueprint \u2014 build today\u2019s shape from three views',
    description:
      'Three flat views \u2014 top, front, and side \u2014 are all you get. Place and remove cubes in 3D until your shape\u2019s own views match them exactly.',
  });
}

export default function BlueprintPage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('blueprint');
  const game = getGame('blueprint')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <BlueprintBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
