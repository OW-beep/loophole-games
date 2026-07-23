import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { PigmentBoard } from './PigmentBoard';
import { GameDetails } from '@/components/GameDetails';
import { getGame } from '@/lib/games/registry';
import { buildGameMetadata, type SearchParams } from '@/lib/og-metadata';
import { JsonLd } from '@/components/JsonLd';
import { buildGameJsonLd, buildBreadcrumbJsonLd } from '@/lib/structured-data';

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  return buildGameMetadata(getGame('pigment')!, await searchParams, {
    title: 'Pigment — mix colors to match today\u2019s targets',
    description:
      'Tap Red, Yellow, Blue, White, and Black to mix three target colors from scratch. Watch your match percentage climb as you get closer, then bottle it before you run out of taps.',
  });
}

export default function PigmentPage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('pigment');
  const game = getGame('pigment')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <PigmentBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
