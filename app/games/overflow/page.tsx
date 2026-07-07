import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { OverflowBoard } from './OverflowBoard';
import { GameDetails } from '@/components/GameDetails';
import { getGame } from '@/lib/games/registry';
import { buildGameMetadata, type SearchParams } from '@/lib/og-metadata';
import { JsonLd } from '@/components/JsonLd';
import { buildGameJsonLd, buildBreadcrumbJsonLd } from '@/lib/structured-data';

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  return buildGameMetadata(getGame('overflow')!, await searchParams, {
    title: 'Overflow — tap cells to overflow and trigger chain reactions',
    description: 'Add drops to cells until they overflow into neighbors, triggering chain reactions. Hit the score target in ten taps.',
  });
}

export default function OverflowPage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('overflow');
  const game = getGame('overflow')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <OverflowBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
