import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { ColorDebtBoard } from './ColorDebtBoard';
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
  return buildGameMetadata(getGame('color-debt')!, await searchParams, {
    title: 'Color Debt — a match-3 where every match leaves something behind',
    description:
      'Match tiles to clear them, but every match spawns debt tiles that lock the board if you ignore them too long. A new Color Debt puzzle every day.',
  });
}

export default function ColorDebtPage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('color-debt');
  const game = getGame('color-debt')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <ColorDebtBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
