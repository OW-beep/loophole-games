// lib/leaderboard-client.ts
//
// Shared, game-agnostic helper. Any game can call submitScore(slug, name, n)
// and fetchLeaderboard(slug) — this is intentionally generic so wiring up
// the other 23 games later is a couple of lines each, not a new system.

const NICKNAME_KEY = 'loophole:nickname';

export function getNickname(): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(NICKNAME_KEY) ?? '';
}

export function saveNickname(name: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(NICKNAME_KEY, name.trim().slice(0, 20));
}

export interface LeaderboardEntry {
  name: string;
  score: number;
}

/** Best-effort — a failed submit should never interrupt the game. */
export async function submitScore(game: string, name: string, score: number): Promise<void> {
  if (!name) return;
  try {
    await fetch(`/api/leaderboard/${game}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, score }),
    });
  } catch {
    // ignore — ranking is a nice-to-have, not core gameplay
  }
}

export async function fetchLeaderboard(game: string): Promise<LeaderboardEntry[]> {
  try {
    const res = await fetch(`/api/leaderboard/${game}`, { cache: 'no-store' });
    const data = await res.json();
    return Array.isArray(data.entries) ? data.entries : [];
  } catch {
    return [];
  }
}
