'use client';

import { useEffect, useRef } from 'react';

interface AdSlotProps {
  slotId: string;
  className?: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  label?: string;
}

const ADSENSE_ENABLED = process.env.NEXT_PUBLIC_ADSENSE_ENABLED === 'true';
const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

/**
 * A single ad unit, deliberately styled as its own "specimen tag" so it
 * never gets mistaken for game content (AdSense requires clear ad/content
 * separation, and players trust the UI more when ads don't pretend to be
 * something else).
 */
export function AdSlot({ slotId, className = '', format = 'auto', label = 'Sponsored' }: AdSlotProps) {
  const ref = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!ADSENSE_ENABLED || pushed.current) return;
    try {
      // @ts-expect-error injected by the AdSense script
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense script not loaded yet or blocked — fail silently.
    }
  }, []);

  return (
    <div className={`relative border border-dashed border-index dark:border-index-dark p-3 ${className}`}>
      <span className="stat-line absolute -top-2 left-3 bg-paper dark:bg-graphite px-1 text-ink/60 dark:text-white/50">
        {label}
      </span>
      {ADSENSE_ENABLED && ADSENSE_CLIENT_ID ? (
        <ins
          ref={ref as never}
          className="adsbygoogle block min-h-[100px]"
          style={{ display: 'block' }}
          data-ad-client={ADSENSE_CLIENT_ID}
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      ) : (
        <div className="min-h-[100px] flex items-center justify-center text-ink/30 dark:text-white/20 text-xs">
          Ad space — enable NEXT_PUBLIC_ADSENSE_ENABLED once your account is approved
        </div>
      )}
    </div>
  );
}
