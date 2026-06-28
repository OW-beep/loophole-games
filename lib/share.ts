export interface ShareData {
  gameName: string;
  puzzleNumber: number;
  won: boolean;
  moves: number;
  movesLimit: number;
  score?: number;
  url: string;
}

/** Appends result params to the base game URL so the unfurled link preview (OG image) reflects this specific result. */
export function buildResultUrl(baseUrl: string, data: ShareData): string {
  const params = new URLSearchParams({
    won: data.won ? '1' : '0',
    moves: String(data.moves),
    limit: String(data.movesLimit),
    puzzle: String(data.puzzleNumber),
  });
  if (data.score !== undefined) params.set('score', String(data.score));
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Builds a short, emoji-coded share string in the Wordle tradition:
 * a result line that's satisfying to paste, and gives nothing away
 * about the puzzle itself.
 */
export function buildShareText(data: ShareData): string {
  const filled = Math.min(data.moves, data.movesLimit);
  const empty = Math.max(data.movesLimit - filled, 0);
  const bar = (data.won ? '🟩' : '🟥').repeat(Math.max(filled, 1)) + '⬜'.repeat(empty);
  const scoreLine = data.score !== undefined ? `Score ${data.score} · ` : '';
  return [
    `Loophole — ${data.gameName} #${data.puzzleNumber}`,
    `${data.won ? 'Solved' : 'Did not solve'} in ${data.moves}/${data.movesLimit} moves`,
    `${scoreLine}${bar}`,
    buildResultUrl(data.url, data),
  ].join('\n');
}

export async function shareResult(data: ShareData): Promise<'shared' | 'copied' | 'failed'> {
  const text = buildShareText(data);
  const resultUrl = buildResultUrl(data.url, data);
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ text, url: resultUrl });
      return 'shared';
    } catch {
      // user cancelled the native share sheet — not an error, fall through
    }
  }
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return 'copied';
    } catch {
      return 'failed';
    }
  }
  return 'failed';
}
