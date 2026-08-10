import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { PulseBoard } from './PulseBoard';
import { GameDetails } from '@/components/GameDetails';
import { getGame } from '@/lib/games/registry';
import { buildGameMetadata, type SearchParams } from '@/lib/og-metadata';
import { JsonLd } from '@/components/JsonLd';
import { buildGameJsonLd, buildBreadcrumbJsonLd } from '@/lib/structured-data';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  return buildGameMetadata(getGame('pulse')!, await searchParams, {
    title: 'Pulse — a timing arcade game, tap the sweeping marker in the zone',
    description:
      'A marker sweeps back and forth across a track. Tap to stop it inside the shrinking target zone before you run out of attempts.',
  });
}

export default function PulsePage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('pulse');
  const game = getGame('pulse')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <PulseBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
