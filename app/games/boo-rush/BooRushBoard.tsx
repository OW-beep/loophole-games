'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createCourse,
  createInitialBody,
  stepPhysics,
  checkGroundHit,
  checkGateCollision,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  GHOST_X,
  GHOST_RADIUS,
  GATE_WIDTH,
  SCROLL_SPEED,
  COURSE_LENGTH,
  type Gate,
} from '@/lib/games/boo-rush';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { GAMES } from '@/lib/games/registry';

type Status = 'ready' | 'playing' | 'won' | 'lost';

export function BooRushBoard({
  seed,
  dateString,
  puzzleNumber,
}: {
  seed: number;
  dateString: string;
  puzzleNumber: number;
}) {
  const game = GAMES.find((g) => g.slug === 'boo-rush')!;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number>(0);
  const flapRef = useRef(false);
  const statusRef = useRef<Status>('ready');

  const gatesRef = useRef<Gate[]>(createCourse(seed));
  const scrollRef = useRef(0);
  const bodyRef = useRef(createInitialBody());
  const clearedRef = useRef(0);
  const finishedRef = useRef(false);

  const [status, setStatus] = useState<Status>('ready');
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [streak, setStreak] = useState(0);

  const resetRun = useCallback(() => {
    gatesRef.current = createCourse(seed);
    scrollRef.current = 0;
    bodyRef.current = createInitialBody();
    clearedRef.current = 0;
    finishedRef.current = false;
    lastTsRef.current = 0;
    setScore(0);
    setShowResult(false);
    statusRef.current = 'ready';
    setStatus('ready');
  }, [seed]);

  const startOrFlap = useCallback(() => {
    if (statusRef.current === 'won' || statusRef.current === 'lost') {
      resetRun();
      return;
    }
    if (statusRef.current === 'ready') {
      statusRef.current = 'playing';
      setStatus('playing');
    }
    flapRef.current = true;
  }, [resetRun]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        startOrFlap();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [startOrFlap]);

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
      setScore(clearedRef.current);
      recordResult('boo-rush', {
        date: dateString,
        won,
        moves: clearedRef.current,
        score: clearedRef.current,
        elapsedMs: 0,
      });
      setStreak(getStreak('boo-rush').current);
      setShowResult(true);
    }

    function drawRoundedRect(x: number, y: number, w: number, h: number, r: number) {
      if (h <= 0) return;
      const rad = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + rad, y);
      ctx.arcTo(x + w, y, x + w, y + h, rad);
      ctx.arcTo(x + w, y + h, x, y + h, rad);
      ctx.arcTo(x, y + h, x, y, rad);
      ctx.arcTo(x, y, x + w, y, rad);
      ctx.closePath();
      ctx.fill();
    }

    function drawGhost(x: number, y: number, vy: number) {
      const tilt = Math.max(-0.35, Math.min(0.55, vy / 900));
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(tilt);

      // wavy-bottomed ghost body
      const r = GHOST_RADIUS;
      ctx.fillStyle = '#F6F1FF';
      ctx.strokeStyle = '#5C2E8C';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -2, r, Math.PI, 0, false);
      ctx.lineTo(r, r * 0.7);
      for (let i = 0; i < 3; i++) {
        const wx = r - (i * (2 * r)) / 3 - r / 3;
        ctx.quadraticCurveTo(wx, r * 1.05, wx - r / 3, r * 0.7);
      }
      ctx.lineTo(-r, r * 0.7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // eyes + blush
      ctx.fillStyle = '#33363D';
      ctx.beginPath();
      ctx.ellipse(-r * 0.32, -r * 0.15, 2.6, 3.4, 0, 0, Math.PI * 2);
      ctx.ellipse(r * 0.32, -r * 0.15, 2.6, 3.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(199,76,148,0.45)';
      ctx.beginPath();
      ctx.ellipse(-r * 0.62, r * 0.05, 2.8, 1.8, 0, 0, Math.PI * 2);
      ctx.ellipse(r * 0.62, r * 0.05, 2.8, 1.8, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    function draw() {
      const sky = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      sky.addColorStop(0, '#EAF2FF');
      sky.addColorStop(1, '#F6F1FF');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.fillStyle = '#DCC9F0';
      ctx.fillRect(0, CANVAS_HEIGHT - 6, CANVAS_WIDTH, 6);

      for (const gate of gatesRef.current) {
        const screenX = gate.x - scrollRef.current;
        if (screenX < -GATE_WIDTH || screenX > CANVAS_WIDTH + GATE_WIDTH) continue;
        const left = screenX - GATE_WIDTH / 2;
        ctx.fillStyle = gate.cleared ? '#C9A9E8' : '#7A3DB8';
        drawRoundedRect(left, 0, GATE_WIDTH, gate.gapTop, 8);
        drawRoundedRect(left, gate.gapBottom, GATE_WIDTH, CANVAS_HEIGHT - gate.gapBottom, 8);
      }

      drawGhost(GHOST_X, bodyRef.current.y, bodyRef.current.vy);
    }

    function frame(ts: number) {
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = Math.min((ts - lastTsRef.current) / 1000, 0.032);
      lastTsRef.current = ts;

      if (statusRef.current === 'playing') {
        const flapping = flapRef.current;
        flapRef.current = false;
        bodyRef.current = stepPhysics(bodyRef.current, dt, flapping);
        scrollRef.current += SCROLL_SPEED * dt;

        if (checkGroundHit(bodyRef.current.y)) {
          finish(false);
        } else {
          for (const gate of gatesRef.current) {
            const screenX = gate.x - scrollRef.current;
            if (!gate.cleared && screenX + GATE_WIDTH / 2 < GHOST_X) {
              gate.cleared = true;
              clearedRef.current += 1;
              setScore(clearedRef.current);
              if (clearedRef.current >= COURSE_LENGTH) finish(true);
            }
            if (checkGateCollision(bodyRef.current.y, screenX, gate)) {
              finish(false);
              break;
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
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={score} movesLimit={COURSE_LENGTH} />

      <div
        className="relative mb-5 border-2 border-graphite dark:border-white/80 overflow-hidden touch-none select-none mx-auto"
        style={{ maxWidth: CANVAS_WIDTH }}
        onPointerDown={(e) => {
          e.preventDefault();
          startOrFlap();
        }}
      >
        <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', display: 'block' }} />
        {status === 'ready' && (
          <div className="absolute inset-0 flex items-center justify-center bg-graphite/40 pointer-events-none">
            <p className="stat-line text-white bg-graphite/80 px-3 py-2">Tap or press Space to fly</p>
          </div>
        )}
      </div>

      <div className="stat-line text-ink/50 dark:text-white/40 text-center mb-3">
        tap / click / space to flap · clear all {COURSE_LENGTH} gates without touching them
      </div>

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug="boo-rush"
        gameName="Boo Rush"
        puzzleNumber={puzzleNumber}
        won={status === 'won'}
        moves={score}
        movesLimit={COURSE_LENGTH}
        score={score}
        streak={streak}
      />
    </div>
  );
}
