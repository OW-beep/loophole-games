import Link from 'next/link';
import { GAMES } from '@/lib/games/registry';
import { STRIPE_CLASS, SOFT_CLASS } from '@/components/SpecimenCard';

export function RelatedGames({ slugs }: { slugs: [string, string] }) {
  const games = slugs.map((slug) => GAMES.find((g) => g.slug === slug)).filter(Boolean);
  if (games.length === 0) return null;

  return (
    <div className="my-10 not-prose">
      <p className="stat-line text-ink/40 dark:text-white/30 mb-3">Play the games behind this idea</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {games.map((game) => {
          if (!game) return null;
          return (
            <Link
              key={game.slug}
              href={`/games/${game.slug}`}
              className={`specimen-card group block p-4 pl-6 transition-colors ${SOFT_CLASS[game.color]}`}
            >
              <span className={`tag-stripe ${STRIPE_CLASS[game.color]}`} aria-hidden />
              <p className="stat-line text-ink/40 dark:text-white/30 mb-1">№{game.index}</p>
              <p className="font-display font-bold mb-1">{game.name}</p>
              <p className="text-sm text-ink/60 dark:text-white/50 leading-snug">{game.tagline}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
