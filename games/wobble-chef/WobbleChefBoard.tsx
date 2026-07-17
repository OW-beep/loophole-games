'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createMenu,
  createInitialTower,
  createFallingItem,
  stepFalling,
  evaluateDrop,
  FOOD_TYPES,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  GROUND_Y,
  SWING_AMPLITUDE,
  SWING_SPEED,
  MENU_LENGTH,
  type FallingItem,
  type TowerState,
} from '@/lib/games/wobble-chef';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { GAMES } from '@/lib/games/registry';

type Status = 'playing' | 'falling' | 'won' | 'lost';

interface PlacedItem {
  x: number;
  y: number;
  w: number;
  h: number;
  typeIndex: number;
}

const CAMERA_REFERENCE_Y = 130;

export function WobbleChefBoard({
  seed,
  dateString,
  puzzleNumber,
}: {
  seed: number;
  dateString: string;
  puzzleNumber: number;
}) {
  const game = GAMES.find((g) => g.slug === 'wobble-chef')!;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number>(0);
  const statusRef = useRef<Status>('playing');
  const finishedRef = useRef(false);

  const menuRef = useRef<number[]>(createMenu(seed));
  const towerRef = useRef<TowerState>(createInitialTower());
  const stackRef = useRef<PlacedItem[]>([]);
  const fallingRef = useRef<FallingItem | null>(null);
  const menuIndexRef = useRef(0);
  const phaseRef = useRef(0);
  const hasDroppedRef = useRef(false);

  const [status, setStatus] = useState<Status>('playing');
  const [stacked, setStacked] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [streak, setStreak] = useState(0);
  const [everDropped, setEverDropped] = useState(false);

  const resetRun = useCallback(() => {
    menuRef.current = createMenu(seed);
    towerRef.current = createInitialTower();
    stackRef.current = [];
    fallingRef.current = null;
    menuIndexRef.current = 0;
    phaseRef.current = 0;
    hasDroppedRef.current = false;
    finishedRef.current = false;
    setStacked(0);
    setShowResult(false);
    setEverDropped(false);
    statusRef.current = 'playing';
    setStatus('playing');
  }, [seed]);

  const onTap = useCallback(() => {
    if (statusRef.current === 'won' || statusRef.current === 'lost') {
      resetRun();
      return;
    }
    if (statusRef.current !== 'playing') return;
    hasDroppedRef.current = true;
    setEverDropped(true);
    const x = CANVAS_WIDTH / 2 + SWING_AMPLITUDE * Math.sin(phaseRef.current);
    fallingRef.current = createFallingItem(menuRef.current[menuIndexRef.current], x);
    statusRef.current = 'falling';
    setStatus('falling');
  }, [resetRun]);

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
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rawCtx = canvas.getContext('2d');
    if (!rawCtx) return;
    const ctx: CanvasRenderingContext2D = rawCtx;

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    canvas.width = CANVAS_WIDTH * dpr;
    canvas.height = CANVAS_HEIGHT * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    function finish(won: boolean) {
      if (finishedRef.current) return;
      finishedRef.current = true;
      statusRef.current = won ? 'won' : 'lost';
      setStatus(statusRef.current);
      recordResult('wobble-chef', {
        date: dateString,
        won,
        moves: menuIndexRef.current,
        score: menuIndexRef.current,
        elapsedMs: 0,
      });
      setStreak(getStreak('wobble-chef').current);
      setShowResult(true);
    }

    function shiftDown() {
      return Math.max(0, CAMERA_REFERENCE_Y - towerRef.current.topY);
    }

    function drawRoundedRect(x: number, y: number, w: number, h: number, r: number, color: string) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
      ctx.fill();
    }

    function draw() {
      const bg = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      bg.addColorStop(0, '#FFF3E6');
      bg.addColorStop(1, '#F6F7F4');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const sd = shiftDown();

      ctx.fillStyle = '#E9D3B8';
      ctx.fillRect(0, GROUND_Y + sd, CANVAS_WIDTH, Math.max(0, CANVAS_HEIGHT - (GROUND_Y + sd)));

      for (const item of stackRef.current) {
        const t = FOOD_TYPES[item.typeIndex];
        drawRoundedRect(item.x - item.w / 2, item.y + sd - item.h / 2, item.w, item.h, 8, t.color);
      }

      if (statusRef.current === 'playing') {
        const t = FOOD_TYPES[menuRef.current[menuIndexRef.current]];
        const x = CANVAS_WIDTH / 2 + SWING_AMPLITUDE * Math.sin(phaseRef.current);
        drawRoundedRect(x - t.w / 2, 34 + sd - t.h / 2, t.w, t.h, 8, t.color);
      } else if (statusRef.current === 'falling' && fallingRef.current) {
        const t = FOOD_TYPES[fallingRef.current.typeIndex];
        drawRoundedRect(
          fallingRef.current.x - t.w / 2,
          fallingRef.current.y + sd - t.h / 2,
          t.w,
          t.h,
          8,
          t.color
        );
      }

      // center guide line for the tower's current landing target
      ctx.strokeStyle = 'rgba(51,54,61,0.15)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(towerRef.current.centerX, 0);
      ctx.lineTo(towerRef.current.centerX, CANVAS_HEIGHT);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    function frame(ts: number) {
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = Math.min((ts - lastTsRef.current) / 1000, 0.032);
      lastTsRef.current = ts;

      if (statusRef.current === 'playing') {
        phaseRef.current += SWING_SPEED * dt;
      } else if (statusRef.current === 'falling' && fallingRef.current) {
        fallingRef.current = stepFalling(fallingRef.current, dt);
        const t = FOOD_TYPES[fallingRef.current.typeIndex];
        const landingY = towerRef.current.topY - t.h / 2;

        if (fallingRef.current.y >= landingY) {
          const result = evaluateDrop(towerRef.current, fallingRef.current.x, fallingRef.current.typeIndex);
          if (result.success) {
            stackRef.current.push({
              x: fallingRef.current.x,
              y: landingY,
              w: t.w,
              h: t.h,
              typeIndex: fallingRef.current.typeIndex,
            });
            towerRef.current = result.tower;
            menuIndexRef.current += 1;
            setStacked(menuIndexRef.current);
            fallingRef.current = null;
            if (menuIndexRef.current >= MENU_LENGTH) {
              finish(true);
            } else {
              statusRef.current = 'playing';
              setStatus('playing');
            }
          } else {
            finish(false);
          }
        }
      }

      draw();
      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = 0;
    };
  }, [dateString]);

  return (
    <div>
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={stacked} movesLimit={MENU_LENGTH} />

      <div
        className="relative mb-5 border-2 border-graphite dark:border-white/80 overflow-hidden touch-none select-none mx-auto"
        style={{ maxWidth: CANVAS_WIDTH }}
        onPointerDown={(e) => {
          e.preventDefault();
          onTap();
        }}
      >
        <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', display: 'block' }} />
        {!everDropped && status === 'playing' && (
          <div className="absolute inset-0 flex items-center justify-center bg-graphite/40 pointer-events-none">
            <p className="stat-line text-white bg-graphite/80 px-3 py-2">Tap to drop the dish</p>
          </div>
        )}
      </div>

      <div className="stat-line text-ink/50 dark:text-white/40 text-center mb-3">
        tap / click / space to drop · stack today&rsquo;s {MENU_LENGTH}-dish menu without a topple
      </div>

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug="wobble-chef"
        gameName="Wobble Chef"
        puzzleNumber={puzzleNumber}
        won={status === 'won'}
        moves={stacked}
        movesLimit={MENU_LENGTH}
        score={stacked}
        streak={streak}
      />
    </div>
  );
}
