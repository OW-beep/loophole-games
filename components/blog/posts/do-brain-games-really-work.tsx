import { ArticleHero } from '@/components/blog/ArticleHero';
import { StatCallout, StatGrid } from '@/components/blog/StatCallout';

export default function DoBrainGamesReallyWork() {
  return (
    <>
      <ArticleHero>
        <rect width="640" height="260" fill="#EAE3FA" />
        <circle cx="320" cy="130" r="70" fill="#FFFFFF" stroke="#1B1D22" strokeWidth="3" />
        <path
          d="M 300 100 Q 285 100 285 118 Q 285 132 300 138 Q 300 150 315 150 L 325 150 Q 340 150 340 138 Q 355 132 355 118 Q 355 100 340 100 Q 335 90 320 90 Q 305 90 300 100 Z"
          fill="#6C4CC4"
          opacity="0.85"
        />
        <text x="320" y="228" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill="#1B1D22">NEAR TRANSFER, NOT MAGIC</text>
      </ArticleHero>

      <p>
        &ldquo;Do brain games actually work?&rdquo; has a real, research-backed answer, and it
        isn&rsquo;t the confident yes that a lot of brain-training apps advertise or the dismissive
        no that skeptics sometimes reach for either. The honest answer depends entirely on what
        you mean by &ldquo;work.&rdquo;
      </p>

      <h2>The distinction the whole debate hinges on</h2>
      <p>
        Cognitive scientists split this question into two separate claims. Near transfer means
        getting better at tasks similar to the one you practiced &mdash; play a lot of Wordle and
        you&rsquo;ll likely get faster at other word-guessing games. Far transfer means that
        practice generalizing to something meaningfully different &mdash; better memory in daily
        life, higher measured intelligence, sharper focus at work. Nearly every brain-training
        product markets itself on the promise of far transfer. Nearly all of the contested science
        is about whether far transfer is real at all.
      </p>

      <h2>What the evidence actually shows</h2>
      <p>
        Near transfer has reasonably consistent support across the research literature &mdash;
        practicing a specific type of cognitive task reliably improves performance on similar
        tasks. Far transfer is a much murkier picture. A 2022 study from UC Riverside and UC
        Irvine, published in Nature Human Behavior, found that people who show strong near
        transfer from training are more likely to also show far transfer &mdash; but the far
        transfer effect itself remains inconsistent across the field, with some meta-analyses
        finding small positive effects on fluid intelligence and others finding no evidence of
        generalization at all.
      </p>

      <StatGrid
        stats={[
          { value: 'Consistent', label: 'evidence for near transfer &mdash; better at similar tasks' },
          { value: 'Contested', label: 'evidence for far transfer &mdash; general cognitive gains' },
          { value: '2022', label: 'UC Riverside/Irvine study linking the two transfer types' },
        ]}
      />

      <h2>The cautionary tale worth knowing</h2>
      <p>
        The clearest sign of how oversold this category became is a specific, well-documented
        case. In January 2016, the Federal Trade Commission fined Lumos Labs, maker of the
        popular Lumosity brain-training program, $2 million for deceptive advertising. The FTC
        found the company had claimed its games could help stave off memory loss, dementia, and
        even Alzheimer&rsquo;s disease, without the scientific evidence to back those claims up.
        It&rsquo;s a useful benchmark for reading any brain-game marketing since: if a product
        promises it will meaningfully change your real-world cognition, ask what evidence
        actually supports that specific claim, not just the general idea that &ldquo;training your
        brain&rdquo; sounds like it should work.
      </p>

      <StatCallout value="$2M" label="FTC fine against Lumosity for unsubstantiated brain-training claims (2016)" color="#6C4CC4" />

      <h2>So is a daily puzzle habit worth it?</h2>
      <p>
        Yes &mdash; just for more modest, better-supported reasons than &ldquo;boost your IQ.&rdquo;
        A regular puzzle habit will reliably make you better at that specific kind of puzzle,
        which is near transfer working exactly as the research says it should. It&rsquo;s also,
        independent of any cognitive claim at all, a genuinely pleasant daily ritual &mdash; and
        the psychological research on flow and engagement stands on its own without needing to
        borrow credibility from contested claims about general intelligence.
      </p>
      <p>
        The realistic pitch for a daily logic puzzle isn&rsquo;t that it will make you smarter in
        some general, transferable sense. It&rsquo;s that it will make you better at solving that
        particular kind of problem, give you a few minutes of genuine, focused enjoyment, and ask
        nothing more of you than that &mdash; which, unlike a $300 lifetime brain-training
        subscription, is a claim that actually holds up.
      </p>
    </>
  );
}
