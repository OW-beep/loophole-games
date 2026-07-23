import Link from 'next/link';
import type { GameMeta } from '@/lib/games/registry';
import { StreakBadge } from './StreakBadge';

export const STRIPE_CLASS: Record<string, string> = {
  echo: 'bg-echo', mirror: 'bg-mirror', debt: 'bg-debt', gravity: 'bg-gravity',
  fold: 'bg-fold', carry: 'bg-carry', brace: 'bg-brace', splice: 'bg-splice',
  heat: 'bg-heat', oneline: 'bg-oneline', overflow: 'bg-overflow', polarity: 'bg-polarity',
  shadow: 'bg-shadow', tether: 'bg-tether', drift: 'bg-drift', phase: 'bg-phase',
  boo: 'bg-boo',
  blobble: 'bg-blobble', sprout: 'bg-sprout', chef: 'bg-chef', noodle: 'bg-noodle',
  acorn: 'bg-acorn',
  cloud: 'bg-cloud',
  peek: 'bg-peek',
  duel: 'bg-duel',
  pigment: 'bg-pigment',
  waypoint: 'bg-waypoint',
};

export const SOFT_CLASS: Record<string, string> = {
  echo: 'group-hover:bg-echo-soft dark:group-hover:bg-echo/10',
  mirror: 'group-hover:bg-mirror-soft dark:group-hover:bg-mirror/10',
  debt: 'group-hover:bg-debt-soft dark:group-hover:bg-debt/10',
  gravity: 'group-hover:bg-gravity-soft dark:group-hover:bg-gravity/10',
  fold: 'group-hover:bg-fold-soft dark:group-hover:bg-fold/10',
  carry: 'group-hover:bg-carry-soft dark:group-hover:bg-carry/10',
  brace: 'group-hover:bg-brace-soft dark:group-hover:bg-brace/10',
  splice: 'group-hover:bg-splice-soft dark:group-hover:bg-splice/10',
  heat: 'group-hover:bg-heat-soft dark:group-hover:bg-heat/10',
  oneline: 'group-hover:bg-oneline-soft dark:group-hover:bg-oneline/10',
  overflow: 'group-hover:bg-overflow-soft dark:group-hover:bg-overflow/10',
  polarity: 'group-hover:bg-polarity-soft dark:group-hover:bg-polarity/10',
  shadow: 'group-hover:bg-shadow-soft dark:group-hover:bg-shadow/10',
  tether: 'group-hover:bg-tether-soft dark:group-hover:bg-tether/10',
  drift: 'group-hover:bg-drift-soft dark:group-hover:bg-drift/10',
  phase: 'group-hover:bg-phase-soft dark:group-hover:bg-phase/10',
  boo: 'group-hover:bg-boo-soft dark:group-hover:bg-boo/10',
  blobble: 'group-hover:bg-blobble-soft dark:group-hover:bg-blobble/10',
  sprout: 'group-hover:bg-sprout-soft dark:group-hover:bg-sprout/10',
  chef: 'group-hover:bg-chef-soft dark:group-hover:bg-chef/10',
  noodle: 'group-hover:bg-noodle-soft dark:group-hover:bg-noodle/10',
  acorn: 'group-hover:bg-acorn-soft dark:group-hover:bg-acorn/10',
  cloud: 'group-hover:bg-cloud-soft dark:group-hover:bg-cloud/10',
  peek: 'group-hover:bg-peek-soft dark:group-hover:bg-peek/10',
  duel: 'group-hover:bg-duel-soft dark:group-hover:bg-duel/10',
  pigment: 'group-hover:bg-pigment-soft dark:group-hover:bg-pigment/10',
  waypoint: 'group-hover:bg-waypoint-soft dark:group-hover:bg-waypoint/10',
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
