'use client';

import { useState, type ReactNode } from 'react';
import { DIFFICULTY_ORDER, DIFFICULTY_LABEL, type Difficulty } from '@/lib/difficulty';

/**
 * Presentational shell for Coin Mode, shared by every game's board. Leans
 * on the site's existing specimen-card / punch-hole vocabulary (hard-edge
 * shadow, clipped corner, mono uppercase labels) rather than inventing a
 * separate "gamer" style — it reads as an arcade ticket stub, not a neon
 * overlay. All the game-specific board goes in `children`, rendered only
 * once a round is active.
 *
 * Difficulty is optional and additive: pass `onDifficultyChange` to show
 * the Easy/Normal/Hard picker (hidden while a round is active); a board
 * that doesn't pass it renders exactly as before. See fold/CroakBoard for
 * reference wiring — the picker only changes what the *board* does with
 * the selected value (scaling its own move budget via scaleLimit()) and
 * what it passes into computeCoinDelta; this component just displays it.
 */
export function CoinModeSection({
  coins,
  nickname,
  onSaveNickname,
  roundActive,
  roundFinished,
  roundWon,
  lastDelta,
  onStart,
  onShowLeaderboard,
  onDifficultyChange,
  children,
}: {
  coins: number;
  nickname: string;
  onSaveNickname: (name: string) => void;
  roundActive: boolean;
  roundFinished: boolean;
  roundWon: boolean;
  lastDelta: number;
  onStart: () => void;
  onShowLeaderboard: () => void;
  onDifficultyChange?: (difficulty: Difficulty) => void;
  children?: ReactNode;
}) {
  const [draft, setDraft] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');

  function selectDifficulty(d: Difficulty) {
    setDifficulty(d);
    onDifficultyChange?.(d);
  }

  return (
    <div className="mt-10">
      <div className="relative specimen-card bg-panel dark:bg-panel-dark p-4 pl-7">
        <span className="punch-hole" aria-hidden />

        <div className="flex items-center justify-between mb-4">
          <p className="stat-line font-bold tracking-widest text-ink/70 dark:text-white/60 border-b-2 border-coin pb-0.5">
            🕹 Coin Mode
          </p>
          <button
            onClick={onShowLeaderboard}
            className="stat-line text-ink/50 dark:text-white/40 hover:underline"
          >
            Leaderboard
          </button>
        </div>

        <div
          key={coins}
          className="inline-flex items-center gap-1.5 bg-coin-soft dark:bg-coin/15 border-2 border-coin text-graphite dark:text-white stat-line font-bold px-2.5 py-1 mb-4 animate-punch-pop"
        >
          <span>🪙</span>
          <span className="font-mono text-sm">{coins}</span>
        </div>

        {!nickname && (
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Nickname for the leaderboard (optional)"
              maxLength={20}
              className="stat-line flex-1 min-w-0 border-2 border-index dark:border-index-dark bg-transparent px-2 py-1.5 text-ink dark:text-white placeholder:text-ink/30 dark:placeholder:text-white/30"
            />
            <button
              onClick={() => {
                const trimmed = draft.trim();
                if (trimmed) onSaveNickname(trimmed);
              }}
              className="stat-line border-2 border-graphite dark:border-white/80 px-3 py-1.5 hover:bg-graphite hover:text-paper dark:hover:bg-white dark:hover:text-graphite transition-colors shrink-0"
            >
              Save
            </button>
          </div>
        )}

        {!roundActive && onDifficultyChange && (
          <div className="mb-4">
            <p className="stat-line text-ink/40 dark:text-white/30 mb-1.5">Difficulty</p>
            <div className="grid grid-cols-3 gap-1.5">
              {DIFFICULTY_ORDER.map((d) => (
                <button
                  key={d}
                  onClick={() => selectDifficulty(d)}
                  className={[
                    'stat-line border-2 px-2 py-1.5 transition-colors',
                    difficulty === d
                      ? 'border-coin bg-coin text-white'
                      : 'border-index dark:border-index-dark text-ink/60 dark:text-white/50 hover:border-coin',
                  ].join(' ')}
                >
                  {DIFFICULTY_LABEL[d]}
                </button>
              ))}
            </div>
          </div>
        )}

        {!roundActive && (
          <button
            onClick={onStart}
            className="stat-line w-full border-2 border-graphite dark:border-white/80 px-3 py-2.5 hover:bg-coin hover:border-coin hover:text-white dark:hover:bg-coin dark:hover:text-graphite transition-colors"
          >
            Play again for Coins
          </button>
        )}

        {roundActive && (
          <div>
            {children}

            {roundFinished && (
              <div className="text-center mt-2">
                <p className="font-display font-bold text-lg mb-3">
                  {roundWon ? `Cleared — +${lastDelta}🪙` : `Fell short — ${lastDelta}🪙`}
                </p>
                <button
                  onClick={onStart}
                  className="stat-line w-full border-2 border-graphite dark:border-white/80 px-3 py-2.5 hover:bg-coin hover:border-coin hover:text-white dark:hover:bg-coin dark:hover:text-graphite transition-colors"
                >
                  Play again
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
