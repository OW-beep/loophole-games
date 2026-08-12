import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { ClashBoard } from './ClashBoard';
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
  return buildGameMetadata(getGame('clash')!, await searchParams, {
    title: 'Clash — a turn-based battle with the enemy\u2019s attacks shown up front',
    description:
      'A turn-based RPG battle against a slime with its entire attack sequence revealed in advance. Attack, Defend, or unleash a Special to bring it down before your HP runs out.',
  });
}

export default function ClashPage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('clash');
  const game = getGame('clash')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <ClashBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
