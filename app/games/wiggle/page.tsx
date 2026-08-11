import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { WiggleBoard } from './WiggleBoard';
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
  return buildGameMetadata(getGame('wiggle')!, await searchParams, {
    title: 'Wiggle — guide a caterpillar without crossing its own trail',
    description:
      'Guide a caterpillar around a small grid to eat every leaf before you run out of moves — but every cell it crosses becomes part of its own body.',
  });
}

export default function WigglePage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('wiggle');
  const game = getGame('wiggle')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <WiggleBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
