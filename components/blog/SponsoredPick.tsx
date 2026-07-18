import { AD_BANNERS } from '@/lib/ads';

/**
 * A contextual, clearly-disclosed affiliate placement for inside article
 * body text — a text recommendation with a small thumbnail, rather than a
 * generic display banner. `note` should describe why it's here in the
 * context of the article, without claiming specifics about the advertised
 * product we don't actually know (these are generic ad-network creatives).
 *
 * Labelled "広告 / PR" up front per Japan's stealth-marketing (steruma)
 * disclosure requirements under the Act against Unjustifiable Premiums and
 * Misleading Representations.
 */
export function SponsoredPick({ variant = 0, note }: { variant?: number; note: string }) {
  const banner = AD_BANNERS[variant % AD_BANNERS.length];
  const displayWidth = banner.width ? Math.min(140, banner.width) : 120;
  const displayHeight = banner.width && banner.height ? Math.round((banner.height / banner.width) * displayWidth) : 60;

  return (
    <div className="specimen-card p-4 pl-6 my-8 not-prose flex items-center gap-4">
      <span className="tag-stripe bg-graphite dark:bg-white/70" aria-hidden />
      <div className="flex-1 min-w-0">
        <p className="stat-line flex items-center gap-1.5 text-ink/40 dark:text-white/30 mb-2">
          <span className="border border-ink/30 dark:border-white/30 px-1 rounded-sm">PR</span>
          <span>広告 / Advertisement</span>
        </p>
        <p className="text-sm text-ink/70 dark:text-white/60 mb-2 leading-snug">{note}</p>
        <a
          href={banner.href}
          rel="nofollow sponsored noopener"
          target="_blank"
          className="stat-line underline underline-offset-2"
        >
          View offer →
        </a>
      </div>
      <a href={banner.href} rel="nofollow sponsored noopener" target="_blank" className="shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={banner.imgSrc}
          width={displayWidth}
          height={displayHeight}
          alt=""
          className="block h-auto"
          style={{ maxWidth: displayWidth }}
        />
      </a>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={banner.pixelSrc} width={1} height={1} alt="" className="hidden" />
    </div>
  );
}
