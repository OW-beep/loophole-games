import { ArticleHero } from '@/components/blog/ArticleHero';
import { BarChart } from '@/components/blog/BarChart';
import { StatCallout, StatGrid } from '@/components/blog/StatCallout';

export default function WhyDailyGamesTookOver() {
  return (
    <>
      <ArticleHero>
        <rect width="640" height="260" fill="#F8E3EE" />
        <rect x="240" y="70" width="160" height="120" rx="6" fill="#FFFFFF" stroke="#1B1D22" strokeWidth="3" />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={252 + i * 28} y={90} width="22" height="22" rx="3" fill={i < 3 ? '#C2417A' : '#EFEFEF'} stroke="#1B1D22" strokeWidth="2" />
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={`b-${i}`} x={252 + i * 28} y={120} width="22" height="22" rx="3" fill={i === 4 ? '#C2417A' : '#EFEFEF'} stroke="#1B1D22" strokeWidth="2" />
        ))}
        <text x="320" y="164" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill="#1B1D22">ONE PUZZLE. ONCE A DAY.</text>
        <circle cx="120" cy="60" r="18" fill="none" stroke="#1B1D22" strokeWidth="3" />
        <circle cx="520" cy="200" r="14" fill="#C2417A" opacity="0.5" />
      </ArticleHero>

      <p>
        In October 2021, a small word-guessing game with no ads, no account system, and exactly
        one puzzle a day started spreading through group chats. By the time The New York Times
        bought it a few months later, it had already done something most game designers spend
        careers chasing: it made restriction feel like a feature, not a limitation.
      </p>

      <p>
        Wordle didn&rsquo;t win by offering more. It won by offering less, on purpose, and only once
        a day.
      </p>

      <h2>The numbers behind the habit</h2>
      <p>
        The scale is easy to underestimate because there&rsquo;s no flashy graphics or trailer to
        point to. According to figures the New York Times has shared about its games platform,
        puzzles across Wordle, Connections, Strands, and the Mini Crossword were played 11.1
        billion times in 2024 alone. Wordle made up nearly half of that on its own.
      </p>

      <BarChart
        title="NYT Games — puzzles played in 2024"
        data={[
          { label: 'Wordle', value: 5.3 },
          { label: 'Connections', value: 3.3 },
          { label: 'Strands', value: 1.3 },
        ]}
        color="#C2417A"
        suffix="B"
        source="The New York Times, reported plays for 2024"
      />

      <p>
        What&rsquo;s more telling than the raw volume is how steady it&rsquo;s stayed. Independent
        trackers estimate Wordle still pulls in millions of daily active users years after its
        viral peak, with the top five word-puzzle apps combined drawing over 35 million daily
        players. That&rsquo;s not a spike. That&rsquo;s a routine, the same category as checking
        the weather or reading the news.
      </p>

      <StatGrid
        stats={[
          { value: '~12M', label: 'Wordle daily active users (2025)' },
          { value: '3.8', label: 'average guesses to solve' },
          { value: '98.7%', label: 'of started puzzles get finished' },
        ]}
      />

      <h2>Why the constraint is the whole point</h2>
      <p>
        Almost every other genre of game is built to maximize time spent. Daily puzzles do the
        opposite on purpose, and that turns out to matter for three reasons.
      </p>
      <p>
        First, there&rsquo;s nothing to binge. A player can&rsquo;t get burned out on a game that
        physically won&rsquo;t give them a second puzzle until tomorrow. That single design choice
        removes the entire category of fatigue that eventually kills most casual mobile games.
      </p>
      <p>
        Second, everyone is solving the same puzzle at the same time. That shared board is what
        makes the format so shareable &mdash; a green-and-yellow grid posted with no spoilers means
        something to a friend only because you both know it refers to the exact same challenge.
        Compare scores, not content; that&rsquo;s a much lower bar for a casual post than a full
        review or screenshot.
      </p>
      <p>
        Third, a daily cap keeps the business model honest. There&rsquo;s no session to extend, no
        energy meter to refill, no ad to sit through for one more turn. The entire monetization
        surface area shrinks to &ldquo;come back tomorrow,&rdquo; which is a much harder thing to
        exploit than &ldquo;spend one more minute today.&rdquo;
      </p>

      <StatCallout value="11.1B" label="puzzles played across NYT Games in 2024" color="#C2417A" />

      <h2>Where the format is spreading next</h2>
      <p>
        Word games got there first, but the daily-puzzle shape has since spread well beyond
        five-letter guessing games. Logic puzzles, geography guessers, music-identification
        games, and increasingly arcade-style reflex games have all adopted the same rules: one
        board a day, generated from a shared seed, the same for every player on Earth. The
        mechanic changes; the shape doesn&rsquo;t.
      </p>
      <p>
        That shape is likely to keep spreading, not because it&rsquo;s trendy, but because it
        solves a real problem the rest of the games industry has struggled with for years: how do
        you keep people coming back without wearing them out. Once a day, it turns out, is often
        enough.
      </p>
    </>
  );
}
