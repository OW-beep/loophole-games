import { ArticleHero } from '@/components/blog/ArticleHero';
import { StatGrid } from '@/components/blog/StatCallout';

export default function CountriesWithTheMostActiveVolcanoes() {
  return (
    <>
      <ArticleHero>
        <rect width="640" height="260" fill="#1a1005" />
        <polygon points="120,210 170,90 220,210" fill="#3a2415" stroke="#f2b84b" strokeWidth="2" />
        <circle cx="170" cy="88" r="6" fill="#e2725b" />
        <polygon points="290,210 335,110 380,210" fill="#3a2415" stroke="#f2b84b" strokeWidth="2" />
        <circle cx="335" cy="108" r="5" fill="#e2725b" />
        <polygon points="450,210 490,130 530,210" fill="#3a2415" stroke="#f2b84b" strokeWidth="2" />
        <circle cx="490" cy="128" r="4" fill="#e2725b" />
        <text x="320" y="240" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12" fill="#8b93a3">
          165 · 120 · 107 (US · Japan · Indonesia)
        </text>
      </ArticleHero>

      <p>
        Say &ldquo;country with the most volcanoes&rdquo; out loud and most people reach for
        Indonesia or Japan &mdash; both reasonable guesses, both wrong. According to the
        Smithsonian Institution&rsquo;s Global Volcanism Program, which tracks volcanoes active at
        some point in the last 12,000 years, the United States actually tops the list. The reason
        has nothing to do with the volcano most people are picturing.
      </p>

      <h2>It&rsquo;s the Aleutian Islands, not Yellowstone</h2>
      <p>
        The U.S. total, around 165 Holocene volcanoes, isn&rsquo;t driven by the famous ones people
        name first &mdash; Yellowstone, Mount St. Helens, Hawaii&rsquo;s Kilauea. It&rsquo;s the
        Aleutian Islands in Alaska, a roughly 1,900-kilometer volcanic arc with dozens of active
        cones, most of which most Americans couldn&rsquo;t name. Add the Cascade Range and Hawaii
        on top of that chain and the U.S. quietly outpaces every other country on Earth.
      </p>

      <h2>Japan and Indonesia are close behind, for very different reasons</h2>
      <p>
        Japan (around 120) and Indonesia (around 107) sit on some of the most active plate
        boundaries on the planet &mdash; Japan at the junction of four tectonic plates, Indonesia
        strung along the Pacific Ring of Fire across more than 17,000 islands. Both nations have
        built extensive monitoring networks essentially out of necessity: volcanic activity there
        isn&rsquo;t a rare event, it&rsquo;s a routine part of the geological background.
      </p>

      <StatGrid
        stats={[
          { value: '165', label: 'Holocene volcanoes in the United States' },
          { value: '120', label: 'in Japan' },
          { value: '90', label: 'in Chile \u2014 the Andes\u2019 volcanic backbone' },
        ]}
      />

      <h2>Iceland&rsquo;s number is the real outlier</h2>
      <p>
        Chile comes in at roughly 90, unsurprising for a country running the length of the volcanic
        Andes. But the most disproportionate figure belongs to Iceland: around 35 active volcanoes
        packed into an island smaller than the state of Kentucky. Iceland sits directly on the
        Mid-Atlantic Ridge, where two tectonic plates are actively pulling apart, giving it a
        volcano-per-square-kilometer rate that dwarfs every country ahead of it on the raw list.
      </p>

      <p>
        Active volcano count is one of the newer questions in World Data Duel, sourced from the
        same Smithsonian Global Volcanism Program data cited above. If you draw a card tagged
        &ldquo;Volcanoes&rdquo; &mdash; Iceland, Indonesia, Japan, Chile &mdash; that tag is doing
        real work, not just flavor text.
      </p>
    </>
  );
}
