import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { TetherBoard } from './TetherBoard';
import { GameDetails } from '@/components/GameDetails';
import { getGame } from '@/lib/games/registry';
import { buildGameMetadata, type SearchParams } from '@/lib/og-metadata';
import { JsonLd } from '@/components/JsonLd';
import { buildGameJsonLd, buildBreadcrumbJsonLd } from '@/lib/structured-data';

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  return buildGameMetadata(getGame('tether')!, await searchParams, {
    title: 'Tether — two characters, one direction, one rope',
    description: 'Control two tethered characters that always move in the same direction. Walls stop one while the other keeps going.',
  });
}

export default function TetherPage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('tether');
  const game = getGame('tether')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <TetherBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
