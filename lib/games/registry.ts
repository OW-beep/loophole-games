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
  /** Longer, page-content paragraphs: the design idea behind the mechanic, then strategy tips. Rendered statically below the board. */
  designNotes: string[];
  strategyTips: string[];
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
    designNotes: [
      'Most merge puzzles only ask you to think one move ahead. Echo Merge asks you to think one move ahead twice — once for the tile you\u2019re moving now, and once for the echo it will trigger on your next turn. The idea started from a simple question: what if a puzzle\u2019s hardest opponent was a slightly-delayed copy of your own decisions?',
      'Because the echo always fires from wherever your tracked tile ends up — not from where it started — a single move can set off a small chain reaction one turn later. Reading that delay correctly, rather than just chasing the biggest immediate merge, is the whole game.',
    ],
    strategyTips: [
      'Before you move, ask what your tracked tile will do next turn, not just what your current tile will do this turn. The echo is information you already have — use it.',
      'Low-value tiles (2s and 4s) make cheap, low-risk echo anchors. Park one where you expect to need a merge next turn, rather than always chasing the highest tile on the board.',
      'A wasted move (a tile that\u2019s already blocked) doesn\u2019t cost you a turn or advance the echo queue, so it\u2019s safe to tap around and scout before committing.',
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
    designNotes: [
      'Light-reflection puzzles are an old genre, but almost all of them give you one beam and one budget. Mirror Loop runs three independent beams across the same board at once, but forces them to share a single rotation budget. That single change turns three small, separate puzzles into one resource-allocation problem.',
      'Because each mirror only has two states, fixing a wrongly-oriented mirror always costs exactly one rotation — no more, no less. That made it possible to guarantee every daily puzzle is solvable in exactly the number of rotations you\u2019re given, with zero wasted slack.',
    ],
    strategyTips: [
      'Trace each beam\u2019s path mentally before you rotate anything. Rotating the wrong mirror first can make you think you\u2019re out of budget when you\u2019re actually one rotation away.',
      'A beam that\u2019s already hitting its target doesn\u2019t need touching — don\u2019t waste a rotation "double-checking" a mirror that\u2019s already correct.',
      'Since every mirror only flips between two states, there\u2019s no such thing as a "small adjustment" — every tap is a full commitment, so look before you tap.',
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
    designNotes: [
      'Match-3 games usually reward you for finding the biggest combo on the board. Color Debt asks a different question: what if your biggest combo was also your biggest liability? Every match spawns debt tiles roughly proportional to its size, so a flashy five-in-a-row leaves a bigger mess behind than a clean three-in-a-row.',
      'Debt tiles aren\u2019t inherently bad — they convert back into normal color tiles for free the moment a match happens next to them. The tension is entirely about timing: debt left untouched for three turns locks permanently into a Bad Tile, which never moves and never clears, slowly shrinking your usable board.',
    ],
    strategyTips: [
      'A small match next to a debt tile is often worth more than a big match somewhere else — converting debt back to a normal color is free value you don\u2019t get any other way.',
      'Watch the countdown number on each gray tile. A debt tile about to mature should usually be your next priority, even over a tempting bigger combo elsewhere.',
      'Once a Bad Tile locks in, it\u2019s permanent for that board — plan your matches around it rather than trying to "save" it after the fact.',
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
    designNotes: [
      'Word games almost always present letters in a fixed grid and ask you to find words within it. Gravity Word makes the grid itself unstable: every flip physically rearranges which letters sit next to which, so the same sixteen-odd letters can spell completely different words depending on which way you tilt the board.',
      'New letters only enter from the edge directly opposite the direction you just set, which means gravity isn\u2019t just a way to move letters around — it\u2019s also the only way new letters get into play. Every flip is simultaneously a search for existing words and a decision about what comes in next.',
    ],
    strategyTips: [
      'Scan for short, common words first (3–4 letters) rather than holding out for a long one — clearing small words faster keeps new letters flowing in, which gives you more shots at bigger words later.',
      'Pay attention to which edge refills after each flip. If you need a specific letter, flipping gravity away from that edge is how you\u2019ll eventually draw a fresh one there.',
      'A flip that clears nothing isn\u2019t wasted — it still reshuffles adjacency, which is often exactly what you need to set up a word on the next flip.',
    ],
  },
];

export function getGame(slug: string): GameMeta | undefined {
  return GAMES.find((g) => g.slug === slug);
}
