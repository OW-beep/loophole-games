import { ArticleHero } from '@/components/blog/ArticleHero';
import { BarChart } from '@/components/blog/BarChart';
import { StatCallout, StatGrid } from '@/components/blog/StatCallout';

export default function EconomicsOfFreeToPlay() {
  return (
    <>
      <ArticleHero>
        <rect width="640" height="260" fill="#DBF3EC" />
        <circle cx="200" cy="130" r="55" fill="#FFFFFF" stroke="#1B1D22" strokeWidth="3" />
        <text x="200" y="140" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="24" fill="#1B1D22">FREE</text>
        <circle cx="420" cy="90" r="16" fill="#0D8A6B" />
        <circle cx="460" cy="140" r="10" fill="#0D8A6B" opacity="0.7" />
        <circle cx="400" cy="170" r="13" fill="#0D8A6B" opacity="0.5" />
        <path d="M 255 130 L 380 100" stroke="#1B1D22" strokeWidth="2.5" strokeDasharray="6 6" />
        <path d="M 255 140 L 385 150" stroke="#1B1D22" strokeWidth="2.5" strokeDasharray="6 6" />
      </ArticleHero>

      <p>
        In 2025, mobile games earned more money than console and PC gaming combined &mdash; and
        almost every dollar of it came from games that cost nothing to download. Free-to-play
        isn&rsquo;t a workaround for making money without charging players. Across the industry, it
        has become the model that makes the most money, period.
      </p>

      <h2>How &ldquo;free&rdquo; ended up outearning &ldquo;paid&rdquo;</h2>
      <p>
        Newzoo&rsquo;s figures put the total global games market at roughly $187.7 billion in 2024
        and $188.8 billion in 2025, with mobile&rsquo;s share climbing from about 49% to 55% in
        that single year. That shift put mobile&rsquo;s 2025 revenue at around $103 billion,
        ahead of console and PC combined.
      </p>

      <BarChart
        title="Global games market by platform, 2025 (estimated)"
        data={[
          { label: 'Mobile', value: 103 },
          { label: 'Console + PC', value: 85.8 },
        ]}
        color="#0D8A6B"
        prefix="$"
        suffix="B"
        source="Newzoo-based industry estimates, 2025"
      />

      <p>
        Almost none of that mobile revenue comes from selling a copy of the game. In 2024,
        in-app purchases made up roughly $82 billion of the $92 billion mobile games earned that
        year &mdash; around 89% of all mobile game revenue. The download is the bait; the
        in-game economy is the business.
      </p>

      <StatCallout value="$103B" label="global mobile game revenue in 2025 &mdash; more than console and PC combined" color="#0D8A6B" />

      <h2>Why free-to-play out-earns a $60 price tag</h2>
      <p>
        The math is simple once you separate two things every premium game bundles together:
        getting someone to try the game, and getting them to pay for it. A $60 price tag does
        both at once, which filters out anyone unwilling to pay upfront before they&rsquo;ve even
        seen the game. Free-to-play splits the two steps apart entirely. Removing the price
        removes the biggest single reason people don&rsquo;t try a game, which means a
        free-to-play title can build a download base many times larger than a premium
        equivalent&rsquo;s player base ever could.
      </p>
      <p>
        Once that much larger funnel exists, the game only needs a small percentage of players
        to convert into paying customers to out-earn a premium release. That&rsquo;s the part of
        the model that draws the most criticism, and fairly so: F2P monetization is well known
        for being sharply concentrated, with a small share of players &mdash; often called
        &ldquo;whales&rdquo; in industry shorthand &mdash; accounting for a disproportionate
        amount of total revenue, while the vast majority of players never pay a cent.
      </p>

      <h2>Where the money actually comes from</h2>
      <p>
        Not every free game monetizes the same way. Broadly, mobile apps generate revenue through
        three channels: direct in-app purchases, advertising, and up-front paid downloads. Across
        the mobile app ecosystem generally, in-app purchases account for the largest share of
        earnings, with advertising and paid downloads splitting a smaller remainder &mdash; and
        gaming apps lean on in-app purchases even more heavily than the average app, since ads
        interrupt play in a way they don&rsquo;t interrupt, say, a weather app.
      </p>

      <StatGrid
        stats={[
          { value: '$82B', label: 'mobile game in-app purchase revenue, 2024' },
          { value: '55%', label: "mobile's share of the global games market, 2025" },
          { value: '~$36', label: 'average annual revenue per mobile gamer (ARPU), recent estimates' },
        ]}
      />

      <h2>What this means for players</h2>
      <p>
        None of this makes free-to-play inherently predatory &mdash; plenty of F2P games monetize
        fairly, with cosmetic-only purchases or generous free tiers that never gate core
        gameplay. But the underlying incentive is worth knowing as a player: a free-to-play
        game&rsquo;s design is optimized around converting and retaining a small paying minority,
        not around a fixed, one-time transaction. Understanding that distinction is the easiest
        way to tell a generous free game from one quietly built around your spending habits.
      </p>
    </>
  );
}
