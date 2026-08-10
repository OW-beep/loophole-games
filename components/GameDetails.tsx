import type { GameMeta } from '@/lib/games/registry';
import { CATEGORY_LABEL, getSimilarGames } from '@/lib/games/registry';
import { getPostsForGame } from '@/lib/blog/registry';
import { buildFaqJsonLd } from '@/lib/structured-data';
import { JsonLd } from '@/components/JsonLd';
import Link from 'next/link';

/**
 * Rendered server-side, always present in the page's initial HTML (unlike
 * the in-game "How to play" modal, which only exists in the DOM once a
 * player opens it). This is the substantive, crawlable content for each
 * game page.
 */
export function GameDetails({ game }: { game: GameMeta }) {
  const relatedPosts = getPostsForGame(game.slug);
  const similarGames = getSimilarGames(game);
  const faqJsonLd = buildFaqJsonLd(game);

  return (
    <section className="max-w-2xl mt-16 pt-10 border-t border-index dark:border-index-dark">
      {faqJsonLd && <JsonLd data={faqJsonLd} />}

      {/* Quick facts: gives crawlers (and skimming players) the Difficulty / Play Time /
          Category info without having to parse prose. */}
      <dl className="flex flex-wrap gap-x-8 gap-y-2 mb-8 stat-line text-ink/60 dark:text-white/50">
        <div>
          <dt className="inline text-ink/40 dark:text-white/30">Difficulty </dt>
          <dd className="inline">{game.difficulty}</dd>
        </div>
        <div>
          <dt className="inline text-ink/40 dark:text-white/30">Play time </dt>
          <dd className="inline">~{game.avgSolveTime}</dd>
        </div>
        <div>
          <dt className="inline text-ink/40 dark:text-white/30">Category </dt>
          <dd className="inline">{CATEGORY_LABEL[game.category]}</dd>
        </div>
      </dl>

      <h2 className="font-display font-bold text-2xl mb-4">About {game.name}</h2>
      <div className="space-y-4 text-ink/80 dark:text-white/70 leading-relaxed text-sm mb-8">
        {game.designNotes.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <h3 className="font-display font-bold text-lg mb-3">How to play</h3>
      <ol className="space-y-2 text-sm text-ink/80 dark:text-white/70 list-decimal list-inside mb-8">
        {game.howToPlay.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>

      <h3 className="font-display font-bold text-lg mb-3">Strategy tips</h3>
      <ul className="space-y-2 text-sm text-ink/80 dark:text-white/70 list-disc list-inside">
        {game.strategyTips.map((tip, i) => (
          <li key={i}>{tip}</li>
        ))}
      </ul>

      {game.faq && game.faq.length > 0 && (
        <>
          <h3 className="font-display font-bold text-lg mb-3 mt-8">FAQ</h3>
          <div className="space-y-4 mb-8">
            {game.faq.map((item, i) => (
              <div key={i}>
                <p className="text-sm font-semibold text-ink dark:text-white/90 mb-1">{item.q}</p>
                <p className="text-sm text-ink/80 dark:text-white/70 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {similarGames.length > 0 && (
        <>
          <h3 className="font-display font-bold text-lg mb-3 mt-8">Similar games</h3>
          <ul className="flex flex-wrap gap-3 mb-8">
            {similarGames.map((g) => (
              <li key={g.slug}>
                <Link
                  href={`/games/${g.slug}`}
                  className="stat-line border-2 border-index dark:border-index-dark px-3 py-1.5 inline-block hover:border-graphite dark:hover:border-white/80 transition-colors"
                >
                  {g.name}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      {relatedPosts.length > 0 && (
        <>
          <h3 className="font-display font-bold text-lg mb-3 mt-8">Related reading</h3>
          <ul className="space-y-2 text-sm">
            {relatedPosts.map((post) => (
              <li key={post.slug}>
                <Link href={`/blog/${post.slug}`} className="underline text-ink/80 dark:text-white/70 hover:text-ink dark:hover:text-white">
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
