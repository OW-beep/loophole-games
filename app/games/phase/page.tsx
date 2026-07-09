import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { PhaseBoard } from './PhaseBoard';
import { GameDetails } from '@/components/GameDetails';
import { getGame } from '@/lib/games/registry';
import { buildGameMetadata, type SearchParams } from '@/lib/og-metadata';
import { JsonLd } from '@/components/JsonLd';
import { buildGameJsonLd, buildBreadcrumbJsonLd } from '@/lib/structured-data';

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  return buildGameMetadata(getGame('phase')!, await searchParams, {
    title: 'Phase — alternate between solid and ghost every step',
    description: 'Solid steps stop at walls. Ghost steps pass through walls but fall through holes. Plan your parity to reach the goal.',
  });
}

export default function PhasePage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('phase');
  const game = getGame('phase')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <PhaseBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
