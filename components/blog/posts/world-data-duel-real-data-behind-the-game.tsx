import { ArticleHero } from '@/components/blog/ArticleHero';
import { StatGrid } from '@/components/blog/StatCallout';

export default function WorldDataDuelRealDataBehindTheGame() {
  return (
    <>
      <ArticleHero>
        <rect width="640" height="260" fill="#0b0e14" />
        <text x="60" y="70" fontFamily="var(--font-mono)" fontSize="13" fill="#4fd1c5">2022 · World Bank / UN</text>
        <text x="60" y="100" fontFamily="var(--font-mono)" fontSize="13" fill="#4fd1c5">2023 · FAOSTAT / ICO</text>
        <text x="60" y="130" fontFamily="var(--font-mono)" fontSize="13" fill="#4fd1c5">2024 · IMF WEO</text>
        <text x="60" y="160" fontFamily="var(--font-mono)" fontSize="13" fill="#4fd1c5">2026 · Smithsonian GVP</text>
        <rect x="380" y="55" width="200" height="150" rx="10" fill="#171c26" stroke="#f2b84b" strokeWidth="2" />
        <text x="480" y="115" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12" fill="#f2b84b">COFFEE PRODUCTION</text>
        <text x="480" y="145" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="20" fill="#e9e7e1">2,993,780 t</text>
        <text x="480" y="168" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill="#8b93a3">Brazil · 2023</text>
      </ArticleHero>

      <p>
        Most trivia games either make up plausible-sounding numbers or quietly go stale the moment
        the real world changes. We wanted World Data Duel to do neither. Every card in the game is
        backed by a real, dated figure from an actual statistical agency, and every round tells you
        exactly which year that number is from and where it came from &mdash; not because it looks
        rigorous, but because a surprising result should be something you can go check, not
        something you just have to take our word for.
      </p>

      <h2>Why we show the year on every card</h2>
      <p>
        Country statistics don&rsquo;t all update on the same schedule. Population estimates get
        revised annually. GDP figures move with currency swings and revised IMF forecasts. Forest
        cover, measured by satellite survey, sometimes only gets a fresh figure every few years.
        Treating all of that as one timeless &ldquo;fact&rdquo; is how trivia games quietly become
        wrong. So instead of picking a single reference year and hoping it ages well, we attach a
        year and a source to each dataset individually &mdash; population is a 2022 World Bank
        estimate, GDP is a 2024 IMF figure, coffee production is a roughly 2023 FAOSTAT/ICO number,
        and so on. When one of those goes stale, we only have to replace that one file.
      </p>

      <h2>Where the numbers actually come from</h2>
      <p>
        We deliberately stuck to a short list of primary sources rather than scraping trivia sites:
        the World Bank&rsquo;s open data catalog for population, GDP, forest cover, internet usage,
        and renewable energy share; FAOSTAT and the International Coffee Organization for
        agricultural production (coffee, coconut, tea, rice, cocoa, sheep); the UN&rsquo;s World
        Population Prospects for life expectancy and UNWTO for tourist arrivals; the U.S. Energy
        Information Administration for oil and natural gas production; the USGS for gold
        production; and the Smithsonian Institution&rsquo;s Global Volcanism Program for how many
        volcanoes have been active in each country over the last 12,000 years. If a number seemed
        interesting but we couldn&rsquo;t trace it to one of these, it didn&rsquo;t make the cut.
      </p>

      <StatGrid
        stats={[
          { value: '24', label: 'countries currently in the roster' },
          { value: '20', label: 'real-world topics, from GDP to active volcanoes' },
          { value: '10', label: 'primary sources behind every figure' },
        ]}
      />

      <h2>The game is a tag-reading exercise, not a memorization test</h2>
      <p>
        The actual numbers stay hidden until after you commit to a card. What you see beforehand is
        a flag and a handful of tags &mdash; &ldquo;Amazon, Coffee, Football&rdquo; for Brazil,
        &ldquo;Volcanoes, Geothermal, Glaciers&rdquo; for Iceland. That&rsquo;s enough to make a
        confident guess on a coffee or a volcano question without ever having memorized a
        production figure, which is the actual point: the game rewards reasoning about what you
        already loosely know about a country, then lets the real data confirm or upend that guess.
      </p>

      <h2>What&rsquo;s next</h2>
      <p>
        The roster and question list are both still growing. Energy and disaster-themed topics
        (oil production, active volcanoes) are the newest additions, each sourced the same way as
        everything else. If a number in the game ever looks wrong to you, that&rsquo;s worth
        flagging &mdash; the whole premise only works if the data stays honest.
      </p>
    </>
  );
}
