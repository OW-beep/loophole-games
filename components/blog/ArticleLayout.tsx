import Link from 'next/link';
import type { ReactNode } from 'react';
import type { BlogPost } from '@/lib/blog/registry';
import { CATEGORY_LABEL, getAllPosts } from '@/lib/blog/registry';

const STRIPE_CLASS: Record<string, string> = {
  trend: 'bg-trend',
  biz: 'bg-biz',
  culture: 'bg-culture',
  insight: 'bg-insight',
};

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function ArticleLayout({ post, children }: { post: BlogPost; children: ReactNode }) {
  const related = getAllPosts()
    .filter((p) => p.slug !== post.slug)
    .slice(0, 2);

  return (
    <article className="max-w-2xl mx-auto">
      <Link href="/blog" className="stat-line text-ink/50 dark:text-white/40 hover:underline mb-6 inline-block">
        ← All articles
      </Link>

      <div className="flex items-center gap-3 mb-4">
        <span className={`stat-line text-white px-2 py-1 rounded-tag ${STRIPE_CLASS[post.category]}`}>
          {CATEGORY_LABEL[post.category]}
        </span>
        <span className="stat-line text-ink/40 dark:text-white/30">
          {formatDate(post.publishDate)} · {post.readTime}
        </span>
      </div>

      <h1 className="font-display font-bold text-3xl sm:text-4xl leading-tight mb-3">{post.title}</h1>
      <p className="text-ink/70 dark:text-white/60 text-lg leading-snug mb-10">{post.tagline}</p>

      <div
        className="
          text-ink/80 dark:text-white/70 leading-relaxed
          [&>p]:mb-5
          [&>h2]:font-display [&>h2]:font-bold [&>h2]:text-2xl [&>h2]:text-ink [&>h2]:dark:text-white [&>h2]:mt-12 [&>h2]:mb-4
          [&>h3]:font-display [&>h3]:font-bold [&>h3]:text-lg [&>h3]:text-ink [&>h3]:dark:text-white [&>h3]:mt-8 [&>h3]:mb-3
          [&>ul]:list-disc [&>ul]:list-inside [&>ul]:space-y-2 [&>ul]:mb-5
          [&>ol]:list-decimal [&>ol]:list-inside [&>ol]:space-y-2 [&>ol]:mb-5
          [&>blockquote]:border-l-2 [&>blockquote]:border-index [&>blockquote]:dark:border-index-dark [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:my-6
        "
      >
        {children}
      </div>

      <div className="mt-14 pt-8 border-t border-index dark:border-index-dark">
        <p className="stat-line text-ink/40 dark:text-white/30 mb-4">More from the blog</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
          {related.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="specimen-card block p-4 pl-6 text-sm"
            >
              <span className={`tag-stripe ${STRIPE_CLASS[p.category]}`} aria-hidden />
              <p className="font-display font-bold mb-1">{p.title}</p>
              <p className="text-ink/60 dark:text-white/50 leading-snug">{p.tagline}</p>
            </Link>
          ))}
        </div>

        <Link
          href="/games"
          className="stat-line inline-block border-2 border-graphite dark:border-white/80 px-4 py-3 hover:bg-graphite hover:text-white dark:hover:bg-white dark:hover:text-graphite transition-colors"
        >
          Looking for something to play? → Today&rsquo;s puzzles
        </Link>
      </div>
    </article>
  );
}
