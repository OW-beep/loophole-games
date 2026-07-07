export type GameSlug =
  | 'echo-merge' | 'mirror-loop' | 'color-debt' | 'gravity-word'
  | 'fold' | 'carry-chain' | 'brace-yard' | 'splice'
  | 'heatmap' | 'signal' | 'overflow' | 'polarity';

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
    tagline: "You can see where the beam starts. You can't see where it ends.",
    description:
      'Rotate mirrors on a grid to route three colored light beams into their matching targets \u2014 but each beam disappears after hitting its first mirror. You have to reason about where it goes from there.',
    color: 'mirror',
    avgSolveTime: '3:30',
    difficulty: 'Hard',
    howToPlay: [
      "Each colored emitter fires a beam in a straight line. The beam is visible until it hits the first mirror \u2014 after that, you can't see it.",
      "Tap a mirror to rotate it 90\u00b0. A mirror can face either direction, and rotating it changes where the beam goes after it hits.",
      'Each beam must reach the target circle that matches its color.',
      "You only have as many rotations as there are mirrors currently pointing the wrong way \u2014 figure out which ones need changing before you start tapping.",
    ],
    designNotes: [
      "The original Mirror Loop showed the full beam path, which turned it into a visual scanning task rather than a reasoning one. This version makes two changes: each lane now has two mirrors in sequence, and the beam disappears after hitting its first mirror so you can't just follow it to the answer.",
      'Because the rotation budget equals exactly the number of wrongly-set mirrors, every wasted rotation on a mirror that didn\u2019t need changing is a rotation you can\u2019t get back. The puzzle is partly about correctly diagnosing the problem before you act.',
    ],
    strategyTips: [
      "The visible half of each beam \u2014 from the emitter to the first mirror \u2014 tells you whether the first mirror's angle is roughly right. Use that to narrow down which mirrors are definitely wrong before spending a rotation.",
      "A target that's already lit means that entire beam is solved. Don't touch those mirrors, even if you're not sure why they're working.",
      "If you're unsure about a mirror, mentally trace the beam through it: given where the beam arrives and the mirror's current angle, where does the reflection go? Does that direction lead toward the second mirror or away from it?",
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
  {
    slug: 'fold',
    index: '05',
    name: 'Fold',
    tagline: 'Fold the strip. Watch the numbers add up.',
    description:
      'A strip of numbered cells that you fold in half, again and again. Folded sections always land on top of each other and add together — get the final number to match the target before you run out of folds.',
    color: 'fold',
    avgSolveTime: '2:20',
    difficulty: 'Easy',
    howToPlay: [
      'Tap any point between two cells to fold the strip there. The shorter side always folds onto the longer side — that\u2019s just how paper works.',
      'Wherever the fold causes two cells to land on top of each other, their numbers add together into one cell.',
      'Keep folding to shrink the strip down to a single cell.',
      'You win when that final cell matches the target number, with folds left to spare.',
    ],
    designNotes: [
      'Most number-merging puzzles ask you to combine pieces side by side. Fold asks what happens if the combining motion is a literal fold — the geometry of paper-folding means you don\u2019t get to choose which two cells touch independently of each other; an entire side of the strip moves at once.',
      'Because the shorter flap always folds onto the longer base, every fold is irreversible in a specific, physical way: you can\u2019t un-crease paper. Reaching the target is really a question of choosing your crease points in the right order.',
    ],
    strategyTips: [
      'Folding near the middle shrinks the strip fastest, but folding near an edge lets you control exactly which two cells combine first — sometimes a slow, precise fold beats a fast, blunt one.',
      'Work out roughly what the last one or two cells need to sum to before you commit to your final folds — it\u2019s easy to overshoot the target in the last move.',
      'A strip of length 1 can\u2019t be folded any further, so don\u2019t fold so aggressively that you run out of room to course-correct.',
    ],
  },
  {
    slug: 'carry-chain',
    index: '06',
    name: 'Carry Chain',
    tagline: 'Every merge leaves a little extra behind.',
    description:
      'Merge adjacent numbers down a row, but every merge bumps the next number over by one. Land the row\u2019s total on the exact target before you run out of merges.',
    color: 'carry',
    avgSolveTime: '2:50',
    difficulty: 'Medium',
    howToPlay: [
      'Tap two adjacent numbers to merge them into one tile holding their sum. The row gets one tile shorter.',
      'The merge always bumps the very next tile to the right by +1 — a small "carry" that lands whether you want it or not.',
      'Watch the row\u2019s total at the top. It only changes when a carry actually lands on a tile (a merge at the far right edge wastes its carry).',
      'You win the moment the total matches the target, with merges left over.',
    ],
    designNotes: [
      'Carry Chain started from a question about 2048-style merging games: what if the act of combining two things always left a small side effect on something else nearby? The "+1 to your neighbor" rule means every merge is doing two things at once — simplifying the row, and quietly inflating the total.',
      'Because a carry that lands on the rightmost edge is wasted, where you merge matters just as much as what you merge. The same two numbers merged in a different position can produce a different total by the end of the puzzle.',
    ],
    strategyTips: [
      'Track the running total, not just the tile values — the target is about the whole row\u2019s sum, not any single tile.',
      'Merging near the right edge of the row wastes the carry. If you need every point you can get, merge further left.',
      'Since each merge adds 0 or 1 to the total sum, you can often work backward from the target to figure out roughly how many merges you have left to spend.',
    ],
  },
  {
    slug: 'brace-yard',
    index: '07',
    name: 'Brace Yard',
    tagline: 'Ten shipments. Choose the heavy ones wisely.',
    description:
      'A yard full of numbered crates, but you only get ten shipments. A crate can only ship while its neighbors can still brace its weight — chase the heavy ones before their support disappears.',
    color: 'brace',
    avgSolveTime: '3:30',
    difficulty: 'Hard',
    howToPlay: [
      'Each crate shows a weight. Tap a crate to ship it — but only if it\u2019s currently shippable.',
      'A crate is shippable if the weights of its remaining orthogonal neighbors add up to at least its own weight, or if it has no neighbors left at all.',
      'You only have ten shipments total. Every crate you ship adds its weight to your score.',
      'Reach the target score before your shipments run out. Shipping a crate removes it, which can make its neighbors easier or harder to ship later.',
    ],
    designNotes: [
      'Brace Yard came from a simple observation: a support requirement like this is almost always satisfiable if you ship the whole yard eventually — there\u2019s always some safe order. The real tension only shows up once you can\u2019t ship everything. With just ten shipments out of twenty-five crates, you have to deliberately choose the high-value ones, and the heaviest crates tend to depend on each other for support.',
      'That last part is the trap: ship one heavy crate too early, and you may have just removed the only thing holding up its heavy neighbor.',
    ],
    strategyTips: [
      'Going purely for the single heaviest crate available, over and over, performs surprisingly well — but watch what it leaves unsupported behind it.',
      'Two heavy crates that neighbor each other are often safer shipped back-to-back than spread apart, before something else erodes their mutual support.',
      'A light crate with no neighbors left is always shippable — sometimes it\u2019s worth a "free" shipment just to keep your count moving while you plan the next heavy one.',
    ],
  },
  {
    slug: 'splice',
    index: '08',
    name: 'Splice',
    tagline: 'Swap a stretch of one strand for the other.',
    description:
      'Two strands of numbers, sixteen values between them. Splice matching stretches between the strands until every low number sits in one strand and every high number sits in the other.',
    color: 'splice',
    avgSolveTime: '3:10',
    difficulty: 'Medium',
    howToPlay: [
      'Drag across a range of columns to select a stretch, then tap to splice it — that exact stretch swaps places between the top strand and the bottom strand.',
      'Every value from 1 to 16 appears exactly once across both strands combined.',
      'You win when the entire top strand holds only 1–8 and the entire bottom strand holds only 9–16, in any order, with splices left to spare.',
    ],
    designNotes: [
      'Splice is built on a simple mathematical fact: swapping the same stretch twice undoes itself completely. That made it possible to generate a guaranteed-solvable puzzle by starting from a solved board and scrambling it with a few splices — the puzzle is fair by construction, not by luck.',
      'The mechanic is closer to genome-rearrangement problems in computational biology than to anything in a typical puzzle catalog — you\u2019re not matching or merging, you\u2019re sorting two interleaved sequences using only block swaps.',
    ],
    strategyTips: [
      'Scan for the longest stretch where every number in the top strand is already \u2264 8 or every number in the bottom strand is already \u2265 9 — those sections don\u2019t need touching.',
      'A single splice can fix several misplaced numbers at once if you pick the range carefully, rather than splicing one column at a time.',
      'If a splice makes things look worse, it might still be progress — sometimes you have to temporarily group the wrong numbers together before a second splice can separate them cleanly.',
    ],
  },
  {
    slug: 'heatmap',
    index: '09',
    name: 'Heatmap',
    tagline: 'Spread the heat. Equalize everything.',
    description:
      'A grid of temperature tiles. Tap any tile to spread its heat to all four neighbors. Get every tile to the same temperature before you run out of taps.',
    color: 'heat',
    avgSolveTime: '2:40',
    difficulty: 'Medium',
    howToPlay: [
      'Each tile shows a temperature from 1 to 9.',
      'Tap a tile to spread: its value is divided equally among its orthogonal neighbors (fractions round down), and the tile keeps the remainder.',
      'You win when all tiles show the same value.',
      'You lose if you run out of taps before equalizing.',
    ],
    designNotes: [
      'Heatmap started from a physical intuition: heat spreads from hot things to cooler neighbors. The puzzle twist is that spreading is irreversible \u2014 once you distribute a tile\u2019s heat, you can\u2019t un-spread it. Choosing which tile to tap first, and in what order, determines whether equalization is even reachable.',
      'Because spreading always moves value outward, high-value tiles need to be tapped before their neighbors get too warm \u2014 otherwise there\u2019s nowhere for the heat to go.',
    ],
    strategyTips: [
      'Tap the hottest tile first, before its neighbors heat up and reduce the differential available to spread.',
      'Corner and edge tiles have fewer neighbors, so they accumulate heat faster \u2014 watch them carefully.',
      'A tile surrounded by already-equal neighbors can\u2019t contribute to further equalization \u2014 don\u2019t waste a tap on it.',
    ],
  },
  {
    slug: 'signal',
    index: '10',
    name: 'Signal',
    tagline: 'Each cell expects exactly that many resolved neighbors.',
    description:
      'Every cell holds a number. Tap a cell to mark it as resolved — but only when exactly that many of its neighbors are already resolved. Resolve every cell to win.',
    color: 'oneline',
    avgSolveTime: '3:30',
    difficulty: 'Hard',
    howToPlay: [
      'Each cell shows a value from 0 to 4.',
      'Tap a cell to resolve it — but only when the number of its already-resolved neighbors exactly equals its value.',
      'A cell showing 0 can be resolved at any time (it needs no resolved neighbors). A cell showing 3 needs exactly 3 neighbors resolved first.',
      'Resolve every cell on the board to win.',
    ],
    designNotes: [
      'Signal is a pure logic puzzle: the only information you need is the number on each cell and which of its neighbors are already resolved. There is no randomness in whether a move works — either the count matches and it resolves, or it does not. That makes every tap a deliberate choice rather than a gamble.',
      'The daily puzzle is constructed by assigning each cell the exact count of resolved neighbors it will have when it gets resolved, so a solution always exists. Finding that order from scratch is the challenge.',
    ],
    strategyTips: [
      'Start with all the 0-value cells — they can always be resolved immediately and often unlock their neighbors.',
      'After resolving a cell, check all its neighbors: their required count may now be satisfied.',
      'Corner cells have at most 2 neighbors, edge cells at most 3. A corner cell with value 2 can only be resolved after both its neighbors are resolved — plan that chain early.',
    ],
  },
  {
    slug: 'overflow',
    index: '11',
    name: 'Overflow',
    tagline: 'Tap to spill. Chain reactions score big.',
    description:
      'Each cell holds water up to its capacity. Tap a cell to add one drop \u2014 when it overflows, it spills into all four neighbors, which may overflow in turn. Clear the board by triggering the right chain reactions.',
    color: 'overflow',
    avgSolveTime: '3:00',
    difficulty: 'Medium',
    howToPlay: [
      'Each cell shows its current water level out of its capacity (e.g. \u201c2/3\u201d means 2 drops, capacity 3).',
      'Tap a cell to add one drop. If it reaches capacity, it overflows: all its water spills into orthogonal neighbors, one drop each.',
      'Overflow can trigger chain reactions if a neighbor was already at capacity.',
      'A cell that overflows is emptied and removed from the board. Clear every cell to win.',
    ],
    designNotes: [
      'Overflow is built on the chain-reaction genre, but the puzzle version adds variable capacities and starting levels, so not every cell will overflow from a single tap. Figuring out which cells to prime (bring almost to capacity) before triggering a chain is the whole puzzle.',
      'Chain reactions that clear five or more cells in a sequence are deeply satisfying and make for great share moments.',
    ],
    strategyTips: [
      'Prime the cells adjacent to your intended chain before triggering it \u2014 a cell at capacity-minus-one will join the chain automatically.',
      'Corner cells have only 2 neighbors, so their overflows are less powerful. Use them as anchors that you prime but don\u2019t trigger until the right moment.',
      'Work from the outside in: clearing edge cells first opens up more room for inner chains to propagate.',
    ],
  },
  {
    slug: 'polarity',
    index: '12',
    name: 'Polarity',
    tagline: 'Opposites attract. Like poles block.',
    description:
      'A grid of positive and negative magnets. Tap a magnet to slide it: it moves until attracted to an opposite pole or blocked by a same pole. Separate all positives to one side, all negatives to the other.',
    color: 'polarity',
    avgSolveTime: '3:20',
    difficulty: 'Medium',
    howToPlay: [
      'Tap a magnet to select it, then tap an arrow to slide it in that direction.',
      'A magnet slides until it is adjacent to an opposite-pole magnet (attraction stops it), blocked by a same-pole magnet (repulsion), or hits a wall.',
      'You win when all \u002b magnets occupy the left half of the grid and all \u2212 magnets occupy the right half.',
      'You have a limited number of slides to reach the goal.',
    ],
    designNotes: [
      'The key insight behind Polarity is that the stopping rule is asymmetric: opposite poles pull you in (stop one cell away), same poles push you away (you can\u2019t enter that cell at all). The same magnet behaves very differently depending on what is already on the board when you slide it.',
      'The puzzle is constructed so the solution always uses fewer slides than the budget, giving you some room to experiment \u2014 but not much.',
    ],
    strategyTips: [
      'Slide magnets that are already close to their target side first \u2014 they need fewer moves and won\u2019t interfere with the rest of the board.',
      'Use opposite-pole magnets as anchors: sliding into them stops you in a predictable place you can plan around.',
      'If a magnet is blocked by a same-pole neighbor, try clearing the blocker first by sliding it away.',
    ],
  },
];

export function getGame(slug: string): GameMeta | undefined {
  return GAMES.find((g) => g.slug === slug);
}
