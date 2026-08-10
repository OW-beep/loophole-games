import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { CroakBoard } from './CroakBoard';
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
  return buildGameMetadata(getGame('croak')!, await searchParams, {
    title: 'Croak — hop a frog across a pond of lily pads',
    description:
      'Hop a little frog across a pond of lily pads to reach the goal before you run out of hops. Catch fireflies along the way for bonus hops.',
  });
}

export default function CroakPage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('croak');
  const game = getGame('croak')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <CroakBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
