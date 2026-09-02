import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { RegentBoard } from './RegentBoard';
import { GameDetails } from '@/components/GameDetails';
import { getGame } from '@/lib/games/registry';
import { buildGameMetadata, type SearchParams } from '@/lib/og-metadata';
import { JsonLd } from '@/components/JsonLd';
import { buildGameJsonLd, buildBreadcrumbJsonLd } from '@/lib/structured-data';

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  return buildGameMetadata(getGame('regent')!, await searchParams, {
    title: 'Regent — one crown per row, column and color',
    description: 'Place a crown in every row, column and color region on the board — with no two crowns touching, even diagonally. A fresh 6×6 board every day.',
  });
}

export default function RegentPage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('regent');
  const game = getGame('regent')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <RegentBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
