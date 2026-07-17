'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createBowls, BOWL_COUNT, type BowlConfig } from '@/lib/games/noodle-cat';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { GAMES } from '@/lib/games/registry';

type Status = 'ready' | 'playing' | 'won' | 'lost';

export function NoodleCatBoard({
  seed,
  dateString,
  puzzleNumber,
}: {
  seed: number;
  dateString: string;
  puzzleNumber: number;
}) {
  const game = GAMES.find((g) => g.slug === 'noodle-cat')!;
  const bowlsRef = useRef<BowlConfig[]>(createBowls(seed));
  const bowlIndexRef = useRef(0);
  const tapsRef = useRef(0);
  const bowlStartRef = useRef(0);
  const statusRef = useRef<Status>('ready');
  const finishedRef = useRef(false);

  const [status, setStatus] = useState<Status>('ready');
  const [bowlIndex, setBowlIndex] = useState(0);
  const [taps, setTaps] = useState(0);
  const [tick, setTick] = useState(0);
  const [chompKey, setChompKey] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [streak, setStreak] = useState(0);

  const resetRun = useCallback(() => {
    bowlsRef.current = createBowls(seed);
    bowlIndexRef.current = 0;
    tapsRef.current = 0;
    finishedRef.current = false;
    setBowlIndex(0);
    setTaps(0);
    setShowResult(false);
    statusRef.current = 'ready';
    setStatus('ready');
  }, [seed]);

  const finish = useCallback(
    (won: boolean) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      statusRef.current = won ? 'won' : 'lost';
      setStatus(statusRef.current);
      recordResult('noodle-cat', {
        date: dateString,
        won,
        moves: bowlIndexRef.current,
        score: bowlIndexRef.current,
        elapsedMs: 0,
      });
      setStreak(getStreak('noodle-cat').current);
      setShowResult(true);
    },
    [dateString]
  );

  const onTap = useCallback(() => {
    if (statusRef.current === 'won' || statusRef.current === 'lost') {
      resetRun();
      return;
    }
    if (statusRef.current === 'ready') {
      statusRef.current = 'playing';
      setStatus('playing');
      bowlStartRef.current = Date.now();
      return;
    }
    if (statusRef.current !== 'playing') return;

    tapsRef.current += 1;
    setTaps(tapsRef.current);
    setChompKey((k) => k + 1);

    const bowl = bowlsRef.current[bowlIndexRef.current];
    if (tapsRef.current >= bowl.targetTaps) {
      bowlIndexRef.current += 1;
      if (bowlIndexRef.current >= BOWL_COUNT) {
        finish(true);
      } else {
        tapsRef.current = 0;
        setTaps(0);
        setBowlIndex(bowlIndexRef.current);
        bowlStartRef.current = Date.now();
      }
    }
  }, [finish, resetRun]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === 'Space') {
        e.preventDefault();
        onTap();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onTap]);

  useEffect(() => {
    if (status !== 'playing') return;
    const id = setInterval(() => {
      const bowl = bowlsRef.current[bowlIndexRef.current];
      const elapsed = Date.now() - bowlStartRef.current;
      if (elapsed >= bowl.timeMs) {
        finish(false);
      } else {
        setTick((t) => t + 1);
      }
    }, 80);
    return () => clearInterval(id);
  }, [status, bowlIndex, finish]);

  const bowl = bowlsRef.current[Math.min(bowlIndexRef.current, BOWL_COUNT - 1)];
  const elapsed = status === 'playing' ? Date.now() - bowlStartRef.current : 0;
  const timeLeftRatio = status === 'playing' ? Math.max(0, 1 - elapsed / bowl.timeMs) : 1;
  const noodleProgress = Math.min(1, taps / bowl.targetTaps);

  return (
    <div>
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={bowlIndex} movesLimit={BOWL_COUNT} />

      <div
        className="relative mb-5 border-2 border-graphite dark:border-white/80 overflow-hidden touch-none select-none mx-auto bg-white dark:bg-panel-dark"
        style={{ maxWidth: 320 }}
        onPointerDown={(e) => {
          e.preventDefault();
          onTap();
        }}
      >
        <svg viewBox="0 0 320 320" className="block w-full h-auto">
          <rect x="0" y="0" width="320" height="6" fill="#EEE7D6" />
          <rect x="0" y="0" width={320 * timeLeftRatio} height="6" fill="#D9A62E" />

          {/* cat face */}
          <g transform="translate(160 120)">
            <polygon points="-58,-46 -30,-84 -6,-50" fill="#F2C879" />
            <polygon points="58,-46 30,-84 6,-50" fill="#F2C879" />
            <circle r="62" fill="#F7DCA0" />
            <circle cx="-22" cy="-8" r="5" fill="#33363D" />
            <circle cx="22" cy="-8" r="5" fill="#33363D" />
            <ellipse cx="-40" cy="6" rx="7" ry="4" fill="rgba(199,76,148,0.4)" />
            <ellipse cx="40" cy="6" rx="7" ry="4" fill="rgba(199,76,148,0.4)" />
            <g key={chompKey} className="animate-chomp" style={{ transformOrigin: '160px 152px' }}>
              <path d="M -16 20 Q 0 34 16 20 Q 0 30 -16 20 Z" fill="#33363D" />
            </g>
          </g>

          {/* noodle bowl */}
          <g transform="translate(160 250)">
            <ellipse cx="0" cy="16" rx="82" ry="26" fill="#E9E2D3" stroke="#C7BFA8" strokeWidth="3" />
            <path
              d="M -60 0 Q -30 -22 0 0 Q 30 -22 60 0"
              fill="none"
              stroke="#D9A62E"
              strokeWidth="8"
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray={100}
              strokeDashoffset={100 * noodleProgress}
            />
            <path
              d="M -46 8 Q -20 -10 0 8 Q 20 -10 46 8"
              fill="none"
              stroke="#F0C15A"
              strokeWidth="6"
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray={100}
              strokeDashoffset={100 * noodleProgress}
            />
          </g>
        </svg>

        {status === 'ready' && (
          <div className="absolute inset-0 flex items-center justify-center bg-graphite/40 pointer-events-none">
            <p className="stat-line text-white bg-graphite/80 px-3 py-2">Tap to start slurping</p>
          </div>
        )}
      </div>

      <div className="stat-line text-ink/50 dark:text-white/40 text-center mb-3">
        mash tap / click / space · bowl {Math.min(bowlIndex + 1, BOWL_COUNT)}/{BOWL_COUNT} · {taps}/{bowl.targetTaps} taps
      </div>

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug="noodle-cat"
        gameName="Noodle Cat"
        puzzleNumber={puzzleNumber}
        won={status === 'won'}
        moves={bowlIndex}
        movesLimit={BOWL_COUNT}
        score={bowlIndex}
        streak={streak}
      />
    </div>
  );
}
