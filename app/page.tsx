import { GAMES } from '@/lib/games/registry';
import { SpecimenCard } from '@/components/SpecimenCard';
import { DailyBanner } from '@/components/DailyBanner';
import { AdSlot } from '@/components/AdSlot';

export default function HomePage() {
  return (
    <div>
      <section className="mb-10">
        <p className="stat-line text-ink/50 dark:text-white/40 mb-3">
          Catalog №01–04 · est. 2026
        </p>
        <h1 className="font-display font-bold text-4xl sm:text-5xl leading-[1.05] mb-4 max-w-2xl">
          Four puzzles you haven&rsquo;t played before.
        </h1>
        <p className="text-ink/70 dark:text-white/60 max-w-xl">
          Loophole is a small, growing index of original puzzle mechanics — not reskins of
          games you already know. One board per game, every day, shared by every player on
          Earth. Free. No download. No account required.
        </p>
      </section>

      <DailyBanner />

      <section className="grid sm:grid-cols-2 gap-5 mb-12">
        {GAMES.map((game) => (
          <SpecimenCard key={game.slug} game={game} />
        ))}
      </section>

      <AdSlot slotId="0000000001" className="mb-12" />

      <section className="max-w-2xl">
        <h2 className="font-display font-bold text-2xl mb-3">Why these puzzles don&rsquo;t look familiar</h2>
        <p className="text-ink/70 dark:text-white/60 mb-3">
          Every mechanic in this index was built from scratch for Loophole. Echo Merge makes
          your previous move replay itself against you. Mirror Loop forces three beams to
          share one rotation budget. Color Debt punishes big matches with literal debt. Gravity
          Word turns the whole board into a single falling sentence. None of them are a match-3
          or a sliding-tile game wearing a new skin.
        </p>
        <p className="text-ink/70 dark:text-white/60">
          New puzzle specimens get added to the catalog over time — bookmark the index and
          check back.
        </p>
      </section>
    </div>
  );
}
