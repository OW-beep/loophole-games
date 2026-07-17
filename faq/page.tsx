import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Common questions about how Loophole\u2019s daily puzzles, streaks, and games work.',
  alternates: { canonical: '/faq' },
};

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: 'Why is there only one puzzle a day per game?',
    a: (
      <>
        Because everyone gets the same board on the same day, results are actually comparable —
        your streak means the same thing as someone else&rsquo;s streak. An endless-mode version
        would be easy to add, but it would also dilute the one thing that makes a daily puzzle
        worth coming back to: knowing you solved the exact same thing everyone else did.
      </>
    ),
  },
  {
    q: 'Do I need to create an account?',
    a: (
      <>
        No. There are no accounts anywhere on this site. Your results and streaks are saved
        directly in your browser&rsquo;s local storage, which means they&rsquo;re private to your
        device and never touch our servers. See the{' '}
        <Link href="/privacy" className="underline">
          Privacy Policy
        </Link>{' '}
        for the full details.
      </>
    ),
  },
  {
    q: 'I lost my streak — what happened?',
    a: (
      <>
        Streaks live in your browser&rsquo;s local storage, so clearing your browsing data,
        switching browsers, or switching devices will reset them. There&rsquo;s currently no way to
        sync a streak across devices, since that would require the accounts system this site
        deliberately doesn&rsquo;t have.
      </>
    ),
  },
  {
    q: 'When does the daily puzzle reset?',
    a: 'At 00:00 UTC, for every game, for every player, everywhere. The countdown on the home page shows exactly how long is left.',
  },
  {
    q: 'Are these games actually original, or are they reskins of games I already know?',
    a: (
      <>
        Every mechanic was designed specifically for this site. None of the twelve games started
        from an existing game\u2019s rules with new art on top. If a mechanic reminds you of
        something else, that\u2019s the puzzle genre overlapping with itself, not a template — see
        the &ldquo;About this puzzle&rdquo; section on each game\u2019s page for the specific design idea
        behind it.
      </>
    ),
  },
  {
    q: 'Is Loophole free? Is there a catch?',
    a: 'It\u2019s free to play, with no purchases, no energy timers, and no pay-to-skip mechanics anywhere. The site is supported by ads.',
  },
  {
    q: 'Is there a mobile app?',
    a: 'Not currently — the site is built to work fully in a mobile browser, including saving your streaks, so there\u2019s no separate app to install.',
  },
  {
    q: 'I found a bug, or a puzzle that seems unsolvable. What do I do?',
    a: (
      <>
        Email{' '}
        <a href="mailto:openwave25@gmail.com" className="underline">
          openwave25@gmail.com
        </a>{' '}
        with the game name and the date of the puzzle (shown as the puzzle number on the
        game\u2019s page), and it\u2019ll get looked at.
      </>
    ),
  },
];

export default function FaqPage() {
  return (
    <article className="max-w-2xl">
      <h1 className="font-display font-bold text-3xl mb-6">Frequently Asked Questions</h1>
      <div className="space-y-8">
        {FAQS.map((item, i) => (
          <section key={i}>
            <h2 className="font-display font-bold text-lg mb-2">{item.q}</h2>
            <p className="text-sm text-ink/80 dark:text-white/70 leading-relaxed">{item.a}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
