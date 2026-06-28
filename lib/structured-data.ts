import { GAMES, type GameMeta } from './games/registry';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://loophole.games';

export function buildWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Loophole',
    url: SITE_URL,
    description:
      'Four original daily puzzle games: Echo Merge, Mirror Loop, Color Debt, and Gravity Word. Free to play, no download.',
  };
}

export function buildGameListJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: GAMES.map((g, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}/games/${g.slug}`,
      name: g.name,
    })),
  };
}

export function buildGameJsonLd(game: GameMeta) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: game.name,
    description: game.description,
    url: `${SITE_URL}/games/${game.slug}`,
    applicationCategory: 'Game',
    genre: 'Puzzle',
    gamePlatform: 'Web Browser',
    operatingSystem: 'Any',
    isAccessibleForFree: true,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Loophole',
      url: SITE_URL,
    },
  };
}

export function buildBreadcrumbJsonLd(game: GameMeta) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Loophole', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: game.name, item: `${SITE_URL}/games/${game.slug}` },
    ],
  };
}
