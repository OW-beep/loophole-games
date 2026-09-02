import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { VialsBoard } from './VialsBoard';
import { GameDetails } from '@/components/GameDetails';
import { getGame } from '@/lib/games/registry';
import { buildGameMetadata, type SearchParams } from '@/lib/og-metadata';
import { JsonLd } from '@/components/JsonLd';
import { buildGameJsonLd, buildBreadcrumbJsonLd } from '@/lib/structured-data';

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  return buildGameMetadata(getGame('vials')!, await searchParams, {
    title: 'Vials — Free Color Sort Puzzle Game',
    description: 'A free color-sort puzzle: pour colored liquid between tubes until every color sits in its own tube. Oddly satisfying, one new puzzle every day.',
  });
}

export default function VialsPage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('vials');
  const game = getGame('vials')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <VialsBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
