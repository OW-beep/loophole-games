import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { FlickerBoard } from './FlickerBoard';
import { GameDetails } from '@/components/GameDetails';
import { getGame } from '@/lib/games/registry';
import { buildGameMetadata, type SearchParams } from '@/lib/og-metadata';
import { JsonLd } from '@/components/JsonLd';
import { buildGameJsonLd, buildBreadcrumbJsonLd } from '@/lib/structured-data';

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  return buildGameMetadata(getGame('flicker')!, await searchParams, {
    title: 'Flicker \u2014 turn off today\u2019s lights',
    description:
      'Tap a tile to flip it and its neighbors. Work out which tiles to press to turn every light off, in as few taps as possible.',
  });
}

export default function FlickerPage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('flicker');
  const game = getGame('flicker')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <FlickerBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
