import { ArticleHero } from '@/components/blog/ArticleHero';

export default function PsychologyOfOneMoreTry() {
  return (
    <>
      <ArticleHero>
        <rect width="640" height="260" fill="#EAE3FA" />
        <circle cx="320" cy="130" r="80" fill="none" stroke="#1B1D22" strokeWidth="3" strokeDasharray="10 8" />
        <path d="M 320 50 A 80 80 0 0 1 395 155" fill="none" stroke="#6C4CC4" strokeWidth="6" strokeLinecap="round" />
        <circle cx="395" cy="155" r="8" fill="#6C4CC4" />
        <text x="320" y="138" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="13" fill="#1B1D22">ONE MORE</text>
        <text x="320" y="230" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill="#1B1D22">THE LOOP THAT KEEPS YOU PLAYING</text>
      </ArticleHero>

      <p>
        &ldquo;Just one more try&rdquo; is one of the most familiar feelings in games, and one of
        the most misunderstood. The same psychological mechanism can describe a puzzle game that
        leaves someone feeling sharp and satisfied, and a slot machine that leaves someone
        feeling drained and regretful. The mechanism isn&rsquo;t the problem. What a game does with
        it is.
      </p>

      <h2>The mechanism: variable rewards</h2>
      <p>
        The core idea comes from decades-old psychology, not game design. B.F. Skinner&rsquo;s
        research on operant conditioning found that rewards delivered on an unpredictable
        schedule &mdash; sometimes called variable ratio reinforcement &mdash; produce more
        persistent, harder-to-extinguish behavior than rewards delivered on a predictable
        schedule. A reward you can count on stops feeling exciting. A reward that might come this
        time, or might not, keeps you checking.
      </p>
      <p>
        Games use this constantly, often without players noticing: a puzzle that might click into
        place on this attempt, a loot drop that might be a good one this run, a match that might
        finally go your way this time. The uncertainty itself is what generates the pull to try
        again, more than the reward's actual size.
      </p>

      <h2>The near-miss effect</h2>
      <p>
        A closely related and even more specific quirk is the near-miss effect, first studied
        seriously in slot machine research. A result that almost lands &mdash; two matching
        symbols and a third just one position off &mdash; triggers a similar brain response to an
        actual win, even though it&rsquo;s functionally a total loss. That near-miss feeling
        translates directly into &ldquo;I was so close, let me try again,&rdquo; regardless of
        whether being close actually improves the odds of the next attempt at all.
      </p>
      <p>
        Well-designed puzzle and skill games use a legitimate version of this same effect: a
        level you almost solved, a run you almost completed, a target you barely missed. The
        difference is that in a genuinely skill-based game, being close usually does reflect real
        progress toward mastering it &mdash; unlike a slot machine, where a near miss is
        manufactured and has no bearing on the next spin at all.
      </p>

      <h2>What separates healthy design from exploitative design</h2>
      <p>
        The psychologist Mihaly Csikszentmihalyi&rsquo;s concept of &ldquo;flow&rdquo; &mdash; a
        state of full absorption where challenge and skill are closely matched &mdash; offers a
        useful test here. Flow requires that a person&rsquo;s ability is actually improving in
        response to the challenge. A good puzzle game, rhythm game, or skill-based arcade game
        produces flow because the player is genuinely getting better at it over repeated tries,
        and each attempt teaches them something that makes the next one easier.
      </p>
      <p>
        An exploitative loop mimics the emotional feeling of that cycle &mdash; the pull, the
        near-miss, the urge to continue &mdash; without the actual skill growth underneath it. A
        loot box doesn&rsquo;t make you better at opening loot boxes. A slot machine doesn&rsquo;t
        reward improving technique. Stripped of any real skill component, the same reward-schedule
        psychology that makes mastery feel good is repurposed to make pure chance feel good
        instead &mdash; which is a much harder loop to walk away from, because there&rsquo;s no
        sense of genuine progress to feel satisfied about and stop.
      </p>

      <h2>A practical way to tell the difference</h2>
      <p>
        A useful question to ask about any game that produces a strong &ldquo;one more try&rdquo;
        pull is simple: after you stop playing, do you feel like you got better at something, or
        just like you spent time and possibly money chasing a feeling? Games built around
        real skill &mdash; timing, pattern recognition, problem-solving &mdash; tend to leave
        players with a concrete answer: a level cleared, a time beaten, a puzzle finally
        understood. Games built purely around chance-based reward schedules tend to leave players
        with only the urge to try again, and comparatively little to show for the tries already
        spent.
      </p>
      <p>
        Neither pull is imaginary, and neither is inherently sinister on its own &mdash;
        uncertainty and near-misses are a basic and effective part of what makes any game
        engaging. The distinction that actually matters, for designers and players alike, is
        whether that pull is in service of something a person is actually getting better at, or
        whether the feeling itself is the entire product.
      </p>
    </>
  );
}
