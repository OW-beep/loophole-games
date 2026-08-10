import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { BlipBoard } from './BlipBoard';
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
  return buildGameMetadata(getGame('blip')!, await searchParams, {
    title: 'Blip — a grid reflex game, tap the lit cell before it fades',
    description:
      'One cell in a 3×3 grid lights up at a time. Tap it before it fades — the window gets shorter every round.',
  });
}

export default function BlipPage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('blip');
  const game = getGame('blip')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <BlipBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
