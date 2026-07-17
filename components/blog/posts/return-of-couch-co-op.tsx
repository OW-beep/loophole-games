import { ArticleHero } from '@/components/blog/ArticleHero';
import { StatGrid } from '@/components/blog/StatCallout';

export default function ReturnOfCouchCoOp() {
  return (
    <>
      <ArticleHero>
        <rect width="640" height="260" fill="#F8E3EE" />
        <rect x="200" y="150" width="240" height="50" rx="20" fill="#FFFFFF" stroke="#1B1D22" strokeWidth="3" />
        <circle cx="260" cy="120" r="26" fill="#C2417A" />
        <circle cx="380" cy="120" r="26" fill="#1B1D22" opacity="0.15" stroke="#1B1D22" strokeWidth="3" />
        <rect x="238" y="140" width="44" height="14" rx="4" fill="#1B1D22" />
        <rect x="358" y="140" width="44" height="14" rx="4" fill="#1B1D22" />
        <text x="320" y="230" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill="#1B1D22">SAME SCREEN, SAME SOFA</text>
      </ArticleHero>

      <p>
        For most of the 2010s, &ldquo;multiplayer&rdquo; quietly came to mean online multiplayer.
        Splitscreen modes got cut from sequels, couch co-op became a marketing footnote, and the
        assumption baked into most big releases was that friends would play together over the
        internet, not in the same room. Then a handful of the decade&rsquo;s most-praised games
        pointed the other direction.
      </p>

      <h2>What actually changed</h2>
      <p>
        It Takes Two swept Game of the Year awards built entirely around a two-player,
        can&rsquo;t-play-it-alone premise. Its follow-up, Split Fiction, kept the same
        forced-co-op structure. Nintendo built an entire console generation around Joy-Cons that
        hand to a friend mid-conversation, and its best-selling titles &mdash; Mario Kart, Mario
        Party, Animal Crossing sessions with visiting friends &mdash; are built around people
        physically sharing a space, not a network connection.
      </p>
      <p>
        None of this happened because online multiplayer failed. It happened because online
        multiplayer solved a different problem than the one couch co-op solves. Online play is
        about connecting with people who aren&rsquo;t in the room. Couch co-op is about a shared
        activity for people who already are &mdash; and after years of remote work, remote school,
        and video-call socializing, being in the same physical room with friends became something
        people actively sought out rather than took for granted.
      </p>

      <h2>Why it&rsquo;s a hard trend to see in the data</h2>
      <p>
        Local multiplayer&rsquo;s comeback doesn&rsquo;t show up cleanly in industry revenue
        charts the way mobile or cloud gaming does, because it isn&rsquo;t a platform or a
        monetization model &mdash; it&rsquo;s a design choice that cuts across genres and price
        points. A $20 party game and a $70 open-world adventure can both lean into local co-op,
        and neither shows up in a &ldquo;local multiplayer market size&rdquo; report because no
        such category exists. The evidence is anecdotal but consistent: critical and commercial
        successes in the last few years disproportionately include games designed to be played
        by more than one person on the same screen.
      </p>

      <StatGrid
        stats={[
          { value: 'GOTY winner', label: "It Takes Two — built entirely around 2-player co-op" },
          { value: 'Console strategy', label: 'Nintendo\u2019s handheld hybrid design leans on shared-screen play' },
          { value: 'Genre-wide', label: 'Party and co-op titles span nearly every price tier and genre' },
        ]}
      />

      <h2>What it says about how people actually want to play</h2>
      <p>
        The underlying appeal of couch co-op isn&rsquo;t nostalgia for old consoles, even though
        it often gets framed that way. It&rsquo;s that shared-screen play creates a kind of social
        friction &mdash; bumping elbows, watching a friend&rsquo;s reaction in real time, arguing
        over a shared decision &mdash; that online voice chat can approximate but never fully
        replace. A missed jump is funnier when you can see the other person&rsquo;s face. A shared
        win means more when you can high-five over it immediately.
      </p>
      <p>
        That doesn&rsquo;t mean online multiplayer is going anywhere; it remains the default for
        competitive and massive-scale games for good reason. But the assumption that local
        multiplayer was a relic of the pre-broadband era has clearly not held up. If anything, it
        turned out to be one of the few kinds of shared experience that streaming, social media,
        and remote everything couldn&rsquo;t fully substitute for.
      </p>
    </>
  );
}
