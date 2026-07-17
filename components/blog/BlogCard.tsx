import Link from 'next/link';
import type { BlogPost } from '@/lib/blog/registry';
import { CATEGORY_LABEL } from '@/lib/blog/registry';

const STRIPE_CLASS: Record<string, string> = {
  trend: 'bg-trend',
  biz: 'bg-biz',
  culture: 'bg-culture',
  insight: 'bg-insight',
};

const SOFT_CLASS: Record<string, string> = {
  trend: 'group-hover:bg-trend-soft dark:group-hover:bg-trend/10',
  biz: 'group-hover:bg-biz-soft dark:group-hover:bg-biz/10',
  culture: 'group-hover:bg-culture-soft dark:group-hover:bg-culture/10',
  insight: 'group-hover:bg-insight-soft dark:group-hover:bg-insight/10',
};

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`specimen-card group block p-5 pl-7 transition-colors ${SOFT_CLASS[post.category]}`}
    >
      <span className={`tag-stripe ${STRIPE_CLASS[post.category]}`} aria-hidden />
      <span className="punch-hole" aria-hidden />

      <div className="flex items-start justify-between mb-3">
        <span className="stat-line text-ink/40 dark:text-white/30">{CATEGORY_LABEL[post.category]}</span>
        <span className="stat-line text-ink/40 dark:text-white/30">{post.readTime}</span>
      </div>

      <h3 className="font-display font-bold text-xl mb-1 leading-tight">{post.title}</h3>
      <p className="text-sm text-ink/70 dark:text-white/60 mb-4 leading-snug">{post.tagline}</p>

      <p className="stat-line text-ink/40 dark:text-white/30">{formatDate(post.publishDate)}</p>
    </Link>
  );
}
