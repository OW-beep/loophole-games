import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { FoldBoard } from './FoldBoard';
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
  return buildGameMetadata(getGame('fold')!, await searchParams, {
    title: 'Fold — a paper-folding puzzle where overlapping numbers add up',
    description:
      'Fold a strip of numbers in half, again and again. Overlapping cells add together — land on the target number before you run out of folds.',
  });
}

export default function FoldPage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('fold');
  const game = getGame('fold')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <FoldBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
