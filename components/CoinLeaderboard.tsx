'use client';

import { useEffect, useState } from 'react';
import { fetchLeaderboard, type LeaderboardEntry } from '@/lib/leaderboard-client';
import { GLOBAL_LEADERBOARD_SLUG } from '@/lib/coin-mode';

type Mode = 'current' | 'best';

export function CoinLeaderboard({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<Mode>('current');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchLeaderboard(GLOBAL_LEADERBOARD_SLUG, mode).then((e) => {
      if (alive) {
        setEntries(e);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [mode]);

  return (
    <div className="fixed inset-0 bg-graphite/60 dark:bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="specimen-card bg-panel dark:bg-panel-dark max-w-sm w-full p-6 pl-8">
        <span className="punch-hole" aria-hidden />
        <p className="stat-line font-bold tracking-widest text-ink/70 dark:text-white/60 border-b-2 border-coin pb-0.5 mb-1 inline-block">
          🕹 Coin Mode
        </p>
        <h2 className="font-display font-bold text-xl mb-4">High scores</h2>

        <div className="grid grid-cols-2 gap-1.5 mb-4">
          <button
            onClick={() => setMode('current')}
            className={[
              'stat-line border-2 px-2 py-1.5 transition-colors',
              mode === 'current'
                ? 'border-coin bg-coin text-white'
                : 'border-index dark:border-index-dark text-ink/60 dark:text-white/50 hover:border-coin',
            ].join(' ')}
          >
            Current
          </button>
          <button
            onClick={() => setMode('best')}
            className={[
              'stat-line border-2 px-2 py-1.5 transition-colors',
              mode === 'best'
                ? 'border-coin bg-coin text-white'
                : 'border-index dark:border-index-dark text-ink/60 dark:text-white/50 hover:border-coin',
            ].join(' ')}
          >
            All-time best
          </button>
        </div>
        <p className="stat-line text-ink/40 dark:text-white/30 mb-4">
          {mode === 'current'
            ? 'Live wallet balance \u2014 a loss can lower your spot.'
            : 'Highest balance each player has ever reached \u2014 this one never drops.'}
        </p>

        {loading && <p className="stat-line text-ink/50 dark:text-white/40 mb-4">Loading…</p>}

        {!loading && entries.length === 0 && (
          <p className="stat-line text-ink/50 dark:text-white/40 mb-4">
            No scores yet — play a Coin Mode round to be the first on the board.
          </p>
        )}

        {!loading && entries.length > 0 && (
          <ol className="mb-5">
            {entries.map((e, i) => (
              <li
                key={`${e.name}-${i}`}
                className={[
                  'stat-line flex justify-between items-center border-b border-index dark:border-index-dark py-1.5',
                  i === 0 ? 'text-graphite dark:text-white' : 'text-ink/70 dark:text-white/60',
                ].join(' ')}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={[
                      'w-5 h-5 flex items-center justify-center text-[0.65rem] font-mono border-2',
                      i === 0
                        ? 'bg-coin border-coin text-white'
                        : 'border-index dark:border-index-dark text-ink/50 dark:text-white/40',
                    ].join(' ')}
                  >
                    {i + 1}
                  </span>
                  {e.name}
                </span>
                <span className="font-mono">🪙 {e.score}</span>
              </li>
            ))}
          </ol>
        )}

        <button
          onClick={onClose}
          className="stat-line w-full border-2 border-graphite dark:border-white/80 px-3 py-2.5 hover:bg-graphite hover:text-paper dark:hover:bg-white dark:hover:text-graphite transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
