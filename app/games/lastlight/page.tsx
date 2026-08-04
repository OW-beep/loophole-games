import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { LastlightBoard } from './LastlightBoard';
import { GameDetails } from '@/components/GameDetails';
import { getGame } from '@/lib/games/registry';
import { buildGameMetadata, type SearchParams } from '@/lib/og-metadata';
import { JsonLd } from '@/components/JsonLd';
import { buildGameJsonLd, buildBreadcrumbJsonLd } from '@/lib/structured-data';

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  return buildGameMetadata(getGame('lastlight')!, await searchParams, {
    title: 'Lastlight \u2014 take the final token, every day',
    description:
      'A classic take-away game against a perfect-playing CPU. Today\u2019s piles are always winnable \u2014 the only question is whether you can find the exact move that keeps it that way.',
  });
}

export default function LastlightPage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('lastlight');
  const game = getGame('lastlight')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <LastlightBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
