'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  createInitialState,
  rotateMirror,
  traceBeams,
  getLanes,
  cellIndex,
  GRID_SIZE,
  ROTATION_BUDGET,
  type MirrorLoopState,
} from '@/lib/games/mirror-loop';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { GAMES } from '@/lib/games/registry';

const CELL = 48;
const SIZE = CELL * GRID_SIZE;

function center(r: number, c: number) {
  return { x: c * CELL + CELL / 2, y: r * CELL + CELL / 2 };
}

const DIR_ANGLE: Record<string, number> = { up: -90, down: 90, left: 180, right: 0 };

export function MirrorLoopBoard({ seed, dateString, puzzleNumber }: { seed: number; dateString: string; puzzleNumber: number }) {
  const game = GAMES.find((g) => g.slug === 'mirror-loop')!;
  const [state, setState] = useState<MirrorLoopState>(() => createInitialState(seed));
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);
  const lanes = useMemo(() => getLanes(), []);
  const beams = useMemo(() => traceBeams(state), [state]);

  function handleClick(cellIdx: number) {
    if (state.won || state.lost) return;
    setState((prev) => rotateMirror(prev, cellIdx));
  }

  useEffect(() => {
    if ((state.won || state.lost) && !finishedRef.current) {
      finishedRef.current = true;
      recordResult('mirror-loop', {
        date: dateString,
        won: state.won,
        moves: state.movesUsed,
        score: beams.filter((b) => b.success).length,
        elapsedMs: 0,
      });
      setStreak(getStreak('mirror-loop').current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.movesUsed, beams, dateString]);

  return (
    <div>
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.movesUsed} movesLimit={ROTATION_BUDGET} />

      <p className="stat-line text-ink/50 dark:text-white/40 mb-3">
        Rotations left:{' '}
        <span className="font-mono text-ink dark:text-white">{ROTATION_BUDGET - state.movesUsed}</span>
        {' '}· tap a mirror tile to rotate it
      </p>

      <div className="border-2 border-graphite dark:border-white/80 bg-panel dark:bg-panel-dark mb-5 overflow-hidden">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-auto block touch-none">
          {/* grid lines */}
          {Array.from({ length: GRID_SIZE + 1 }, (_, i) => (
            <g key={`grid-${i}`}>
              <line x1={i * CELL} y1={0} x2={i * CELL} y2={SIZE} stroke="currentColor" className="text-index dark:text-index-dark" strokeWidth={1} />
              <line x1={0} y1={i * CELL} x2={SIZE} y2={i * CELL} stroke="currentColor" className="text-index dark:text-index-dark" strokeWidth={1} />
            </g>
          ))}

          {/* beams, drawn before mirrors/targets so glyphs sit on top */}
          {beams.map((beam) => {
            const pts = beam.points.map((p) => center(p.r, p.c));
            const pathStr = pts.map((p) => `${p.x},${p.y}`).join(' ');
            return (
              <polyline
                key={`beam-${beam.laneId}`}
                points={pathStr}
                fill="none"
                stroke={beam.color}
                strokeWidth={beam.success ? 5 : 3}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={beam.success ? 0.95 : 0.45}
              />
            );
          })}

          {/* emitters */}
          {lanes.map((lane) => {
            const { x, y } = center(lane.emitterPos.r, lane.emitterPos.c);
            const color = state.laneColors[lane.id];
            return (
              <g key={`emitter-${lane.id}`} transform={`translate(${x},${y}) rotate(${DIR_ANGLE[lane.emitterDir]})`}>
                <circle r={14} fill={color} />
                <path d="M -4,-7 L 8,0 L -4,7 Z" fill="white" />
              </g>
            );
          })}

          {/* targets */}
          {lanes.map((lane) => {
            const { x, y } = center(lane.targetPos.r, lane.targetPos.c);
            const color = state.laneColors[lane.id];
            const success = beams.find((b) => b.laneId === lane.id)?.success;
            return (
              <circle
                key={`target-${lane.id}`}
                cx={x}
                cy={y}
                r={13}
                fill={success ? color : 'none'}
                stroke={color}
                strokeWidth={3}
                opacity={success ? 0.9 : 0.6}
              />
            );
          })}

          {/* mirrors */}
          {lanes.map((lane) => {
            const { x, y } = center(lane.mirrorPos.r, lane.mirrorPos.c);
            const cIdx = cellIndex(lane.mirrorPos.r, lane.mirrorPos.c);
            const orientation = state.orientations[cIdx];
            const d =
              orientation === '/'
                ? `M ${x - 16},${y + 16} L ${x + 16},${y - 16}`
                : `M ${x - 16},${y - 16} L ${x + 16},${y + 16}`;
            return (
              <g key={`mirror-${lane.id}`}>
                <rect
                  x={x - 24}
                  y={y - 24}
                  width={48}
                  height={48}
                  fill="transparent"
                  className="cursor-pointer"
                  onClick={() => handleClick(cIdx)}
                />
                <path d={d} stroke="currentColor" className="text-graphite dark:text-white" strokeWidth={4} strokeLinecap="round" />
              </g>
            );
          })}
        </svg>
      </div>

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug="mirror-loop"
        gameName="Mirror Loop"
        puzzleNumber={puzzleNumber}
        won={state.won}
        moves={state.movesUsed}
        movesLimit={ROTATION_BUDGET}
        score={beams.filter((b) => b.success).length}
        streak={streak}
      />
    </div>
  );
}
