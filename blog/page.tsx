import type { Metadata } from 'next';
import { getAllPosts } from '@/lib/blog/registry';
import { BlogCard } from '@/components/blog/BlogCard';
import { JsonLd } from '@/components/JsonLd';
import { buildBlogListJsonLd } from '@/lib/blog/structured-data';

export const metadata: Metadata = {
  title: 'Blog — gaming trends and analysis',
  description:
    'Plain-English analysis of gaming industry trends: cloud gaming, free-to-play economics, indie games, retro revivals, and what actually makes games fun.',
  alternates: { canonical: '/blog' },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();
  return (
    <div>
      <JsonLd data={buildBlogListJsonLd(posts)} />
      <p className="stat-line text-ink/50 dark:text-white/40 mb-3">Field notes · est. 2026</p>
      <h1 className="font-display font-bold text-4xl sm:text-5xl leading-[1.05] mb-4 max-w-2xl">
        Gaming trends, explained plainly.
      </h1>
      <p className="text-ink/70 dark:text-white/60 max-w-xl mb-12 leading-relaxed">
        Ten short, data-backed reads on where gaming is heading — cloud streaming, free-to-play
        economics, indie games, retro aesthetics, and the psychology of why games hook us in the
        first place. No jargon, no hype, real numbers.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {posts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
