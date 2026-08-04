import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { BloomBoard } from './BloomBoard';
import { GameDetails } from '@/components/GameDetails';
import { getGame } from '@/lib/games/registry';
import { buildGameMetadata, type SearchParams } from '@/lib/og-metadata';
import { JsonLd } from '@/components/JsonLd';
import { buildGameJsonLd, buildBreadcrumbJsonLd } from '@/lib/structured-data';

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  return buildGameMetadata(getGame('bloom')!, await searchParams, {
    title: 'Bloom \u2014 flood today\u2019s board in one color',
    description:
      'Grow your color from one corner of the board until it covers every tile. Each pick absorbs whole chains of matching color at once.',
  });
}

export default function BloomPage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('bloom');
  const game = getGame('bloom')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <BloomBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
