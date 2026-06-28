export type GameSlug = 'echo-merge' | 'mirror-loop' | 'color-debt' | 'gravity-word';

export interface GameMeta {
  slug: GameSlug;
  index: string; // catalog number, e.g. "01"
  name: string;
  tagline: string;
  description: string;
  color: string; // tailwind color key, matches tailwind.config.ts
  avgSolveTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  howToPlay: string[];
}

export const GAMES: GameMeta[] = [
  {
    slug: 'echo-merge',
    index: '01',
    name: 'Echo Merge',
    tagline: 'Your last move haunts the board.',
    description:
      'Slide numbered tiles to merge them — but every move you make echoes automatically one turn later. Read the echo, set the trap, chain the combo.',
    color: 'echo',
    avgSolveTime: '3:20',
    difficulty: 'Medium',
    howToPlay: [
      'Tap a tile, then tap an arrow to slide it in that direction until it hits a wall or another tile.',
      'Equal tiles merge into one with double the value, just like you’d expect — the twist is what happens next.',
      'One turn after you move, the same tile and direction "echoes" automatically again from wherever that tile ended up.',
      'Plan around your own echo to set up chain merges before you run out of moves.',
      'Reach the target tile value before the move counter hits zero.',
    ],
  },
  {
    slug: 'mirror-loop',
    index: '02',
    name: 'Mirror Loop',
    tagline: 'Bend three beams of light. Don’t waste a turn.',
    description:
      'Rotate mirrors on a grid to route three colored light beams from their emitters into their matching targets, sharing one tight rotation budget.',
    color: 'mirror',
    avgSolveTime: '2:40',
    difficulty: 'Medium',
    howToPlay: [
      'Each colored emitter fires a beam across the grid in a straight line until it hits a mirror, a wall, or a target.',
      'Tap a mirror tile to rotate it 90°. Beams update instantly so you can see the effect of every rotation.',
      'All three beams share the same rotation budget for the puzzle — spend rotations on the mirrors that matter.',
      'Solve it when every beam reaches the target that matches its color, with rotations left to spare.',
    ],
  },
  {
    slug: 'color-debt',
    index: '03',
    name: 'Color Debt',
    tagline: 'Every match you make, you’ll have to pay for.',
    description:
      'A match-3 board where clearing tiles spawns gray "debt" tiles above the board. Let debt mature too long and it locks the column. Match smart, not just big.',
    color: 'debt',
    avgSolveTime: '4:10',
    difficulty: 'Hard',
    howToPlay: [
      'Swap two adjacent tiles to make a line of 3 or more matching colors and clear them.',
      'Every match spawns debt tiles — gray tiles equal to (match size − 2) — that drop in from the top.',
      'Debt tiles convert into a normal color only when a match happens directly next to them. Left alone, they mature into locked Bad Tiles after a few turns.',
      'Clear the board of Bad Tiles and hit the score target before your moves run out.',
    ],
  },
  {
    slug: 'gravity-word',
    index: '04',
    name: 'Gravity Word',
    tagline: 'Flip gravity. Catch the words as they fall.',
    description:
      'Letters tumble across the grid in whichever direction you set gravity. Flip it to spell real words in the rows and columns before you run out of flips.',
    color: 'gravity',
    avgSolveTime: '3:00',
    difficulty: 'Medium',
    howToPlay: [
      'Tap one of the four arrows to set gravity. Every loose letter slides that direction until it’s blocked.',
      'After the board settles, any row or column that spells a real word (3+ letters) clears automatically and scores points.',
      'Cleared letters refill from the edge opposite your current gravity direction.',
      'Hit the score target before your flip count runs out.',
    ],
  },
];

export function getGame(slug: string): GameMeta | undefined {
  return GAMES.find((g) => g.slug === slug);
}
