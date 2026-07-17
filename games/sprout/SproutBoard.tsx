'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createStages,
  gaugePhase,
  isInWindow,
  STAGE_COUNT,
  MAX_MISSES,
  type StageConfig,
} from '@/lib/games/sprout';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { GAMES } from '@/lib/games/registry';

type Status = 'ready' | 'playing' | 'won' | 'lost';

const CX = 150;
const CY = 150;
const R = 96;

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(stage: StageConfig): string {
  const startDeg = stage.windowStart * 360;
  const endDeg = (stage.windowStart + stage.windowWidth) * 360;
  const start = polar(CX, CY, R, startDeg);
  const end = polar(CX, CY, R, endDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${R} ${R} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

/** Small procedural plant illustration whose height/leaves/bloom scale with
 * the current stage — this is the "growth" the player is watering toward. */
function Plant({ stage }: { stage: number }) {
  const stemHeight = 14 + stage * 11;
  const leafCount = Math.min(stage, 3);
  const bloomed = stage >= STAGE_COUNT - 1;
  return (
    <g>
      <path
        d={`M 150 220 Q 146 ${220 - stemHeight / 2} 150 ${220 - stemHeight}`}
        stroke="#5FA344"
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
      />
      {Array.from({ length: leafCount }, (_, i) => {
        const y = 220 - stemHeight * ((i + 1) / (leafCount + 1));
        const side = i % 2 === 0 ? 1 : -1;
        return (
          <ellipse
            key={i}
            cx={150 + side * 10}
            cy={y}
            rx={9}
            ry={5}
            fill="#7BC25C"
            transform={`rotate(${side * 30} ${150 + side * 10} ${y})`}
          />
        );
      })}
      {bloomed && (
        <g transform={`translate(150 ${220 - stemHeight})`}>
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <ellipse key={deg} cx={0} cy={-8} rx={6} ry={9} fill="#F0A0C8" transform={`rotate(${deg})`} />
          ))}
          <circle r={5} fill="#F7D65B" />
        </g>
      )}
    </g>
  );
}

export function SproutBoard({
  seed,
  dateString,
  puzzleNumber,
}: {
  seed: number;
  dateString: string;
  puzzleNumber: number;
}) {
  const game = GAMES.find((g) => g.slug === 'sprout')!;
  const stagesRef = useRef<StageConfig[]>(createStages(seed));
  const needleGroupRef = useRef<SVGGElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const cycleStartRef = useRef(0);
  const stageIndexRef = useRef(0);
  const missesRef = useRef(0);
  const statusRef = useRef<Status>('ready');
  const finishedRef = useRef(false);

  const [status, setStatus] = useState<Status>('ready');
  const [stageIndex, setStageIndex] = useState(0);
  const [misses, setMisses] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [streak, setStreak] = useState(0);

  const resetRun = useCallback(() => {
    stagesRef.current = createStages(seed);
    stageIndexRef.current = 0;
    missesRef.current = 0;
    finishedRef.current = false;
    setStageIndex(0);
    setMisses(0);
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
      recordResult('sprout', {
        date: dateString,
        won,
        moves: stageIndexRef.current,
        score: stageIndexRef.current,
        elapsedMs: 0,
      });
      setStreak(getStreak('sprout').current);
      setShowResult(true);
    },
    [dateString]
  );

  const handleTap = useCallback(() => {
    if (statusRef.current === 'won' || statusRef.current === 'lost') {
      resetRun();
      return;
    }
    if (statusRef.current === 'ready') {
      statusRef.current = 'playing';
      setStatus('playing');
      cycleStartRef.current = performance.now();
      return;
    }
    if (statusRef.current !== 'playing') return;

    const stage = stagesRef.current[stageIndexRef.current];
    const phase = gaugePhase(stage, performance.now() - cycleStartRef.current);
    if (isInWindow(stage, phase)) {
      stageIndexRef.current += 1;
      setStageIndex(stageIndexRef.current);
      if (stageIndexRef.current >= STAGE_COUNT) {
        finish(true);
        return;
      }
      cycleStartRef.current = performance.now();
    } else {
      missesRef.current += 1;
      setMisses(missesRef.current);
      if (missesRef.current > MAX_MISSES) {
        finish(false);
      }
    }
  }, [finish, resetRun]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === 'Space') {
        e.preventDefault();
        handleTap();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleTap]);

  useEffect(() => {
    function frame() {
      if (statusRef.current === 'playing' && needleGroupRef.current) {
        const stage = stagesRef.current[stageIndexRef.current];
        const phase = gaugePhase(stage, performance.now() - cycleStartRef.current);
        needleGroupRef.current.setAttribute('transform', `rotate(${phase * 360} ${CX} ${CY})`);
      }
      rafRef.current = requestAnimationFrame(frame);
    }
    rafRef.current = requestAnimationFrame(frame);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const stage = stagesRef.current[Math.min(stageIndexRef.current, STAGE_COUNT - 1)];

  return (
    <div>
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={stageIndex} movesLimit={STAGE_COUNT} />

      <div
        className="relative mb-5 border-2 border-graphite dark:border-white/80 overflow-hidden touch-none select-none mx-auto bg-white dark:bg-panel-dark"
        style={{ maxWidth: 300 }}
        onPointerDown={(e) => {
          e.preventDefault();
          handleTap();
        }}
      >
        <svg viewBox="0 0 300 300" className="block w-full h-auto">
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="#E4E1D8" strokeWidth={10} />
          <path d={arcPath(stage)} fill="none" stroke="#5FA344" strokeWidth={10} strokeLinecap="round" />
          <g ref={needleGroupRef}>
            <line x1={CX} y1={CY} x2={CX} y2={CY - R} stroke="#33363D" strokeWidth={3} strokeLinecap="round" />
            <circle cx={CX} cy={CY} r={5} fill="#33363D" />
          </g>
          <Plant stage={stageIndex} />
        </svg>

        {status === 'ready' && (
          <div className="absolute inset-0 flex items-center justify-center bg-graphite/40 pointer-events-none">
            <p className="stat-line text-white bg-graphite/80 px-3 py-2">Tap to start the dial</p>
          </div>
        )}
      </div>

      <div className="stat-line text-ink/50 dark:text-white/40 text-center mb-3">
        tap / space when the needle crosses the green arc · misses {misses}/{MAX_MISSES}
      </div>

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug="sprout"
        gameName="Sprout"
        puzzleNumber={puzzleNumber}
        won={status === 'won'}
        moves={stageIndex}
        movesLimit={STAGE_COUNT}
        score={stageIndex}
        streak={streak}
      />
    </div>
  );
}
