import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { CairnBoard } from './CairnBoard';
import { GameDetails } from '@/components/GameDetails';
import { getGame } from '@/lib/games/registry';
import { buildGameMetadata, type SearchParams } from '@/lib/og-metadata';
import { JsonLd } from '@/components/JsonLd';
import { buildGameJsonLd, buildBreadcrumbJsonLd } from '@/lib/structured-data';

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  return buildGameMetadata(getGame('cairn')!, await searchParams, {
    title: 'Cairn — clear today\u2019s card pyramid',
    description:
      'A pyramid-solitaire card puzzle: pair exposed cards that add up to ten to clear the pyramid before your draws run out.',
  });
}

export default function CairnPage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('cairn');
  const game = getGame('cairn')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <CairnBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
