import type { Metadata } from 'next';
import { WorldDataDuelBoard } from './WorldDataDuelBoard';
import { GameDetails } from '@/components/GameDetails';
import { getGame } from '@/lib/games/registry';
import { buildGameMetadata, type SearchParams } from '@/lib/og-metadata';
import { JsonLd } from '@/components/JsonLd';
import { buildGameJsonLd, buildBreadcrumbJsonLd } from '@/lib/structured-data';

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  return buildGameMetadata(getGame('world-data-duel')!, await searchParams, {
    title: 'World Data Duel — a real-world statistics card duel',
    description:
      'Read the tags, guess the country, win the round. A reasoning card game built on real, sourced world statistics — population, GDP, coffee production, and more.',
  });
}

export default function WorldDataDuelPage() {
  const game = getGame('world-data-duel')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <WorldDataDuelBoard />
      <GameDetails game={game} />
    </div>
  );
}
