import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'What Loophole is, and why every puzzle in it is original.',
};

export default function AboutPage() {
  return (
    <article className="max-w-2xl">
      <h1 className="font-display font-bold text-3xl mb-6">About Loophole</h1>
      <div className="space-y-4 text-ink/80 dark:text-white/70 leading-relaxed">
        <p>
          Loophole is a small, independent index of original puzzle games. Every mechanic in
          the catalog was designed from scratch — no reskinned match-3, no sliding-tile clone
          wearing a new coat of paint. If a game in this index reminds you of something else,
          that&rsquo;s a coincidence of the puzzle genre, not a template.
        </p>
        <p>
          Every game follows the same shape: one puzzle a day, the same board for every player
          on Earth, and a result you can compare with friends. No accounts, no downloads, no
          energy timers, no pay-to-skip. If you solve it, you solve it the same way everyone
          else has to.
        </p>
        <p>
          The catalog grows slowly and on purpose. New puzzle specimens get added when they&rsquo;re
          ready, not on a schedule.
        </p>
      </div>
    </article>
  );
}
