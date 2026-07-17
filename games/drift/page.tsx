import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { DriftBoard } from './DriftBoard';
import { GameDetails } from '@/components/GameDetails';
import { getGame } from '@/lib/games/registry';
import { buildGameMetadata, type SearchParams } from '@/lib/og-metadata';
import { JsonLd } from '@/components/JsonLd';
import { buildGameJsonLd, buildBreadcrumbJsonLd } from '@/lib/structured-data';

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  return buildGameMetadata(getGame('drift')!, await searchParams, {
    title: 'Drift — slide until something stops you',
    description: 'Your character slides until hitting a wall or object. Objects shift one step when pushed. Plan your slides to reach the goal.',
  });
}

export default function DriftPage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('drift');
  const game = getGame('drift')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <DriftBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
