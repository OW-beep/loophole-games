import { ArticleHero } from '@/components/blog/ArticleHero';
import { StatGrid } from '@/components/blog/StatCallout';

export default function CountriesThatProduceTheMostCoffee() {
  return (
    <>
      <ArticleHero>
        <rect width="640" height="260" fill="#2b1a10" />
        {[
          { name: 'Brazil', v: 100, y: 60 },
          { name: 'Vietnam', v: 62, y: 100 },
          { name: 'Indonesia', v: 26, y: 140 },
          { name: 'Colombia', v: 19, y: 180 },
        ].map((row) => (
          <g key={row.name}>
            <rect x="180" y={row.y} width={row.v * 3} height="24" fill="#B8862E" rx="3" />
            <text x="170" y={row.y + 17} textAnchor="end" fontFamily="var(--font-mono)" fontSize="13" fill="#f2b84b">
              {row.name}
            </text>
          </g>
        ))}
      </ArticleHero>

      <p>
        Ask most people to name the world&rsquo;s biggest coffee producer and they&rsquo;ll get
        Brazil right. Ask them for second place and almost everyone guesses Colombia. The actual
        answer &mdash; Vietnam, by a wide margin &mdash; surprises even people who drink coffee
        every day, which is exactly the kind of gap between assumption and reality that real
        production data closes fast.
      </p>

      <h2>Brazil isn&rsquo;t just first, it&rsquo;s dominant</h2>
      <p>
        Brazil has been the world&rsquo;s largest coffee producer for well over a century, and the
        gap isn&rsquo;t close. Recent FAOSTAT/ICO estimates put Brazilian output at roughly 3
        million tonnes a year &mdash; on the order of a third of global production by itself, more
        than the next several countries combined. The scale comes from sheer growing area: Brazil
        has more land planted with coffee than most countries have arable land for anything at all.
      </p>

      <h2>Vietnam&rsquo;s rise is a robusta story</h2>
      <p>
        Vietnam produces close to 1.85 million tonnes a year, almost entirely of robusta beans
        rather than the arabica most specialty coffee shops favor. Robusta is higher-yielding,
        more disease-resistant, and cheaper to grow at scale, which is exactly why Vietnam went
        from a minor producer in the 1980s to the world&rsquo;s clear number two within about two
        decades. Most of it ends up in instant coffee and blends rather than pour-over menus, which
        is part of why the country&rsquo;s production volume doesn&rsquo;t match its profile among
        casual coffee drinkers.
      </p>

      <h2>Where Colombia and Indonesia actually land</h2>
      <p>
        Colombia, despite being practically synonymous with coffee in a lot of marketing, produces
        around 560,000 tonnes a year &mdash; solidly top-five, but well behind Vietnam and
        Indonesia&rsquo;s roughly 765,000 tonnes. Colombia&rsquo;s outsized reputation comes from
        quality and branding (it grows almost exclusively arabica, and built a genuinely effective
        national marketing campaign) rather than sheer volume.
      </p>

      <StatGrid
        stats={[
          { value: '~2.99M t', label: "Brazil's annual coffee production, ~2023" },
          { value: '~1.85M t', label: "Vietnam, almost entirely robusta beans" },
          { value: '~456K t', label: "Ethiopia \u2014 coffee's country of origin" },
        ]}
      />

      <h2>Ethiopia holds a different kind of record</h2>
      <p>
        Ethiopia doesn&rsquo;t crack the top three by volume, but it holds a different distinction:
        it&rsquo;s widely considered the birthplace of coffee, with wild arabica plants still
        growing in its highland forests. Production there remains dominated by smallholder farms
        rather than large plantations, which keeps output modest relative to Brazil or Vietnam even
        though the crop has been part of Ethiopian life for centuries longer than anywhere else.
      </p>

      <p>
        Coffee production is one of the real-world questions in World Data Duel &mdash; along with
        population, GDP, and coconut and tea production &mdash; so if a country&rsquo;s tags say
        &ldquo;Coffee,&rdquo; the numbers above are exactly the kind of reasoning that pays off.
      </p>
    </>
  );
}
