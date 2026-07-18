'use client';

import { useCallback, useState } from 'react';
import {
  createLayout,
  GRID_SIZE,
  MOVE_BUDGET,
  COMBO_BONUS_STEP,
  COMBO_BONUS_ATTEMPTS,
  type CardSymbol,
} from '@/lib/games/twin-peek';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { GAMES } from '@/lib/games/registry';

type Status = 'playing' | 'won' | 'lost';

const SYMBOL_COLOR: Record<CardSymbol, string> = {
  ghost: '#7A3DB8',
  blob: '#2FA7B8',
  sprout: '#5FA344',
  dish: '#E2793D',
  cat: '#D9A62E',
  squirrel: '#B5651D',
  bunny: '#5B9BD1',
  star: '#E8677E',
};

function SymbolIcon({ symbol }: { symbol: CardSymbol }) {
  const c = SYMBOL_COLOR[symbol];
  switch (symbol) {
    case 'ghost':
      return (
        <svg viewBox="0 0 40 40" className="w-7 h-7">
          <path d="M12 30V17a8 8 0 0 1 16 0v13l-3-3-2.5 3-2.5-3-2.5 3-2.5-3z" fill={c} />
          <circle cx="16.5" cy="17" r="1.6" fill="#fff" />
          <circle cx="23.5" cy="17" r="1.6" fill="#fff" />
        </svg>
      );
    case 'blob':
      return (
        <svg viewBox="0 0 40 40" className="w-7 h-7">
          <circle cx="20" cy="21" r="12" fill={c} />
          <circle cx="16.5" cy="18" r="1.6" fill="#fff" />
          <circle cx="23.5" cy="18" r="1.6" fill="#fff" />
        </svg>
      );
    case 'sprout':
      return (
        <svg viewBox="0 0 40 40" className="w-7 h-7">
          <path d="M20 30V16" stroke={c} strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="14" cy="18" rx="6" ry="4" fill={c} transform="rotate(-25 14 18)" />
          <ellipse cx="26" cy="18" rx="6" ry="4" fill={c} transform="rotate(25 26 18)" />
        </svg>
      );
    case 'dish':
      return (
        <svg viewBox="0 0 40 40" className="w-7 h-7">
          <ellipse cx="20" cy="26" rx="13" ry="6" fill="#E9E2D3" stroke={c} strokeWidth="2" />
          <circle cx="20" cy="18" r="8" fill={c} />
        </svg>
      );
    case 'cat':
      return (
        <svg viewBox="0 0 40 40" className="w-7 h-7">
          <polygon points="12,12 17,20 9,20" fill={c} />
          <polygon points="28,12 31,20 23,20" fill={c} />
          <circle cx="20" cy="22" r="10" fill={c} />
          <circle cx="17" cy="21" r="1.4" fill="#33363D" />
          <circle cx="23" cy="21" r="1.4" fill="#33363D" />
        </svg>
      );
    case 'squirrel':
      return (
        <svg viewBox="0 0 40 40" className="w-7 h-7">
          <ellipse cx="20" cy="22" rx="8" ry="9" fill={c} />
          <ellipse cx="20" cy="12" rx="7" ry="5" fill="#7A4A1E" />
        </svg>
      );
    case 'bunny':
      return (
        <svg viewBox="0 0 40 40" className="w-7 h-7">
          <ellipse cx="15" cy="12" rx="3" ry="9" fill="#FBEFE3" stroke={c} strokeWidth="1.5" transform="rotate(-10 15 12)" />
          <ellipse cx="25" cy="12" rx="3" ry="9" fill="#FBEFE3" stroke={c} strokeWidth="1.5" transform="rotate(10 25 12)" />
          <circle cx="20" cy="24" r="10" fill="#FBEFE3" stroke={c} strokeWidth="1.5" />
          <circle cx="17" cy="22" r="1.4" fill="#33363D" />
          <circle cx="23" cy="22" r="1.4" fill="#33363D" />
        </svg>
      );
    case 'star':
      return (
        <svg viewBox="0 0 40 40" className="w-7 h-7">
          <path
            d="M20 8 L23.5 16.5 L32.5 17.5 L25.5 23.5 L27.5 32.5 L20 27.5 L12.5 32.5 L14.5 23.5 L7.5 17.5 L16.5 16.5 Z"
            fill={c}
          />
        </svg>
      );
    default:
      return null;
  }
}

