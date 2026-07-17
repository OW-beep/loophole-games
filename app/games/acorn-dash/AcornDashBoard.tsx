'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createHarvest,
  countAcorns,
  currentX,
  hasCrossedLine,
  resolveCrossing,
  stepBasket,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  BASKET_Y,
  BASKET_HALF_WIDTH,
  ITEM_RADIUS,
  SPAWN_Y,
  DROP_COUNT,
  MISS_BUDGET,
  type DropItem,
} from '@/lib/games/acorn-dash';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { GAMES } from '@/lib/games/registry';

type Status = 'ready' | 'playing' | 'won' | 'lost';

const RESPAWN_PAUSE_MS = 200;

export function AcornDashBoard({
  seed,
  dateString,
  puzzleNumber,
}: {
  seed: number;
  dateString: string;
  puzzleNumber: number;
}) {
  const game = GAMES.find((g) => g.slug === 'acorn-dash')!;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number>(0);
  const statusRef = useRef<Status>('ready');
  const finishedRef = useRef(false);

  const harvestRef = useRef<DropItem[]>(createHarvest(seed));
  const totalAcornsRef = useRef<number>(countAcorns(harvestRef.current));
  const indexRef = useRef(0);
  const itemYRef = useRef(SPAWN_Y);
  const itemElapsedRef = useRef(0);
  const pauseRef = useRef(0);
  const basketXRef = useRef(CANVAS_WIDTH / 2);
  const targetXRef = useRef(CANVAS_WIDTH / 2);
  const draggingRef = useRef(false);
  const keysRef = useRef({ left: false, right: false });
  const caughtRef = useRef(0);
  const missesRef = useRef(0);
  const comboRef = useRef(0);
  const bounceRef = useRef(0);
  const flashRef = useRef(0); // brief gold flash on the squirrel after a golden catch

  const [status, setStatus] = useState<Status>('ready');
  const [caught, setCaught] = useState(0);
  const [misses, setMisses] = useState(0);
  const [combo, setCombo] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [streak, setStreak] = useState(0);

  const resetRun = useCallback(() => {
    harvestRef.current = createHarvest(seed);
    totalAcornsRef.current = countAcorns(harvestRef.current);
    indexRef.current = 0;
    itemYRef.current = SPAWN_Y;
    itemElapsedRef.current = 0;
    pauseRef.current = 0;
    basketXRef.current = CANVAS_WIDTH / 2;
    targetXRef.current = CANVAS_WIDTH / 2;
    caughtRef.current = 0;
    missesRef.current = 0;
    comboRef.current = 0;
    finishedRef.current = false;
    setCaught(0);
    setMisses(0);
    setCombo(0);
    setShowResult(false);
    statusRef.current = 'ready';
    setStatus('ready');
  }, [seed]);

  const startIfReady = useCallback(() => {
    if (statusRef.current === 'won' || statusRef.current === 'lost') {
      resetRun();
      return;
    }
    if (statusRef.current === 'ready') {
      statusRef.current = 'playing';
      setStatus('playing');
    }
  }, [resetRun]);

  const toCanvasX = useCallback((clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return CANVAS_WIDTH / 2;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    return (clientX - rect.left) * scaleX;
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      startIfReady();
      draggingRef.current = true;
      targetXRef.current = toCanvasX(e.clientX);
    },
    [startIfReady, toCanvasX]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return;
      targetXRef.current = toCanvasX(e.clientX);
    },
    [toCanvasX]
  );

  const onPointerUp = useCallback(() => {
    draggingRef.current = false;
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.code === 'ArrowLeft') {
        e.preventDefault();
        keysRef.current.left = true;
        startIfReady();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        keysRef.current.right = true;
        startIfReady();
      } else if (e.code === 'Space') {
        e.preventDefault();
        startIfReady();
      }
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.code === 'ArrowLeft') keysRef.current.left = false;
      if (e.code === 'ArrowRight') keysRef.current.right = false;
    }
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [startIfReady]);

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

    const BASKET_KEY_SPEED_LOCAL = 340;

    function finish(won: boolean) {
      if (finishedRef.current) return;
      finishedRef.current = true;
      statusRef.current = won ? 'won' : 'lost';
      setStatus(statusRef.current);
      recordResult('acorn-dash', {
        date: dateString,
        won,
        moves: caughtRef.current,
        score: caughtRef.current,
        elapsedMs: 0,
      });
      setStreak(getStreak('acorn-dash').current);
      setShowResult(true);
    }

    function drawAcorn(x: number, y: number, golden: boolean) {
      ctx.fillStyle = golden ? '#E8A93A' : '#B5651D';
      ctx.beginPath();
      ctx.ellipse(x, y + 2, ITEM_RADIUS * 0.85, ITEM_RADIUS, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = golden ? '#B9781C' : '#7A4A1E';
      ctx.beginPath();
      ctx.ellipse(x, y - ITEM_RADIUS * 0.55, ITEM_RADIUS * 0.95, ITEM_RADIUS * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      if (golden) {
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        ctx.beginPath();
        ctx.ellipse(x - 3, y + 2, 2.2, 3.2, -0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawBurr(x: number, y: number) {
      ctx.fillStyle = '#8B8B8B';
      const spikes = 10;
      ctx.beginPath();
      for (let i = 0; i < spikes; i++) {
        const a1 = (i / spikes) * Math.PI * 2;
        const a2 = ((i + 0.5) / spikes) * Math.PI * 2;
        const outer = ITEM_RADIUS * 1.35;
        const inner = ITEM_RADIUS * 0.8;
        const p1x = x + Math.cos(a1) * inner;
        const p1y = y + Math.sin(a1) * inner;
        const p2x = x + Math.cos(a2) * outer;
        const p2y = y + Math.sin(a2) * outer;
        if (i === 0) ctx.moveTo(p1x, p1y);
        else ctx.lineTo(p1x, p1y);
        ctx.lineTo(p2x, p2y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#5B5B5B';
      ctx.beginPath();
      ctx.arc(x, y, ITEM_RADIUS * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawSquirrel(x: number, y: number, squash: number, glow: number) {
      const s = 1 - squash * 0.18;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(1 / s, s);

      if (glow > 0) {
        ctx.fillStyle = `rgba(232,169,58,${0.35 * glow})`;
        ctx.beginPath();
        ctx.arc(6, -4, 42, 0, Math.PI * 2);
        ctx.fill();
      }

      // tail
      ctx.fillStyle = '#C17A3D';
      ctx.beginPath();
      ctx.ellipse(-24, -18, 20, 26, -0.4, 0, Math.PI * 2);
      ctx.fill();

      // body
      ctx.fillStyle = '#D68A46';
      ctx.beginPath();
      ctx.ellipse(0, 4, 26, 20, 0, 0, Math.PI * 2);
      ctx.fill();

      // head
      ctx.beginPath();
      ctx.arc(14, -14, 16, 0, Math.PI * 2);
      ctx.fill();

      // ears
      ctx.beginPath();
      ctx.arc(6, -27, 6, 0, Math.PI * 2);
      ctx.arc(22, -27, 6, 0, Math.PI * 2);
      ctx.fill();

      // face
      ctx.fillStyle = '#33363D';
      ctx.beginPath();
      ctx.arc(20, -15, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#F6E3C9';
      ctx.beginPath();
      ctx.ellipse(24, -8, 6, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    function draw() {
      const sky = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      sky.addColorStop(0, '#F5E3CD');
      sky.addColorStop(1, '#EFF6E4');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.fillStyle = '#DCE9CE';
      ctx.fillRect(0, BASKET_Y + 14, CANVAS_WIDTH, CANVAS_HEIGHT - BASKET_Y - 14);

      ctx.strokeStyle = 'rgba(51,54,61,0.15)';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(0, BASKET_Y);
      ctx.lineTo(CANVAS_WIDTH, BASKET_Y);
      ctx.stroke();
      ctx.setLineDash([]);

      if (statusRef.current === 'playing' && pauseRef.current <= 0 && indexRef.current < DROP_COUNT) {
        const item = harvestRef.current[indexRef.current];
        const x = currentX(item, itemElapsedRef.current);
        if (item.type === 'acorn') drawAcorn(x, itemYRef.current, item.golden);
        else drawBurr(x, itemYRef.current);
      }

      drawSquirrel(basketXRef.current, BASKET_Y + 6, Math.max(0, bounceRef.current), flashRef.current);
    }

    function frame(ts: number) {
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = Math.min((ts - lastTsRef.current) / 1000, 0.032);
      lastTsRef.current = ts;

      bounceRef.current = Math.max(0, bounceRef.current - dt * 3);
      flashRef.current = Math.max(0, flashRef.current - dt * 1.6);

      if (statusRef.current === 'playing') {
        if (draggingRef.current) {
          // targetXRef already updated by pointer handlers
        } else {
          if (keysRef.current.left) targetXRef.current -= BASKET_KEY_SPEED_LOCAL * dt;
          if (keysRef.current.right) targetXRef.current += BASKET_KEY_SPEED_LOCAL * dt;
        }
        basketXRef.current = stepBasket(basketXRef.current, targetXRef.current, dt);

        if (pauseRef.current > 0) {
          pauseRef.current -= dt * 1000;
        } else if (indexRef.current < DROP_COUNT) {
          const item = harvestRef.current[indexRef.current];
          itemElapsedRef.current += dt;
          const prevY = itemYRef.current;
          const nextY = prevY + item.speed * dt;
          itemYRef.current = nextY;

          if (hasCrossedLine(prevY, nextY)) {
            const x = currentX(item, itemElapsedRef.current);
            const outcome = resolveCrossing(item, x, basketXRef.current);

            if (outcome === 'caught-acorn' || outcome === 'caught-golden') {
              caughtRef.current += 1;
              setCaught(caughtRef.current);
              comboRef.current += 1;
              setCombo(comboRef.current);
              bounceRef.current = 1;
              if (outcome === 'caught-golden') {
                missesRef.current = Math.max(0, missesRef.current - 1);
                setMisses(missesRef.current);
                flashRef.current = 1;
              }
            } else if (outcome === 'caught-burr' || outcome === 'missed-acorn') {
              missesRef.current += 1;
              setMisses(missesRef.current);
              comboRef.current = 0;
              setCombo(0);
            }

            indexRef.current += 1;
            itemYRef.current = SPAWN_Y;
            itemElapsedRef.current = 0;
            pauseRef.current = RESPAWN_PAUSE_MS;

            if (missesRef.current > MISS_BUDGET) {
              finish(false);
            } else if (indexRef.current >= DROP_COUNT) {
              finish(true);
            }
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
      <GameHeader
        game={game}
        puzzleNumber={puzzleNumber}
        movesUsed={caught}
        movesLimit={totalAcornsRef.current}
      />

      <div
        className="relative mb-5 border-2 border-graphite dark:border-white/80 overflow-hidden touch-none select-none mx-auto"
        style={{ maxWidth: CANVAS_WIDTH }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', display: 'block' }} />
        {status === 'ready' && (
          <div className="absolute inset-0 flex items-center justify-center bg-graphite/40 pointer-events-none">
            <p className="stat-line text-white bg-graphite/80 px-3 py-2">Drag to move, catch the acorns</p>
          </div>
        )}
        {combo >= 3 && status === 'playing' && (
          <div className="absolute top-2 right-2 stat-line bg-acorn text-white px-2 py-1 rounded-tag pointer-events-none">
            combo ×{combo}
          </div>
        )}
      </div>

      <div className="stat-line text-ink/50 dark:text-white/40 text-center mb-3">
        drag / arrow keys to move · caught {caught}/{totalAcornsRef.current} · misses {misses}/{MISS_BUDGET}
        {combo >= 3 ? ` · combo \u00d7${combo}` : ''}
      </div>
      <div className="stat-line text-ink/40 dark:text-white/30 text-center mb-3">
        gold acorns forgive a miss · burrs sway as they fall, so watch the drift
      </div>

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug="acorn-dash"
        gameName="Acorn Dash"
        puzzleNumber={puzzleNumber}
        won={status === 'won'}
        moves={caught}
        movesLimit={totalAcornsRef.current}
        score={caught}
        streak={streak}
      />
    </div>
  );
}
