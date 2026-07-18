export type BlogCategory = 'trend' | 'biz' | 'culture' | 'insight';

export interface BlogPost {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: BlogCategory;
  publishDate: string; // ISO yyyy-mm-dd
  readTime: string;
  /** Exactly two game slugs from lib/games/registry, shown as "play this next" links. */
  relatedGames: [string, string];
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
    relatedGames: ['echo-merge', 'mirror-loop'],
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
    relatedGames: ['boo-rush', 'drift'],
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
    relatedGames: ['color-debt', 'overflow'],
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
    relatedGames: ['sprout', 'noodle-cat'],
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
    relatedGames: ['tether', 'wobble-chef'],
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
    relatedGames: ['phase', 'carry-chain'],
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
    relatedGames: ['boo-rush', 'blobble'],
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
    relatedGames: ['noodle-cat', 'sprout'],
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
    relatedGames: ['drift', 'boo-rush'],
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
    relatedGames: ['mirror-loop', 'blobble'],
  },
  {
    slug: 'best-wordle-alternatives-2026',
    title: '15 Best Wordle Alternatives to Play in 2026',
    tagline: 'Multi-board word games, knowledge guessers, unlimited-guess puzzles \u2014 and a few that drop letters entirely.',
    description:
      'Looking for games like Wordle? A grounded guide to the best Wordle alternatives in 2026, organized by what they actually change about the formula \u2014 not just a list of names.',
    category: 'culture',
    publishDate: '2026-07-15',
    readTime: '7 min read',
    relatedGames: ['echo-merge', 'mirror-loop'],
  },
  {
    slug: 'free-online-games-no-download',
    title: 'The Best Free Online Games You Can Play With Zero Downloads',
    tagline: 'No install, no account, no 40GB update \u2014 just a link and a game.',
    description:
      'A practical guide to genuinely no-download browser games in 2026: what makes one actually good, and where to find puzzle and arcade games that open instantly.',
    category: 'trend',
    publishDate: '2026-07-16',
    readTime: '5 min read',
    relatedGames: ['boo-rush', 'cloud-hop'],
  },
  {
    slug: 'do-brain-games-really-work',
    title: 'Do Brain Training Games Actually Work? What the Research Really Says',
    tagline: 'The honest version: real evidence for getting better at the game you\u2019re playing, much weaker evidence for anything beyond it.',
    description:
      'A grounded look at the actual research behind brain training and puzzle games \u2014 near transfer versus far transfer, the Lumosity FTC case, and what a daily puzzle habit can realistically do for you.',
    category: 'insight',
    publishDate: '2026-07-17',
    readTime: '6 min read',
    relatedGames: ['color-debt', 'overflow'],
  },
  {
    slug: 'best-games-for-work-break',
    title: 'The Best Games for a 5-Minute Work or Study Break',
    tagline: 'Short enough to finish before your coffee cools, and no login wall between you and playing.',
    description:
      'What actually makes a game good for a short break \u2014 and a practical list of free, no-download games that fit into five minutes without dragging you back for forty-five.',
    category: 'culture',
    publishDate: '2026-07-17',
    readTime: '5 min read',
    relatedGames: ['sprout', 'noodle-cat'],
  },
  {
    slug: 'can-games-improve-reaction-time',
    title: 'Can Games Actually Improve Your Reaction Time?',
    tagline: 'Unlike most brain-training claims, this is one of the few where the research holds up reasonably well.',
    description:
      'What research on action video games and visual attention actually shows about reaction time training, and which kinds of games are most likely to genuinely sharpen it.',
    category: 'insight',
    publishDate: '2026-07-18',
    readTime: '6 min read',
    relatedGames: ['acorn-dash', 'cloud-hop'],
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getAllPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort((a, b) => (a.publishDate < b.publishDate ? 1 : -1));
}
