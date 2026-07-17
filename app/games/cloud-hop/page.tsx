import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { CloudHopBoard } from './CloudHopBoard';
import { GameDetails } from '@/components/GameDetails';
import { getGame } from '@/lib/games/registry';
import { buildGameMetadata, type SearchParams } from '@/lib/og-metadata';
import { JsonLd } from '@/components/JsonLd';
import { buildGameJsonLd, buildBreadcrumbJsonLd } from '@/lib/structured-data';

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  return buildGameMetadata(getGame('cloud-hop')!, await searchParams, {
    title: 'Cloud Hop — bounces on its own, you just steer',
    description: 'Steer a bouncing bunny from cloud to cloud, higher and higher. Free to play, no download.',
  });
}

export default function CloudHopPage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('cloud-hop');
  const game = getGame('cloud-hop')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <CloudHopBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
