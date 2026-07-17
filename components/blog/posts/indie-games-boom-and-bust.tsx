import { ArticleHero } from '@/components/blog/ArticleHero';
import { BarChart } from '@/components/blog/BarChart';
import { LineChart } from '@/components/blog/LineChart';
import { StatCallout, StatGrid } from '@/components/blog/StatCallout';

export default function IndieGamesBoomAndBust() {
  return (
    <>
      <ArticleHero>
        <rect width="640" height="260" fill="#DBF3EC" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => {
          const h = [30, 42, 50, 68, 96, 130, 60][i];
          return (
            <rect
              key={i}
              x={90 + i * 68}
              y={220 - h}
              width="40"
              height={h}
              fill={i === 5 ? '#0D8A6B' : '#FFFFFF'}
              stroke="#1B1D22"
              strokeWidth="2.5"
            />
          );
        })}
        <text x="320" y="242" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill="#1B1D22">MORE GAMES. SAME-SIZE AUDIENCE.</text>
      </ArticleHero>

      <p>
        Two things are true about indie games on Steam at the same time, and they don&rsquo;t
        contradict each other the way they sound like they should. Indie games made more money in
        2025 than in any year before it. And the typical indie developer still made almost
        nothing.
      </p>

      <h2>The catalog is growing faster than the audience</h2>
      <p>
        SteamDB&rsquo;s release tracking shows the number of new games launching on the platform
        has more than doubled in five years &mdash; from 9,648 in 2020 to over 20,000 in 2025.
        That&rsquo;s not a gradual climb; it&rsquo;s a curve that keeps steepening every single
        year.
      </p>

      <LineChart
        title="New games released on Steam, per year"
        data={[
          { label: '2020', value: 9648 },
          { label: '2021', value: 11237 },
          { label: '2022', value: 12274 },
          { label: '2023', value: 14063 },
          { label: '2024', value: 18477 },
          { label: '2025', value: 20003 },
        ]}
        color="#0D8A6B"
        source="SteamDB, annual release summaries"
      />

      <p>
        The player base hasn&rsquo;t grown anywhere near that fast. The result is straightforward
        arithmetic: more than twice as many games are now competing for a discoverability slot
        that, on a per-game basis, is worth less than it was five years ago.
      </p>

      <h2>Where the money actually landed</h2>
      <p>
        Indie games earned a record $4.4 billion on Steam in 2025, about 25% of the platform&rsquo;s
        total $17.7 billion in revenue &mdash; genuinely impressive at the category level. But that
        total is overwhelmingly concentrated at the very top. The five best-selling indie releases
        of 2025 pulled in more than $500 million between them.
      </p>

      <BarChart
        title="Top 5 indie releases by revenue, 2025 (estimated)"
        data={[
          { label: 'Schedule I', value: 151 },
          { label: 'R.E.P.O.', value: 147 },
          { label: 'PEAK', value: 87 },
          { label: 'Hollow Knight: Silksong', value: 75 },
          { label: 'Escape from Duckov', value: 53 },
        ]}
        color="#0D8A6B"
        prefix="$"
        suffix="M"
        source="VG Insights / industry trackers, 2025 estimates"
      />

      <p>
        Meanwhile, the median Steam game released in 2025 grossed roughly $249 in its entire
        first year &mdash; before Valve&rsquo;s 30% platform cut, before tax, before splitting
        anything among a team. Divide that record $4.4 billion evenly across the 20,000-plus games
        that launched, and it comes out to about $231,000 per game on average. Almost no developer
        outside the top 1% actually sees anything close to that average, because the distribution
        isn&rsquo;t close to even.
      </p>

      <StatCallout value="$249" label="median gross revenue of a game released on Steam in 2025" color="#0D8A6B" />

      <h2>A blurrier line than &ldquo;indie&rdquo; suggests</h2>
      <p>
        Part of what&rsquo;s propping up the top of that chart isn&rsquo;t what most players
        picture when they hear &ldquo;indie.&rdquo; Studios like Larian (Baldur&rsquo;s Gate 3) and
        Game Science (Black Myth: Wukong) technically count as indie because they self-publish,
        but their budgets and teams rival traditional AA studios. Industry trackers estimate these
        larger, self-published &ldquo;Triple-I&rdquo; studios captured 53% of all indie revenue in
        2024 &mdash; meaning a meaningful chunk of &ldquo;indie success&rdquo; headlines describe
        something closer to a well-funded mid-size studio than a bedroom developer.
      </p>

      <StatGrid
        stats={[
          { value: '20,003', label: 'new games released on Steam in 2025' },
          { value: '5,863', label: "games that crossed $100K in revenue in 2025" },
          { value: '25%', label: "indie share of Steam's total 2025 revenue" },
        ]}
      />

      <h2>The honest takeaway</h2>
      <p>
        None of this means indie development is a dead end &mdash; the number of games crossing
        the $100K mark has nearly doubled since 2020, and developers making their second or third
        game consistently earn more than they did on their first. But it does mean the era of a
        good game quietly finding its audience on word-of-mouth alone is largely over. In a
        catalog adding 20,000 new competitors a year, discoverability isn&rsquo;t a secondary
        concern for indie developers anymore. It&rsquo;s the main event.
      </p>
    </>
  );
}
