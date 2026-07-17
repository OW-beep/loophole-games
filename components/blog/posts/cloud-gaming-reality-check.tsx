import { ArticleHero } from '@/components/blog/ArticleHero';
import { BarChart } from '@/components/blog/BarChart';
import { LineChart } from '@/components/blog/LineChart';
import { StatCallout, StatGrid } from '@/components/blog/StatCallout';

export default function CloudGamingRealityCheck() {
  return (
    <>
      <ArticleHero>
        <rect width="640" height="260" fill="#DBF3EC" />
        <rect x="60" y="150" width="90" height="60" rx="6" fill="#FFFFFF" stroke="#1B1D22" strokeWidth="3" />
        <rect x="480" y="150" width="90" height="60" rx="6" fill="#FFFFFF" stroke="#1B1D22" strokeWidth="3" />
        <path d="M 150 170 C 260 90, 380 90, 480 170" fill="none" stroke="#1B1D22" strokeWidth="3" strokeDasharray="8 8" />
        <circle cx="320" cy="115" r="34" fill="#0D8A6B" opacity="0.85" />
        <path d="M 305 115 l 10 10 l 20 -22" stroke="#FFFFFF" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <text x="320" y="220" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill="#1B1D22">STREAMED, NOT INSTALLED</text>
      </ArticleHero>

      <p>
        Ask five research firms how big the cloud gaming market is in 2026, and you&rsquo;ll get
        five very different answers &mdash; not within rounding error, but off by nearly a factor
        of six. One report says $4.8 billion. Another says $28.3 billion. Both are talking about
        the same year, the same industry, and largely the same handful of companies.
      </p>

      <BarChart
        title="Cloud gaming market size, 2026 (as estimated by different research firms)"
        data={[
          { label: 'Precedence Research', value: 4.8 },
          { label: 'Mordor Intelligence', value: 6.2 },
          { label: 'Persistence Mkt. Rsch.', value: 6.8 },
          { label: 'Fortune Bus. Insights', value: 23.8 },
          { label: 'Research and Markets', value: 28.3 },
        ]}
        color="#0D8A6B"
        prefix="$"
        suffix="B"
        source="Public market research summaries, 2026 estimates"
      />

      <p>
        The gap isn&rsquo;t sloppiness &mdash; it&rsquo;s a definitions problem. Some estimates count
        only direct consumer subscriptions to services like GeForce NOW or Xbox Cloud Gaming.
        Others fold in telco data bundles, advertising, hardware sales, and general-purpose cloud
        compute rented by publishers. Same industry, very different rulers.
      </p>

      <h2>The one number that actually is stable</h2>
      <p>
        User counts are far more consistent across trackers than revenue estimates, and they tell
        a clearer story: cloud gaming has quietly become a habit for a very large number of
        people. Modeling from Statista Market Insights put the global cloud gaming audience at
        roughly 396 million users in 2024, climbing toward 482 million by 2026.
      </p>

      <LineChart
        title="Cloud gaming users, worldwide"
        data={[
          { label: '2024', value: 396 },
          { label: '2025', value: 455 },
          { label: '2026', value: 482 },
        ]}
        color="#0D8A6B"
        suffix="M"
        source="Statista Market Insights modeling, cited via industry trackers"
      />

      <p>
        Behavior data backs up that this isn&rsquo;t a casual dabble. A 2025 survey of over 22,000
        cloud gamers found that 47% now play all of their games in the cloud, and just over half
        use a cloud service every single day. On the platform side, Microsoft told developers at
        GDC 2025 that Xbox Cloud Gaming hours had grown 45% year-over-year, and that more than a
        third of those sessions came from devices that couldn&rsquo;t run the games locally at all
        &mdash; meaning cloud gaming is genuinely expanding who gets to play, not just offering a
        second way to play the same audience.
      </p>

      <StatCallout value="482M" label="projected global cloud gaming users in 2026" color="#0D8A6B" />

      <h2>Where the friction still is</h2>
      <p>
        None of this means the format has fully arrived. Spending patterns stay cautious: about a
        third of paying cloud gamers spend under $10 a month, and the largest single group spends
        between $10 and $20. NVIDIA&rsquo;s GeForce NOW, despite reaching more than 30 million
        registered users across 4,500-plus games, introduced a 100-hour monthly cap on its paid
        tiers in January 2026 &mdash; a sign that even at scale, the underlying compute costs are
        still expensive enough to ration.
      </p>

      <StatGrid
        stats={[
          { value: '47%', label: 'of surveyed cloud gamers play everything in-cloud' },
          { value: '+45%', label: 'YoY growth in Xbox Cloud Gaming hours' },
          { value: '30M+', label: 'registered GeForce NOW users' },
        ]}
      />

      <h2>The honest verdict</h2>
      <p>
        Cloud gaming isn&rsquo;t the industry-reshaping wave that was promised around 2020, and
        it&rsquo;s still a small slice of the roughly $190 billion global games business by any
        measure. But it has settled into something more durable than hype: a genuinely useful way
        to play console-grade games on hardware that couldn&rsquo;t otherwise run them, used daily
        by a real and growing base of people. That&rsquo;s a smaller story than &ldquo;the future
        of gaming,&rdquo; but it&rsquo;s a truer one.
      </p>
    </>
  );
}
