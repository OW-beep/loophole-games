import type { Metadata } from 'next';
import { getDailyContext } from '@/lib/daily-seed';
import { CipherBoard } from './CipherBoard';
import { GameDetails } from '@/components/GameDetails';
import { getGame } from '@/lib/games/registry';
import { buildGameMetadata, type SearchParams } from '@/lib/og-metadata';
import { JsonLd } from '@/components/JsonLd';
import { buildGameJsonLd, buildBreadcrumbJsonLd } from '@/lib/structured-data';

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  return buildGameMetadata(getGame('cipher')!, await searchParams, {
    title: 'Cipher — crack today\u2019s cryptogram',
    description:
      'A short phrase, encoded letter for letter. Work out the substitution one letter at a time using repetition, common short words, and pattern recognition.',
  });
}

export default function CipherPage() {
  const { seed, dateString, puzzleNumber } = getDailyContext('cipher');
  const game = getGame('cipher')!;
  return (
    <div>
      <JsonLd data={buildGameJsonLd(game)} />
      <JsonLd data={buildBreadcrumbJsonLd(game)} />
      <CipherBoard seed={seed} dateString={dateString} puzzleNumber={puzzleNumber} />
      <GameDetails game={game} />
    </div>
  );
}
