import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { SproutBoard } from './SproutBoard';
import { GameDetails } from '@/components/GameDetails';
import { getGame } from '@/lib/games/registry';
import { buildGameMetadata, type SearchParams } from '@/lib/og-metadata';
import { JsonLd } from '@/components/JsonLd';
import { buildGameJsonLd, buildBreadcrumbJsonLd } from '@/lib/structured-data';

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  return buildGameMetadata(getGame('sprout')!, await searchParams, {
    title: 'Sprout — water it at exactly the right moment',
    description: 'Tap the sweeping dial the instant it passes the highlighted arc to grow a sprout to full bloom. Free to play, no download.',
  });
}

export default function SproutPage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('sprout');
  const game = getGame('sprout')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <SproutBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
