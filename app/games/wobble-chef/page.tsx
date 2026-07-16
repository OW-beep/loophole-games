import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { WobbleChefBoard } from './WobbleChefBoard';
import { GameDetails } from '@/components/GameDetails';
import { getGame } from '@/lib/games/registry';
import { buildGameMetadata, type SearchParams } from '@/lib/og-metadata';
import { JsonLd } from '@/components/JsonLd';
import { buildGameJsonLd, buildBreadcrumbJsonLd } from '@/lib/structured-data';

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  return buildGameMetadata(getGame('wobble-chef')!, await searchParams, {
    title: 'Wobble Chef — today\u2019s menu, stacked one wobble at a time',
    description: 'Drop today\u2019s sequence of dishes onto a swaying tower without toppling it. Free to play, no download.',
  });
}

export default function WobbleChefPage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('wobble-chef');
  const game = getGame('wobble-chef')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <WobbleChefBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
