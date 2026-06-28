import Link from 'next/link';
import type { GameMeta } from '@/lib/games/registry';
import { StreakBadge } from './StreakBadge';

const STRIPE_CLASS: Record<string, string> = {
  echo: 'bg-echo',
  mirror: 'bg-mirror',
  debt: 'bg-debt',
  gravity: 'bg-gravity',
};

const SOFT_CLASS: Record<string, string> = {
  echo: 'group-hover:bg-echo-soft dark:group-hover:bg-echo/10',
  mirror: 'group-hover:bg-mirror-soft dark:group-hover:bg-mirror/10',
  debt: 'group-hover:bg-debt-soft dark:group-hover:bg-debt/10',
  gravity: 'group-hover:bg-gravity-soft dark:group-hover:bg-gravity/10',
};

export function SpecimenCard({ game }: { game: GameMeta }) {
  return (
    <Link
      href={`/games/${game.slug}`}
      className={`specimen-card group block p-5 pl-7 transition-colors ${SOFT_CLASS[game.color]}`}
    >
      <span className={`tag-stripe ${STRIPE_CLASS[game.color]}`} aria-hidden />
      <span className="punch-hole" aria-hidden />

      <div className="flex items-start justify-between mb-3">
        <span className="stat-line text-ink/40 dark:text-white/30">{game.index} / FILE</span>
        <StreakBadge gameSlug={game.slug} />
      </div>

      <h3 className="font-display font-bold text-2xl mb-1">{game.name}</h3>
      <p className="text-sm text-ink/70 dark:text-white/60 mb-4 leading-snug">{game.tagline}</p>

      <dl className="stat-line flex gap-4 text-ink/50 dark:text-white/40">
        <div>
          <dt className="inline">AVG&nbsp;</dt>
          <dd className="inline">{game.avgSolveTime}</dd>
        </div>
        <div>
          <dt className="inline">DIFF&nbsp;</dt>
          <dd className="inline">{game.difficulty}</dd>
        </div>
      </dl>
    </Link>
  );
}
