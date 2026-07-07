import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { HeatmapBoard } from './HeatmapBoard';
import { GameDetails } from '@/components/GameDetails';
import { getGame } from '@/lib/games/registry';
import { buildGameMetadata, type SearchParams } from '@/lib/og-metadata';
import { JsonLd } from '@/components/JsonLd';
import { buildGameJsonLd, buildBreadcrumbJsonLd } from '@/lib/structured-data';

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  return buildGameMetadata(getGame('heatmap')!, await searchParams, {
    title: 'Heatmap — tap high-value cells when their neighbors can support them',
    description:
      'Each cell has a value. Tap it to score — but only when the sum of its active neighbors is at least as large. Build score before you run out of taps.',
  });
}

export default function HeatmapPage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('heatmap');
  const game = getGame('heatmap')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <HeatmapBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
