'use client';

import { useState } from 'react';
import type { GameMeta, GameCategory } from '@/lib/games/registry';
import { SpecimenCard } from './SpecimenCard';

const TABS: { key: GameCategory | 'all'; label: string; emoji: string }[] = [
  { key: 'all',      label: 'All',       emoji: '◎' },
  { key: 'puzzle',   label: 'Puzzles',   emoji: '🧮' },
  { key: 'movement', label: 'Movement',  emoji: '🎮' },
  { key: 'word',     label: 'Word',      emoji: '🔤' },
  { key: 'arcade',   label: 'Arcade',    emoji: '👻' },
];

export function GameCatalog({ games }: { games: GameMeta[] }) {
  const [active, setActive] = useState<GameCategory | 'all'>('all');

  const visible = active === 'all' ? games : games.filter(g => g.category === active);

  // hide tabs with 0 games
  const availableTabs = TABS.filter(t =>
    t.key === 'all' || games.some(g => g.category === t.key)
  );

  return (
    <section className="mb-12">
      {/* tab bar */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {availableTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={[
              'stat-line px-3 py-1.5 border-2 transition-colors',
              active === tab.key
                ? 'border-graphite bg-graphite text-paper dark:border-white dark:bg-white dark:text-graphite'
                : 'border-index dark:border-index-dark text-ink/60 dark:text-white/50 hover:border-graphite dark:hover:border-white/80',
            ].join(' ')}
          >
            {tab.emoji} {tab.label}
            <span className="ml-1.5 opacity-50">
              {tab.key === 'all' ? games.length : games.filter(g => g.category === tab.key).length}
            </span>
          </button>
        ))}
      </div>

      {/* grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {visible.map(game => (
          <SpecimenCard key={game.slug} game={game} />
        ))}
      </div>
    </section>
  );
}
