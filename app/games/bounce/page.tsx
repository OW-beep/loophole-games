import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { BounceBoard } from './BounceBoard';
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
  return buildGameMetadata(getGame('bounce')!, await searchParams, {
    title: 'Bounce — hop a chibi bunny across floating cloud platforms',
    description:
      'Bounce a chibi bunny across a field of floating cloud platforms to reach the rainbow goal before you run out of hops. Catch stars along the way for bonus hops.',
  });
}

export default function BouncePage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('bounce');
  const game = getGame('bounce')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <BounceBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
