export type BlogCategory = 'trend' | 'biz' | 'culture' | 'insight';

export interface BlogPost {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: BlogCategory;
  publishDate: string; // ISO yyyy-mm-dd
  readTime: string;
}

export const CATEGORY_LABEL: Record<BlogCategory, string> = {
  trend: 'Trends',
  biz: 'Business',
  culture: 'Culture',
  insight: 'Psychology',
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'why-daily-games-took-over',
    title: 'Why Daily Games Took Over the Internet',
    tagline: 'One puzzle, once a day, no way to binge it. That constraint turned out to be the whole appeal.',
    description:
      'Wordle helped turn "one puzzle a day" into one of the biggest trends in casual gaming. Here\u2019s the data on why the format works, and why it keeps spreading.',
    category: 'culture',
    publishDate: '2026-05-18',
    readTime: '6 min read',
  },
  {
    slug: 'cloud-gaming-reality-check',
    title: 'Cloud Gaming in 2026: A Reality Check',
    tagline: 'The user numbers are real and growing. The market-size numbers depend entirely on who you ask.',
    description:
      'Cloud gaming has quietly become a daily habit for hundreds of millions of players. We break down what the data actually shows versus what the marketing decks claim.',
    category: 'biz',
    publishDate: '2026-05-27',
    readTime: '7 min read',
  },
  {
    slug: 'economics-of-free-to-play',
    title: 'The Economics of Free-to-Play',
    tagline: 'Mobile games make more money than console and PC combined \u2014 and almost none of it comes from most players.',
    description:
      'A plain-English breakdown of how free-to-play games actually make money, why mobile now outearns every other platform, and what that means for players.',
    category: 'biz',
    publishDate: '2026-06-03',
    readTime: '7 min read',
  },
  {
    slug: 'indie-games-boom-and-bust',
    title: 'Indie Games Are Booming and Starving at the Same Time',
    tagline: 'More indie games are released \u2014 and make more money \u2014 than ever. Almost none of that money reaches most of them.',
    description:
      'Steam released over 19,000 games in a single year. Indie revenue hit a record high. Here\u2019s why most developers still saw almost none of it.',
    category: 'biz',
    publishDate: '2026-06-10',
    readTime: '7 min read',
  },
  {
    slug: 'return-of-couch-co-op',
    title: 'The Quiet Return of Couch Co-op',
    tagline: 'After a decade of every game pushing you online, some of the biggest hits are pulling players back onto the same sofa.',
    description:
      'Local multiplayer never really left, but it spent a decade in the background. Here\u2019s why couch co-op is having a real moment again.',
    category: 'culture',
    publishDate: '2026-06-17',
    readTime: '5 min read',
  },
  {
    slug: 'ai-in-game-development',
    title: 'How AI Is Actually Being Used to Make Games',
    tagline: 'Not to replace developers \u2014 to remove the parts of the job nobody enjoyed in the first place.',
    description:
      'Beyond the hype and the fear, a grounded look at where AI tools are genuinely changing game development in 2026, and where they clearly are not.',
    category: 'trend',
    publishDate: '2026-06-24',
    readTime: '6 min read',
  },
  {
    slug: 'browser-game-renaissance',
    title: 'The Browser Game Renaissance',
    tagline: 'No install, no account, no 40GB update. The most frictionless way to play games in 2026 is also one of the oldest.',
    description:
      'Instant, no-download browser games are having a real resurgence. Here\u2019s why the format that predates the App Store is suddenly relevant again.',
    category: 'trend',
    publishDate: '2026-07-01',
    readTime: '5 min read',
  },
  {
    slug: 'retro-revival-pixel-art',
    title: 'Retro Revival: Why Pixel Art Never Actually Left',
    tagline: 'It\u2019s not just nostalgia. Low-fidelity art is one of the few styles that ages well and stays affordable to make.',
    description:
      'From Stardew Valley to Sea of Stars, pixel art keeps producing some of the industry\u2019s biggest indie hits. Here\u2019s the real reason it endures.',
    category: 'culture',
    publishDate: '2026-07-06',
    readTime: '5 min read',
  },
  {
    slug: 'speedrunning-goes-mainstream',
    title: 'Speedrunning Goes Mainstream',
    tagline: 'What used to be a basement hobby with a stopwatch is now a broadcast sport with millions watching.',
    description:
      'Speedrunning grew from a niche curiosity into a genuine spectator category. Here\u2019s how it happened, and what it says about how people want to play.',
    category: 'culture',
    publishDate: '2026-07-10',
    readTime: '5 min read',
  },
  {
    slug: 'psychology-of-one-more-try',
    title: 'The Psychology of "One More Try"',
    tagline: 'The same mental hook that makes a slot machine addictive can make a good puzzle feel satisfying. The difference is what happens after you stop.',
    description:
      'What actually makes games compelling \u2014 the psychology of near-misses, variable rewards, and flow \u2014 and how to tell healthy design from exploitative design.',
    category: 'insight',
    publishDate: '2026-07-14',
    readTime: '6 min read',
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getAllPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort((a, b) => (a.publishDate < b.publishDate ? 1 : -1));
}
