'use client';

import { useEffect, useState } from 'react';
import { getStreak } from '@/lib/storage';

export function StreakBadge({ gameSlug }: { gameSlug: string }) {
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    setStreak(getStreak(gameSlug).current);
  }, [gameSlug]);

  if (!streak) return null;

  return (
    <span className="stat-line bg-graphite text-paper dark:bg-white dark:text-graphite px-1.5 py-0.5">
      🔥 {streak}
    </span>
  );
}
