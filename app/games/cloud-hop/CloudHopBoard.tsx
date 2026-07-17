'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createClouds,
  cloudX,
  isOverlappingCloud,
  stepBunnyX,
  wrapX,
  screenYForHeight,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  GRAVITY,
  BOUNCE_VELOCITY,
  BOOST_MULTIPLIER,
  CLOUD_COUNT,
  CLOUD_HALF_WIDTH,
  BUNNY_RADIUS,
  BUNNY_KEY_SPEED,
  type Cloud,
} from '@/lib/games/cloud-hop';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { GAMES } from '@/lib/games/registry';

type Status = 'ready' | 'playing' | 'won' | 'lost';

const TOTAL_CLIMBS = CLOUD_COUNT - 1;

export function CloudHopBoard({
  seed,
  dateString,
  puzzleNumber,
}: {
  seed: number;
  dateString: string;
  puzzleNumber: number;
}) {
  const game = GAMES.find((g) => g.slug === 'cloud-hop')!;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number>(0);
  const statusRef = useRef<Status>('ready');
  const finishedRef = useRef(false);

  const cloudsRef = useRef<Cloud[]>(createClouds(seed));
  const indexRef = useRef(1);
  const climbedRef = useRef(0);
  const heightRef = useRef(0);
  const vyRef = useRef(0);
  const maxHeightRef = useRef(0);
  const timeRef = useRef(0);
  const boostNextRef = useRef(false);
  const bunnyXRef = useRef(CANVAS_WIDTH / 2);
  const targetXRef = useRef(CANVAS_WIDTH / 2);
  const draggingRef = useRef(false);
  const keysRef = useRef({ left: false, right: false });
  const bounceRef = useRef(0);
  const flashRef = useRef(0);

  const [status, setStatus] = useState<Status>('ready');
  const [climbed, setClimbed] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [streak, setStreak] = useState(0);

  const resetRun = useCallback(() => {
    cloudsRef.current = createClouds(seed);
    indexRef.current = 1;
    climbedRef.current = 0;
    heightRef.current = 0;
    vyRef.current = 0;
    maxHeightRef.current = 0;
    timeRef.current = 0;
    boostNextRef.current = false;
    bunnyXRef.current = CANVAS_WIDTH / 2;
    targetXRef.current = CANVAS_WIDTH / 2;
    finishedRef.current = false;
    setClimbed(0);
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
      vyRef.current = BOUNCE_VELOCITY;
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

    function finish(won: boolean) {
      if (finishedRef.current) return;
      finishedRef.current = true;
      statusRef.current = won ? 'won' : 'lost';
      setStatus(statusRef.current);
      recordResult('cloud-hop', {
        date: dateString,
        won,
        moves: climbedRef.current,
        score: climbedRef.current,
        elapsedMs: 0,
      });
      setStreak(getStreak('cloud-hop').current);
      setShowResult(true);
    }

    function drawCloud(x: number, y: number, cloud: Cloud) {
      const w = CLOUD_HALF_WIDTH;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(x, y, w, 14, 0, 0, Math.PI * 2);
      ctx.ellipse(x - w * 0.45, y - 4, w * 0.55, 12, 0, 0, Math.PI * 2);
      ctx.ellipse(x + w * 0.45, y - 4, w * 0.55, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(51,54,61,0.18)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (cloud.type === 'rainbow') {
        const stripes = ['#E85E7A', '#F0A93A', '#5FA344', '#5B9BD1', '#8A5CF6'];
        stripes.forEach((c, i) => {
          ctx.strokeStyle = c;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x, y + 6, w * 0.6 - i * 4, Math.PI * 1.15, Math.PI * 1.85);
          ctx.stroke();
        });
      } else if (cloud.type === 'moving') {
        ctx.strokeStyle = 'rgba(91,155,209,0.55)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - w * 0.7, y + 12);
        ctx.lineTo(x - w * 0.3, y + 12);
        ctx.moveTo(x + w * 0.3, y + 12);
        ctx.lineTo(x + w * 0.7, y + 12);
        ctx.stroke();
      }
    }

    function drawBunny(x: number, y: number, vy: number, squash: number) {
      const stretch = Math.max(-0.25, Math.min(0.3, -vy / 1400));
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(1 - squash * 0.16, 1 + squash * 0.16 - stretch * 0.3 + stretch);

      // ears
      ctx.fillStyle = '#FBEFE3';
      ctx.beginPath();
      ctx.ellipse(-7, -26, 5, 16, -0.15, 0, Math.PI * 2);
      ctx.ellipse(7, -26, 5, 16, 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#F0A9BE';
      ctx.beginPath();
      ctx.ellipse(-7, -24, 2.4, 10, -0.15, 0, Math.PI * 2);
      ctx.ellipse(7, -24, 2.4, 10, 0.15, 0, Math.PI * 2);
      ctx.fill();

      // body
      ctx.fillStyle = '#FBEFE3';
      ctx.beginPath();
      ctx.ellipse(0, 2, 17, 15, 0, 0, Math.PI * 2);
      ctx.fill();

      // face
      ctx.fillStyle = '#33363D';
      ctx.beginPath();
      ctx.arc(-5, -2, 2, 0, Math.PI * 2);
      ctx.arc(5, -2, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#F0A9BE';
      ctx.beginPath();
      ctx.ellipse(0, 5, 3, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    function draw() {
      const sky = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      sky.addColorStop(0, '#E4F0FA');
      sky.addColorStop(1, '#F6F7F4');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const clouds = cloudsRef.current;
      const from = Math.max(0, indexRef.current - 2);
      const to = Math.min(clouds.length - 1, indexRef.current + 3);
      for (let i = from; i <= to; i++) {
        const cloud = clouds[i];
        const y = screenYForHeight(cloud.height, maxHeightRef.current);
        if (y < -60 || y > CANVAS_HEIGHT + 60) continue;
        const x = cloudX(cloud, timeRef.current);
        drawCloud(x, y, cloud);
      }

      const bunnyScreenY = screenYForHeight(heightRef.current, maxHeightRef.current);
      drawBunny(bunnyXRef.current, bunnyScreenY, vyRef.current, Math.max(0, bounceRef.current));

      if (flashRef.current > 0) {
        ctx.fillStyle = `rgba(255,255,255,${0.5 * flashRef.current})`;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }
    }

    function frame(ts: number) {
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = Math.min((ts - lastTsRef.current) / 1000, 0.032);
      lastTsRef.current = ts;

      bounceRef.current = Math.max(0, bounceRef.current - dt * 3);
      flashRef.current = Math.max(0, flashRef.current - dt * 2.4);

      if (statusRef.current === 'playing') {
        if (draggingRef.current) {
          // targetXRef already updated by pointer handlers
        } else {
          if (keysRef.current.left) targetXRef.current -= BUNNY_KEY_SPEED * dt;
          if (keysRef.current.right) targetXRef.current += BUNNY_KEY_SPEED * dt;
        }
        bunnyXRef.current = wrapX(stepBunnyX(bunnyXRef.current, targetXRef.current, dt));
        targetXRef.current = wrapX(targetXRef.current);

        timeRef.current += dt;
        const prevHeight = heightRef.current;
        vyRef.current -= GRAVITY * dt;
        heightRef.current += vyRef.current * dt;
        maxHeightRef.current = Math.max(maxHeightRef.current, heightRef.current);

        if (vyRef.current < 0 && indexRef.current < CLOUD_COUNT) {
          const target = cloudsRef.current[indexRef.current];
          if (prevHeight > target.height && heightRef.current <= target.height) {
            const tx = cloudX(target, timeRef.current);
            if (isOverlappingCloud(bunnyXRef.current, tx)) {
              vyRef.current = boostNextRef.current ? BOUNCE_VELOCITY * BOOST_MULTIPLIER : BOUNCE_VELOCITY;
              boostNextRef.current = target.type === 'rainbow';
              heightRef.current = target.height;
              bounceRef.current = 1;
              if (target.type === 'rainbow') flashRef.current = 1;
              climbedRef.current += 1;
              setClimbed(climbedRef.current);
              indexRef.current += 1;
              if (indexRef.current >= CLOUD_COUNT) {
                finish(true);
              }
            }
          }
        }

        const screenY = screenYForHeight(heightRef.current, maxHeightRef.current);
        if (screenY > CANVAS_HEIGHT + BUNNY_RADIUS * 3) {
          finish(false);
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
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={climbed} movesLimit={TOTAL_CLIMBS} />

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
            <p className="stat-line text-white bg-graphite/80 px-3 py-2">Drag to steer, it bounces on its own</p>
          </div>
        )}
      </div>

      <div className="stat-line text-ink/50 dark:text-white/40 text-center mb-3">
        drag / arrow keys to steer · climbed {climbed}/{TOTAL_CLIMBS}
      </div>
      <div className="stat-line text-ink/40 dark:text-white/30 text-center mb-3">
        rainbow clouds boost the next bounce · edges wrap around
      </div>

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug="cloud-hop"
        gameName="Cloud Hop"
        puzzleNumber={puzzleNumber}
        won={status === 'won'}
        moves={climbed}
        movesLimit={TOTAL_CLIMBS}
        score={climbed}
        streak={streak}
      />
    </div>
  );
}
