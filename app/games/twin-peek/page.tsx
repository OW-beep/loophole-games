import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { TwinPeekBoard } from './TwinPeekBoard';
import { GameDetails } from '@/components/GameDetails';
import { getGame } from '@/lib/games/registry';
import { buildGameMetadata, type SearchParams } from '@/lib/og-metadata';
import { JsonLd } from '@/components/JsonLd';
import { buildGameJsonLd, buildBreadcrumbJsonLd } from '@/lib/structured-data';

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  return buildGameMetadata(getGame('twin-peek')!, await searchParams, {
    title: 'Twin Peek — flip two, remember where the others were',
    description: 'A daily memory-match grid starring the whole arcade cast. Free to play, no download.',
  });
}

export default function TwinPeekPage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('twin-peek');
  const game = getGame('twin-peek')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <TwinPeekBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
