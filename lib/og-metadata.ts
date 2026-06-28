import type { Metadata } from 'next';
import type { GameMeta } from './games/registry';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://loophole.games';

export type SearchParams = Record<string, string | string[] | undefined>;

function asString(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

/**
 * Builds page metadata for a game route. When the URL carries result params
 * (added automatically by the in-game share button — see lib/share.ts), the
 * title and OG image are personalized to that specific result, so a shared
 * link unfurls as "I solved it in 11 moves" rather than the generic game
 * blurb. Without result params, it falls back to the game's normal metadata.
 */
export function buildGameMetadata(
  game: GameMeta,
  searchParams: SearchParams,
  base: { title: string; description: string }
): Metadata {
  const moves = asString(searchParams.moves);
  const limit = asString(searchParams.limit);
  const won = asString(searchParams.won);
  const puzzle = asString(searchParams.puzzle);
  const score = asString(searchParams.score);
  const isResult = moves !== undefined && limit !== undefined;

  const ogParams = new URLSearchParams({ game: game.slug });
  if (isResult) {
    ogParams.set('moves', moves);
    ogParams.set('limit', limit);
    if (won !== undefined) ogParams.set('won', won);
    if (puzzle !== undefined) ogParams.set('puzzle', puzzle);
    if (score !== undefined) ogParams.set('score', score);
  }
  const ogImage = `/api/og?${ogParams.toString()}`;

  const title = isResult
    ? `${won === '1' ? 'Solved' : 'Played'} ${game.name} #${puzzle ?? '?'} in ${moves}/${limit} moves`
    : base.title;
  const description = isResult
    ? `${won === '1' ? 'I solved' : 'I played'} ${game.name} in ${moves}/${limit} moves on Loophole. ${base.description}`
    : base.description;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/games/${game.slug}` },
    openGraph: { title, description, images: [ogImage] },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage] },
  };
}
