import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { MirrorLoopBoard } from './MirrorLoopBoard';
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
  return buildGameMetadata(getGame('mirror-loop')!, await searchParams, {
    title: 'Mirror Loop — Free Mirror Reflection Puzzle Game',
    description:
      'A free mirror puzzle game: rotate mirrors to send three colored light beams into their matching targets, sharing one tight rotation budget. A new puzzle every day.',
  });
}

export default function MirrorLoopPage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('mirror-loop');
  const game = getGame('mirror-loop')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <MirrorLoopBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
