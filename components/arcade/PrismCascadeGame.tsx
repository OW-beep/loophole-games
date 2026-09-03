'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createEmptyGrid,
  spawnPiece,
  tryMove,
  tryRotate,
  lockPiece,
  resolveCascade,
  isGameOver,
  scoreForPop,
  fallIntervalForScore,
  COLS,
  ROWS,
  MATCH_THRESHOLD_NORMAL,
  MATCH_THRESHOLD_OVERDRIVE,
  OVERDRIVE_METER_MAX,
  OVERDRIVE_DURATION_MS,
  type Grid,
  type Piece,
} from '@/lib/games/prism-cascade';

const HIGH_SCORE_KEY = 'loophole:arcade:prism-cascade:high-score';

function loadHighScore(): number {
  if (typeof window === 'undefined') return 0;
  return Number(window.localStorage.getItem(HIGH_SCORE_KEY)) || 0;
}
function saveHighScore(score: number) {
  try {
    window.localStorage.setItem(HIGH_SCORE_KEY, String(score));
  } catch {
    // ignore
  }
}

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Status = 'ready' | 'playing' | 'gameover';

let particleId = 0;

export function PrismCascadeGame() {
  const rngRef = useRef(mulberry32(Date.now() % 1_000_000));
  const [status, setStatus] = useState<Status>('ready');
  const [grid, setGrid] = useState<Grid>(() => createEmptyGrid());
  const [piece, setPiece] = useState<Piece | null>(null);
  const [nextColors, setNextColors] = useState<[string, string]>(['#FF2E63', '#FFD400']);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [overdriveMeter, setOverdriveMeter] = useState(0);
  const [overdriveUntil, setOverdriveUntil] = useState(0);
  const [isOverdriveActive, setIsOverdriveActive] = useState(false);
  const [chainFlash, setChainFlash] = useState<{ chain: number; id: number } | null>(null);
  const [popParticles, setPopParticles] = useState<{ id: number; col: number; row: number; color: string }[]>([]);
  const [shake, setShake] = useState(false);
  const [cascading, setCascading] = useState(false);

  const dropTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const overdriveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gridRef = useRef(grid);
  gridRef.current = grid;
  const pieceRef = useRef(piece);
  pieceRef.current = piece;
  const scoreRef = useRef(score);
  scoreRef.current = score;
  const overdriveMeterRef = useRef(overdriveMeter);
  overdriveMeterRef.current = overdriveMeter;

  useEffect(() => {
    setHighScore(loadHighScore());
  }, []);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 180);
  }, []);

  function spawnNext(currentGrid: Grid, colors: [string, string]) {
    const { piece: newPiece, nextColors: newNext } = spawnPiece(rngRef.current, colors);
    if (isGameOver(currentGrid, newPiece)) {
      setStatus('gameover');
      setPiece(null);
      if (dropTimerRef.current) clearTimeout(dropTimerRef.current);
      const final = scoreRef.current;
      if (final > loadHighScore()) saveHighScore(final);
      setHighScore(loadHighScore());
      return;
    }
    setPiece(newPiece);
    setNextColors(newNext);
  }

  function runCascade(lockedGrid: Grid) {
    setCascading(true);
    const threshold = isOverdriveActive ? MATCH_THRESHOLD_OVERDRIVE : MATCH_THRESHOLD_NORMAL;
    const steps = resolveCascade(lockedGrid, threshold);

    if (steps.length === 0) {
      setGrid(lockedGrid);
      setCascading(false);
      spawnNext(lockedGrid, nextColors);
      return;
    }

    let i = 0;
    function playStep() {
      const step = steps[i];
      // show particles at the popped cells using the PREVIOUS grid's colors
      const priorGrid = i === 0 ? lockedGrid : steps[i - 1].grid;
      const bursts = step.poppedCells.map(([r, c]) => ({
        id: particleId++,
        col: c,
        row: r,
        color: (priorGrid[r][c] as string) ?? '#FFFFFF',
      }));
      setPopParticles((prev) => [...prev, ...bursts]);
      triggerShake();
      setChainFlash({ chain: step.chain, id: particleId++ });
      setTimeout(() => setPopParticles((prev) => prev.filter((p) => !bursts.some((b) => b.id === p.id))), 500);

      const cellsPopped = step.poppedCells.length;
      const gained = scoreForPop(cellsPopped, step.chain, isOverdriveActive);
      setScore((s) => s + gained);
      setOverdriveMeter((m) => {
        const next = Math.min(OVERDRIVE_METER_MAX, m + cellsPopped * 3);
        if (next >= OVERDRIVE_METER_MAX && !isOverdriveActive) {
          activateOverdrive();
        }
        return next;
      });
      setGrid(step.grid);

      i++;
      if (i < steps.length) {
        setTimeout(playStep, 340);
      } else {
        setTimeout(() => {
          setCascading(false);
          setChainFlash(null);
          spawnNext(step.grid, nextColors);
        }, 260);
      }
    }
    playStep();
  }

  function activateOverdrive() {
    setIsOverdriveActive(true);
    setOverdriveMeter(0);
    if (overdriveTimerRef.current) clearTimeout(overdriveTimerRef.current);
    overdriveTimerRef.current = setTimeout(() => {
      setIsOverdriveActive(false);
    }, OVERDRIVE_DURATION_MS);
  }

  const lockAndResolve = useCallback(() => {
    const p = pieceRef.current;
    if (!p) return;
    const locked = lockPiece(gridRef.current, p);
    setPiece(null);
    runCascade(locked);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOverdriveActive, nextColors]);

  const scheduleDrop = useCallback(() => {
    if (dropTimerRef.current) clearTimeout(dropTimerRef.current);
    dropTimerRef.current = setTimeout(() => {
      setPiece((prev) => {
        if (!prev || cascading) return prev;
        const moved = tryMove(gridRef.current, prev, 0, 1);
        if (moved) {
          return moved;
        } else {
          lockAndResolve();
          return prev;
        }
      });
    }, fallIntervalForScore(scoreRef.current));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cascading, lockAndResolve]);

  useEffect(() => {
    if (status !== 'playing' || cascading || !piece) return;
    scheduleDrop();
    return () => {
      if (dropTimerRef.current) clearTimeout(dropTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [piece, status, cascading]);

  function startGame() {
    rngRef.current = mulberry32(Date.now() % 1_000_000);
    const empty = createEmptyGrid();
    setGrid(empty);
    setScore(0);
    setOverdriveMeter(0);
    setIsOverdriveActive(false);
    setChainFlash(null);
    setPopParticles([]);
    setStatus('playing');
    const initialColors: [string, string] = ['#FF2E63', '#FFD400'];
    spawnNext(empty, initialColors);
  }

  function move(dx: number) {
    if (status !== 'playing' || cascading) return;
    setPiece((prev) => {
      if (!prev) return prev;
      return tryMove(gridRef.current, prev, dx, 0) ?? prev;
    });
  }
  function rotate() {
    if (status !== 'playing' || cascading) return;
    setPiece((prev) => {
      if (!prev) return prev;
      return tryRotate(gridRef.current, prev) ?? prev;
    });
  }
  function softDrop() {
    if (status !== 'playing' || cascading) return;
    setPiece((prev) => {
      if (!prev) return prev;
      const moved = tryMove(gridRef.current, prev, 0, 1);
      if (moved) return moved;
      lockAndResolve();
      return prev;
    });
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') move(-1);
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') move(1);
      if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') softDrop();
      if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w' || e.key === ' ') rotate();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, cascading]);

  useEffect(() => {
    return () => {
      if (dropTimerRef.current) clearTimeout(dropTimerRef.current);
      if (overdriveTimerRef.current) clearTimeout(overdriveTimerRef.current);
    };
  }, []);

  // Build a display grid that overlays the falling piece on top of the locked grid.
  const displayGrid: (string | null)[][] = grid.map((row) => [...row]) as (string | null)[][];
  if (piece) {
    displayGrid[piece.row][piece.col] = piece.color;
    const p = (() => {
      switch (piece.partnerDir) {
        case 'up':
          return { col: piece.col, row: piece.row - 1 };
        case 'down':
          return { col: piece.col, row: piece.row + 1 };
        case 'left':
          return { col: piece.col - 1, row: piece.row };
        case 'right':
          return { col: piece.col + 1, row: piece.row };
      }
    })();
    if (p.row >= 0 && p.row < ROWS && p.col >= 0 && p.col < COLS) {
      displayGrid[p.row][p.col] = piece.partnerColor;
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="arcade-stat-panel px-3 py-1.5 rounded text-xs">
          SCORE <span className="text-lg ml-1" style={{ color: 'var(--arcade-yellow)' }}>{score}</span>
        </div>
        <div className="arcade-stat-panel px-3 py-1.5 rounded text-xs flex items-center gap-2">
          <span>NEXT</span>
          <span className="flex gap-0.5">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ background: nextColors[0] }} />
            <span className="inline-block w-3 h-3 rounded-sm" style={{ background: nextColors[1] }} />
          </span>
        </div>
      </div>

      {/* Overdrive meter */}
      <div className="mb-3">
        <div className="h-3 rounded-full overflow-hidden bg-white/10 border border-white/20">
          <div
            className="h-full transition-all duration-200"
            style={{
              width: `${isOverdriveActive ? 100 : overdriveMeter}%`,
              background: isOverdriveActive
                ? 'linear-gradient(90deg, var(--arcade-pink), var(--arcade-yellow), var(--arcade-cyan))'
                : 'var(--arcade-cyan)',
            }}
          />
        </div>
        <p className="stat-line text-center mt-1" style={{ color: isOverdriveActive ? 'var(--arcade-yellow)' : 'rgba(255,255,255,0.4)' }}>
          {isOverdriveActive ? '⚡ OVERDRIVE — matches of 3 now pop!' : 'OVERDRIVE METER'}
        </p>
      </div>

      <div
        className={`relative rounded-xl overflow-hidden border-4 mx-auto ${shake ? 'arcade-shake' : ''}`}
        style={{
          width: '100%',
          aspectRatio: `${COLS} / ${ROWS}`,
          background: isOverdriveActive ? 'linear-gradient(180deg, #2a1030 0%, #0B0710 100%)' : 'linear-gradient(180deg, #1a1024 0%, #0B0710 100%)',
          borderColor: isOverdriveActive ? 'var(--arcade-yellow)' : '#000',
        }}
      >
        <div
          className="absolute inset-0 grid"
          style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }}
        >
          {displayGrid.map((row, r) =>
            row.map((cell, c) => (
              <div key={`${r}-${c}`} className="relative border border-white/5">
                {cell && (
                  <div
                    className="absolute inset-[8%] rounded-md"
                    style={{
                      background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.85), ${cell} 55%, rgba(0,0,0,0.35) 100%)`,
                      boxShadow: `0 0 8px ${cell}99, inset 0 0 4px rgba(255,255,255,0.4)`,
                    }}
                  />
                )}
              </div>
            ))
          )}
        </div>

        {popParticles.map((p) => (
          <span
            key={p.id}
            className="arcade-particle absolute"
            style={{
              left: `${((p.col + 0.5) / COLS) * 100}%`,
              top: `${((p.row + 0.5) / ROWS) * 100}%`,
              width: 10,
              height: 10,
              background: p.color,
              // @ts-expect-error custom properties for the keyframe
              '--px': `${(Math.random() - 0.5) * 60}px`,
              '--py': `${(Math.random() - 0.5) * 60}px`,
            }}
          />
        ))}

        {chainFlash && chainFlash.chain > 1 && (
          <div
            key={chainFlash.id}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <span className="arcade-combo-pop font-black text-3xl" style={{ color: 'var(--arcade-yellow)', textShadow: '0 0 12px rgba(0,0,0,0.8)' }}>
              CHAIN x{chainFlash.chain}!
            </span>
          </div>
        )}

        {status !== 'playing' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/75 text-center px-6">
            {status === 'ready' && (
              <>
                <p className="text-white/80 text-sm max-w-xs">
                  Drop gem pairs and connect 4 or more of the same color to clear them. Chain multiple pops in one
                  drop for bonus score — fill the meter to trigger Overdrive.
                </p>
                <button
                  onClick={startGame}
                  className="arcade-cta px-8 py-3 rounded-full font-black text-lg"
                  style={{ background: 'var(--arcade-yellow)', color: '#141018' }}
                >
                  START
                </button>
              </>
            )}
            {status === 'gameover' && (
              <>
                <p className="text-2xl font-black" style={{ color: 'var(--arcade-pink)' }}>
                  STACK OVERFLOW!
                </p>
                <p className="text-white/90">
                  Score: <span className="font-black text-xl">{score}</span>
                </p>
                <p className="text-white/50 text-xs">High score: {highScore}</p>
                <div className="flex gap-3 mt-1">
                  <button
                    onClick={startGame}
                    className="arcade-cta px-6 py-2.5 rounded-full font-black"
                    style={{ background: 'var(--arcade-yellow)', color: '#141018' }}
                  >
                    PLAY AGAIN
                  </button>
                  <button
                    onClick={() => {
                      const text = `I scored ${score} in PRISM CASCADE 💎 Beat me: ${typeof window !== 'undefined' ? window.location.href : ''}`;
                      if (navigator.share) navigator.share({ text }).catch(() => {});
                      else if (navigator.clipboard) navigator.clipboard.writeText(text);
                    }}
                    className="px-6 py-2.5 rounded-full font-black border-2"
                    style={{ borderColor: 'var(--arcade-cyan)', color: 'var(--arcade-cyan)' }}
                  >
                    SHARE
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {status === 'playing' && (
        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            onClick={() => move(-1)}
            className="w-12 h-12 rounded-full bg-white/15 border-2 border-white/40 text-white text-xl font-bold active:scale-90 transition-transform"
          >
            ←
          </button>
          <button
            onClick={rotate}
            className="w-14 h-12 rounded-full font-black active:scale-95 transition-transform"
            style={{ background: 'var(--arcade-cyan)', color: '#141018' }}
          >
            ROTATE
          </button>
          <button
            onClick={softDrop}
            className="w-12 h-12 rounded-full bg-white/15 border-2 border-white/40 text-white text-xl font-bold active:scale-90 transition-transform"
          >
            ↓
          </button>
          <button
            onClick={() => move(1)}
            className="w-12 h-12 rounded-full bg-white/15 border-2 border-white/40 text-white text-xl font-bold active:scale-90 transition-transform"
          >
            →
          </button>
        </div>
      )}
      {status === 'playing' && (
        <p className="stat-line text-center text-white/30 mt-2 hidden sm:block">←/→ move · ↑ or space rotate · ↓ soft drop</p>
      )}
    </div>
  );
}
