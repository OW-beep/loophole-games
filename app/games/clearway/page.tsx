import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { ClearwayBoard } from './ClearwayBoard';
import { GameDetails } from '@/components/GameDetails';
import { getGame } from '@/lib/games/registry';
import { buildGameMetadata, type SearchParams } from '@/lib/og-metadata';
import { JsonLd } from '@/components/JsonLd';
import { buildGameJsonLd, buildBreadcrumbJsonLd } from '@/lib/structured-data';

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  return buildGameMetadata(getGame('clearway')!, await searchParams, {
    title: 'Clearway — slide today\u2019s gridlock free',
    description:
      'A marked vehicle is boxed in by a grid full of others. Slide vehicles along their own orientation to open a path to the exit.',
  });
}

export default function ClearwayPage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('clearway');
  const game = getGame('clearway')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <ClearwayBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
