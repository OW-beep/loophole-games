import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { BlobbleBoard } from './BlobbleBoard';
import { GameDetails } from '@/components/GameDetails';
import { getGame } from '@/lib/games/registry';
import { buildGameMetadata, type SearchParams } from '@/lib/og-metadata';
import { JsonLd } from '@/components/JsonLd';
import { buildGameJsonLd, buildBreadcrumbJsonLd } from '@/lib/structured-data';

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  return buildGameMetadata(getGame('blobble')!, await searchParams, {
    title: 'Blobble — pull back, let go, bounce something loose',
    description: 'Slingshot a squishy blob into a stack of blocks with a limited number of launches. Free to play, no download.',
  });
}

export default function BlobblePage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('blobble');
  const game = getGame('blobble')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <BlobbleBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
