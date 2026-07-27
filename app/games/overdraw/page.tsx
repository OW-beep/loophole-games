import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { OverdrawBoard } from './OverdrawBoard';
import { GameDetails } from '@/components/GameDetails';
import { getGame } from '@/lib/games/registry';
import { buildGameMetadata, type SearchParams } from '@/lib/og-metadata';
import { JsonLd } from '@/components/JsonLd';
import { buildGameJsonLd, buildBreadcrumbJsonLd } from '@/lib/structured-data';

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  return buildGameMetadata(getGame('overdraw')!, await searchParams, {
    title: 'Overdraw — push your luck to today\u2019s target score',
    description:
      'Draw from a fixed daily deck, banking runs before a bust card wipes them out. Longer runs bank a bigger bonus \u2014 the deck tells you exactly how risky your next draw is.',
  });
}

export default function OverdrawPage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('overdraw');
  const game = getGame('overdraw')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <OverdrawBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
