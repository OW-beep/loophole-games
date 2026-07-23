import { ArticleHero } from '@/components/blog/ArticleHero';
import { StatGrid } from '@/components/blog/StatCallout';

export default function PigmentColorMixingStrategy() {
  return (
    <>
      <ArticleHero>
        <rect width="640" height="260" fill="#1a1020" />
        <rect x="70" y="60" width="130" height="130" rx="12" fill="#B8419C" />
        <text x="135" y="210" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12" fill="#e9e7e1">TARGET</text>
        <rect x="260" y="60" width="130" height="130" rx="12" fill="#c96bb0" />
        <text x="325" y="210" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12" fill="#e9e7e1">YOUR MIX</text>
        <rect x="450" y="60" width="120" height="16" rx="8" fill="#3a2b3e" />
        <rect x="450" y="60" width="88" height="16" rx="8" fill="#4CAF7D" />
        <text x="510" y="98" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12" fill="#e9e7e1">73% match</text>
      </ArticleHero>

      <p>
        Pigment doesn&rsquo;t tell you what&rsquo;s in the target color. There&rsquo;s no recipe,
        no hex code, no hint beyond a swatch and a match percentage that climbs or falls with every
        ink you add. That&rsquo;s the whole puzzle: reasoning about color the way you would if you
        were actually mixing paint, using feedback instead of a formula.
      </p>

      <h2>The match meter is doing more work than it looks like</h2>
      <p>
        Every tap recalculates your well&rsquo;s color as a straight average of everything you&rsquo;ve
        added, then measures the distance to the target in color space and converts that into a
        percentage. That means the meter isn&rsquo;t just telling you &ldquo;warmer&rdquo; or
        &ldquo;colder&rdquo; &mdash; it&rsquo;s telling you your exact distance. A jump from 61% to
        74% after one tap is a much stronger signal than a jump from 61% to 63%, and it&rsquo;s worth
        paying attention to which ink caused the bigger jump.
      </p>

      <h2>Ratio matters more than which colors you&rsquo;ve used</h2>
      <p>
        Because the well is an average, three parts red to one part white lands somewhere
        completely different than one part red to three parts white, even though both mixes
        technically contain &ldquo;mostly red and some white.&rdquo; If your mix looks close in hue
        but not quite right, the fix is usually proportion, not a new color. Try adding two of
        whatever you already have the least of before reaching for a fifth ink you haven&rsquo;t
        used yet.
      </p>

      <StatGrid
        stats={[
          { value: '24', label: 'total ink taps shared across all 3 targets' },
          { value: '0', label: 'cost to clear a well and start over' },
          { value: '40', label: 'the color-distance threshold that counts as a match' },
        ]}
      />

      <h2>Clearing is free &mdash; use it more than you think you should</h2>
      <p>
        Unlike most games in the catalog, undoing your progress in Pigment costs nothing. If a mix
        stalls in the 60s no matter what you add, that almost always means the base ratio is wrong,
        not that you need one more tap of something. Clear it and start over with a completely
        different starting mix rather than layering more ink onto a foundation that isn&rsquo;t
        working. Only the ink taps themselves draw from your shared budget.
      </p>

      <h2>Budget across all three targets, not just the one in front of you</h2>
      <p>
        All three targets pull from the same pool of taps. A target you nail in three or four taps
        banks real slack for a trickier one later, so it&rsquo;s worth resisting the urge to
        over-polish an already-good match from 92% to 97% when those extra taps might matter more
        on target three. Bottling at a solid match and moving on is usually the better trade.
      </p>

      <p>
        White and black are worth remembering as fine-tuning tools rather than base colors: they
        shift how light or dark a mix reads without dragging the hue toward a completely different
        color, which makes them the safest way to nudge a mix that&rsquo;s already close.
      </p>
    </>
  );
}
