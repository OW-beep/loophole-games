'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createBlocks,
  createBlobAtAnchor,
  launchFromDrag,
  stepBlob,
  resolveBlockCollision,
  isSettled,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  GROUND_Y,
  BLOB_RADIUS,
  ANCHOR,
  LAUNCH_BUDGET,
  type Block,
  type BlobBody,
} from '@/lib/games/blobble';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { GAMES } from '@/lib/games/registry';

type Status = 'ready' | 'flying' | 'won' | 'lost';

export function BlobbleBoard({
  seed,
  dateString,
  puzzleNumber,
}: {
  seed: number;
  dateString: string;
  puzzleNumber: number;
}) {
  const game = GAMES.find((g) => g.slug === 'blobble')!;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number>(0);
  const statusRef = useRef<Status>('ready');

  const blocksRef = useRef<Block[]>(createBlocks(seed));
  const bodyRef = useRef<BlobBody>(createBlobAtAnchor());
  const launchesRef = useRef(0);
  const clearedRef = useRef(0);
  const finishedRef = useRef(false);
  const draggingRef = useRef(false);
  const dragPointRef = useRef({ x: ANCHOR.x, y: ANCHOR.y });

  const [status, setStatus] = useState<Status>('ready');
  const [launchesUsed, setLaunchesUsed] = useState(0);
  const [cleared, setCleared] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [streak, setStreak] = useState(0);

  const resetRun = useCallback(() => {
    blocksRef.current = createBlocks(seed);
    bodyRef.current = createBlobAtAnchor();
    launchesRef.current = 0;
    clearedRef.current = 0;
    finishedRef.current = false;
    draggingRef.current = false;
    setLaunchesUsed(0);
    setCleared(0);
    setShowResult(false);
    statusRef.current = 'ready';
    setStatus('ready');
  }, [seed]);

  const toCanvasPoint = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (statusRef.current === 'won' || statusRef.current === 'lost') {
        resetRun();
        return;
      }
      if (statusRef.current !== 'ready') return;
      draggingRef.current = true;
      dragPointRef.current = toCanvasPoint(e.clientX, e.clientY);
    },
    [resetRun, toCanvasPoint]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return;
      dragPointRef.current = toCanvasPoint(e.clientX, e.clientY);
    },
    [toCanvasPoint]
  );

  const onPointerUp = useCallback(() => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    const dx = dragPointRef.current.x - ANCHOR.x;
    const dy = dragPointRef.current.y - ANCHOR.y;
    if (Math.hypot(dx, dy) < 8) return; // too small a pull to count as a launch
    bodyRef.current = launchFromDrag(dx, dy);
    statusRef.current = 'flying';
    setStatus('flying');
  }, []);

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
      recordResult('blobble', {
        date: dateString,
        won,
        moves: launchesRef.current,
        score: clearedRef.current,
        elapsedMs: 0,
      });
      setStreak(getStreak('blobble').current);
      setShowResult(true);
    }

    function drawRoundedRect(x: number, y: number, w: number, h: number, r: number) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
      ctx.fill();
    }

    function drawBlob(x: number, y: number) {
      ctx.fillStyle = '#2FA7B8';
      ctx.beginPath();
      ctx.arc(x, y, BLOB_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#F6FDFE';
      ctx.beginPath();
      ctx.ellipse(x - BLOB_RADIUS * 0.32, y - BLOB_RADIUS * 0.15, 2.6, 3.4, 0, 0, Math.PI * 2);
      ctx.ellipse(x + BLOB_RADIUS * 0.32, y - BLOB_RADIUS * 0.15, 2.6, 3.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1B1D22';
      ctx.beginPath();
      ctx.arc(x - BLOB_RADIUS * 0.32, y - BLOB_RADIUS * 0.1, 1.4, 0, Math.PI * 2);
      ctx.arc(x + BLOB_RADIUS * 0.32, y - BLOB_RADIUS * 0.1, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }

    function draw() {
      const sky = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      sky.addColorStop(0, '#E9F8FA');
      sky.addColorStop(1, '#F6F7F4');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.fillStyle = '#CFE9EC';
      ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);

      for (const block of blocksRef.current) {
        if (block.cleared) continue;
        ctx.fillStyle = '#2FA7B8';
        drawRoundedRect(block.x - block.w / 2, block.y - block.h / 2, block.w, block.h, 6);
      }

      if (draggingRef.current) {
        ctx.strokeStyle = '#7A3DB8';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(ANCHOR.x, ANCHOR.y);
        ctx.lineTo(dragPointRef.current.x, dragPointRef.current.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      const b = bodyRef.current;
      const drawX = draggingRef.current ? dragPointRef.current.x : b.x;
      const drawY = draggingRef.current ? dragPointRef.current.y : b.y;
      drawBlob(drawX, drawY);
    }

    function frame(ts: number) {
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = Math.min((ts - lastTsRef.current) / 1000, 0.032);
      lastTsRef.current = ts;

      if (statusRef.current === 'flying') {
        let body = stepBlob(bodyRef.current, dt);
        for (const block of blocksRef.current) {
          const result = resolveBlockCollision(body, block);
          body = result.body;
          if (result.cleared) {
            block.cleared = true;
            clearedRef.current += 1;
            setCleared(clearedRef.current);
          }
        }
        bodyRef.current = body;

        if (isSettled(body)) {
          launchesRef.current += 1;
          setLaunchesUsed(launchesRef.current);
          if (clearedRef.current >= blocksRef.current.length) {
            finish(true);
          } else if (launchesRef.current >= LAUNCH_BUDGET) {
            finish(false);
          } else {
            bodyRef.current = createBlobAtAnchor();
            statusRef.current = 'ready';
            setStatus('ready');
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
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={launchesUsed} movesLimit={LAUNCH_BUDGET} />

      <div
        className="relative mb-5 border-2 border-graphite dark:border-white/80 overflow-hidden touch-none select-none mx-auto"
        style={{ maxWidth: CANVAS_WIDTH }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', display: 'block' }} />
        {status === 'ready' && launchesUsed === 0 && !draggingRef.current && (
          <div className="absolute inset-0 flex items-center justify-center bg-graphite/40 pointer-events-none">
            <p className="stat-line text-white bg-graphite/80 px-3 py-2">Drag back from the blob and release</p>
          </div>
        )}
      </div>

      <div className="stat-line text-ink/50 dark:text-white/40 text-center mb-3">
        cleared {cleared}/{blocksRef.current.length} blocks · {LAUNCH_BUDGET - launchesUsed} launches left
      </div>

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug="blobble"
        gameName="Blobble"
        puzzleNumber={puzzleNumber}
        won={status === 'won'}
        moves={launchesUsed}
        movesLimit={LAUNCH_BUDGET}
        score={cleared}
        streak={streak}
      />
    </div>
  );
}
