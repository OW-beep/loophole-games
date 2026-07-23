import { ArticleHero } from '@/components/blog/ArticleHero';
import { StatGrid } from '@/components/blog/StatCallout';

export default function PsychologyOfTheDailyStreak() {
  return (
    <>
      <ArticleHero>
        <rect width="640" height="260" fill="#141821" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <g key={i}>
            <rect x={60 + i * 78} y="90" width="60" height="60" rx="8" fill={i < 5 ? '#E8677E' : '#2a2f3a'} stroke="#8b93a3" strokeWidth="1" />
            {i < 5 && <text x={90 + i * 78} y="128" textAnchor="middle" fontSize="26">🔥</text>}
          </g>
        ))}
        <text x="320" y="190" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="13" fill="#8b93a3">5-day streak &middot; don&#39;t break it</text>
      </ArticleHero>

      <p>
        A streak counter is a strange little piece of software. It doesn&rsquo;t make the puzzle
        easier, it doesn&rsquo;t unlock anything tangible, and in most implementations it&rsquo;s
        nothing more than a number next to a flame emoji. And yet it&rsquo;s one of the most
        reliable ways ever built into an app to get someone to open it again tomorrow, and the
        day after that.
      </p>

      <h2>Loss aversion, not reward, is doing the work</h2>
      <p>
        The behavioral economics term for what makes a streak effective is loss aversion: people
        feel the pain of losing something roughly twice as strongly as they feel the pleasure of
        gaining an equivalent thing. A streak reframes a daily puzzle from &ldquo;something fun I
        could do&rdquo; into &ldquo;something I already have that I could lose.&rdquo; Once a
        streak hits five or six days, skipping a day doesn&rsquo;t feel neutral anymore &mdash; it
        feels like giving something up, even though nothing was ever actually at stake.
      </p>

      <h2>Why the reset has to be real</h2>
      <p>
        A streak mechanic only works if breaking it actually costs something. Apps that quietly
        forgive a missed day, or let you buy back a lost streak, tend to see the habit loop weaken
        over time &mdash; once people learn the number doesn&rsquo;t really reset, it stops
        functioning as a streak and starts functioning as a regular counter. The uncomfortable part
        of a real streak is exactly what makes it effective.
      </p>

      <StatGrid
        stats={[
          { value: '2x', label: 'roughly how much stronger loss feels than an equivalent gain' },
          { value: '1', label: 'missed day needed to reset most streak counters to zero' },
          { value: '0', label: 'tangible reward behind most streak mechanics \u2014 the number is the reward' },
        ]}
      />

      <h2>Where it tips from habit into stress</h2>
      <p>
        The same mechanic that builds a healthy daily habit can just as easily start to feel like
        an obligation. A common signal that a streak has crossed that line: opening the app out of
        anxiety about losing the number rather than any interest in the puzzle itself, or solving
        on autopilot just to log the win before bed. At that point the streak has stopped doing its
        job \u2014 building a habit around something enjoyable \u2014 and started doing the opposite.
      </p>

      <h2>Keeping a streak in the healthy zone</h2>
      <p>
        A few small design and personal habits keep a streak feeling like a nudge instead of a
        leash: playing at a consistent, low-pressure time of day rather than squeezing it in right
        before a deadline; treating an eventual broken streak as a data point instead of a failure;
        and remembering that the underlying puzzle, not the number next to it, is the actual point.
        A streak is a good reason to open the app today. It&rsquo;s a bad reason to feel bad about
        yesterday.
      </p>
    </>
  );
}
