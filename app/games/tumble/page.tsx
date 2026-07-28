import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { TumbleBoard } from './TumbleBoard';
import { GameDetails } from '@/components/GameDetails';
import { getGame } from '@/lib/games/registry';
import { buildGameMetadata, type SearchParams } from '@/lib/og-metadata';
import { JsonLd } from '@/components/JsonLd';
import { buildGameJsonLd, buildBreadcrumbJsonLd } from '@/lib/structured-data';

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  return buildGameMetadata(getGame('tumble')!, await searchParams, {
    title: 'Tumble \u2014 roll today\u2019s block home',
    description:
      'A rectangular block rolls end over end across a gap-filled 3D board. Reach the goal tile standing upright before you roll off the edge or run out of moves.',
  });
}

export default function TumblePage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('tumble');
  const game = getGame('tumble')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <TumbleBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
