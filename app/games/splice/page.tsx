import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { SpliceBoard } from './SpliceBoard';
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
  return buildGameMetadata(getGame('splice')!, await searchParams, {
    title: 'Splice — swap stretches between two number strands to sort them apart',
    description:
      'Two strands, sixteen numbers between them. Splice matching stretches between the strands until every low number sits in one strand and every high number sits in the other.',
  });
}

export default function SplicePage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('splice');
  const game = getGame('splice')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <SpliceBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
