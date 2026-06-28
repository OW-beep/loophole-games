export interface ShareData {
  gameName: string;
  puzzleNumber: number;
  won: boolean;
  moves: number;
  movesLimit: number;
  score?: number;
  url: string;
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
    data.url,
  ].join('\n');
}

export async function shareResult(data: ShareData): Promise<'shared' | 'copied' | 'failed'> {
  const text = buildShareText(data);
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ text, url: data.url });
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
