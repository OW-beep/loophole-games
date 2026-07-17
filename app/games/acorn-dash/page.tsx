import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { AcornDashBoard } from './AcornDashBoard';
import { GameDetails } from '@/components/GameDetails';
import { getGame } from '@/lib/games/registry';
import { buildGameMetadata, type SearchParams } from '@/lib/og-metadata';
import { JsonLd } from '@/components/JsonLd';
import { buildGameJsonLd, buildBreadcrumbJsonLd } from '@/lib/structured-data';

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  return buildGameMetadata(getGame('acorn-dash')!, await searchParams, {
    title: 'Acorn Dash — drag to catch, dodge the spiky ones',
    description: 'Guide a squirrel to catch today\u2019s falling acorns and dodge the burrs. Free to play, no download.',
  });
}

export default function AcornDashPage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('acorn-dash');
  const game = getGame('acorn-dash')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <AcornDashBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
