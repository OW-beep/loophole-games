'use client';

import { useEffect, useState } from 'react';
import { msUntilNextUtcMidnight } from '@/lib/daily-seed';

function formatMs(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const s = String(totalSeconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export function DailyBanner() {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    setRemaining(msUntilNextUtcMidnight());
    const id = setInterval(() => setRemaining(msUntilNextUtcMidnight()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="border-2 border-graphite dark:border-white/80 px-5 py-4 flex flex-wrap items-center justify-between gap-3 mb-10">
      <div>
        <p className="stat-line text-ink/50 dark:text-white/40 mb-1">Today&rsquo;s loop</p>
        <p className="font-display font-bold text-lg leading-none">
          4 puzzles. One streak each. Same board for everyone, worldwide.
        </p>
      </div>
      <div className="text-right">
        <p className="stat-line text-ink/50 dark:text-white/40 mb-1">Resets in</p>
        <p className="font-mono text-lg font-medium tabular-nums">
          {remaining === null ? '--:--:--' : formatMs(remaining)}
        </p>
      </div>
    </div>
  );
}
