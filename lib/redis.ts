// lib/redis.ts
//
// Shared Redis client for cross-game leaderboards, backed by Vercel's
// Redis (Upstash-hosted, TCP protocol via REDIS_URL — the "redis" npm
// package, not the Upstash REST SDK).
//
// Setup (one-time, in the Vercel dashboard):
//   1. Project → Storage tab → Create Database → Redis. Free tier is
//      plenty for a leaderboard.
//   2. Click "Connect to Project" so Vercel injects REDIS_URL into your
//      project's environment variables automatically.
//   3. For local development: `vercel env pull .env.local` (Vercel CLI),
//      or copy REDIS_URL from the dashboard's ".env.local" tab yourself.
//
// Serverless functions can get a fresh cold start per request, so this
// caches one connected client per warm instance (on `globalThis`) instead
// of opening a new TCP connection every time — the same pattern commonly
// used for Prisma/DB clients in Next.js.

import { createClient, type RedisClientType } from 'redis';

declare global {
  // eslint-disable-next-line no-var
  var __redisClient: RedisClientType | undefined;
  // eslint-disable-next-line no-var
  var __redisConnectPromise: Promise<RedisClientType> | undefined;
}

export async function getRedis(): Promise<RedisClientType> {
  if (globalThis.__redisClient?.isOpen) {
    return globalThis.__redisClient;
  }

  if (!globalThis.__redisConnectPromise) {
    const client = createClient({ url: process.env.REDIS_URL }) as RedisClientType;
    client.on('error', (err) => console.error('Redis client error', err));

    globalThis.__redisConnectPromise = client
      .connect()
      .then(() => {
        globalThis.__redisClient = client;
        return client;
      })
      .catch((err) => {
        // Reset so the next call can retry instead of reusing a rejected promise forever.
        globalThis.__redisConnectPromise = undefined;
        throw err;
      });
  }

  return globalThis.__redisConnectPromise;
}
