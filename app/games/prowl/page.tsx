import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { ProwlBoard } from './ProwlBoard';
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
  return buildGameMetadata(getGame('prowl')!, await searchParams, {
    title: 'Prowl — sneak across a night city without being spotted',
    description:
      'Guide an agent across a 3D city block to the extraction point without walking into a patrol guard\u2019s line of sight. Grab jammers and data shards along the way.',
  });
}

export default function ProwlPage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('prowl');
  const game = getGame('prowl')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <ProwlBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
