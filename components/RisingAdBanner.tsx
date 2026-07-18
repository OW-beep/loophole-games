'use client';

import { useEffect, useState } from 'react';
import { AD_BANNERS, AD_SESSION_KEY, type BannerAd } from '@/lib/ads';

/**
 * A bottom-anchored ad banner that slides up into view shortly after the
 * page mounts. One of AD_BANNERS is picked at random per session, client-side
 * only (avoids any server/client mismatch), and can be dismissed.
 *
 * Shown at most once per browser session (tracked via sessionStorage) so a
 * visitor browsing multiple pages doesn't get the same banner sliding up
 * again on every single one.
 */
export function RisingAdBanner() {
  const [banner, setBanner] = useState<BannerAd | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let alreadyShown = false;
    try {
      alreadyShown = sessionStorage.getItem(AD_SESSION_KEY) === '1';
    } catch {
      // sessionStorage unavailable (e.g. privacy mode) — fall back to showing it
    }
    if (alreadyShown) return;

    setBanner(AD_BANNERS[Math.floor(Math.random() * AD_BANNERS.length)]);
    const showTimer = setTimeout(() => {
      setVisible(true);
      try {
        sessionStorage.setItem(AD_SESSION_KEY, '1');
      } catch {
        // ignore — worst case the banner can reappear this session
      }
    }, 500);
    return () => clearTimeout(showTimer);
  }, []);

  if (!banner || dismissed) return null;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-3 pointer-events-none transition-transform duration-500 ease-out ${
        visible ? 'translate-y-0' : 'translate-y-[150%]'
      }`}
    >
      <div className="relative pointer-events-auto bg-white dark:bg-panel-dark border-2 border-graphite dark:border-white/80 shadow-xl max-w-full">
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Close ad"
          className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-graphite dark:bg-white text-white dark:text-graphite text-sm leading-none flex items-center justify-center border-2 border-white dark:border-graphite z-10"
        >
          ×
        </button>
        <div className="stat-line flex items-center gap-1.5 px-2 py-1 border-b border-index dark:border-index-dark text-ink/50 dark:text-white/40">
          <span className="border border-ink/30 dark:border-white/30 px-1 rounded-sm">PR</span>
          <span>広告 / Advertisement</span>
        </div>
        <div className="p-2">
          <a href={banner.href} rel="nofollow sponsored noopener noreferrer" target="_blank">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={banner.imgSrc}
              width={banner.width}
              height={banner.height}
              alt=""
              className="block max-w-full h-auto"
            />
          </a>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={banner.pixelSrc} width={1} height={1} alt="" className="absolute w-px h-px opacity-0" />
      </div>
    </div>
  );
}
