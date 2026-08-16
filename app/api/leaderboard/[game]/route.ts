// app/api/leaderboard/[game]/route.ts
//
// Generic leaderboard endpoint, shared by every game on the site.
// Each game gets two Redis sorted sets:
//   leaderboard:<game>       — "current" — live snapshot, overwritten on
//                               every submit. For Coin Mode this tracks
//                               your wallet balance right now, so it can
//                               go down after a loss same as a real
//                               balance would.
//                               (key: leaderboard:<game>)
//   leaderboard:<game>:best  — "best" — only ever moves up. Written with
//                               Redis's ZADD GT flag, so a lower submit is
//                               silently ignored and a name's entry only
//                               updates when it beats their own record.
//
// GET  /api/leaderboard/world-data-duel              -> top 20 current { name, score }
// GET  /api/leaderboard/world-data-duel?mode=best     -> top 20 all-time-best { name, score }
// POST /api/leaderboard/world-data-duel               -> body: { name, score } — updates BOTH boards
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

export async function GET(req: NextRequest, context: { params: Promise<{ game: string }> }) {
  const { game } = await context.params;
  const mode = req.nextUrl.searchParams.get('mode') === 'best' ? 'best' : 'current';
  const key = mode === 'best' ? `leaderboard:${game}:best` : `leaderboard:${game}`;

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

  const currentKey = `leaderboard:${game}`;
  const bestKey = `leaderboard:${game}:best`;
  try {
    const redis = await getRedis();
    await Promise.all([
      redis.zAdd(currentKey, { score: numericScore, value: cleanName }),
      // GT: only write if numericScore is greater than the member's existing
      // score (or the member doesn't exist yet) — a losing round's lower
      // balance never overwrites a previously-reached personal best.
      redis.zAdd(bestKey, { score: numericScore, value: cleanName }, { GT: true }),
    ]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('leaderboard POST failed', err);
    // Best-effort: a failed leaderboard write should never break the game itself.
    return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 200 });
  }
}
