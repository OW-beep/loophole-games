import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { ShadowBoard } from './ShadowBoard';
import { GameDetails } from '@/components/GameDetails';
import { getGame } from '@/lib/games/registry';
import { buildGameMetadata, type SearchParams } from '@/lib/og-metadata';
import { JsonLd } from '@/components/JsonLd';
import { buildGameJsonLd, buildBreadcrumbJsonLd } from '@/lib/structured-data';

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  return buildGameMetadata(getGame('shadow')!, await searchParams, {
    title: 'Shadow — your last move replays as a ghost one step behind you',
    description: 'Move your character to the goal — but after each step, a ghost replays your previous move from wherever you just were.',
  });
}

export default function ShadowPage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('shadow');
  const game = getGame('shadow')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <ShadowBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
