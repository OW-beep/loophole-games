import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import { BLOG_POSTS, getPost } from '@/lib/blog/registry';
import { POST_COMPONENTS } from '@/lib/blog/post-components';
import { ArticleLayout } from '@/components/blog/ArticleLayout';
import { RisingAdBanner } from '@/components/RisingAdBanner';
import { JsonLd } from '@/components/JsonLd';
import { buildBlogPostingJsonLd } from '@/lib/blog/structured-data';

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { title: post.title, description: post.description, type: 'article' },
    twitter: { card: 'summary_large_image', title: post.title, description: post.description },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const Content = POST_COMPONENTS[post.slug];

  return (
    <>
      <JsonLd data={buildBlogPostingJsonLd(post)} />
      <RisingAdBanner />
      <ArticleLayout post={post}>
        <Content />
      </ArticleLayout>
      {/* Monetag Vignette banner ad — blog article pages only */}
      <Script
        id="monetag-vignette"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(s){s.dataset.zone='11650727',s.src='https://n6wxm.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`,
        }}
      />
    </>
  );
}
