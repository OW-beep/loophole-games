import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { EchoMergeBoard } from './EchoMergeBoard';
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
  return buildGameMetadata(getGame('echo-merge')!, await searchParams, {
    title: 'Echo Merge — a tile puzzle where your last move replays itself',
    description:
      'Slide and merge numbered tiles, but every move echoes automatically one turn later. A new Echo Merge puzzle every day.',
  });
}

export default function EchoMergePage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('echo-merge');
  const game = getGame('echo-merge')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <EchoMergeBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
