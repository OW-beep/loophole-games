import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { SignalBoard } from './SignalBoard';
import { GameDetails } from '@/components/GameDetails';
import { getGame } from '@/lib/games/registry';
import { buildGameMetadata, type SearchParams } from '@/lib/og-metadata';
import { JsonLd } from '@/components/JsonLd';
import { buildGameJsonLd, buildBreadcrumbJsonLd } from '@/lib/structured-data';

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  return buildGameMetadata(getGame('signal')!, await searchParams, {
    title: 'Signal — resolve cells in the exact order their numbers demand',
    description:
      'Each cell shows how many resolved neighbors it needs before you can tap it. Resolve every cell to win.',
  });
}

export default function SignalPage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('signal');
  const game = getGame('signal')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <SignalBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
