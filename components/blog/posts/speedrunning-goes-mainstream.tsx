import { ArticleHero } from '@/components/blog/ArticleHero';
import { LineChart } from '@/components/blog/LineChart';
import { StatCallout, StatGrid } from '@/components/blog/StatCallout';

export default function SpeedrunningGoesMainstream() {
  return (
    <>
      <ArticleHero>
        <rect width="640" height="260" fill="#F8E3EE" />
        <circle cx="320" cy="130" r="70" fill="none" stroke="#1B1D22" strokeWidth="4" />
        <line x1="320" y1="130" x2="320" y2="80" stroke="#1B1D22" strokeWidth="4" strokeLinecap="round" />
        <line x1="320" y1="130" x2="358" y2="150" stroke="#C2417A" strokeWidth="5" strokeLinecap="round" />
        <circle cx="320" cy="130" r="6" fill="#1B1D22" />
        <text x="320" y="230" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill="#1B1D22">EVERY SECOND, ON CAMERA</text>
      </ArticleHero>

      <p>
        For a long time, speedrunning looked like a fringe hobby: someone alone in a room,
        replaying the same twenty seconds of a decades-old game hundreds of times to shave off a
        few frames. Today, the biggest speedrunning marathons sell out venues, draw hundreds of
        thousands of concurrent viewers, and raise millions of dollars for charity in a single
        week. The hobby didn&rsquo;t change. The audience for watching mastery in real time did.
      </p>

      <h2>The clearest evidence: the money</h2>
      <p>
        Games Done Quick, the twice-yearly charity marathon where speedrunners attempt back-to-back
        world-record runs for a full week, is the best public record of how far the format has
        grown. Since its first event in 2010, GDQ has raised more than $34 million for charity
        overall &mdash; more than $25 million of that for the Prevent Cancer Foundation alone across
        fourteen years of its January marathon.
      </p>

      <LineChart
        title="Awesome Games Done Quick — total raised per event"
        data={[
          { label: '2015', value: 1.57 },
          { label: '2018', value: 2.2 },
          { label: '2020', value: 3.1 },
          { label: '2022', value: 3.42 },
          { label: '2024', value: 2.5 },
          { label: '2026', value: 2.4 },
        ]}
        color="#C2417A"
        suffix="M"
        source="Games Done Quick / Statista, AGDQ totals, $ millions"
      />

      <p>
        That curve is a useful, honest picture of where the format actually sits today: it grew
        rapidly through the late 2010s, peaked around 2022, and has settled into a steady, mature
        plateau since &mdash; still raising millions per event, but no longer breaking its own
        record every single year the way it did in its growth phase. That&rsquo;s not decline;
        it&rsquo;s what a format looks like once it stops being a novelty and becomes an
        institution.
      </p>

      <StatCallout value="$34M+" label="raised for charity across Games Done Quick's history since 2010" color="#C2417A" />

      <h2>Why it works as a spectator format</h2>
      <p>
        Speedrunning shouldn&rsquo;t work as something to watch, on paper. The runner has usually
        played the exact route hundreds of times before, so there&rsquo;s no mystery about what
        happens next. What makes it compelling anyway is precision under pressure: watching
        someone execute a frame-perfect trick they&rsquo;ve practiced thousands of times, live, with
        the constant possibility that one mistimed input undoes twenty minutes of flawless play.
        It&rsquo;s closer to watching a gymnast&rsquo;s routine than watching someone play a game
        casually &mdash; the tension comes from execution, not uncertainty about the plot.
      </p>
      <p>
        Commentary culture helped enormously here too. GDQ runs are almost always accompanied by
        a couch of commentators explaining, in real time, exactly what trick is being attempted and
        why it&rsquo;s hard &mdash; turning a run that would be opaque to a casual viewer into
        something closer to sports commentary, where the audience is taught to appreciate the
        difficulty of what they&rsquo;re watching as it happens.
      </p>

      <StatGrid
        stats={[
          { value: '$3.42M', label: 'single-event record, AGDQ 2022' },
          { value: '150+', label: 'games commonly run across one week-long marathon' },
          { value: '14 years', label: 'GDQ\u2019s partnership with the Prevent Cancer Foundation' },
        ]}
      />

      <h2>What it says about game design</h2>
      <p>
        Speedrunning&rsquo;s popularity has quietly influenced how some games get designed and
        supported. It&rsquo;s common now for developers to add built-in timers, replay tools, and
        even official speedrun modes at launch, rather than leaving the community to reverse-engineer
        routes after the fact. That&rsquo;s a real shift &mdash; a niche way of playing that started
        as an unintended use of a game&rsquo;s mechanics has become something studios plan for from
        the start, because they&rsquo;ve seen firsthand how much attention and goodwill a thriving
        speedrunning scene can bring to a game years after its release.
      </p>
    </>
  );
}
