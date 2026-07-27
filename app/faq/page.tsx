import type { Metadata } from 'next';
import Link from 'next/link';
import { GAMES } from '@/lib/games/registry';
import { JsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Common questions about how Loophole\u2019s daily puzzles, streaks, and games work.',
  alternates: { canonical: '/faq' },
};

interface FaqItem {
  q: string;
  a: React.ReactNode;
  /** Plain-text version of the answer, used only for FAQPage structured data
   * (search engines need a plain string, not JSX with embedded links). */
  plainAnswer: string;
}

const FAQS: FaqItem[] = [
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
    plainAnswer:
      'Because everyone gets the same board on the same day, results are actually comparable — your streak means the same thing as someone else\u2019s streak. An endless-mode version would dilute the one thing that makes a daily puzzle worth coming back to: knowing you solved the exact same thing everyone else did.',
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
    plainAnswer:
      'No. There are no accounts anywhere on this site. Your results and streaks are saved directly in your browser\u2019s local storage, which means they\u2019re private to your device and never touch our servers.',
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
    plainAnswer:
      'Streaks live in your browser\u2019s local storage, so clearing your browsing data, switching browsers, or switching devices will reset them. There\u2019s currently no way to sync a streak across devices.',
  },
  {
    q: 'When does the daily puzzle reset?',
    a: 'At 00:00 UTC, for every game, for every player, everywhere. The countdown on the home page shows exactly how long is left.',
    plainAnswer:
      'At 00:00 UTC, for every game, for every player, everywhere. The countdown on the home page shows exactly how long is left.',
  },
  {
    q: 'Are these games actually original, or are they reskins of games I already know?',
    a: (
      <>
        Every mechanic was designed specifically for this site. None of the {GAMES.length} games
        started from an existing game&rsquo;s rules with new art on top. If a mechanic reminds you
        of something else, that&rsquo;s the puzzle genre overlapping with itself, not a template —
        see the &ldquo;About this puzzle&rdquo; section on each game&rsquo;s page for the specific
        design idea behind it.
      </>
    ),
    plainAnswer: `Every mechanic was designed specifically for this site. None of the ${GAMES.length} games started from an existing game's rules with new art on top. See the "About this puzzle" section on each game's page for the specific design idea behind it.`,
  },
  {
    q: 'Is Loophole free? Is there a catch?',
    a: 'It\u2019s free to play, with no purchases, no energy timers, and no pay-to-skip mechanics anywhere. The site is supported by ads.',
    plainAnswer:
      'It\u2019s free to play, with no purchases, no energy timers, and no pay-to-skip mechanics anywhere. The site is supported by ads.',
  },
  {
    q: 'Is there a mobile app?',
    a: 'Not currently — the site is built to work fully in a mobile browser, including saving your streaks, so there\u2019s no separate app to install.',
    plainAnswer:
      'Not currently — the site is built to work fully in a mobile browser, including saving your streaks, so there\u2019s no separate app to install.',
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
        game&rsquo;s page), and it&rsquo;ll get looked at.
      </>
    ),
    plainAnswer:
      'Email openwave25@gmail.com with the game name and the date of the puzzle (shown as the puzzle number on the game\u2019s page), and it\u2019ll get looked at.',
  },
];

function buildFaqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.plainAnswer,
      },
    })),
  };
}

export default function FaqPage() {
  return (
    <article className="max-w-2xl">
      <JsonLd data={buildFaqJsonLd()} />
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
