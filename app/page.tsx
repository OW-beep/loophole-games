import { GAMES } from '@/lib/games/registry';
import { GameCatalog } from '@/components/GameCatalog';
import { DailyBanner } from '@/components/DailyBanner';
import { SponsorSlot } from '@/components/AdSlot';
import { RisingAdBanner } from '@/components/RisingAdBanner';
import { JsonLd } from '@/components/JsonLd';
import { buildWebsiteJsonLd, buildGameListJsonLd } from '@/lib/structured-data';

const RAKUTEN_HREF = [
  'https://rpx.a8.net/svt/ejp?a8mat=3NA6HT+AFOMKY+2HOM+609HT&rakuten=y',
  '&a8ejpredirect=http%3A%2F%2Fhb.afl.rakuten.co.jp%2Fhgc%2F',
  '0ea62065.34400275.0ea62066.204f04c0%2Fa22050476466_3NA6HT_AFOMKY_2HOM_609HT',
  '%3Fpc%3Dhttp%253A%252F%252Fwww.rakuten.co.jp%252F',
  '%26m%3Dhttp%253A%252F%252Fm.rakuten.co.jp%252F',
].join('');

const RAKUTEN_IMG_SRC = 'http://hbb.afl.rakuten.co.jp/hsb/0eb4bbb3.93b2e556.0eb4bbaa.95151395/';
const RAKUTEN_PIXEL_SRC = 'https://www10.a8.net/0.gif?a8mat=3NA6HT+AFOMKY+2HOM+609HT';

const LOLIPOP_HREF = 'https://px.a8.net/svt/ejp?a8mat=3TNLL7+D8W8C2+348+631SX';
const LOLIPOP_IMG_SRC = 'https://www25.a8.net/svt/bgt?aid=231208459801&wid=001&eno=01&mid=s00000000404001022000&mc=1';
const LOLIPOP_PIXEL_SRC = 'https://www13.a8.net/0.gif?a8mat=3TNLL7+D8W8C2+348+631SX';

export default function HomePage() {
  return (
    <div>
      <JsonLd data={buildWebsiteJsonLd()} />
      <JsonLd data={buildGameListJsonLd()} />
      <RisingAdBanner />

      <section className="mb-10">
        <p className="stat-line text-ink/50 dark:text-white/40 mb-3">
          Catalog №01–24 · est. 2026
        </p>
        <h1 className="font-display font-bold text-4xl sm:text-5xl leading-[1.05] mb-4 max-w-2xl">
          Twenty-four games you haven&rsquo;t played before.
        </h1>
        <p className="text-ink/70 dark:text-white/60 max-w-xl">
          Loophole is a small, growing index of original puzzle mechanics — not reskins of
          games you already know. One board per game, every day, shared by every player on
          Earth. Free. No download. No account required.
        </p>
      </section>

      <DailyBanner />

      <GameCatalog games={GAMES} />

      <SponsorSlot className="mb-12">
        {/* Rakuten */}
        <a href={RAKUTEN_HREF} rel="nofollow sponsored" target="_blank">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={RAKUTEN_IMG_SRC} alt="Rakuten" />
        </a>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img width={1} height={1} src={RAKUTEN_PIXEL_SRC} alt="" />

        {/* Lolipop */}
        <a href={LOLIPOP_HREF} rel="nofollow sponsored" target="_blank">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img width={468} height={60} src={LOLIPOP_IMG_SRC} alt="Lolipop" />
        </a>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img width={1} height={1} src={LOLIPOP_PIXEL_SRC} alt="" />
      </SponsorSlot>

      <section className="max-w-2xl">
        <h2 className="font-display font-bold text-2xl mb-3">Why these puzzles don&rsquo;t look familiar</h2>
        <p className="text-ink/70 dark:text-white/60 mb-3">
          Every mechanic in this index was built from scratch. Twelve logic and word
          puzzles — Echo Merge, Mirror Loop, Color Debt, Gravity Word, Fold, Carry Chain,
          Brace Yard, Splice, Heatmap, Signal, Overflow, Polarity — and four movement
          puzzles where a character navigates a grid under rules you won&rsquo;t find
          elsewhere: Shadow (your last move haunts you as a ghost), Tether (two characters
          share one direction), Drift (you slide until something stops you), and Phase
          (you alternate between solid and ghost every step). None of them are a match-3
          or a sliding-tile game wearing a new skin. Boo Rush, Blobble, Sprout,
          Wobble Chef, and Noodle Cat break the turn-based mold entirely: real-time
          input, simple self-made physics or timing, and a course or run generated
          from the same daily seed as everything else in the index.
        </p>
        <p className="text-ink/70 dark:text-white/60">
          New puzzle specimens get added to the catalog over time — bookmark the index and
          check back.
        </p>
      </section>
    </div>
  );
}
