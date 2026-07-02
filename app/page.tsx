import { GAMES } from '@/lib/games/registry';
import { SpecimenCard } from '@/components/SpecimenCard';
import { DailyBanner } from '@/components/DailyBanner';
import { SponsorSlot } from '@/components/AdSlot';
import { JsonLd } from '@/components/JsonLd';
import { buildWebsiteJsonLd, buildGameListJsonLd } from '@/lib/structured-data';

export default function HomePage() {
  return (
    <div>
      <JsonLd data={buildWebsiteJsonLd()} />
      <JsonLd data={buildGameListJsonLd()} />

      <section className="mb-10">
        <p className="stat-line text-ink/50 dark:text-white/40 mb-3">
          Catalog №01–08 · est. 2026
        </p>
        <h1 className="font-display font-bold text-4xl sm:text-5xl leading-[1.05] mb-4 max-w-2xl">
          Eight puzzles you haven&rsquo;t played before.
        </h1>
        <p className="text-ink/70 dark:text-white/60 max-w-xl">
          Loophole is a small, growing index of original puzzle mechanics — not reskins of
          games you already know. One board per game, every day, shared by every player on
          Earth. Free. No download. No account required.
        </p>
      </section>

      <DailyBanner />

      <section className="grid sm:grid-cols-2 gap-5 mb-12">
        {GAMES.map((game) => (
          <SpecimenCard key={game.slug} game={game} />
        ))}
      </section>

      <SponsorSlot className="mb-12">
        {/* Rakuten */}
        
          href="https://rpx.a8.net/svt/ejp?a8mat=3NA6HT+AFOMKY+2HOM+609HT&rakuten=y&a8ejpredirect=http%3A%2F%2Fhb.afl.rakuten.co.jp%2Fhgc%2F0ea62065.34400275.0ea62066.204f04c0%2Fa22050476466_3NA6HT_AFOMKY_2HOM_609HT%3Fpc%3Dhttp%253A%252F%252Fwww.rakuten.co.jp%252F%26m%3Dhttp%253A%252F%252Fm.rakuten.co.jp%252F"
          rel="nofollow sponsored"
          target="_blank"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="http://hbb.afl.rakuten.co.jp/hsb/0eb4bbb3.93b2e556.0eb4bbaa.95151395/"
            border="0"
            alt="Rakuten"
          />
        </a>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          border="0"
          width="1"
          height="1"
          src="https://www10.a8.net/0.gif?a8mat=3NA6HT+AFOMKY+2HOM+609HT"
          alt=""
        />

        {/* Lolipop */}
        
          href="https://px.a8.net/svt/ejp?a8mat=3TNLL7+D8W8C2+348+631SX"
          rel="nofollow sponsored"
          target="_blank"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            border="0"
            width="468"
            height="60"
            alt="Lolipop"
            src="https://www25.a8.net/svt/bgt?aid=231208459801&wid=001&eno=01&mid=s00000000404001022000&mc=1"
          />
        </a>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          border="0"
          width="1"
          height="1"
          src="https://www13.a8.net/0.gif?a8mat=3TNLL7+D8W8C2+348+631SX"
          alt=""
        />
      </SponsorSlot>

      <section className="max-w-2xl">
        <h2 className="font-display font-bold text-2xl mb-3">Why these puzzles don&rsquo;t look familiar</h2>
        <p className="text-ink/70 dark:text-white/60 mb-3">
          Every mechanic in this index was built from scratch for Loophole. Echo Merge makes
          your previous move replay itself against you. Mirror Loop forces three beams to
          share one rotation budget. Color Debt punishes big matches with literal debt.
          Gravity Word turns the whole board into a single falling sentence. Fold and Carry
          Chain ask what happens when combining two numbers has a side effect on a third. Brace
          Yard turns crate removal into a question of structural support under a tight
          shipment budget. Splice sorts two strands using nothing but block swaps. None of them
          are a match-3 or a sliding-tile game wearing a new skin.
        </p>
        <p className="text-ink/70 dark:text-white/60">
          New puzzle specimens get added to the catalog over time — bookmark the index and
          check back.
        </p>
      </section>
    </div>
  );
}