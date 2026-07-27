import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { VantageBoard } from './VantageBoard';
import { GameDetails } from '@/components/GameDetails';
import { getGame } from '@/lib/games/registry';
import { buildGameMetadata, type SearchParams } from '@/lib/og-metadata';
import { JsonLd } from '@/components/JsonLd';
import { buildGameJsonLd, buildBreadcrumbJsonLd } from '@/lib/structured-data';

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  return buildGameMetadata(getGame('vantage')!, await searchParams, {
    title: 'Vantage \u2014 rotate today\u2019s 3D shape and count the cubes',
    description:
      'A freely rotatable 3D voxel structure with cubes hidden behind others. Guess how many cubes it\u2019s made of, with higher/lower feedback guiding each attempt.',
  });
}

export default function VantagePage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('vantage');
  const game = getGame('vantage')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <VantageBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
