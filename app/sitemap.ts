import type { MetadataRoute } from 'next';
import { GAMES } from '@/lib/games/registry';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://loophole.games';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ['', '/about', '/faq', '/privacy', '/terms'].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? ('daily' as const) : ('monthly' as const),
    priority: path === '' ? 1 : 0.5,
  }));

  const gamePages = GAMES.map((g) => ({
    url: `${SITE_URL}/games/${g.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  return [...staticPages, ...gamePages];
}
