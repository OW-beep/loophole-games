import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { CarryChainBoard } from './CarryChainBoard';
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
  return buildGameMetadata(getGame('carry-chain')!, await searchParams, {
    title: 'Carry Chain — merge numbers down a row, but every merge leaves a +1 behind',
    description:
      'Merge adjacent numbers down a row. Every merge carries +1 onto the next tile over. Land the total on the exact target before you run out of merges.',
  });
}

export default function CarryChainPage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('carry-chain');
  const game = getGame('carry-chain')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <CarryChainBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
