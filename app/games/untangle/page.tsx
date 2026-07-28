import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { UntangleBoard } from './UntangleBoard';
import { GameDetails } from '@/components/GameDetails';
import { getGame } from '@/lib/games/registry';
import { buildGameMetadata, type SearchParams } from '@/lib/og-metadata';
import { JsonLd } from '@/components/JsonLd';
import { buildGameJsonLd, buildBreadcrumbJsonLd } from '@/lib/structured-data';

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  return buildGameMetadata(getGame('untangle')!, await searchParams, {
    title: 'Untangle \u2014 swap today\u2019s letters back into place',
    description:
      'A word\u2019s letters, scrambled into tiles. Swap any two tiles at a time to unscramble it in as few swaps as possible.',
  });
}

export default function UntanglePage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('untangle');
  const game = getGame('untangle')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <UntangleBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
