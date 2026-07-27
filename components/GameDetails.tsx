import type { GameMeta } from '@/lib/games/registry';
import { getPostsForGame } from '@/lib/blog/registry';
import Link from 'next/link';

/**
 * Rendered server-side, always present in the page's initial HTML (unlike
 * the in-game "How to play" modal, which only exists in the DOM once a
 * player opens it). This is the substantive, crawlable content for each
 * game page.
 */
export function GameDetails({ game }: { game: GameMeta }) {
  const relatedPosts = getPostsForGame(game.slug);

  return (
    <section className="max-w-2xl mt-16 pt-10 border-t border-index dark:border-index-dark">
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
