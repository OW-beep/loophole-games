import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { DecantBoard } from './DecantBoard';
import { GameDetails } from '@/components/GameDetails';
import { getGame } from '@/lib/games/registry';
import { buildGameMetadata, type SearchParams } from '@/lib/og-metadata';
import { JsonLd } from '@/components/JsonLd';
import { buildGameJsonLd, buildBreadcrumbJsonLd } from '@/lib/structured-data';

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  return buildGameMetadata(getGame('decant')!, await searchParams, {
    title: 'Decant — measure out today\u2019s exact amount',
    description:
      'Three jugs, one unlimited tap, and a target amount. Fill, empty, and pour between jugs to measure out exactly the right volume.',
  });
}

export default function DecantPage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('decant');
  const game = getGame('decant')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <DecantBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
