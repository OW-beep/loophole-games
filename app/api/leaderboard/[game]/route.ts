// app/api/leaderboard/[game]/route.ts
//
// Generic leaderboard endpoint, shared by every game on the site.
// Each game gets its own Redis sorted set (key: leaderboard:<game>), so
// wiring up a new game later is just: POST/GET this same route with a
// different `game` slug and whatever number that game wants to rank by
// (coins, time, moves, streak — the route doesn't care).
//
// GET  /api/leaderboard/world-data-duel        -> top 20 { name, score }
// POST /api/leaderboard/world-data-duel        -> body: { name, score }
//
// Uses the standard Node.js runtime (not Edge) since the Redis client
// needs a raw TCP socket.

import { NextRequest, NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';

const TOP_N = 20;
const MAX_NAME_LENGTH = 20;

function sanitizeName(raw: string): string {
  const cleaned = raw
    .trim()
    .slice(0, MAX_NAME_LENGTH)
    .replace(/[^\p{L}\p{N}\s_-]/gu, '');
  return cleaned.length > 0 ? cleaned : 'Anonymous';
}

export async function GET(_req: NextRequest, context: { params: Promise<{ game: string }> }) {
  const { game } = await context.params;
  const key = `leaderboard:${game}`;

  try {
    const redis = await getRedis();
    // Highest score first: index range 0..N-1 with REV reverses sort order.
    const raw = await redis.zRangeWithScores(key, 0, TOP_N - 1, { REV: true });
    const entries = raw.map((r) => ({ name: r.value, score: r.score }));
    return NextResponse.json({ entries });
  } catch (err) {
    console.error('leaderboard GET failed', err);
    return NextResponse.json({ entries: [], error: 'unavailable' }, { status: 200 });
  }
}

export async function POST(req: NextRequest, context: { params: Promise<{ game: string }> }) {
  const { game } = await context.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }

  const { name, score } = (body ?? {}) as { name?: unknown; score?: unknown };
  const cleanName = sanitizeName(typeof name === 'string' ? name : '');
  const numericScore = Number(score);

  if (!Number.isFinite(numericScore)) {
    return NextResponse.json({ error: 'score must be a number' }, { status: 400 });
  }

  const key = `leaderboard:${game}`;
  try {
    const redis = await getRedis();
    await redis.zAdd(key, { score: numericScore, value: cleanName });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('leaderboard POST failed', err);
    // Best-effort: a failed leaderboard write should never break the game itself.
    return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 200 });
  }
}
