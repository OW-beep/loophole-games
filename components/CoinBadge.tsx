'use client';

import { useEffect, useState } from 'react';
import { loadCoinBalance } from '@/lib/coin-mode';

/**
 * A small "how many coins do I have right now" chip for the header. Coins
 * are a single global balance (see lib/coin-mode.ts) shared across every
 * game's Coin Mode, so showing it here — rather than only inside each
 * game's Coin Mode panel — makes the whole site read like one arcade with
 * one wallet, not 43 separate mini-games.
 */
export function CoinBadge() {
  const [coins, setCoins] = useState<number | null>(null);

  useEffect(() => {
    setCoins(loadCoinBalance());

    function sync() {
      setCoins(loadCoinBalance());
    }
    // Same-tab navigation doesn't fire the 'storage' event, so also refresh
    // on focus — cheap, and catches "played a round, came back to the index".
    window.addEventListener('focus', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('focus', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  if (coins === null) return null;

  return (
    <span
      key={coins}
      className="inline-flex items-center gap-1 stat-line border-2 border-coin bg-coin-soft dark:bg-coin/15 text-graphite dark:text-white px-2 py-1 animate-punch-pop"
      title="Coin Mode balance"
    >
      <span aria-hidden>🪙</span>
      <span className="font-mono">{coins}</span>
    </span>
  );
}
