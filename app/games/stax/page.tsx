import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { StaxBoard } from './StaxBoard';
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
  return buildGameMetadata(getGame('stax')!, await searchParams, {
    title: 'Stax — perfect drops build the tower, one miss ends it',
    description:
      'A block slides back and forth on top of your tower — tap to drop it. Land it perfectly to keep full width and build a combo; miss entirely and the run is over.',
  });
}

export default function StaxPage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('stax');
  const game = getGame('stax')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <StaxBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
