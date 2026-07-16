import { createRng } from '../daily-seed';

/**
 * Boo Rush is the index's one real-time entry: a single-input flap game
 * where a ghost flies through a fixed sequence of gates. Everything here is
 * plain, dependency-free math — no physics library, just gravity and a
 * velocity integrator — so it stays consistent with the rest of the repo.
 */

export const CANVAS_WIDTH = 360;
export const CANVAS_HEIGHT = 480;

export const GHOST_X = 96;          // fixed screen x of the ghost
export const GHOST_RADIUS = 15;

export const GRAVITY = 1500;        // px / s^2
export const FLAP_VELOCITY = -430;  // px / s, applied instantly on flap
export const MAX_FALL_SPEED = 620;  // px / s terminal velocity

export const SCROLL_SPEED = 150;    // px / s, world scrolls left at this rate

export const GATE_WIDTH = 46;
export const GATE_SPACING = 210;    // world-x distance between gate centers
export const GAP_HEIGHT = 150;      // vertical opening a gate leaves
export const EDGE_MARGIN = 44;      // min distance from gap edge to top/bottom
export const MAX_GAP_SHIFT = 105;   // how far consecutive gaps can move, so the course stays flyable

export const COURSE_LENGTH = 20;    // gates in a full daily run
export const START_OFFSET = 460;    // world-x of the first gate (gives the player runway before it)

export interface Gate {
  x: number;         // world x of the gate's center line
  gapTop: number;    // y of the top edge of the gap
  gapBottom: number; // y of the bottom edge of the gap
  cleared: boolean;
}

/** Deterministically builds today's course from the daily seed. Every gap is
 * reachable from the previous one because consecutive centers are clamped to
 * within MAX_GAP_SHIFT of each other. */
export function createCourse(seed: number): Gate[] {
  const rng = createRng(seed);
  const gates: Gate[] = [];
  const minCenter = EDGE_MARGIN + GAP_HEIGHT / 2;
  const maxCenter = CANVAS_HEIGHT - EDGE_MARGIN - GAP_HEIGHT / 2;
  let prevCenter = CANVAS_HEIGHT / 2;

  for (let i = 0; i < COURSE_LENGTH; i++) {
    const low = Math.max(minCenter, prevCenter - MAX_GAP_SHIFT);
    const high = Math.min(maxCenter, prevCenter + MAX_GAP_SHIFT);
    const center = low + rng() * (high - low);
    gates.push({
      x: START_OFFSET + i * GATE_SPACING,
      gapTop: center - GAP_HEIGHT / 2,
      gapBottom: center + GAP_HEIGHT / 2,
      cleared: false,
    });
    prevCenter = center;
  }
  return gates;
}

export interface GhostBody {
  y: number;
  vy: number;
}

export function createInitialBody(): GhostBody {
  return { y: CANVAS_HEIGHT / 2, vy: 0 };
}

/** Advances the ghost one physics step. A flap sets velocity instantly
 * (classic flappy feel); otherwise gravity accelerates the fall, capped at
 * a terminal velocity so long drops stay controllable. The ceiling is soft
 * (you're stopped, not killed) — only the ground and gates end a run. */
export function stepPhysics(body: GhostBody, dt: number, flapping: boolean): GhostBody {
  let vy = flapping ? FLAP_VELOCITY : Math.min(body.vy + GRAVITY * dt, MAX_FALL_SPEED);
  let y = body.y + vy * dt;
  if (y < GHOST_RADIUS) {
    y = GHOST_RADIUS;
    vy = 0;
  }
  return { y, vy };
}

export function checkGroundHit(y: number): boolean {
  return y + GHOST_RADIUS >= CANVAS_HEIGHT;
}

/** gateScreenX is the gate's center x already converted to screen space
 * (world x minus current scroll offset). */
export function checkGateCollision(ghostY: number, gateScreenX: number, gate: Gate): boolean {
  const left = gateScreenX - GATE_WIDTH / 2;
  const right = gateScreenX + GATE_WIDTH / 2;
  if (GHOST_X + GHOST_RADIUS < left || GHOST_X - GHOST_RADIUS > right) return false;
  return ghostY - GHOST_RADIUS < gate.gapTop || ghostY + GHOST_RADIUS > gate.gapBottom;
}
