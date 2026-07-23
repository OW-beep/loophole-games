import { ArticleHero } from '@/components/blog/ArticleHero';
import { StatGrid } from '@/components/blog/StatCallout';

export default function CountriesWithNoCoastline() {
  return (
    <>
      <ArticleHero>
        <rect width="640" height="260" fill="#0f1a14" />
        <circle cx="220" cy="140" r="70" fill="#1e3a2a" stroke="#4CAF7D" strokeWidth="2" />
        <circle cx="220" cy="140" r="30" fill="#4CAF7D" />
        <text x="220" y="145" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill="#0f1a14">LANDLOCKED</text>
        <path d="M 340 80 Q 420 60 480 100 T 580 140" stroke="#4fd1c5" strokeWidth="3" fill="none" />
        <text x="460" y="180" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12" fill="#4fd1c5">nearest coast \u2192</text>
      </ArticleHero>

      <p>
        Roughly a sixth of the world&rsquo;s countries have no coastline at all &mdash; no port, no
        navy, no direct sea trade route, nothing but land in every direction. It&rsquo;s one of
        those geographic facts that sounds like trivia but actually shapes a country&rsquo;s entire
        economic history, and one nation on the list is landlocked in an unusually extreme way:
        surrounded by a single neighboring country on all sides.
      </p>

      <h2>Being landlocked is a lasting economic disadvantage</h2>
      <p>
        Sea access has historically been one of the cheapest ways to move goods at scale, which
        means landlocked countries are structurally dependent on their neighbors for any seaborne
        trade &mdash; goods have to cross at least one border, pay transit costs, and clear customs
        twice, before they even reach a port. Economists have long pointed to this as a major
        reason many landlocked countries, especially in Africa and Central Asia, have historically
        grown more slowly than coastal neighbors with otherwise similar resources.
      </p>

      <h2>Ethiopia is the largest landlocked country by population</h2>
      <p>
        Ethiopia, with well over 100 million people, is the most populous landlocked country in the
        world, and it wasn&rsquo;t always this way &mdash; it had a coastline until Eritrea&rsquo;s
        independence in 1993 cut it off. Ethiopia now routes almost all of its maritime trade
        through the port of Djibouti, a striking real-world example of exactly the trade-route
        dependency landlocked status creates.
      </p>

      <StatGrid
        stats={[
          { value: '~44', label: 'countries in the world with no coastline' },
          { value: '2', label: 'countries that are "doubly landlocked" \u2014 surrounded only by other landlocked countries' },
          { value: '1993', label: "the year Ethiopia's coastline was lost to Eritrean independence" },
        ]}
      />

      <h2>Switzerland shows landlocked doesn&rsquo;t have to mean poor</h2>
      <p>
        Switzerland is the clearest counterexample to the idea that lacking a coastline caps a
        country&rsquo;s prosperity: it&rsquo;s one of the wealthiest nations on Earth despite
        being entirely surrounded by other landlocked or near-landlocked neighbors. Its position at
        the center of European rail and road networks, combined with a services- and precision-
        manufacturing-heavy economy that doesn&rsquo;t depend on bulk shipping the way agriculture
        or heavy industry does, let it sidestep the disadvantage that hits many other landlocked
        economies.
      </p>

      <h2>A handful of countries are landlocked twice over</h2>
      <p>
        Liechtenstein and Uzbekistan hold a rarer distinction: they&rsquo;re landlocked by countries
        that are themselves landlocked, meaning goods have to cross two full countries with no sea
        access before reaching any coast at all. It&rsquo;s the geographic equivalent of a
        worst-case scenario for trade logistics, and both countries have built unusually specialized
        economies partly in response.
      </p>

      <p>
        Coastline length is one of the real-world questions in World Data Duel, and it&rsquo;s the
        first question in the game where a country can score a flat zero &mdash; both Ethiopia and
        Switzerland are in the roster with exactly that.
      </p>
    </>
  );
}
