import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { BraceYardBoard } from './BraceYardBoard';
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
  return buildGameMetadata(getGame('brace-yard')!, await searchParams, {
    title: 'Brace Yard — ship the heaviest crates before their support disappears',
    description:
      'A crate can only ship while its neighbors can brace its weight, and you only get ten shipments. Chase the heavy ones before their support is gone.',
  });
}

export default function BraceYardPage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('brace-yard');
  const game = getGame('brace-yard')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <BraceYardBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
