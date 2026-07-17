import { ArticleHero } from '@/components/blog/ArticleHero';
import { BarChart } from '@/components/blog/BarChart';
import { StatCallout, StatGrid } from '@/components/blog/StatCallout';

export default function AiInGameDevelopment() {
  return (
    <>
      <ArticleHero>
        <rect width="640" height="260" fill="#DEE9FD" />
        <rect x="270" y="80" width="100" height="80" rx="10" fill="#FFFFFF" stroke="#1B1D22" strokeWidth="3" />
        <circle cx="300" cy="110" r="7" fill="#2563EB" />
        <circle cx="340" cy="110" r="7" fill="#2563EB" />
        <path d="M 295 135 Q 320 148 345 135" stroke="#1B1D22" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M 170 120 L 260 110" stroke="#1B1D22" strokeWidth="2.5" strokeDasharray="6 6" />
        <path d="M 380 110 L 470 120" stroke="#1B1D22" strokeWidth="2.5" strokeDasharray="6 6" />
        <rect x="130" y="95" width="55" height="40" rx="4" fill="none" stroke="#1B1D22" strokeWidth="2.5" />
        <text x="320" y="200" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill="#1B1D22">A TOOL, NOT A TEAMMATE (YET)</text>
      </ArticleHero>

      <p>
        Ask people inside the games industry how they feel about generative AI, and you get two
        contradictory-sounding facts from the same survey: more developers are using it than ever,
        and more developers than ever think it&rsquo;s bad for the industry. Both are true at once,
        and once you see what the tools are actually being used for, the contradiction mostly
        resolves itself.
      </p>

      <h2>What the numbers actually say</h2>
      <p>
        GDC&rsquo;s 2026 State of the Game Industry survey, based on responses from over 2,300
        industry professionals, found that 36% of game industry workers now use generative AI
        tools as part of their job &mdash; though that drops to 30% specifically among people
        working at game studios, versus 58% at publishing, marketing, and support functions
        surrounding them.
      </p>

      <StatCallout value="36%" label="of game industry professionals use generative AI tools in their work (2026)" color="#2563EB" />

      <p>
        The more interesting number is what that 36% is actually doing with the tools. It&rsquo;s
        overwhelmingly research and administrative work, not game-facing creative output.
      </p>

      <BarChart
        title="What game industry AI users use the tools for"
        data={[
          { label: 'Research/brainstorm', value: 81 },
          { label: 'Coding assistance', value: 47 },
          { label: 'Daily admin tasks', value: 47 },
          { label: 'Prototyping', value: 35 },
          { label: 'Asset generation', value: 19 },
          { label: 'Procedural content', value: 10 },
          { label: 'Player-facing features', value: 5 },
        ]}
        color="#2563EB"
        suffix="%"
        source="GDC 2026 State of the Game Industry survey"
      />

      <p>
        Read top to bottom, that chart is basically a map of where developers trust the tools and
        where they don&rsquo;t. Research, brainstorming, and code assistance sit at the top &mdash;
        tasks where a wrong or mediocre AI suggestion costs a developer a few minutes of review.
        Player-facing features sit at the very bottom, at just 5% &mdash; the one place where a
        mistake ships directly to a paying customer.
      </p>

      <h2>Why the industry is skeptical anyway</h2>
      <p>
        Despite that fairly conservative usage pattern, sentiment has gotten more negative, not
        less, as the tools have improved. The same 2026 survey found 52% of respondents now
        believe generative AI is having a negative impact on the industry, up from 30% the year
        before and just 18% two years before that. Only 7% describe its impact as positive, down
        from 13% the prior year.
      </p>

      <StatGrid
        stats={[
          { value: '52%', label: 'say generative AI is harming the industry (2026)' },
          { value: '64%', label: 'of visual/technical artists hold a negative view' },
          { value: '7%', label: 'describe its impact as positive, down from 13%' },
        ]}
      />

      <p>
        That skepticism isn&rsquo;t evenly spread. It runs highest exactly where you&rsquo;d expect
        it to hurt most personally and professionally: visual and technical artists (64%
        negative), game designers and narrative writers (63%), and programmers (59%). These are
        the same disciplines where AI-generated output competes most directly with a
        developer&rsquo;s own creative skillset, versus, say, an internal ops tool automating a
        spreadsheet.
      </p>

      <h2>The gap between the hype and the pipeline</h2>
      <p>
        The honest picture in 2026 is less dramatic than either the &ldquo;AI will replace game
        developers&rdquo; headlines or the &ldquo;AI is just a fad&rdquo; dismissals suggest.
        Studios are quietly adopting AI for the unglamorous parts of the job &mdash; research,
        boilerplate code, early prototypes that get thrown away &mdash; while treating anything
        that reaches a player directly with active caution. That caution is partly ethical, partly
        legal, and partly just professional pride: most of the people whose jobs involve making
        something creative would rather it stay recognizably theirs.
      </p>
      <p>
        Whether that caution holds as the tools keep improving is the real open question for the
        rest of the decade. For now, the evidence points to AI quietly speeding up the boring 80%
        of game development, while the creative 20% that actually defines a game stays stubbornly,
        deliberately human.
      </p>
    </>
  );
}
