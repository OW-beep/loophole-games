import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { NoodleCatBoard } from './NoodleCatBoard';
import { GameDetails } from '@/components/GameDetails';
import { getGame } from '@/lib/games/registry';
import { buildGameMetadata, type SearchParams } from '@/lib/og-metadata';
import { JsonLd } from '@/components/JsonLd';
import { buildGameJsonLd, buildBreadcrumbJsonLd } from '@/lib/structured-data';

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  return buildGameMetadata(getGame('noodle-cat')!, await searchParams, {
    title: 'Noodle Cat — mash before the bowl gets cold',
    description: 'Tap as fast as you can to help a cat slurp down bowl after bowl of noodles before time runs out. Free to play, no download.',
  });
}

export default function NoodleCatPage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('noodle-cat');
  const game = getGame('noodle-cat')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <NoodleCatBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
