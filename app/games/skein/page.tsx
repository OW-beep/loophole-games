import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { SkeinBoard } from './SkeinBoard';
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
  return buildGameMetadata(getGame('skein')!, await searchParams, {
    title: 'Skein — untangle a knotted graph until nothing crosses',
    description:
      'Drag knots around until every thread stops crossing another. Each day\u2019s graph is generated already solved, then scrambled \u2014 untangling it is always possible within your move budget.',
  });
}

export default function SkeinPage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('skein');
  const game = getGame('skein')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <SkeinBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
