import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { GravityWordBoard } from './GravityWordBoard';
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
  return buildGameMetadata(getGame('gravity-word')!, await searchParams, {
    title: 'Gravity Word — flip gravity to spell words as letters fall',
    description:
      'Set the direction of gravity and watch letters slide across the board, spelling real words in the rows and columns. A new Gravity Word puzzle every day.',
  });
}

export default function GravityWordPage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('gravity-word');
  const game = getGame('gravity-word')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <GravityWordBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