export function TwinPeekBoard({
  seed,
  dateString,
  puzzleNumber,
}: {
  seed: number;
  dateString: string;
  puzzleNumber: number;
}) {
  const game = GAMES.find((g) => g.slug === 'twin-peek')!;

  const [layout, setLayout] = useState<CardSymbol[]>(() => createLayout(seed));
  const [revealed, setRevealed] = useState<boolean[]>(() => Array(GRID_SIZE).fill(false));
  const [matched, setMatched] = useState<boolean[]>(() => Array(GRID_SIZE).fill(false));
  const [selected, setSelected] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [bonusBudget, setBonusBudget] = useState(0);
  const [combo, setCombo] = useState(0);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>('playing');
  const [showResult, setShowResult] = useState(false);
  const [streak, setStreak] = useState(0);

  const budget = MOVE_BUDGET + bonusBudget;
  const pairsFound = matched.filter(Boolean).length / 2;

  const finish = useCallback(
    (won: boolean, finalAttempts: number, finalPairs: number) => {
      setStatus(won ? 'won' : 'lost');
      recordResult('twin-peek', {
        date: dateString,
        won,
        moves: finalAttempts,
        score: finalPairs,
        elapsedMs: 0,
      });
      setStreak(getStreak('twin-peek').current);
      setShowResult(true);
    },
    [dateString]
  );

  const resetRun = useCallback(() => {
    setLayout(createLayout(seed));
    setRevealed(Array(GRID_SIZE).fill(false));
    setMatched(Array(GRID_SIZE).fill(false));
    setSelected([]);
    setAttempts(0);
    setBonusBudget(0);
    setCombo(0);
    setBusy(false);
    setStatus('playing');
    setShowResult(false);
  }, [seed]);

  const onCardClick = useCallback(
    (i: number) => {
      if (status !== 'playing') {
        resetRun();
        return;
      }
      if (busy || revealed[i] || matched[i] || selected.includes(i) || selected.length >= 2) return;

      const nextRevealed = [...revealed];
      nextRevealed[i] = true;
      setRevealed(nextRevealed);

      const nextSelected = [...selected, i];
      setSelected(nextSelected);

      if (nextSelected.length < 2) return;

      const [a, b] = nextSelected;
      const isMatch = layout[a] === layout[b];
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      setBusy(true);

      if (isMatch) {
        const nextMatched = [...matched];
        nextMatched[a] = true;
        nextMatched[b] = true;
        setMatched(nextMatched);
        setSelected([]);
        setBusy(false);

        const nextCombo = combo + 1;
        setCombo(nextCombo);
        let nextBonus = bonusBudget;
        if (nextCombo % COMBO_BONUS_STEP === 0) {
          nextBonus += COMBO_BONUS_ATTEMPTS;
          setBonusBudget(nextBonus);
        }

        const solvedPairs = nextMatched.filter(Boolean).length / 2;
        if (solvedPairs === GRID_SIZE / 2) {
          finish(true, nextAttempts, solvedPairs);
        } else if (nextAttempts >= MOVE_BUDGET + nextBonus) {
          finish(false, nextAttempts, solvedPairs);
        }
      } else {
        setCombo(0);
        setTimeout(() => {
          setRevealed((prev) => {
            const copy = [...prev];
            copy[a] = false;
            copy[b] = false;
            return copy;
          });
          setSelected([]);
          setBusy(false);
          if (nextAttempts >= MOVE_BUDGET + bonusBudget) {
            const solvedPairs = matched.filter(Boolean).length / 2;
            finish(false, nextAttempts, solvedPairs);
          }
        }, 700);
      }
    },
    [status, busy, revealed, matched, selected, layout, attempts, combo, bonusBudget, finish, resetRun]
  );

  return (
    <div>
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={attempts} movesLimit={budget} />

      <div className="mb-5 mx-auto" style={{ maxWidth: 360 }}>
        <div className="grid grid-cols-4 gap-2">
          {layout.map((symbol, i) => {
            const isUp = revealed[i] || matched[i];
            return (
              <button
                key={i}
                type="button"
                onClick={() => onCardClick(i)}
                className="relative aspect-square"
                style={{ perspective: '600px' }}
                aria-label={isUp ? symbol : 'face-down card'}
              >
                <div
                  className="absolute inset-0 transition-transform duration-300"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isUp ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  }}
                >
                  <div
                    className="absolute inset-0 flex items-center justify-center border-2 border-graphite dark:border-white/80 bg-peek-soft dark:bg-peek/10 rounded-tag"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <span className="w-2 h-2 rounded-full bg-peek" />
                  </div>
                  <div
                    className={`absolute inset-0 flex items-center justify-center border-2 rounded-tag bg-white dark:bg-panel-dark ${
                      matched[i] ? 'border-peek' : 'border-graphite dark:border-white/80'
                    }`}
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    <SymbolIcon symbol={symbol} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="stat-line text-ink/50 dark:text-white/40 text-center mb-3">
        tap two cards to flip · found {pairsFound}/{GRID_SIZE / 2} pairs · attempts {attempts}/{budget}
        {combo >= 2 ? ` · combo \u00d7${combo}` : ''}
      </div>
      <div className="stat-line text-ink/40 dark:text-white/30 text-center mb-3">
        {COMBO_BONUS_STEP} matches in a row earns {COMBO_BONUS_ATTEMPTS} bonus attempts
      </div>

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug="twin-peek"
        gameName="Twin Peek"
        puzzleNumber={puzzleNumber}
        won={status === 'won'}
        moves={attempts}
        movesLimit={budget}
        score={pairsFound}
        streak={streak}
      />
    </div>
  );
}
