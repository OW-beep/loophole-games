import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Terms for using the Loophole puzzle index.',
};

export default function TermsPage() {
  return (
    <article className="max-w-2xl">
      <h1 className="font-display font-bold text-3xl mb-2">Terms of Use</h1>
      <p className="stat-line text-ink/40 dark:text-white/30 mb-6">Last updated: edit this date when you publish</p>

      <div className="space-y-6 text-ink/80 dark:text-white/70 leading-relaxed text-sm">
        <section>
          <h2 className="font-display font-bold text-lg text-ink dark:text-white mb-2">Using this site</h2>
          <p>
            Loophole&rsquo;s games are free to play. Don&rsquo;t scrape, automate, or otherwise abuse the
            site in a way that disrupts it for other players, and don&rsquo;t attempt to manipulate
            ad impressions or clicks.
          </p>
        </section>
        <section>
          <h2 className="font-display font-bold text-lg text-ink dark:text-white mb-2">No accounts, no guarantees</h2>
          <p>
            There are no user accounts. Your results are stored locally in your browser and can
            be lost if you clear site data or switch devices. We provide the site &ldquo;as is&rdquo;
            without warranty of uptime, accuracy, or fitness for any particular purpose.
          </p>
        </section>
        <section>
          <h2 className="font-display font-bold text-lg text-ink dark:text-white mb-2">Intellectual property</h2>
          <p>
            The game mechanics, names, and design on this site belong to Loophole. You&rsquo;re
            welcome to share results and screenshots; please don&rsquo;t republish the games
            themselves elsewhere.
          </p>
        </section>
        <section>
          <h2 className="font-display font-bold text-lg text-ink dark:text-white mb-2">Changes</h2>
          <p>[Edit before publishing] We may update these terms as the site evolves.</p>
        </section>
        <section>
          <h2 className="font-display font-bold text-lg text-ink dark:text-white mb-2">Contact</h2>
          <p>[Edit before publishing] your-email@your-domain.com</p>
        </section>
      </div>
    </article>
  );
}
