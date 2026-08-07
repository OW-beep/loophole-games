import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { ApexBoard } from './ApexBoard';
import { GameDetails } from '@/components/GameDetails';
import { getGame } from '@/lib/games/registry';
import { buildGameMetadata, type SearchParams } from '@/lib/og-metadata';
import { JsonLd } from '@/components/JsonLd';
import { buildGameJsonLd, buildBreadcrumbJsonLd } from '@/lib/structured-data';

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  return buildGameMetadata(getGame('apex')!, await searchParams, {
    title: 'Apex \u2014 plan today\u2019s racing line',
    description:
      'A turn-based vector race: pick an acceleration each turn, carry your speed into the next, and reach the finish without sliding off the track.',
  });
}

export default function ApexPage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('apex');
  const game = getGame('apex')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <ApexBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
