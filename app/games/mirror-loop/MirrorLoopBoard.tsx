'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  createInitialState,
  rotateMirror,
  traceBeams,
  getLanes,
  cellKey,
  GRID_SIZE,
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

export function MirrorLoopBoard({
  seed, dateString, puzzleNumber,
}: {
  seed: number; dateString: string; puzzleNumber: number;
}) {
  const game = GAMES.find(g => g.slug === 'mirror-loop')!;
  const [state, setState] = useState<MirrorLoopState>(() => createInitialState(seed));
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);
  const lanes  = useMemo(() => getLanes(), []);
  const beams  = useMemo(() => traceBeams(state), [state]);
  const budget = state.wrongAtStart;

  function handleClick(r: number, c: number) {
    if (state.won || state.lost) return;
    setState(prev => rotateMirror(prev, r, c));
  }

  useEffect(() => {
    if ((state.won || state.lost) && !finishedRef.current) {
      finishedRef.current = true;
      recordResult('mirror-loop', {
        date: dateString, won: state.won,
        moves: state.movesUsed,
        score: beams.filter(b => b.success).length,
        elapsedMs: 0,
      });
      setStreak(getStreak('mirror-loop').current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.movesUsed, beams, dateString]);

  // Build a set of all mirror cell-keys for hit-testing
  const mirrorKeys = new Set(lanes.flatMap(l => l.mirrors.map(m => cellKey(m.pos.r, m.pos.c))));

  return (
    <div>
      <GameHeader
        game={game} puzzleNumber={puzzleNumber}
        movesUsed={state.movesUsed} movesLimit={budget}
      />

      <p className="stat-line text-ink/50 dark:text-white/40 mb-2">
        Rotations left:{' '}
        <span className="font-mono text-ink dark:text-white">{budget - state.movesUsed}</span>
        {' '}· tap a mirror to rotate it · beam stops at first mirror
      </p>

      <div className="border-2 border-graphite dark:border-white/80 bg-panel dark:bg-panel-dark mb-5 overflow-hidden">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-auto block touch-none">
          {/* grid lines */}
          {Array.from({ length: GRID_SIZE + 1 }, (_, i) => (
            <g key={i}>
              <line x1={i * CELL} y1={0} x2={i * CELL} y2={SIZE}
                stroke="currentColor" className="text-index dark:text-index-dark" strokeWidth={1} />
              <line x1={0} y1={i * CELL} x2={SIZE} y2={i * CELL}
                stroke="currentColor" className="text-index dark:text-index-dark" strokeWidth={1} />
            </g>
          ))}

          {/* visible beam segments (emitter → first mirror only) */}
          {beams.map(beam =>
            beam.visibleSegments.map((seg, si) => {
              const f = center(seg.from.r, seg.from.c);
              const t = center(seg.to.r, seg.to.c);
              return (
                <line key={`${beam.laneId}-${si}`}
                  x1={f.x} y1={f.y} x2={t.x} y2={t.y}
                  stroke={beam.color} strokeWidth={4}
                  strokeLinecap="round" opacity={0.7}
                />
              );
            })
          )}

          {/* emitters */}
          {lanes.map(lane => {
            const { x, y } = center(lane.emitter.r, lane.emitter.c);
            const color = state.laneColors[lane.id];
            return (
              <g key={`em-${lane.id}`}
                transform={`translate(${x},${y}) rotate(${DIR_ANGLE[lane.dir]})`}>
                <circle r={14} fill={color} />
                <path d="M -4,-7 L 8,0 L -4,7 Z" fill="white" />
              </g>
            );
          })}

          {/* targets */}
          {lanes.map(lane => {
            const { x, y } = center(lane.target.r, lane.target.c);
            const color = state.laneColors[lane.id];
            const ok = beams.find(b => b.laneId === lane.id)?.success;
            return (
              <circle key={`tgt-${lane.id}`}
                cx={x} cy={y} r={13}
                fill={ok ? color : 'none'}
                stroke={color} strokeWidth={3}
                opacity={ok ? 0.9 : 0.5}
              />
            );
          })}

          {/* mirrors — clickable */}
          {lanes.map(lane =>
            lane.mirrors.map((m, mi) => {
              const { x, y } = center(m.pos.r, m.pos.c);
              const key = cellKey(m.pos.r, m.pos.c);
              const orientation = state.orientations[key];
              const d = orientation === '/'
                ? `M ${x - 16},${y + 16} L ${x + 16},${y - 16}`
                : `M ${x - 16},${y - 16} L ${x + 16},${y + 16}`;
              return (
                <g key={`m-${lane.id}-${mi}`}>
                  <rect
                    x={x - 24} y={y - 24} width={48} height={48}
                    fill="transparent" className="cursor-pointer"
                    onClick={() => handleClick(m.pos.r, m.pos.c)}
                  />
                  <path
                    d={d}
                    stroke="currentColor"
                    className="text-graphite dark:text-white"
                    strokeWidth={4} strokeLinecap="round"
                  />
                </g>
              );
            })
          )}
        </svg>
      </div>

      {/* per-lane status strip */}
      <div className="flex gap-3 mb-4">
        {lanes.map(lane => {
          const ok = beams.find(b => b.laneId === lane.id)?.success;
          return (
            <div key={lane.id}
              className="stat-line flex items-center gap-1.5 px-2 py-1 border border-index dark:border-index-dark">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ background: state.laneColors[lane.id] }}
              />
              <span className={ok
                ? 'text-mirror dark:text-mirror'
                : 'text-ink/50 dark:text-white/40'}>
                {ok ? 'Connected' : 'Open'}
              </span>
            </div>
          );
        })}
      </div>

      <ResultModal
        open={showResult} onClose={() => setShowResult(false)}
        gameSlug="mirror-loop" gameName="Mirror Loop"
        puzzleNumber={puzzleNumber} won={state.won}
        moves={state.movesUsed} movesLimit={budget}
        score={beams.filter(b => b.success).length}
        streak={streak}
      />
    </div>
  );
}
