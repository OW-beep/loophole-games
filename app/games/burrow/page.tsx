import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { BurrowBoard } from './BurrowBoard';
import { GameDetails } from '@/components/GameDetails';
import { getGame } from '@/lib/games/registry';
import { buildGameMetadata, type SearchParams } from '@/lib/og-metadata';
import { JsonLd } from '@/components/JsonLd';
import { buildGameJsonLd, buildBreadcrumbJsonLd } from '@/lib/structured-data';

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  return buildGameMetadata(getGame('burrow')!, await searchParams, {
    title: 'Burrow \u2014 find the key and clear today\u2019s den',
    description:
      'Guide a small burrowing critter through a fresh daily maze: find the key, avoid the marked hazards, and reach the door before you run out of moves.',
  });
}

export default function BurrowPage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('burrow');
  const game = getGame('burrow')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <BurrowBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
