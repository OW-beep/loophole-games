import { createRng } from '../daily-seed';

/**
 * Blobble: pull-and-release a blob into a small set of blocks. Physics here
 * is deliberately minimal — position + velocity, gravity, and reflect-off-
 * surface bounces — no engine, same spirit as the rest of the real-time
 * games in this index.
 */

export const CANVAS_WIDTH = 360;
export const CANVAS_HEIGHT = 480;

export const GRAVITY = 1100;
export const GROUND_Y = CANVAS_HEIGHT - 24;
export const BLOB_RADIUS = 16;
export const RESTITUTION = 0.55;
export const GROUND_FRICTION = 0.985; // per-frame-ish horizontal damping while rolling on the floor
export const REST_SPEED = 26;         // px/s below which a grounded blob counts as "stopped"
export const MAX_LAUNCH_SPEED = 780;
export const LAUNCH_BUDGET = 6;
export const HIT_THRESHOLD = 180;     // impact speed needed to break a block instead of bouncing off it

export const ANCHOR = { x: 56, y: GROUND_Y - BLOB_RADIUS };

export interface Block {
  x: number;
  y: number;
  w: number;
  h: number;
  cleared: boolean;
}

const BLOCK_W = 40;
const BLOCK_H = 34;

/** Deterministically lays out today's blocks from the daily seed — a mix of
 * ground-level and floating targets, spaced so they don't overlap. */
export function createBlocks(seed: number): Block[] {
  const rng = createRng(seed);
  const count = 5 + Math.floor(rng() * 3); // 5–7 blocks
  const blocks: Block[] = [];
  const minX = 160;
  const maxX = CANVAS_WIDTH - 40;
  const usedX: number[] = [];

  for (let i = 0; i < count; i++) {
    let x = minX;
    let tries = 0;
    do {
      x = minX + rng() * (maxX - minX);
      tries++;
    } while (usedX.some((ux) => Math.abs(ux - x) < BLOCK_W + 8) && tries < 20);
    usedX.push(x);
    const y = GROUND_Y - BLOCK_H / 2 - rng() * 90;
    blocks.push({ x, y, w: BLOCK_W, h: BLOCK_H, cleared: false });
  }
  return blocks;
}

export interface BlobBody {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export function createBlobAtAnchor(): BlobBody {
  return { x: ANCHOR.x, y: ANCHOR.y, vx: 0, vy: 0 };
}

/** Builds a launch from a raw drag vector, clamped to a max speed so no
 * drag distance can send the blob off at an absurd velocity. */
export function launchFromDrag(dragX: number, dragY: number): BlobBody {
  const pullSpeed = Math.hypot(dragX, dragY) * 3.4;
  const speed = Math.min(pullSpeed, MAX_LAUNCH_SPEED);
  const angle = Math.atan2(-dragY, -dragX);
  return {
    x: ANCHOR.x,
    y: ANCHOR.y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
  };
}

/** Advances the blob one physics step, bouncing off the floor, ceiling, and
 * side walls. */
export function stepBlob(body: BlobBody, dt: number): BlobBody {
  let { x, y, vx, vy } = body;
  vy += GRAVITY * dt;
  x += vx * dt;
  y += vy * dt;

  if (y > GROUND_Y - BLOB_RADIUS) {
    y = GROUND_Y - BLOB_RADIUS;
    vy = -vy * RESTITUTION;
    vx *= GROUND_FRICTION;
  }
  if (y < BLOB_RADIUS) {
    y = BLOB_RADIUS;
    vy = -vy * RESTITUTION;
  }
  if (x < BLOB_RADIUS) {
    x = BLOB_RADIUS;
    vx = -vx * RESTITUTION;
  }
  if (x > CANVAS_WIDTH - BLOB_RADIUS) {
    x = CANVAS_WIDTH - BLOB_RADIUS;
    vx = -vx * RESTITUTION;
  }

  return { x, y, vx, vy };
}

/** Resolves a possible collision between the blob and one block. A hit fast
 * enough to clear HIT_THRESHOLD breaks the block and the blob passes
 * straight through; anything slower just bounces the blob off its surface. */
export function resolveBlockCollision(
  body: BlobBody,
  block: Block
): { body: BlobBody; cleared: boolean; hit: boolean } {
  if (block.cleared) return { body, cleared: false, hit: false };

  const left = block.x - block.w / 2;
  const right = block.x + block.w / 2;
  const top = block.y - block.h / 2;
  const bottom = block.y + block.h / 2;
  const closestX = Math.max(left, Math.min(body.x, right));
  const closestY = Math.max(top, Math.min(body.y, bottom));
  const dx = body.x - closestX;
  const dy = body.y - closestY;
  const distSq = dx * dx + dy * dy;
  if (distSq > BLOB_RADIUS * BLOB_RADIUS) return { body, cleared: false, hit: false };

  const speed = Math.hypot(body.vx, body.vy);
  if (speed >= HIT_THRESHOLD) {
    return { body, cleared: true, hit: true };
  }

  const dist = Math.sqrt(distSq) || 0.0001;
  const nx = dx / dist;
  const ny = dy / dist;
  const overlap = BLOB_RADIUS - dist;
  const dot = body.vx * nx + body.vy * ny;
  const newBody: BlobBody = {
    x: body.x + nx * overlap,
    y: body.y + ny * overlap,
    vx: (body.vx - 2 * dot * nx) * RESTITUTION,
    vy: (body.vy - 2 * dot * ny) * RESTITUTION,
  };
  return { body: newBody, cleared: false, hit: true };
}

/** A launch is "spent" once the blob comes to rest on the ground or drifts
 * to a near-standstill — either way, it's time to reset for the next shot. */
export function isSettled(body: BlobBody): boolean {
  const onGround = body.y >= GROUND_Y - BLOB_RADIUS - 1;
  const slow = Math.hypot(body.vx, body.vy) < REST_SPEED;
  return onGround && slow;
}
