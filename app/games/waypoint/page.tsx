import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { WaypointBoard } from './WaypointBoard';
import { GameDetails } from '@/components/GameDetails';
import { getGame } from '@/lib/games/registry';
import { buildGameMetadata, type SearchParams } from '@/lib/og-metadata';
import { JsonLd } from '@/components/JsonLd';
import { buildGameJsonLd, buildBreadcrumbJsonLd } from '@/lib/structured-data';

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  return buildGameMetadata(getGame('waypoint')!, await searchParams, {
    title: 'Waypoint — trace today\u2019s number path',
    description:
      'A handful of numbers are fixed on the grid. Trace the path connecting 1 through 25, one adjacent step at a time, using the fixed numbers to deduce the route between them.',
  });
}

export default function WaypointPage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('waypoint');
  const game = getGame('waypoint')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <WaypointBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
