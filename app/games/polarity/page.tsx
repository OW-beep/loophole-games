import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { PolarityBoard } from './PolarityBoard';
import { GameDetails } from '@/components/GameDetails';
import { getGame } from '@/lib/games/registry';
import { buildGameMetadata, type SearchParams } from '@/lib/og-metadata';
import { JsonLd } from '@/components/JsonLd';
import { buildGameJsonLd, buildBreadcrumbJsonLd } from '@/lib/structured-data';

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  return buildGameMetadata(getGame('polarity')!, await searchParams, {
    title: 'Polarity — slide magnets using attraction and repulsion',
    description: 'Slide positive and negative magnets across the grid. Opposites attract and stop you; same poles block you. Separate them to win.',
  });
}

export default function PolarityPage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('polarity');
  const game = getGame('polarity')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <PolarityBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
