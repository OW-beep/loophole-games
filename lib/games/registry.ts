export type GameSlug =
  | 'echo-merge' | 'mirror-loop' | 'color-debt' | 'gravity-word'
  | 'fold' | 'carry-chain' | 'brace-yard' | 'splice'
  | 'heatmap' | 'signal' | 'overflow' | 'polarity'
  | 'shadow' | 'tether' | 'drift' | 'phase'
  | 'boo-rush' | 'blobble' | 'sprout' | 'wobble-chef' | 'noodle-cat' | 'acorn-dash' | 'cloud-hop' | 'twin-peek'
  | 'world-data-duel'
  | 'pigment'
  | 'waypoint'
  | 'cairn'
  | 'decant'
  | 'cipher'
  | 'clearway'
  | 'overdraw'
  | 'burrow'
  | 'vantage'
  | 'tumble'
  | 'untangle'
  | 'flicker'
  | 'lastlight'
  | 'blueprint'
  | 'bloom'
  | 'apex'
  | 'pulse'
  | 'blip'
  | 'croak'
  | 'bounce'
  | 'wiggle'
  | 'stax'
  | 'clash'
  | 'carom'
  | 'prowl'
  | 'regent'
  | 'skein'
  | 'vials'
  | 'oni-smash'
  | 'wanderwood'
  | 'yokai-bridge';

export type GameCategory = 'puzzle' | 'movement' | 'word' | 'arcade' | 'cards' | 'stealth';

export interface GameFaqItem {
  q: string;
  a: string;
}

export interface GameMeta {
  slug: GameSlug;
  index: string;
  name: string;
  tagline: string;
  description: string;
  color: string;
  avgSolveTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: GameCategory;
  howToPlay: string[];
  designNotes: string[];
  strategyTips: string[];
  /** Optional per-game FAQ. Rendered on the game page and emitted as FAQPage structured data when present. */
  faq?: GameFaqItem[];
  /** Override the default `/games/{slug}` link — for entries that live at a different route (e.g. the Arcade section). */
  href?: string;
}

/** The canonical link for a game — `/games/{slug}` unless the entry overrides it via `href`. */
export function gameHref(game: GameMeta): string {
  return game.href ?? `/games/${game.slug}`;
}

export const CATEGORY_LABEL: Record<GameCategory, string> = {
  puzzle: 'Puzzle',
  movement: 'Movement',
  word: 'Word',
  arcade: 'Arcade',
  cards: 'Cards',
  stealth: 'Stealth',
};

export const GAMES: GameMeta[] = [
  {
    slug: 'echo-merge',
    index: '001',
    name: 'Echo Merge',
    tagline: 'Your last move haunts the board.',
    description:
      'A tile merge puzzle game: slide numbered tiles to merge them \u2014 but every move you make echoes automatically one turn later. Read the echo, set the trap, chain the combo.',
    color: 'echo',
    avgSolveTime: '3:20',
    difficulty: 'Medium',
    category: 'puzzle',
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
    faq: [
      {
        q: 'Does the echo count as one of my moves?',
        a: 'No. The echo fires automatically and doesn\u2019t use up a move from your counter \u2014 only your own taps do.',
      },
      {
        q: 'What happens if the echoed tile can\u2019t slide in that direction anymore?',
        a: 'Nothing \u2014 it\u2019s treated the same as a blocked manual move and simply has no effect that turn.',
      },
      {
        q: 'Is Echo Merge the same puzzle for everyone each day?',
        a: 'Yes. The board is seeded from the date, so every player worldwide gets the exact same starting position and can compare results fairly.',
      },
      {
        q: 'Can I undo a move?',
        a: 'No. Since the echo is tracking your real decisions, undoing would break the puzzle\u2019s logic \u2014 think a move ahead before you tap.',
      },
    ],
  },
  {
    slug: 'mirror-loop',
    index: '002',
    name: 'Mirror Loop',
    tagline: "You can see where the beam starts. You can't see where it ends.",
    description:
      'A mirror puzzle game played on a grid: rotate mirrors to route three colored light beams into their matching targets \u2014 but each beam disappears after hitting its first mirror. You have to reason about where it goes from there.',
    color: 'mirror',
    avgSolveTime: '3:30',
    difficulty: 'Hard',
    category: 'puzzle',
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
    faq: [
      {
        q: 'Can I see where a beam goes after it hits the first mirror?',
        a: 'No — the beam is only visible from the emitter to the first mirror it touches. Everything after that has to be reasoned out, not watched.',
      },
      {
        q: 'How many rotations do I get?',
        a: 'Exactly as many as there are mirrors currently pointing the wrong way — diagnosing which mirrors actually need changing is part of the puzzle.',
      },
      {
        q: 'Does rotating a mirror that\'s already correct cost me anything?',
        a: 'Yes — every rotation counts against your limited budget, even one on a mirror that didn\'t need to move, so misdiagnosing a correct mirror is a real cost.',
      },
      {
        q: 'What does it mean when a target circle lights up?',
        a: 'That beam has reached its matching target and is fully solved — leave those mirrors alone even if you\'re unsure why they\'re working.',
      },
    ],
  },
  {
    slug: 'color-debt',
    index: '003',
    name: 'Color Debt',
    tagline: 'Every match you make, you’ll have to pay for.',
    description:
      'A match-3 board where clearing tiles spawns gray "debt" tiles above the board. Let debt mature too long and it locks the column. Match smart, not just big.',
    color: 'debt',
    avgSolveTime: '4:10',
    difficulty: 'Hard',
    category: 'puzzle',
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
    faq: [
      {
        q: 'How many debt tiles does a match create?',
        a: 'Match size minus two. A 3-tile match spawns 1 debt tile, a 4-tile match spawns 2, and so on \u2014 bigger combos leave bigger cleanup jobs.',
      },
      {
        q: 'Can a Bad Tile ever be cleared?',
        a: 'Yes, but only indirectly \u2014 it\u2019s removed if a match happens in a cell adjacent to it. You can\u2019t match a Bad Tile directly, since it isn\u2019t a color.',
      },
      {
        q: 'Why did my swap not do anything?',
        a: 'Swaps that wouldn\u2019t create a match of 3 or more bounce back for free \u2014 it doesn\u2019t cost you a move, so it\u2019s safe to test one before committing.',
      },
      {
        q: 'What\u2019s the fastest way to lose?',
        a: 'Ignoring debt tiles near maturity while chasing big matches elsewhere \u2014 several tiles locking into Bad Tiles at once can shrink your usable board faster than your score climbs.',
      },
    ],
  },
  {
    slug: 'gravity-word',
    index: '004',
    name: 'Gravity Word',
    tagline: 'Flip gravity. Catch the words as they fall.',
    description:
      'Letters tumble across the grid in whichever direction you set gravity. Flip it to spell real words in the rows and columns before you run out of flips.',
    color: 'gravity',
    avgSolveTime: '3:00',
    difficulty: 'Medium',
    category: 'word',
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
    faq: [
      {
        q: 'Does flipping gravity in a direction with no loose letters waste a flip?',
        a: 'Yes — if nothing moves, you still lose the flip. Check that at least one letter can slide before committing to a direction.',
      },
      {
        q: 'Can a word clear diagonally?',
        a: 'No. Only full rows and columns are checked for real words — diagonal runs never clear, no matter what they spell.',
      },
      {
        q: 'What happens to letters that already spell a word before I flip?',
        a: 'They clear immediately once the board settles after any flip, even if that flip\'s main purpose was something else entirely.',
      },
      {
        q: 'Is today\'s letter set the same for everyone?',
        a: 'Yes, the starting grid and letter pool are generated from the day\'s seed, so every player is solving the exact same board.',
      },
    ],
  },
  {
    slug: 'fold',
    index: '005',
    name: 'Fold',
    tagline: 'Fold the strip. Watch the numbers add up.',
    description:
      'A strip of numbered cells that you fold in half, again and again. Folded sections always land on top of each other and add together — get the final number to match the target before you run out of folds.',
    color: 'fold',
    avgSolveTime: '2:20',
    difficulty: 'Easy',
    category: 'puzzle',
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
    faq: [
      {
        q: 'Can I fold at any point along the strip?',
        a: 'Yes, tap any gap between two adjacent cells. The shorter side always folds onto the longer side — you can\'t choose which side moves.',
      },
      {
        q: 'What happens if I fold down to one cell before hitting the target?',
        a: 'That\'s a loss for that attempt — a single cell can\'t be folded any further, so make sure your last one or two folds land exactly on the target sum.',
      },
      {
        q: 'Do negative or zero values ever appear on the strip?',
        a: 'No, every cell starts as a positive number, so totals only ever grow as folds combine cells.',
      },
      {
        q: 'Is there a way to undo a fold?',
        a: 'No undo — folding is one-directional, the same way creasing real paper is. Plan a couple of folds ahead before committing.',
      },
    ],
  },
  {
    slug: 'carry-chain',
    index: '006',
    name: 'Carry Chain',
    tagline: 'Every merge leaves a little extra behind.',
    description:
      'A number puzzle game with a twist: merge adjacent numbers down a row, but every merge bumps the next number over by one. Land the row\u2019s total on the exact target before you run out of merges.',
    color: 'carry',
    avgSolveTime: '2:50',
    difficulty: 'Medium',
    category: 'puzzle',
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
    faq: [
      {
        q: 'Does the carry ever wrap around to the start of the row?',
        a: 'No. A carry only ever bumps the tile immediately to the right of the merge; merging at the rightmost edge simply wastes that carry.',
      },
      {
        q: 'Does merging order matter, or just which tiles I pick?',
        a: 'Order matters — the same two tiles merged at different positions along the row can land the carry on a different neighbor, changing the final total.',
      },
      {
        q: 'Can I merge the same two tiles more than once?',
        a: 'Once tiles merge they become a single tile, so you\'re always merging the current board state, not the original tiles.',
      },
      {
        q: 'What happens if I run out of merges before hitting the target?',
        a: 'That attempt ends without a win — track the running total as you go so you\'re not guessing when the last merge is due.',
      },
    ],
  },
  {
    slug: 'brace-yard',
    index: '007',
    name: 'Brace Yard',
    tagline: 'Ten shipments. Choose the heavy ones wisely.',
    description:
      'A yard full of numbered crates, but you only get ten shipments. A crate can only ship while its neighbors can still brace its weight — chase the heavy ones before their support disappears.',
    color: 'brace',
    avgSolveTime: '3:30',
    difficulty: 'Hard',
    category: 'puzzle',
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
    faq: [
      {
        q: 'What counts as a crate\'s "neighbors" for the support check?',
        a: 'Only the orthogonally adjacent crates that are still on the board — diagonal crates never count toward support.',
      },
      {
        q: 'Can a crate become shippable again after being unshippable?',
        a: 'Yes — shipping other crates changes the board, so a crate that lacked support can become shippable once its neighbors\' situation changes.',
      },
      {
        q: 'Do all ten shipments have to be used?',
        a: 'No, you win the moment your score hits the target — unused shipments simply go unspent.',
      },
      {
        q: 'Is there always a way to reach the target in ten shipments?',
        a: 'Yes, each day\'s yard is generated so the target is reachable within the shipment budget, though not every ordering of ships gets you there.',
      },
    ],
  },
  {
    slug: 'splice',
    index: '008',
    name: 'Splice',
    tagline: 'Swap a stretch of one strand for the other.',
    description:
      'Two strands of numbers, sixteen values between them. Splice matching stretches between the strands until every low number sits in one strand and every high number sits in the other.',
    color: 'splice',
    avgSolveTime: '3:10',
    difficulty: 'Medium',
    category: 'puzzle',
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
    faq: [
      {
        q: 'Can I splice a single column instead of a range?',
        a: 'Yes, a one-column drag is a valid splice — it just swaps that single column between the two strands.',
      },
      {
        q: 'Does splicing the same range twice do anything?',
        a: 'It undoes itself — two splices of the identical range return both strands to exactly how they were before, so it\'s a safe way to test an idea.',
      },
      {
        q: 'Do the two strands always have the same length?',
        a: 'Yes, both strands hold eight values each, for sixteen total, and a splice always swaps equal-length stretches between them.',
      },
      {
        q: 'Is the puzzle always solvable within the splice budget?',
        a: 'Yes — each board is generated by scrambling a solved strand pair, so reversing that same sequence of splices is always a guaranteed solution.',
      },
    ],
  },
  {
    slug: 'heatmap',
    index: '009',
    name: 'Heatmap',
    tagline: 'Spread the heat. Equalize everything.',
    description:
      'A grid of temperature tiles. Tap any tile to spread its heat to all four neighbors. Get every tile to the same temperature before you run out of taps.',
    color: 'heat',
    avgSolveTime: '2:40',
    difficulty: 'Medium',
    category: 'puzzle',
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
    faq: [
      {
        q: 'Does spreading a tile with 0 heat do anything?',
        a: 'No — there\'s nothing to divide among its neighbors, so tapping an empty tile wastes a tap without changing the board.',
      },
      {
        q: 'What happens to the remainder when heat doesn\'t divide evenly?',
        a: 'It stays on the tile you tapped — spreading divides the value among neighbors and rounds down, keeping any leftover in place.',
      },
      {
        q: 'Do corner tiles behave differently from tiles in the middle?',
        a: 'Corner and edge tiles have fewer neighbors, so their heat concentrates faster when neighbors spread into them — watch them closely as the board fills in.',
      },
      {
        q: 'Can I win with a target value other than what the board started with?',
        a: 'Yes, the win condition is just that every tile matches every other tile — the shared final value isn\'t fixed in advance.',
      },
    ],
  },
  {
    slug: 'signal',
    index: '010',
    name: 'Signal',
    tagline: 'Each cell expects exactly that many resolved neighbors.',
    description:
      'Every cell holds a number. Tap a cell to mark it as resolved — but only when exactly that many of its neighbors are already resolved. Resolve every cell to win.',
    color: 'oneline',
    avgSolveTime: '3:30',
    difficulty: 'Hard',
    category: 'puzzle',
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
    faq: [
      {
        q: 'Can I resolve a cell before its neighbor count is satisfied?',
        a: 'No — a tap only works when the resolved-neighbor count exactly matches the cell\'s number. Tapping too early simply does nothing.',
      },
      {
        q: 'Do diagonal cells count as neighbors?',
        a: 'No, only the orthogonal (up/down/left/right) cells count toward a cell\'s required resolved-neighbor total.',
      },
      {
        q: 'Is there ever more than one valid order to resolve the board?',
        a: 'Often yes — the puzzle only guarantees at least one valid order exists, not that it\'s unique, so different starting points can both work.',
      },
      {
        q: 'What should I resolve first?',
        a: 'Any cell showing 0 — it needs no resolved neighbors at all, so it\'s always available immediately and usually unlocks cells around it.',
      },
    ],
  },
  {
    slug: 'overflow',
    index: '011',
    name: 'Overflow',
    tagline: 'Tap to spill. Chain reactions score big.',
    description:
      'Each cell holds water up to its capacity. Tap a cell to add one drop \u2014 when it overflows, it spills into all four neighbors, which may overflow in turn. Clear the board by triggering the right chain reactions.',
    color: 'overflow',
    avgSolveTime: '3:00',
    difficulty: 'Medium',
    category: 'puzzle',
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
    faq: [
      {
        q: 'Does tapping a cell that\'s already empty do anything?',
        a: 'No, tapping only adds a drop to a cell still on the board — an already-cleared cell has nothing left to interact with.',
      },
      {
        q: 'Can one tap clear the whole board?',
        a: 'In principle yes, if enough cells are primed right at capacity — a single overflow can cascade through a long chain, which is the game\'s biggest scoring moment.',
      },
      {
        q: 'Do all cells share the same capacity?',
        a: 'No, each cell has its own capacity shown on the tile, so the same number of drops overflows some cells and not others.',
      },
      {
        q: 'What happens to spilled water that lands on a cell at capacity?',
        a: 'It triggers that cell\'s overflow too, continuing the chain reaction into its own neighbors.',
      },
    ],
  },
  {
    slug: 'polarity',
    index: '012',
    name: 'Polarity',
    tagline: 'Opposites attract. Like poles block.',
    description:
      'A grid of positive and negative magnets. Tap a magnet to slide it: it moves until attracted to an opposite pole or blocked by a same pole. Separate all positives to one side, all negatives to the other.',
    color: 'polarity',
    avgSolveTime: '3:20',
    difficulty: 'Medium',
    category: 'puzzle',
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
    faq: [
      {
        q: 'What happens if two opposite-pole magnets are already adjacent?',
        a: 'Nothing — they\'re already stopped against each other, so sliding one further in that direction isn\'t possible until something changes.',
      },
      {
        q: 'Can a magnet pass through empty space indefinitely?',
        a: 'Yes, a magnet keeps sliding until it hits a wall, gets stopped by an opposite pole, or is blocked by a same pole — open space alone never stops it.',
      },
      {
        q: 'Do I have to use every slide in the budget?',
        a: 'No, you win the instant every magnet is on its correct side — leftover slides just go unused.',
      },
      {
        q: 'Is the solution always achievable in fewer slides than the budget allows?',
        a: 'Yes, each board is generated with some slack built into the slide limit, so there\'s usually a bit of room to experiment.',
      },
    ],
  },
  {
    slug: 'shadow',
    index: '013',
    name: 'Shadow',
    tagline: 'Your last move haunts you — literally.',
    description:
      'Move your character across the grid to reach the goal. After every move, a ghost of you replays your previous step from wherever it ended up. Use your own ghost as a switch, a blocker, or a bridge.',
    color: 'shadow',
    avgSolveTime: '3:10',
    difficulty: 'Medium',
    category: 'movement',
    howToPlay: [
      'Tap an arrow to move your character one step in that direction.',
      'After your move, a ghost appears at your previous position and takes the same step you just took.',
      'Stepping onto a switch tile toggles it — the ghost can do this too.',
      'Reach the goal tile in the move limit. The ghost can help or hinder depending on how you sequence your moves.',
    ],
    designNotes: [
      'Shadow is Echo Merge translated into a character-movement game: instead of a tile replaying a slide, it is your own avatar replaying your last step. The twist is that your ghost occupies real space — it can trigger switches, block enemies, and open paths, but it can also close them.',
      'Because the ghost always does what you just did, planning two steps ahead means planning for both the move you are about to make and the echo that move will create on the next turn.',
    ],
    strategyTips: [
      'The ghost starts one step behind you in time. If you need a switch triggered after you leave it, step on it yourself — the ghost will re-trigger it on the next turn.',
      'Moving back and forth rapidly leaves the ghost oscillating in place, which is useful for holding a toggle switch open while you proceed.',
      'The ghost cannot move off the grid. Use walls to make the ghost stay in a useful position rather than following you into the open.',
    ],
    faq: [
      {
        q: 'Does the ghost appear on my very first move?',
        a: 'No — the ghost needs a previous step to replay, so it first appears after your second move, echoing your first.',
      },
      {
        q: 'Can the ghost trigger a switch on its own?',
        a: 'Yes, stepping onto a switch toggles it whether it\'s you or your ghost doing the stepping — that\'s the core of most puzzles.',
      },
      {
        q: 'What happens if the ghost\'s replayed move would go off the grid?',
        a: 'It simply doesn\'t move that turn — same as if you\'d tried to walk into a wall yourself.',
      },
      {
        q: 'Can I use the ghost to block an enemy or a path on purpose?',
        a: 'Yes — since the ghost occupies real space, deliberately walking a route that leaves it standing somewhere useful is a core strategy.',
      },
    ],
  },
  {
    slug: 'tether',
    index: '014',
    name: 'Tether',
    tagline: 'Two characters, one direction at a time.',
    description:
      'Control two characters connected by a tether. Every tap moves both in the same direction. The tether stretches but keeps them linked — use the tension to solve puzzles neither could solve alone.',
    color: 'tether',
    avgSolveTime: '3:40',
    difficulty: 'Hard',
    category: 'movement',
    howToPlay: [
      'Tap an arrow to move both characters one step in that direction.',
      'If a character is blocked by a wall, it stays in place while the other continues moving (the tether stretches).',
      'The tether has a maximum length. If a move would stretch it beyond that, neither character moves.',
      'Guide both characters to their respective goal tiles simultaneously to win.',
    ],
    designNotes: [
      'Tether emerged from a question: what is the simplest rule that makes two characters meaningfully interdependent without one of them being an obstacle to the other? The answer turned out to be shared input with independent collision — they always try to go the same way, but walls affect them independently.',
      'Because one character can be pinned against a wall while the other moves freely, the tether becomes a positioning tool: you can use walls to hold one character in place while you maneuver the other into a specific spot.',
    ],
    strategyTips: [
      'Walls are not just obstacles — they are anchors. Pin one character against a wall deliberately to move the other into position.',
      'Think about where both characters need to end up, then work backward to find a sequence of moves where the walls do the separating work for you.',
      'The tether length limit is your hardest constraint. When a move would exceed it, treat that as information about the puzzle structure, not just a failure.',
    ],
    faq: [
      {
        q: 'What happens if only one character is blocked by a wall?',
        a: 'That character stays put while the other keeps moving in the chosen direction — the tether stretches to cover the gap between them.',
      },
      {
        q: 'Can the tether ever snap or break?',
        a: 'No — if a move would stretch it past its maximum length, neither character moves at all that turn.',
      },
      {
        q: 'Do both characters need to reach their goals on the same move?',
        a: 'Yes, the puzzle only counts as solved once both characters are simultaneously standing on their respective goal tiles.',
      },
      {
        q: 'Is there a way to move the characters independently?',
        a: 'No — every tap moves both characters in the same direction at once; walls are the only thing that separates their paths.',
      },
    ],
  },
  {
    slug: 'drift',
    index: '015',
    name: 'Drift',
    tagline: 'You slide until something stops you.',
    description:
      'Your character slides in the chosen direction until hitting a wall or object. Stopping in the right place requires planning the whole sequence of slides. Objects you stop against can themselves be shifted by your arrival.',
    color: 'drift',
    avgSolveTime: '2:50',
    difficulty: 'Medium',
    category: 'movement',
    howToPlay: [
      'Tap an arrow to slide your character in that direction. They keep moving until blocked by a wall or an object.',
      'Some objects shift when you slide into them — they move one step in the direction you were travelling.',
      'Reach the goal tile. Use the objects as movable stoppers to land in positions you could not reach with bare walls.',
    ],
    designNotes: [
      'Sliding-until-blocked puzzles are a classic, but adding shiftable objects changes the problem completely. Without them, stopping positions are determined entirely by the fixed walls. With objects you can push, every slide potentially reconfigures the stopping positions available on future slides — turning a positioning puzzle into a planning puzzle.',
      'The daily puzzle is constructed backward from a valid solution, so every puzzle is guaranteed to be solvable within the given slide budget.',
    ],
    strategyTips: [
      'Work backward: where do you need to be on the final slide? What wall or object would stop you there? Is that object in the right place, or do you need to move it first?',
      'Shifting an object is often a two-step process: slide into it to move it, then use a different approach to use it as a stopper.',
      'Every slide commits you to a full traversal of the available space. Short slides are impossible unless there is already something in the way — plan your stoppers before you need them.',
    ],
    faq: [
      {
        q: 'Can I stop a slide partway through, before hitting a wall or object?',
        a: 'No — once you commit to a direction, your character slides all the way until something blocks it. There\'s no partial move.',
      },
      {
        q: 'Do shiftable objects move every time I slide into them?',
        a: 'Yes, one step in the direction you were travelling, every time — which means the same object can be repositioned across several slides.',
      },
      {
        q: 'What happens if a shiftable object is pushed off the edge of the board?',
        a: 'It can\'t be — boards are generated so a solution exists within the given bounds, though a careless push can still put an object somewhere unhelpful.',
      },
      {
        q: 'Is every daily board guaranteed solvable?',
        a: 'Yes, each puzzle is built backward from a working solution, so a valid slide sequence always exists within the move budget.',
      },
    ],
  },
  {
    slug: 'phase',
    index: '016',
    name: 'Phase',
    tagline: 'Solid on odd steps. Ghost on even steps.',
    description:
      'Your character alternates between solid and ghost phase every step. Solid: you stop at walls. Ghost: you pass through walls but fall through floors. Plan your phase to be solid where you need to stop and ghost where you need to pass through.',
    color: 'phase',
    avgSolveTime: '3:20',
    difficulty: 'Hard',
    category: 'movement',
    howToPlay: [
      'Your character starts in solid phase. Tap a direction to move one step.',
      'In solid phase: you are blocked by walls and stand on floors normally.',
      'In ghost phase: you pass through walls freely, but you also fall through any floor tile beneath you (dropping down one row).',
      'The phase flips automatically after every step. Reach the goal tile in the move limit.',
    ],
    designNotes: [
      'Phase started from a simple question: what if intangibility had a cost that was exactly symmetrical with its benefit? Passing through walls is useful, but falling through floors is dangerous — and both happen in the same phase. That forced trade-off is what makes planning interesting rather than just picking the convenient option.',
      'Because the phase is tied to step count rather than a button press, the player cannot choose when to be solid. They can only choose how many steps to take and in what direction, which makes the parity of their position part of the puzzle.',
    ],
    strategyTips: [
      'Count your steps. If you need to be solid (step count = odd) to stop at a specific tile, make sure you arrive there on an odd-numbered step.',
      'Ghost phase falling is only dangerous on floors you do not want to fall through. Use it deliberately to drop to a lower level when that is where you need to go.',
      'Sometimes taking an extra step in the wrong direction is correct — not to make progress, but to flip your phase before the next critical move.',
    ],
    faq: [
      {
        q: 'Can I choose which phase I\'m in?',
        a: 'No — phase flips automatically after every single step, so the only thing you control is how many steps you take and in which direction.',
      },
      {
        q: 'What happens if I\'m in ghost phase and there\'s no floor beneath me?',
        a: 'You simply don\'t fall — the drop only happens over a floor tile that\'s actually there. Standing over open space in ghost phase is safe.',
      },
      {
        q: 'Does moving diagonally exist in this game?',
        a: 'No, every move is one orthogonal step — diagonal movement isn\'t part of the mechanic.',
      },
      {
        q: 'Can I take a wasted step just to flip my phase?',
        a: 'Yes, and it\'s often correct — sometimes the only way to be solid (or ghost) at the right tile is to spend a move purely on parity, not progress.',
      },
    ],
  },
  {
    slug: 'boo-rush',
    index: '017',
    name: 'Boo Rush',
    tagline: 'One tap. One ghost. A whole course of gates.',
    description:
      'Tap to flap and guide a little ghost through a set course of floating gates. No grid, no turns — just timing. Clear every gate to win today\u2019s run.',
    color: 'boo',
    avgSolveTime: '1:10',
    difficulty: 'Medium',
    category: 'arcade',
    howToPlay: [
      'Tap, click, or press Space to make the ghost flap upward. Let go and gravity pulls it back down.',
      'Fly through the gap in each gate. Touching a gate or the ground ends the run.',
      'Today\u2019s course is the same for everyone \u2014 the same gate heights in the same order, every time you play it today.',
      'Clear every gate in the course to win the run. Crash partway and your result shows how many you cleared.',
    ],
    designNotes: [
      'Every other game in this index is turn-based \u2014 you think, then you act, on your own clock. Boo Rush is the one deliberately real-time entry: a single input, continuous physics, and a course rather than a board. The idea was to see how far the "one daily attempt, shareable result" format could stretch beyond puzzles.',
      'The course is generated from the day\u2019s seed the same way every puzzle in the index is, so "today\u2019s run" is identical for every player \u2014 same gate gaps, same order, same difficulty curve. That keeps it comparable, even though the skill being tested is timing instead of logic.',
    ],
    strategyTips: [
      'Small, frequent taps hold a steadier altitude than a few big ones \u2014 over-flapping sends you rocketing toward the top of the screen.',
      'Look at the next gate\u2019s gap while you\u2019re still approaching the current one. Reacting to the gate you\u2019re already inside is usually too late.',
      'If you keep crashing on the same gate, try arriving at it slightly lower than feels natural \u2014 it\u2019s easier to tap upward through a gap than to fall into one.',
    ],
    faq: [
      {
        q: 'Is today\'s course randomized differently for every player?',
        a: 'No — the gate heights and order come from the day\'s seed, so everyone flies through the exact same course.',
      },
      {
        q: 'What happens if I crash partway through?',
        a: 'The run ends immediately, and your result shows how many gates you cleared before the crash — there\'s no continuing from where you stopped.',
      },
      {
        q: 'Does holding the tap keep the ghost flapping continuously?',
        a: 'No, each tap is a single flap. Holding does nothing extra — you need to tap again for another flap.',
      },
      {
        q: 'Is there a way to see the whole course before flying it?',
        a: 'No, you only see what\'s ahead as you fly — reading each gate as it approaches is the entire skill being tested.',
      },
    ],
  },
  {
    slug: 'blobble',
    index: '018',
    name: 'Blobble',
    tagline: 'Pull back. Let go. Bounce something loose.',
    description:
      'Slingshot a squishy blob at a small stack of blocks. Real bounce-off-the-wall physics, a limited number of launches, and one target: clear every block before you run out of shots.',
    color: 'blobble',
    avgSolveTime: '1:20',
    difficulty: 'Medium',
    category: 'arcade',
    howToPlay: [
      'Drag back from the blob and release to launch it, slingshot-style \u2014 the further you pull, the harder it flies.',
      'The blob bounces off the floor, walls, and any block it doesn\u2019t hit hard enough to break.',
      'Hit a block fast enough and it breaks and clears. A slow, glancing hit just bounces you off it instead.',
      'You have a limited number of launches. Clear every block on the board before they run out.',
    ],
    designNotes: [
      'Blobble runs on the same three lines of physics as everything real-time in this index: velocity, gravity, and a bounce. No physics engine \u2014 just position and velocity updated every frame, with a simple speed check deciding whether a hit breaks a block or just deflects off it.',
      'That speed threshold is the whole design: it turns "aim well" into "aim well AND commit," since a soft, cautious shot that technically hits a block still doesn\u2019t clear it.',
    ],
    strategyTips: [
      'A flatter, faster pull tends to clear blocks near the ground; a steeper arc is better for anything floating higher up.',
      'Blocks you bounce off (without clearing) don\u2019t move or reset \u2014 you get another free shot at them off the rebound, so a miss isn\u2019t always wasted.',
      'Save your most confident, hardest-pulled shot for whichever block sits in the most awkward spot \u2014 a glancing hit there is the likeliest one to fail.',
    ],
    faq: [
      {
        q: 'Does the pull direction have to point away from the blocks?',
        a: 'No, you can launch in any direction — pulling back and releasing determines both power and angle, and bounces can bring the blob back toward blocks behind it.',
      },
      {
        q: 'What decides whether a hit breaks a block or just bounces off it?',
        a: 'Speed at the moment of impact — a fast, committed hit breaks the block; a slow, glancing one just deflects the blob away.',
      },
      {
        q: 'Do I get another shot at a block I bounced off without breaking?',
        a: 'Yes, bounced blocks stay exactly where they are, so a rebound often lines up a second, easier shot at the same block.',
      },
      {
        q: 'Is the launch budget the same every day?',
        a: 'The board and launch count are generated from the day\'s seed together, so the budget matches that specific block layout.',
      },
    ],
  },
  {
    slug: 'sprout',
    index: '019',
    name: 'Sprout',
    tagline: 'Water it at exactly the right moment.',
    description:
      'A rotating gauge sweeps around a seed. Tap the instant it passes through the highlighted arc to water it \u2014 miss too often and it wilts before it blooms.',
    color: 'sprout',
    avgSolveTime: '0:50',
    difficulty: 'Easy',
    category: 'arcade',
    howToPlay: [
      'A needle sweeps continuously around the dial. Tap anywhere to water the sprout.',
      'A tap only counts if the needle is inside the highlighted arc at that instant.',
      'Every successful tap grows the sprout one stage. The dial speeds up and the target arc narrows as it grows.',
      'You can miss a few times without losing, but too many misses and the sprout wilts. Reach full bloom to win.',
    ],
    designNotes: [
      'Sprout is the index\u2019s purest timing test \u2014 one dial, one window, no branching decisions. The target arc\u2019s position is different every day (seeded), but its width and the dial\u2019s speed both follow a fixed difficulty curve, so day-to-day variation comes from placement, not from the run suddenly getting unfair.',
      'Allowing a small miss budget rather than ending the run on the first miss keeps a bad-luck early tap from throwing away an otherwise good run \u2014 the tension builds properly instead of resetting to zero at the first bump.',
    ],
    strategyTips: [
      'Watch a full revolution before your first tap if you can \u2014 the dial\u2019s speed doesn\u2019t change mid-stage, so one clean read of the timing carries you through the rest of it.',
      'Later stages move faster with a narrower window; aim slightly early rather than late, since human reaction time tends to land taps a beat behind where you intended.',
      'A miss early in a stage isn\u2019t fatal \u2014 the dial keeps sweeping, so you get another pass at the window on the very next revolution.',
    ],
    faq: [
      {
        q: 'Does the needle\'s speed change partway through a stage?',
        a: 'No, speed is fixed for the whole stage — it only increases once you advance to the next stage, so one clean read carries you through it.',
      },
      {
        q: 'How many misses can I afford?',
        a: 'A small budget, shown on screen — a miss or two won\'t end the run immediately, but running out ends it on the next miss.',
      },
      {
        q: 'Does the target arc\'s position repeat between stages?',
        a: 'No, it\'s randomized daily per stage, though its width and the dial\'s speed follow a fixed difficulty curve you can rely on.',
      },
      {
        q: 'Is today\'s dial the same for every player?',
        a: 'Yes, the arc placement and pacing come from the day\'s seed, so everyone is racing the same sequence of windows.',
      },
    ],
  },
  {
    slug: 'wobble-chef',
    index: '020',
    name: 'Wobble Chef',
    tagline: 'Today\u2019s menu, stacked one wobble at a time.',
    description:
      'Drop today\u2019s sequence of dishes onto a swaying tower, one at a time. Land off-center and the whole thing topples \u2014 stack the entire menu to win.',
    color: 'chef',
    avgSolveTime: '1:00',
    difficulty: 'Medium',
    category: 'arcade',
    howToPlay: [
      'A dish swings back and forth above the tower. Tap to drop it straight down.',
      'It falls under gravity and lands on whatever\u2019s currently on top of the tower.',
      'Land it close enough to center and it joins the tower, which becomes the new base for the next dish. Land too far off and it topples the tower \u2014 game over.',
      'Every day has a fixed menu of dishes in a fixed order. Stack the whole menu without a single topple to win.',
    ],
    designNotes: [
      'Wobble Chef trades a full stacking-physics simulation for one honest question per drop: was this close enough to the center of what\u2019s already there? That single tolerance check, applied to a real gravity-driven fall, gives the stack a physical feel without needing collision resolution between every dish already placed.',
      'The tower\u2019s effective center drifts slightly toward wherever you actually land each dish, not just the very first base \u2014 so a couple of slightly off-center placements in a row make the next drop measurably harder, the same way a real stack leans after a few uneven layers.',
    ],
    strategyTips: [
      'Aim for dead center rather than "close enough," especially early \u2014 small offsets compound, since each new layer\u2019s center shifts toward where the last dish actually landed.',
      'The swing speed is constant for the whole run, so timing your tap is about reading the swing\u2019s rhythm once, not reacting dish-by-dish.',
      'If you\u2019ve been landing consistently to one side, deliberately aim slightly the other way on your next drop \u2014 you\u2019re correcting the tower\u2019s drift, not just the current dish.',
    ],
    faq: [
      {
        q: 'Does the swing speed change as the tower gets taller?',
        a: 'No, the swing stays at a constant speed for the whole run — what gets harder is the shrinking margin for error as the tower\'s effective center drifts.',
      },
      {
        q: 'What happens if a dish is close to center but not exact?',
        a: 'It still lands and joins the tower, but the tower\'s effective center shifts slightly toward that landing spot, making the next drop\'s tolerance tighter.',
      },
      {
        q: 'Is today\'s menu order the same for everyone?',
        a: 'Yes, the sequence of dishes is fixed for the day and identical for every player.',
      },
      {
        q: 'Can I retry a single dish after a topple?',
        a: 'No, a topple ends the run — the whole menu has to be stacked in one continuous attempt to count as a win.',
      },
    ],
  },
  {
    slug: 'noodle-cat',
    index: '021',
    name: 'Noodle Cat',
    tagline: 'Mash before the bowl gets cold.',
    description:
      'Tap as fast as you can to help a very determined cat slurp down a bowl of noodles before the timer runs out \u2014 then the next bowl arrives, a little faster than the last.',
    color: 'noodle',
    avgSolveTime: '0:45',
    difficulty: 'Easy',
    category: 'arcade',
    howToPlay: [
      'Tap repeatedly to slurp noodles from the bowl. Each tap clears a little more of the noodle trail.',
      'Reach the target number of taps before the timer runs out to finish the bowl.',
      'Clearing a bowl brings out the next one \u2014 with a higher tap target and less time on the clock.',
      'Finish every bowl in today\u2019s run to win. Run out of time on any bowl and the run ends there.',
    ],
    designNotes: [
      'Noodle Cat is the index\u2019s one pure reflex test \u2014 no aiming, no timing window, just raw tap speed against a shrinking clock. It exists partly as a palate cleanser next to the more deliberate games elsewhere in the catalog.',
      'Each bowl\u2019s tap target and time budget are generated from the same daily seed as every other game, so "today\u2019s run" is exactly as hard for everyone who plays it \u2014 there\u2019s a fixed, comparable finish line even in a game that\u2019s otherwise just mashing as fast as you can.',
    ],
    strategyTips: [
      'A steady rhythm beats short frantic bursts \u2014 tapping speed tends to drop off fast right after a burst, right when you need it to hold.',
      'The time budget shrinks faster than the tap target grows across the run, so treat every later bowl as more urgent than the last, not just "a bit harder."',
      'If a bowl is close to finished when time is running low, keep tapping at the same pace rather than rushing \u2014 mistimed taps don\u2019t count for less, so panic doesn\u2019t cost you anything, but it doesn\u2019t help either.',
    ],
    faq: [
      {
        q: 'Does the tap target increase for every single bowl?',
        a: 'Yes, and the time budget shrinks at the same time, so later bowls are harder on both fronts, not just one.',
      },
      {
        q: 'Do mistimed or extra taps count against me?',
        a: 'No, every tap counts toward the target the same way — there\'s no penalty for tapping fast, only for not tapping enough in time.',
      },
      {
        q: 'Is today\'s sequence of bowls the same for everyone?',
        a: 'Yes, the tap targets and time limits per bowl come from the day\'s seed, so every player faces an identical run.',
      },
      {
        q: 'What happens if I finish a bowl with time to spare?',
        a: 'The next bowl starts immediately with its own target and clock — leftover time doesn\'t carry over.',
      },
    ],
  },
  {
    slug: 'acorn-dash',
    index: '022',
    name: 'Acorn Dash',
    tagline: 'Drag to catch. Watch the sway. Chase the gold ones.',
    description:
      'Guide a squirrel back and forth to catch today\u2019s falling acorns, dodge the burrs mixed in, and read every drop\u2019s sideways sway before it lands. Gold acorns forgive a miss \u2014 catch the full harvest to win.',
    color: 'acorn',
    avgSolveTime: '1:30',
    difficulty: 'Medium',
    category: 'arcade',
    howToPlay: [
      'Drag left and right (or use the arrow keys) to move the squirrel along the bottom of the screen.',
      'Acorns are good \u2014 catch every one you can. Spiky burrs are bad \u2014 just let them fall past you.',
      'Every drop sways side to side on its way down, so its landing spot isn\u2019t where it started \u2014 track the sway, not the starting point.',
      'Missing an acorn or catching a burr both count as a miss, and the budget is tight. A rare gold acorn forgives one miss when you catch it.',
      'Burrs are bigger and more dangerous than they look at a glance \u2014 give them extra clearance rather than grazing past.',
      'Chain enough catches in a row and you\u2019ll earn a few drops of a wider catch window \u2014 a reward for a hot streak, not just a bigger number.',
      'Today\u2019s harvest is a fixed, fast-ramping sequence of drops, the same for everyone. Catch every acorn in it to win.',
    ],
    designNotes: [
      'Acorn Dash is the one continuous-movement entry in the index \u2014 every other real-time game here is a single button press (flap, tap, drop) at the right moment, but this one asks for constant left-right tracking instead, the same muscle a classic catch game exercises.',
      'The sideways sway on every drop is what keeps the game from being solved by "stand under it" \u2014 the item\u2019s starting x tells you almost nothing about where it\u2019ll actually cross the catch line, so the whole descent has to be read, not just the spawn point.',
      'Gold acorns are a small forgiveness valve on an otherwise unforgiving miss budget: they reward good runs with a bit of margin for the harder drops still ahead, rather than just being extra points. A hot-streak "focus" window does the same job from the other direction \u2014 a run that\u2019s going well earns a temporarily wider catch window instead of just a higher score, so skill compounds into a little breathing room rather than just a bigger number.',
    ],
    strategyTips: [
      'Watch the sway for a beat before committing \u2014 lunging at a drop\u2019s starting x is a common way to end up under the wrong spot once it curves.',
      'A burr you don\u2019t catch costs you nothing, and their bigger size means a near-miss is riskier than it looks \u2014 give them a wider berth than instinct suggests.',
      'Prioritize gold acorns when you see one coming \u2014 the miss they forgive is worth more than the drop itself, especially once the later, faster drops start.',
      'A five-catch streak earns a few drops of a wider catch window \u2014 worth protecting a combo for on its own, not just for the score.',
      'The fall speed and sway both ramp up as the run goes on, so the read-and-react timing that worked on the first few drops will feel rushed by the end \u2014 start tracking each drop earlier than instinct suggests.',
    ],
    faq: [
      {
        q: 'Does catching a burr end the run immediately?',
        a: 'No, it counts as a miss against your miss budget, same as letting an acorn fall — the run only ends when that budget runs out.',
      },
      {
        q: 'How does a gold acorn help exactly?',
        a: 'Catching one forgives your next miss — it doesn\'t add score by itself, it banks a bit of margin for the harder drops ahead.',
      },
      {
        q: 'What triggers the wider catch window?',
        a: 'A streak of catches in a row — hit enough consecutive catches and you earn a few drops with extra forgiveness on positioning.',
      },
      {
        q: 'Does every drop sway the same amount?',
        a: 'No, sway varies drop to drop and tends to increase later in the run, alongside faster fall speed.',
      },
    ],
  },
  {
    slug: 'cloud-hop',
    index: '023',
    name: 'Cloud Hop',
    tagline: 'Bounces on its own. You just have to steer.',
    description:
      'A bunny bounces automatically from cloud to cloud, higher and higher \u2014 drag to steer it onto each next landing before gravity brings it back down. Climb today\u2019s full run of clouds to win.',
    color: 'cloud',
    avgSolveTime: '1:30',
    difficulty: 'Medium',
    category: 'arcade',
    howToPlay: [
      'The bunny bounces on its own \u2014 there\u2019s no jump button. Drag left and right (or use the arrow keys) to line it up with the next cloud before it falls back down.',
      'Drifting clouds sway side to side, so aim for where one will be, not where it is right now.',
      'Landing on a rainbow cloud gives the very next bounce extra height \u2014 handy for an unusually large gap right after.',
      'Going off one edge of the screen brings the bunny back in from the other side.',
      'Miss a landing and the bunny falls out of view \u2014 the run ends there. Reach the top of today\u2019s fixed run of clouds to win.',
    ],
    designNotes: [
      'Cloud Hop deliberately has no jump input at all \u2014 gravity and a fixed bounce velocity handle the vertical motion completely, so the only thing left for the player to control is horizontal position. That constraint is the whole game: steering, not timing.',
      'Every gap between clouds is generated to stay within the bunny\u2019s actual maximum jump height, so a landing is always physically reachable \u2014 the difficulty ramp comes from gaps using more and more of that maximum as the run goes on, not from ever asking for something the physics can\u2019t deliver.',
      'The camera only tracks the highest point reached, never the bunny\u2019s current height \u2014 which is what allows a fall to actually carry it down and off the bottom of the screen instead of the view following it back down and softening the miss.',
    ],
    strategyTips: [
      'Start steering toward a drifting cloud\u2019s landing spot well before you reach its height \u2014 reacting only once you\u2019re level with it is usually too late.',
      'A rainbow cloud\u2019s bonus only applies to the very next bounce, so line up your following landing before you take it, not after.',
      'The screen wraps left-to-right, so a cloud sitting near one edge is often easier to reach by drifting off the opposite side than by chasing it directly.',
      'Gaps get closer to the bunny\u2019s absolute maximum jump height later in the run, so a landing that felt like it had room to spare early on won\u2019t necessarily feel that way by the end.',
    ],
    faq: [
      {
        q: 'Is there a jump button?',
        a: 'No — the bunny bounces automatically on a fixed rhythm. The only input is steering left and right to line up the next landing.',
      },
      {
        q: 'What happens if I go off the side of the screen?',
        a: 'The bunny wraps around and re-enters from the opposite edge, so the screen behaves like a loop rather than a wall.',
      },
      {
        q: 'How long does a rainbow cloud\'s bonus last?',
        a: 'Just one bounce — it boosts the very next jump\'s height only, so line up that next landing before you take it.',
      },
      {
        q: 'Is every gap actually reachable?',
        a: 'Yes, gaps are generated to stay within the bunny\'s maximum jump height, though later gaps use more of that maximum than earlier ones.',
      },
    ],
  },
  {
    slug: 'twin-peek',
    index: '024',
    name: 'Twin Peek',
    tagline: 'Flip two. Remember where the others were.',
    description:
      'A classic memory-match grid starring the whole arcade cast \u2014 flip two cards at a time to find every pair before you run out of attempts. Today\u2019s layout is the same for everyone.',
    color: 'peek',
    avgSolveTime: '1:20',
    difficulty: 'Medium',
    category: 'puzzle',
    howToPlay: [
      'Tap any face-down card to flip it, then tap a second one. If they match, both stay face-up. If not, they flip back down.',
      'Each pair of flips counts as one attempt. Find every matching pair before you run out of attempts to win.',
      'Match three pairs in a row without a miss and you\u2019ll earn a couple of extra attempts \u2014 a reward for remembering well, not just a bigger score.',
      'Today\u2019s card layout is shuffled from the daily seed, the same arrangement for every player.',
    ],
    designNotes: [
      'Twin Peek is the one turn-based, no-physics entry among the site\u2019s newer arcade-style additions \u2014 there\u2019s no timer, no gravity, no drag. Just a grid, a memory, and a budget of attempts, which made it the natural pick for a genuinely different type of game to add.',
      'The eight symbols are small portraits of the other games\u2019 mascots \u2014 the Boo Rush ghost, the Blobble blob, the Acorn Dash squirrel, the Cloud Hop bunny, and a few others \u2014 plus the site\u2019s own mark rounding out the eighth pair. It\u2019s a quiet "whole cast" cameo rather than a new visual theme.',
      'The combo-bonus attempts exist for the same reason golden acorns and focus streaks exist elsewhere in the catalog: a strict, unforgiving budget rewards a good run with a little real margin, instead of just tallying a higher score for the same fixed difficulty.',
    ],
    strategyTips: [
      'Use your first several flips to build a mental map of the whole board rather than chasing an immediate match \u2014 attempts spent purely scouting often pay for themselves later.',
      'When you flip a card that doesn\u2019t match anything you\u2019ve seen yet, its position is still useful information \u2014 you now know what it isn\u2019t, even before you know what it is.',
      'Protect a combo once you have one going: on a hot streak, a safer, more certain match is worth more than a risky guess at an uncertain one, since a miss resets the streak entirely.',
    ],
    faq: [
      {
        q: 'What counts as one attempt?',
        a: 'Each pair of flips, whether they match or not — flipping just one card and stopping doesn\'t use an attempt.',
      },
      {
        q: 'How many matches in a row trigger the bonus attempts?',
        a: 'Three consecutive matched pairs without a miss in between earns a couple of extra attempts.',
      },
      {
        q: 'Is the card layout the same for every player each day?',
        a: 'Yes, the arrangement is shuffled from the day\'s seed, so everyone is memorizing the identical board.',
      },
      {
        q: 'Does a mismatched flip give me any information?',
        a: 'Yes — even a non-matching flip reveals what that card is, which narrows down future guesses even though the attempt is spent.',
      },
    ],
  },
  {
    slug: 'world-data-duel',
    index: '025',
    name: 'World Data Duel',
    tagline: 'Know the World. Play the World.',
    description:
      'A reasoning card duel built on real world statistics. Read the flags and tags on your hand, guess which country wins each round\u2019s question \u2014 population, GDP, coffee production, and more \u2014 and spend your cards wisely across the match.',
    color: 'duel',
    avgSolveTime: '4:00',
    difficulty: 'Medium',
    category: 'cards',
    howToPlay: [
      'Pay the entry fee to start a Standard League match. You and the CPU are each dealt 5 country cards.',
      'Each round shows a question \u2014 e.g. "Population" or "Coffee Production." Pick one card from your hand to compete with.',
      'The country with the higher (or, for some questions, lower) real-world value wins the round.',
      'Each card can only be played once per match, so save your strongest cards for the questions you expect, not just the first round.',
      'Win rounds to earn Coins; a full 5-0 match pays an extra Perfect Clear bonus. Winning a round with a country you haven\u2019t won with before unlocks it in your Discovery log.',
    ],
    designNotes: [
      'World Data Duel isn\u2019t really a numbers-memorization game \u2014 it\u2019s a tag-reading game. Seeing "Amazon / Coffee / Football" on Brazil is enough to make a confident guess on a coffee question without ever having seen the production figures, and that inference is the actual gameplay.',
      'The CPU is dealt one of a few personalities each match \u2014 an Economist that leans hard on its strongest economic cards, a Farmer that does the same for agricultural questions, an Explorer that favors its most distinctive-tagged card regardless of the question, and a Balanced opponent with no particular lean. Reading which personality you\u2019re up against becomes part of the read.',
      'All figures are sourced, dated statistics (World Bank, IMF, FAOSTAT/ICO, UN, IOC) rather than invented numbers \u2014 every round names its data year so a surprising result is something you can go verify, not just take on faith.',
    ],
    strategyTips: [
      'Read tags before you commit \u2014 a country flagged "Coffee" or "Amazon" is telling you something long before the numbers are revealed.',
      'Don\u2019t spend your most obviously-strong card on the first question you see \u2014 with only 5 cards for 5 rounds, an early guess can leave you without an answer for a later one.',
      'A tie still costs you nothing, so when you\u2019re unsure, a safe mid-tier card is often better than gambling your best card on a guess.',
      'Watch how the CPU plays its first couple of rounds \u2014 a strong economic pick early is a good sign you\u2019re facing the Economist personality, and you can plan the rest of the match around that read.',
    ],
    faq: [
      {
        q: 'Where do the statistics come from?',
        a: 'Sourced, dated figures from places like the World Bank, IMF, FAOSTAT/ICO, UN, and IOC — each round shows its data year so you can verify a surprising result.',
      },
      {
        q: 'Can I play the same card twice in a match?',
        a: 'No, each of your five cards can only be played once per match, so saving strength for the right question matters.',
      },
      {
        q: 'What happens on a tie?',
        a: 'Neither side wins the round, and it costs you nothing — a safe way to play a mid-tier card when you\'re unsure.',
      },
      {
        q: 'Does the CPU play the same way every match?',
        a: 'No, it\'s assigned one of a few personalities per match (Economist, Farmer, Explorer, or Balanced), and reading which one you\'re facing is part of the strategy.',
      },
    ],
  },
  {
    slug: 'pigment',
    index: '026',
    name: 'Pigment',
    tagline: 'Mix by feel. Match by eye.',
    description:
      'Tap Red, Yellow, Blue, White, and Black to mix three target colors from scratch, no color codes shown \u2014 just a live match percentage guiding you closer with every tap.',
    color: 'pigment',
    avgSolveTime: '3:30',
    difficulty: 'Medium',
    category: 'puzzle',
    howToPlay: [
      'Each day shows a target color swatch. Tap ink colors (Red, Yellow, Blue, White, Black) to add them to your mixing well.',
      'Your well\u2019s color is the average of everything you\u2019ve tapped into it, shown live next to the target.',
      'A match meter shows how close your mix is to the target. Once it\u2019s close enough, "Bottle it" locks it in and moves you to the next target.',
      'Clearing the well to start over is free. Only adding ink costs a tap, and you share one tap budget across all three targets.',
      'Bottle all three targets before your taps run out to win.',
    ],
    designNotes: [
      'Pigment deliberately never shows the numeric recipe behind a target color \u2014 you\u2019re reasoning about hue and saturation the way you would mixing actual paint, with the match percentage standing in for "does this look right yet?"',
      'Because the well tracks a running average, order doesn\u2019t matter but ratio does: three parts red to one part white lands in a very different place than one part red to three parts white, even though both are "mostly red and white."',
      'Clearing the well for free (versus in games where undo costs a move) was a deliberate choice \u2014 the fun here is in the mixing experimentation, not in punishing a wrong guess.',
    ],
    strategyTips: [
      'Start with two or three taps of the color the target most obviously leans toward, then use the match meter to fine-tune rather than guessing a full recipe up front.',
      'White and black shift lightness without changing hue much \u2014 useful for nudging a close mix without overcorrecting.',
      'If a mix stalls below a high match percentage no matter what you add, clear it (it\u2019s free) and try a completely different starting ratio rather than tapping on top of a bad base.',
      'Budget your taps knowing all three targets share one pool \u2014 a target you nail in three taps banks taps for a trickier one later.',
    ],
    faq: [
      {
        q: 'Does the order I add ink colors matter?',
        a: 'No, the well tracks a running average of everything added, so ratio matters but the order you tap colors in doesn\'t change the result.',
      },
      {
        q: 'Does clearing the well cost a tap?',
        a: 'No, clearing is free — only adding ink to the well counts against your shared tap budget.',
      },
      {
        q: 'Do I need an exact 100% match to bottle a color?',
        a: 'No, the match meter just needs to be close enough — you don\'t need a pixel-perfect match to lock a target in.',
      },
      {
        q: 'Is the tap budget shared across all three targets?',
        a: 'Yes, one pool covers all three colors, so an efficient early mix leaves more taps available for a trickier later target.',
      },
    ],
  },
  {
    slug: 'waypoint',
    index: '027',
    name: 'Waypoint',
    tagline: 'Every step in order. No step wasted.',
    description:
      'A handful of numbers are fixed on a 5\u00d75 grid. Trace the single path connecting 1 through 25, one adjacent cell at a time, using the fixed numbers to deduce the route between them before you run out of guesses.',
    color: 'waypoint',
    avgSolveTime: '4:30',
    difficulty: 'Hard',
    category: 'puzzle',
    howToPlay: [
      'The grid has a handful of numbers already placed. Number 1 and the final number are always shown; a few more are fixed in between.',
      'Tap the cell orthogonally adjacent to your current highest number to guess where the next number goes.',
      'A correct guess locks that number in place and becomes your new current cell. A wrong guess costs one of your limited guesses but doesn\u2019t place anything.',
      'The path must pass through every fixed number at exactly the right step \u2014 use that to rule out dead-end directions before you tap.',
      'Fill all 25 cells before your guesses run out to win.',
    ],
    designNotes: [
      'Waypoint is a Hidato-style path puzzle: a single line snakes through every cell of the grid exactly once, and the pre-placed numbers are the only anchors telling you where that line has to pass. Everything else is deduction from adjacency and cell-counting, not guesswork.',
      'Wrong guesses don\u2019t corrupt the board \u2014 they just cost you one of a limited pool of attempts, so tapping a plausible-looking neighbor to test a theory is a reasonable move, not a punishing mistake, as long as you\u2019re not doing it blindly.',
      'Every path is generated fresh each day from a random walk across the grid, then a subset of steps gets revealed as fixed clues \u2014 so the puzzle is different daily but always guaranteed solvable.',
    ],
    strategyTips: [
      'Count backward from the next fixed number: if there are exactly 3 blank cells between your current position and a clue three steps ahead, any branch that can\u2019t reach that clue in exactly 3 steps is wrong, even if it looks adjacent and reasonable.',
      'Corners and edges have fewer neighbors than open cells \u2014 when a corner is still empty, work out how it must connect before it becomes your only remaining option.',
      'If two neighboring cells both look plausible, look one step further down each branch rather than guessing \u2014 one of them usually leads toward a dead pocket of cells with no way back out.',
      'Save your guesses for real forks in the path. If there\u2019s only one open neighbor, that\u2019s not a guess \u2014 it\u2019s the only move, so tap it with confidence.',
    ],
    faq: [
      {
        q: 'Does a wrong guess remove any numbers I\'ve already placed?',
        a: 'No, wrong guesses only cost one of your limited attempts — they never undo or corrupt numbers you\'ve already locked in.',
      },
      {
        q: 'Can the path move diagonally between numbers?',
        a: 'No, the path only connects orthogonally adjacent cells, one step at a time from 1 through 25.',
      },
      {
        q: 'Are the pre-placed numbers always the same amount each day?',
        a: 'The count varies, but there are always enough fixed clues to guarantee the path is uniquely deducible from adjacency and cell-counting.',
      },
      {
        q: 'What should I do when two neighboring cells both look valid?',
        a: 'Look further down each branch before guessing — one usually leads into a pocket of cells with no way back out, which rules it out without spending a guess.',
      },
    ],
  },
  {
    slug: 'cairn',
    index: '028',
    name: 'Cairn',
    tagline: 'Pair to ten. Clear the cairn.',
    description:
      'A pyramid of 15 cards, stacked like stones. Pair exposed cards that add up to ten to clear them, working your way up from the base, before your draws from the reserve run out.',
    color: 'cairn',
    avgSolveTime: '4:00',
    difficulty: 'Medium',
    category: 'cards',
    howToPlay: [
      'Fifteen cards (values 1\u20139) are stacked in a 5-row pyramid. Only cards not covered by any remaining card below them are exposed and tappable \u2014 the bottom row starts fully exposed.',
      'Tap two exposed cards whose values add up to 10 to clear them both. Clearing cards can expose new cards in the row above.',
      'You can also pair an exposed pyramid card with the current waste card (the top card from the reserve pile).',
      'Tap "Draw" to reveal the next reserve card into the waste slot. Pairing is free; only drawing costs one of your limited draws.',
      'Clear all 15 pyramid cards before your draws run out to win.',
    ],
    designNotes: [
      'Cairn is a scaled-down take on classic pyramid solitaire \u2014 15 cards instead of 28, a fixed target sum instead of face-card special cases, and no redeals, so a full run stays inside a few focused minutes.',
      'Like the traditional game it\u2019s based on, not every deal is guaranteed solvable \u2014 that unpredictability is part of the genre rather than a bug we\u2019re trying to eliminate.',
      'Drawing costs a move, but every valid pair you clear is free, which is meant to reward reading the pyramid carefully before reaching for a new reserve card.',
    ],
    strategyTips: [
      'Prioritize pairs that unlock a new exposed card over pairs that don\u2019t \u2014 clearing two bottom-row cards that both cover the same higher card exposes something new; clearing two cards that don\u2019t share a covered parent doesn\u2019t.',
      'Before drawing, scan the whole exposed row for every possible pair, not just the first one you notice \u2014 clearing more before you draw keeps your draw budget for later, harder stretches.',
      'The waste card is only useful once \u2014 if it doesn\u2019t pair with anything currently exposed, drawing past it is often better than holding out for a match that may not come.',
      'Cards that sum to 10 with themselves (two 5s) are easy to overlook \u2014 keep an eye out whenever multiple 5s are exposed at once.',
    ],
    faq: [
      {
        q: 'Can I pair the waste card with a pyramid card at any time?',
        a: 'Yes, as long as the pyramid card is exposed and the two values sum to 10 — pairing itself never costs a move, only drawing does.',
      },
      {
        q: 'Is every deal guaranteed to be solvable?',
        a: 'No — like traditional pyramid solitaire, not every deal can be fully cleared, which is part of the genre rather than a flaw.',
      },
      {
        q: 'What exposes a new card in the pyramid?',
        a: 'Clearing both cards directly below it in the row underneath — a card stays covered until everything resting on it is gone.',
      },
      {
        q: 'Do two exposed 5s count as a valid pair?',
        a: 'Yes, any two exposed cards summing to 10 pair, including two 5s — easy to miss when several fives are on the board at once.',
      },
    ],
  },
  {
    slug: 'decant',
    index: '029',
    name: 'Decant',
    tagline: 'No cups. Just exactly enough.',
    description:
      'Three jugs of different sizes, an unlimited tap, and a target amount. Fill, empty, and pour between jugs until one of them holds exactly the right volume.',
    color: 'decant',
    avgSolveTime: '4:00',
    difficulty: 'Medium',
    category: 'puzzle',
    howToPlay: [
      'Three jugs of different capacities start empty. A target amount is shown at the top.',
      'Fill a jug completely from the tap, empty a jug out completely, or pour from one jug into another until the source is empty or the destination is full.',
      'Every fill, empty, or pour counts as one move, tracked against your move limit.',
      'Reach the exact target amount in any one jug \u2014 not necessarily a specific one \u2014 to win.',
    ],
    designNotes: [
      'This is the classic water-pouring puzzle (the "jug problem" from Die Hard 3, among other places), generalized to a random set of three jug sizes and a random target every day.',
      'Every day\u2019s puzzle is generated by first solving it: we search every reachable combination of jug amounts from empty, and only pick a target that a real shortest path actually reaches. Nothing in Decant is ever unsolvable \u2014 the move limit is set directly from that verified shortest path, plus some slack.',
      'Unlike most jug-puzzle explanations online, which fix the win condition to one particular jug, Decant accepts the target amount landing in any of the three \u2014 there\u2019s often more than one valid route to a working answer.',
    ],
    strategyTips: [
      'Pouring is rarely wasted, but emptying a jug you might need again usually is \u2014 think about what you\u2019ll need two moves from now, not just the very next pour.',
      'The classic trick behind these puzzles: pouring the smallest jug into the largest, refilling the smallest, and pouring again often isolates an amount you can\u2019t reach directly.',
      'If you\u2019re stuck, try emptying everything and starting from a completely different first move \u2014 the first fill you choose quietly commits you to one branch of the whole solution.',
      'The move limit has slack built in beyond the optimal solution, so a small detour won\u2019t sink you \u2014 but repeating the same fill/empty pair rarely helps.',
    ],
    faq: [
      {
        q: 'Does the target amount always have to end up in a specific jug?',
        a: 'No, the target can land in any of the three jugs — you don\'t need to aim for one particular container.',
      },
      {
        q: 'What counts as one move?',
        a: 'Any single fill, empty, or pour — each one, regardless of how much water it moves, counts the same against your move limit.',
      },
      {
        q: 'Is every day\'s target actually reachable?',
        a: 'Yes, the target is only chosen after verifying a real shortest path reaches it, and the move limit is set from that path plus some slack.',
      },
      {
        q: 'Can I pour only part of a jug\'s contents into another?',
        a: 'No, a pour always continues until either the source jug is empty or the destination jug is full — there\'s no partial pour.',
      },
    ],
  },
  {
    slug: 'cipher',
    index: '030',
    name: 'Cipher',
    tagline: 'Every letter has a twin. Find them all.',
    description:
      'A short phrase encoded one letter at a time. Every occurrence of a cipher letter always stands for the same real letter \u2014 work out the substitution using repetition, short words, and pattern recognition.',
    color: 'cipher',
    avgSolveTime: '5:00',
    difficulty: 'Medium',
    category: 'word',
    howToPlay: [
      'A short phrase is shown with every letter substituted for a different one, consistently throughout.',
      'Tap any tile to select its cipher letter, then tap a real letter below to guess what it stands for \u2014 every matching tile updates at once.',
      'Assigning a letter that\u2019s already in use elsewhere moves it, since each real letter can only be used once.',
      'The puzzle solves itself automatically the moment your guesses reconstruct the full original phrase.',
    ],
    designNotes: [
      'Cipher is a classic cryptogram, played the traditional way: no letter-by-letter right/wrong feedback, no built-in hints. The only signal you get is whether the whole reconstructed phrase reads correctly once you\u2019ve filled enough of it in.',
      'The phrase bank is a small set of original one-line sentences written specifically for this game \u2014 nothing quoted from an existing book, poem, or song.',
      'The move limit is calculated per-phrase, based on how many distinct letters that day\u2019s phrase actually uses, so a short phrase with few unique letters isn\u2019t held to the same budget as a long, letter-rich one.',
    ],
    strategyTips: [
      'Look for repeated letters and short words first \u2014 a lone cipher letter that keeps appearing by itself is very likely to be "A" or "I".',
      'Common short words are the fastest way in: a 3-letter cipher word is a strong candidate for "THE" or "AND".',
      'A cipher letter that appears doubled in a row (like "LL" or "SS" in English) narrows the possibilities a lot \u2014 not many letters double up that often.',
      'Once you\u2019ve locked in three or four letters, try reading the partially-solved phrase out loud \u2014 your ear will often finish words your eyes are still stuck on.',
    ],
    faq: [
      {
        q: 'Does the game tell me if a single letter guess is right or wrong?',
        a: 'No — there\'s no letter-by-letter feedback. The only signal is whether the fully reconstructed phrase reads correctly.',
      },
      {
        q: 'What happens if I assign a real letter that\'s already used elsewhere?',
        a: 'It moves — each real letter can only be assigned to one cipher letter at a time, so reassigning it frees it up from its previous spot.',
      },
      {
        q: 'Are the phrases taken from real books, songs, or quotes?',
        a: 'No, they\'re original one-line sentences written specifically for the game — nothing quoted from existing published work.',
      },
      {
        q: 'Is the move limit the same for every phrase?',
        a: 'No, it\'s calculated from how many distinct letters that specific day\'s phrase uses, so shorter or letter-light phrases get a smaller budget.',
      },
    ],
  },
  {
    slug: 'clearway',
    index: '031',
    name: 'Clearway',
    tagline: 'One way out. Everything else in the way.',
    description:
      'A marked vehicle sits boxed in on a 6\u00d76 grid full of others. Slide vehicles along their own length \u2014 horizontal ones sideways, vertical ones up and down \u2014 to open a path to the exit.',
    color: 'clearway',
    avgSolveTime: '4:30',
    difficulty: 'Medium',
    category: 'movement',
    howToPlay: [
      'The marked vehicle needs to reach the right edge of its row. Every other vehicle can only slide along its own orientation \u2014 sideways if horizontal, up and down if vertical.',
      'Tap a vehicle to select it, then tap an empty cell in the same row (for horizontal vehicles) or column (for vertical ones) to slide it there in one move.',
      'A vehicle can slide any distance in one tap, as long as every cell along the way is empty.',
      'Clear a path and slide the marked vehicle all the way to the exit before you run out of moves.',
    ],
    designNotes: [
      'Every day\u2019s layout is generated by starting from an already-solved board \u2014 the marked vehicle genuinely at the exit \u2014 and then scrambling it with a sequence of real legal moves. Reversing that exact sequence is always a valid solution, so nothing in Clearway is ever a dead end by construction.',
      'The trickiest part of generating a fair puzzle turned out to be making sure the marked vehicle actually leaves the exit during setup \u2014 a vehicle parked in exactly the wrong spot can trap it there completely, which took a few rounds of testing to catch and fix properly.',
      'A single tap moves a vehicle as far as it will legally go in that direction, not one cell at a time \u2014 counting "moves" as full slides keeps the move budget meaningful without turning the puzzle into a tedious cell-by-cell shuffle.',
    ],
    strategyTips: [
      'Work backward from the exit: identify which vehicle is physically blocking the marked one first, then figure out what\u2019s blocking that vehicle, rather than moving whatever\u2019s convenient.',
      'Vertical vehicles sitting in the marked vehicle\u2019s row are usually the real obstacles \u2014 they just need to slide up or down, not out of the grid entirely.',
      'Before moving a vehicle, check whether the space you\u2019re about to occupy is one you\u2019ll need clear again two moves later \u2014 backtracking costs just as much as any other move.',
      'A vehicle with only one legal direction available isn\u2019t a choice \u2014 make that move first and save your thinking for the vehicles with real options.',
    ],
    faq: [
      {
        q: 'Can a vehicle move diagonally?',
        a: 'No, vehicles only slide along their own orientation — horizontal ones sideways, vertical ones up and down.',
      },
      {
        q: 'Does one tap move a vehicle one cell or all the way?',
        a: 'All the way — a single tap slides it as far as it will legally go in that direction, counted as one move regardless of distance.',
      },
      {
        q: 'Is every daily layout guaranteed solvable?',
        a: 'Yes, each board is generated by scrambling backward from an already-solved position, so reversing that sequence is always a valid route out.',
      },
      {
        q: 'How do I know which vehicle to move first?',
        a: 'Work backward from the exit — identify whatever\'s directly blocking the marked vehicle, then whatever\'s blocking that vehicle, rather than moving whatever looks convenient.',
      },
    ],
  },
  {
    slug: 'overdraw',
    index: '032',
    name: 'Overdraw',
    tagline: 'Everyone draws the same deck. Only you decide when to stop.',
    description:
      'A fixed 20-card deck, drawn one at a time. Bank a run before a bust card wipes it out \u2014 longer runs bank a bigger bonus, and the deck always shows you exactly how risky your next draw is.',
    color: 'overdraw',
    avgSolveTime: '3:30',
    difficulty: 'Medium',
    category: 'arcade',
    howToPlay: [
      'The day\u2019s 20-card deck is fixed \u2014 everyone draws the exact same sequence, in the same order.',
      'Draw cards one at a time. Point cards add to your current run; a bust card wipes the run to zero.',
      'Bank at any time (for free) to lock in your current run, plus a bonus for how many cards you held before banking.',
      'Reach the target score before the deck runs out to win.',
    ],
    designNotes: [
      'The deck composition and the risk of your next draw are never hidden \u2014 you always know exactly how many cards are left and how many of them are busts. The tension is entirely about deciding when that risk is worth it, not about being kept in the dark.',
      'Banking one card at a time is deliberately incapable of reaching the target on its own \u2014 the streak bonus for holding a longer run exists specifically so the safest possible strategy isn\u2019t also the winning one.',
      'Because the deck is fixed for the day, this isn\u2019t really a game of chance dressed up as a puzzle \u2014 it\u2019s a single, identical decision tree that every player navigates differently.',
    ],
    strategyTips: [
      'Watch the risk percentage, not just the raw count of bust cards left \u2014 4 busts out of 5 remaining cards is far more dangerous than 4 busts out of 16.',
      'Holding a run of 4-5 cards before banking captures most of the available bonus \u2014 pushing for 6 or more often isn\u2019t worth the extra risk.',
      'Early in the deck, risk is usually lower simply because more safe cards are still mixed in \u2014 it\u2019s often correct to hold longer near the start than near the end.',
      'If you\u2019re close to the target and a bust would end the game, banking a smaller-but-safe run beats chasing a bigger one you might not get to keep.',
    ],
    faq: [
      {
        q: 'Does banking cost a move or a card?',
        a: 'No, banking is free — only drawing the next card counts against the fixed 20-card deck.',
      },
      {
        q: 'Is the deck actually random, or the same for everyone?',
        a: 'The day\'s 20-card sequence is fixed and identical for every player — the only variable is when each person chooses to bank.',
      },
      {
        q: 'What happens if I draw a bust card?',
        a: 'Your current run resets to zero immediately — anything already banked earlier in the day\'s play stays safe, but the active run is lost.',
      },
      {
        q: 'Is holding for a longer streak always better?',
        a: 'Not necessarily — the bonus for length flattens out, so pushing past 5-6 cards often adds more risk than reward.',
      },
    ],
  },
  {
    slug: 'burrow',
    index: '033',
    name: 'Burrow',
    tagline: 'Find the key. Mind the hazards. Get home.',
    description:
      'A small burrowing critter navigates a fresh daily den. Find the key, then the door \u2014 the marked hazards are always visible, and the correct route never crosses one.',
    color: 'burrow',
    avgSolveTime: '3:30',
    difficulty: 'Easy',
    category: 'movement',
    howToPlay: [
      'A new maze-shaped den is generated every day. Tap an adjacent open cell to move your critter there.',
      'Find the key first \u2014 the door won\u2019t count as reached until you\u2019re holding it.',
      'Hazard tiles are marked and visible the entire time. Stepping on one ends the run immediately.',
      'Reach the door with the key before you run out of moves to win.',
    ],
    designNotes: [
      'Every hazard is visible from the very first look at the den \u2014 nothing is hidden, and the guaranteed correct route never crosses a single one of them. The challenge is tracing that route through the maze\u2019s branches, not guessing where danger might be.',
      'The den is generated as a perfect maze \u2014 there is exactly one possible path between any two points in it, no loops or shortcuts. Every dead end you explore is a real dead end, not a trap in the traditional sense.',
      'The key and the door are placed at the two farthest-apart points the day\u2019s maze happens to produce, so the walk is never trivially short.',
    ],
    strategyTips: [
      'Trace the den with your eyes before moving \u2014 in a maze with exactly one true path, most branches you can see are dead ends, and spotting them early saves wasted moves.',
      'Hazard tiles are never on the correct route, so if a path you\u2019re tracing runs through one, that branch is a dead end regardless of anything else.',
      'Head toward the key first no matter how the door looks from where you start \u2014 reaching the door early doesn\u2019t count for anything without it.',
      'If you hit a dead end, backtrack immediately rather than searching further down it \u2014 in a perfect maze, a dead end never quietly connects back around.',
    ],
    faq: [
      {
        q: 'Are the hazard tiles hidden until I step near them?',
        a: 'No, every hazard is visible from the very first look at the den — nothing is hidden or revealed gradually.',
      },
      {
        q: 'Can the correct route ever cross a hazard tile?',
        a: 'No, the guaranteed solution never passes through a marked hazard — if a path you\'re tracing does, that branch is wrong.',
      },
      {
        q: 'Does reaching the door before finding the key count for anything?',
        a: 'No, the door only counts as reached once you\'re holding the key — get the key first no matter how the door looks from your start.',
      },
      {
        q: 'Is the maze guaranteed to have only one path between any two points?',
        a: 'Yes, each den is a perfect maze with no loops or shortcuts, so every dead end really is a dead end.',
      },
    ],
  },
  {
    slug: 'vantage',
    index: '034',
    name: 'Vantage',
    tagline: 'Turn it over. Count what\u2019s hiding.',
    description:
      'A freely rotatable 3D voxel structure, cubes hidden behind others until you turn it. Guess how many cubes it\u2019s made of \u2014 each guess tells you higher or lower.',
    color: 'vantage',
    avgSolveTime: '3:00',
    difficulty: 'Medium',
    category: 'puzzle',
    howToPlay: [
      'A 3D shape made of unit cubes sits in the middle of the screen. Drag to rotate it and scroll or pinch to zoom.',
      'Some cubes are always hidden behind others from any single angle \u2014 you\u2019ll need to actually rotate the shape to see them.',
      'Type a guess for the total number of cubes and submit it.',
      'Each guess tells you whether the real count is higher or lower. Find the exact number before you run out of guesses.',
    ],
    designNotes: [
      'This is the one 3D game in the catalog \u2014 a real, rotatable WebGL scene rather than an isometric illusion, because the whole puzzle depends on cubes genuinely being hidden behind each other until you turn the shape.',
      'The shape is grown daily from a single seed cube, always staying one connected object rather than floating fragments, so it always reads as one coherent thing to inspect rather than a scattered pile.',
      'Guesses give higher/lower feedback rather than nothing at all, since guessing a hidden 3D count completely blind would be pure luck \u2014 the feedback turns it into a real search problem layered on top of the spatial reasoning.',
    ],
    strategyTips: [
      'Rotate to at least three distinct angles before your first guess \u2014 a shape that looks small head-on often reveals a whole extra layer of cubes from the side or underneath.',
      'Look at the shape from directly above and directly below \u2014 those two angles catch cubes that side-on rotation alone can miss.',
      'Use your first guess as an estimate, not a real answer \u2014 the higher/lower feedback is far more reliable than eyeballing a hidden structure, so let it guide your second guess.',
      'Once you have a higher/lower result, narrow toward the midpoint of the remaining possible range rather than adjusting by just one or two \u2014 you have a limited number of guesses to work with.',
    ],
    faq: [
      {
        q: 'Does the shape ever include floating, disconnected pieces?',
        a: 'No, it\'s grown from a single seed cube and always stays one connected structure, never scattered fragments.',
      },
      {
        q: 'What does the higher/lower feedback tell me exactly?',
        a: 'Only whether your guessed total is above or below the real cube count — not by how much, so treat it as a direction, not a distance.',
      },
      {
        q: 'How many angles should I check before guessing?',
        a: 'At least three, including straight from above and below — those catch cubes that side rotation alone often misses.',
      },
      {
        q: 'Is there a limit to how much I can zoom or rotate?',
        a: 'No, you can rotate and zoom freely as many times as you like — only submitting a guess counts against your limited attempts.',
      },
    ],
  },
  {
    slug: 'tumble',
    index: '035',
    name: 'Tumble',
    tagline: 'End over end. Land it standing up.',
    description:
      'A rectangular block rolls end over end across a 3D board full of gaps. Reach the goal tile standing upright \u2014 lying flat on it doesn\u2019t count, and rolling off a gap ends the run.',
    color: 'tumble',
    avgSolveTime: '4:00',
    difficulty: 'Hard',
    category: 'puzzle',
    howToPlay: [
      'The block starts standing on a single tile. Roll it up, down, left, or right \u2014 it tips end over end, alternating between standing on one tile and lying flat across two.',
      'Drag to rotate the camera and scroll to zoom, so you can check what a roll will land on before you commit.',
      'Rolling any part of the block off the edge of the board, or onto a missing tile, ends the run immediately.',
      'Reach the goal tile standing upright \u2014 arriving lying down doesn\u2019t count \u2014 before you run out of moves.',
    ],
    designNotes: [
      'This is the mechanic from a classic browser puzzle genre built from scratch \u2014 a 1\u00d71\u00d72 block that alternates between standing and lying flat as it rolls, rather than simply sliding.',
      'Every day\u2019s board is generated by first solving a completely full, gap-free board to get one guaranteed route, then only cutting gaps into tiles that route never touches \u2014 so however sparse the board looks, a solution always survives intact.',
      'Both the start and goal position, and the exact shape of the guaranteed route between them, are randomized daily \u2014 not just which tiles are missing \u2014 so the puzzle doesn\u2019t settle into one memorizable shape over time.',
    ],
    strategyTips: [
      'A block lying flat is twice as wide as when it\u2019s standing \u2014 check that both tiles under it exist before rolling into a lying orientation near the edge of the board.',
      'Rotate the camera to look straight down before committing to a roll near any gap \u2014 it\u2019s easy to misjudge which tiles are missing from a low angle.',
      'Rolling parallel to a lying block\u2019s long axis stands it up two tiles further on; rolling perpendicular just shifts it sideways while it stays lying down \u2014 those are very different moves.',
      'If the goal is only reachable while standing, plan your last move specifically to arrive standing \u2014 arriving lying across the goal tile doesn\u2019t win.',
    ],
    faq: [
      {
        q: 'Does the block always alternate between standing and lying flat?',
        a: 'Yes, every roll flips it between those two states — there\'s no way to slide it while staying in the same orientation.',
      },
      {
        q: 'Does arriving at the goal tile lying down count as a win?',
        a: 'No, the block must be standing upright on the goal tile specifically — lying across it, even partially, doesn\'t count.',
      },
      {
        q: 'What happens if part of the block rolls onto a missing tile?',
        a: 'The run ends immediately, even if only one end of the block goes over a gap.',
      },
      {
        q: 'Is every board guaranteed to have a working route?',
        a: 'Yes, gaps are only cut into tiles that a pre-solved guaranteed route never touches, so a solution always survives.',
      },
    ],
  },
  {
    slug: 'untangle',
    index: '036',
    name: 'Untangle',
    tagline: 'Every tile has one true place.',
    description:
      'A word\u2019s letters, scrambled into tiles. Swap any two tiles at a time \u2014 no dictionary check along the way, just the finished word \u2014 to unscramble it in as few swaps as possible.',
    color: 'untangle',
    avgSolveTime: '2:30',
    difficulty: 'Medium',
    category: 'word',
    howToPlay: [
      'A hidden word\u2019s letters are shown scrambled into tiles. Tap one tile, then tap another to swap their positions.',
      'Every swap counts as a move \u2014 there\u2019s no penalty for tapping a tile once to select it, only for completing a swap.',
      'The puzzle solves itself automatically the moment the tiles spell the correct word.',
      'Unscramble it before you run out of swaps to win.',
    ],
    designNotes: [
      'There\u2019s no dictionary lookup happening as you swap \u2014 unlike a word-guessing game, Untangle already knows the one target word behind the scramble, so any arrangement that doesn\u2019t match it yet is just "not there yet," not "wrong."',
      'The move limit isn\u2019t a rough estimate \u2014 it\u2019s calculated from the exact minimum number of swaps mathematically required to unscramble that specific day\u2019s permutation, plus a fixed cushion, so the difficulty always matches the actual scramble.',
      'Minimum swap count depends entirely on how the letters got shuffled, not on word length \u2014 a longer word can sometimes need fewer swaps than a shorter one, if its particular scramble happens to have fewer letters out of place.',
    ],
    strategyTips: [
      'Look for letters already in a position that could plausibly be correct, and work outward from those rather than swapping at random.',
      'A swap that puts one letter right but pushes another further wrong is still worth it if it shortens the remaining chain \u2014 counting letters in the right place isn\u2019t the same as counting swaps saved.',
      'If two tiles are stuck swapping places with each other, that\u2019s a 2-cycle \u2014 one swap resolves both of them at once.',
      'Repeated letters can be swapped with any matching tile, not just their "original" one \u2014 use that flexibility to shortcut a longer chain.',
    ],
    faq: [
      {
        q: 'Does the game tell me if a swap is correct?',
        a: 'No, there\'s no dictionary check along the way — the puzzle just knows the target word and solves itself automatically once the tiles match it.',
      },
      {
        q: 'How is the move limit calculated?',
        a: 'From the exact minimum number of swaps mathematically required for that day\'s specific scramble, plus a fixed cushion — not from the word\'s length.',
      },
      {
        q: 'Can I swap two tiles holding the same letter?',
        a: 'Yes, and it\'s often useful — repeated letters can be swapped with any matching tile, not just their original position, to shortcut a longer chain.',
      },
      {
        q: 'What if two tiles are just swapping places with each other?',
        a: 'That\'s a 2-cycle — a single swap between them resolves both tiles at once.',
      },
    ],
  },
  {
    slug: 'flicker',
    index: '037',
    name: 'Flicker',
    tagline: 'Every switch has a ripple.',
    description:
      'Tap a tile to flip it and every tile directly beside it. Work backward from today\u2019s pattern to figure out which tiles to press to turn every light off.',
    color: 'flicker',
    avgSolveTime: '3:00',
    difficulty: 'Medium',
    category: 'puzzle',
    howToPlay: [
      'A 5\u00d75 grid of lights starts partly lit. Tap any tile to flip it and its up/down/left/right neighbors between on and off.',
      'There\u2019s no separate undo \u2014 tapping the same tile again just flips everything back, which is sometimes exactly what you want.',
      'Turn every light off to win, before you run out of taps.',
    ],
    designNotes: [
      'This is built on a classic toggle-puzzle idea: every move is its own exact opposite. Press a tile twice and it\u2019s as if you never touched it, which is what makes the whole puzzle provably solvable rather than just probably solvable.',
      'Order never matters here \u2014 pressing the same set of tiles in any sequence always ends at the same result, since each press is an independent flip rather than something that depends on what came before it.',
      'Each day\u2019s board is generated by scrambling from a solved, all-dark grid, so the exact set of tiles used to scramble it is always guaranteed to solve it again \u2014 the move budget is set directly from that number.',
    ],
    strategyTips: [
      'Work from the corners and edges inward \u2014 a corner tile only affects itself and two neighbors, which makes it the easiest place to reason about with certainty.',
      'If you press a tile and it makes things look worse, that\u2019s not necessarily wrong \u2014 some tiles genuinely need to get lit again temporarily before a later press clears them for good.',
      'Try to fix each row from top to bottom \u2014 once a row above is solved, avoid touching any tile in it again, since re-pressing it will undo your progress.',
      'If you\u2019re stuck, retrace which tiles you\u2019ve pressed an odd number of times \u2014 in this kind of puzzle, only the parity of each tile\u2019s press count ever matters, not the order.',
    ],
    faq: [
      {
        q: 'Does pressing the same tile twice do anything?',
        a: 'No, it flips everything back exactly as it was — the same as never having pressed it, so it\'s a safe way to undo a specific move.',
      },
      {
        q: 'Does the order I press tiles in matter?',
        a: 'No, pressing the same set of tiles in any order always ends at the same result — only which tiles you\'ve pressed, not when, matters.',
      },
      {
        q: 'Is the move budget based on the actual scramble used to generate the board?',
        a: 'Yes, each day\'s board is scrambled from a solved all-dark grid, and the move budget matches the exact number of tiles used to scramble it.',
      },
      {
        q: 'What does it mean if pressing a tile makes the board look worse?',
        a: 'It\'s not necessarily wrong — some tiles genuinely need to get lit again temporarily before a later press clears them for good.',
      },
    ],
  },
  {
    slug: 'lastlight',
    index: '038',
    name: 'Lastlight',
    tagline: 'Whoever takes the last one wins.',
    description:
      'A classic take-away game against a perfect-playing CPU. Take any number of tokens from one pile each turn \u2014 today\u2019s starting piles are always winnable, if you can find the exact move that keeps them that way.',
    color: 'lastlight',
    avgSolveTime: '2:30',
    difficulty: 'Hard',
    category: 'arcade',
    howToPlay: [
      'Several piles of tokens sit on the board. On your turn, take any number of tokens (at least one) from a single pile.',
      'The CPU takes its own turn immediately after yours, playing perfectly.',
      'Whoever takes the very last token on the board wins \u2014 there\u2019s no separate scoring beyond that.',
      'Tap a token in a pile to take it and everything after it in that row.',
    ],
    designNotes: [
      'This is built on Nim, one of the oldest mathematically-solved combinatorial games \u2014 the winning strategy has been fully understood for over a century, which is exactly why it\u2019s possible to guarantee every day\u2019s starting position favors the player.',
      'Every day\u2019s piles are checked before you ever see them: if the starting arrangement would actually favor whoever moves second, one pile is nudged so it doesn\u2019t. You are always the one holding the advantage at the very first move \u2014 keeping it is the entire game.',
      'The CPU doesn\u2019t bluff or take suboptimal lines \u2014 it always plays the objectively correct move. Beating it isn\u2019t about reading an opponent, it\u2019s about finding the one class of move that keeps the position in your favor.',
    ],
    strategyTips: [
      'The winning idea: after your move, the XOR of all the pile sizes should be zero. If you can always leave that behind, the CPU can never leave it that way back to you.',
      'A single pile left alone is easy \u2014 the danger is almost always in leaving two piles of unequal size that don\u2019t cancel out under XOR.',
      'If you\u2019re unsure of the exact math mid-game, mirroring pile sizes into matching pairs is a reasonable fallback \u2014 equal pairs always XOR to zero.',
      'One mistake doesn\u2019t always cost the whole game \u2014 if the CPU\u2019s response leaves an opening again, the same restore-to-zero idea still applies from wherever you are.',
    ],
    faq: [
      {
        q: 'Does the CPU ever make a mistake?',
        a: 'No, it always plays the mathematically correct move — there\'s no bluffing or suboptimal play to exploit.',
      },
      {
        q: 'Is the starting position always winnable for the player?',
        a: 'Yes, if the natural starting arrangement would favor whoever moves second, one pile is adjusted before you see it so you always hold the advantage first.',
      },
      {
        q: 'Can I take tokens from more than one pile in a turn?',
        a: 'No, each turn you take from exactly one pile, though you can take any number of tokens (at least one) from it.',
      },
      {
        q: 'What\'s the core winning idea if I don\'t know the exact math?',
        a: 'Try to leave pile sizes that pair up evenly after your move — matching pairs are a reasonable fallback for the XOR-zero strategy.',
      },
    ],
  },
  {
    slug: 'blueprint',
    index: '039',
    name: 'Blueprint',
    tagline: 'Three flat views. One true shape.',
    description:
      'Three flat views \u2014 top, front, and side \u2014 are all you get. Place and remove cubes in a rotatable 3D grid until your shape\u2019s own views match the blueprint exactly.',
    color: 'blueprint',
    avgSolveTime: '4:00',
    difficulty: 'Hard',
    category: 'puzzle',
    howToPlay: [
      'Three small diagrams show the target shape\u2019s silhouette from directly above, directly in front, and directly from the side.',
      'Click an empty slot in the 3D grid to add a cube there, or click an existing cube to remove it.',
      'Your own shape\u2019s three views update live below the 3D view, so you can compare them against the target as you build.',
      'The puzzle solves itself the moment your shape\u2019s views match the target from all three angles.',
    ],
    designNotes: [
      'Any shape that produces the exact same three silhouettes as the target counts as correct \u2014 there\u2019s deliberately no hidden "one true shape" you have to guess. Matching the views is the actual goal, not reading the generator\u2019s mind.',
      'Three orthogonal views don\u2019t always pin down a shape uniquely in general, which is a known property of this style of puzzle rather than an oversight \u2014 if more than one shape fits, any of them is a legitimate solution here.',
      'The move budget is set from the exact number of cubes in the shape actually used to generate the day\u2019s views, since building precisely those cubes and nothing else is always a guaranteed route to solving it.',
    ],
    strategyTips: [
      'Start from the top view \u2014 it tells you which (x, z) columns need at least one cube somewhere, ruling out a lot of empty space immediately.',
      'The front and side views then tell you how tall each of those columns needs to be, and where \u2014 cross-reference all three before placing a cube you\u2019re unsure about.',
      'Rotate to check a cube from above and from the side before committing \u2014 a cube that looks necessary from the front sometimes turns out to be covered by a neighboring cube in another view.',
      'If your views already match on two sides but not the third, look specifically for cubes that only affect that mismatched view \u2014 you don\u2019t need to rebuild everything.',
    ],
    faq: [
      {
        q: 'Is there only one correct shape for each puzzle?',
        a: 'Not necessarily — any shape that produces the exact same three silhouettes as the target counts as correct, even if it\'s not the one used to generate the puzzle.',
      },
      {
        q: 'How is the move budget decided?',
        a: 'From the exact cube count of the shape actually used to generate that day\'s three views — building precisely that many cubes is always a guaranteed solution.',
      },
      {
        q: 'Can I remove a cube after placing it?',
        a: 'Yes, clicking an existing cube removes it, so you can freely adjust your shape as you compare it against the target views.',
      },
      {
        q: 'Does the puzzle tell me which view is wrong if I\'m not matching yet?',
        a: 'Your own shape\'s three views update live next to the target, so you can compare each angle yourself and see exactly where they differ.',
      },
    ],
  },
  {
    slug: 'bloom',
    index: '040',
    name: 'Bloom',
    tagline: 'One corner. One color. Every tile.',
    description:
      'A grid of scattered colors. Grow your territory outward from one corner, one color pick at a time, absorbing whole chains of matching tiles until the entire board is a single color.',
    color: 'bloom',
    avgSolveTime: '2:30',
    difficulty: 'Medium',
    category: 'puzzle',
    howToPlay: [
      'Your territory starts as the connected block of color in the top-left corner of an 8\u00d78 board.',
      'Pick a color from the palette below the board. Your whole territory becomes that color, then absorbs any touching tiles \u2014 and chains of tiles \u2014 that already matched it.',
      'Picking the same color your territory already is does nothing, so every tap should move you forward.',
      'Cover the entire board in one color before you run out of picks to win.',
    ],
    designNotes: [
      'The move budget isn\u2019t arbitrary \u2014 it\u2019s built from an actual working solve of that day\u2019s specific board (a straightforward "grab the biggest available chain each turn" approach), plus a small cushion, so the difficulty always tracks the real board rather than a flat guess.',
      'A single pick can absorb a surprising number of tiles at once when several same-colored chains happen to be touching your territory\u2019s border simultaneously \u2014 reading the board for those moments is most of the game.',
      'Finding the mathematically optimal solution to this style of puzzle in general is a famously hard problem \u2014 which is exactly why the budget here is built from a real, working solve rather than a claim of the theoretical minimum.',
    ],
    strategyTips: [
      'Before picking, scan the entire border of your territory, not just the closest visible chain \u2014 a color touching your territory in three separate spots absorbs all three at once.',
      'A pick that only grabs one or two tiles is rarely wrong, but it\u2019s worth checking whether a different color would have grabbed considerably more before committing.',
      'Corners and edges of the board have fewer neighbors, so chains that start there tend to be smaller \u2014 prioritize expanding into the open middle of the board when you have the choice.',
      'Picks late in the game usually matter more than picks early on, since your territory has more border to work with \u2014 it\u2019s fine to spend an early pick on a merely decent option.',
    ],
    faq: [
      {
        q: 'Does picking a color my territory already is count as a move?',
        a: 'No, picking the current color does nothing and doesn\'t use up a pick — every tap should move you toward a new absorption.',
      },
      {
        q: 'Can one pick absorb tiles from multiple directions at once?',
        a: 'Yes, if the chosen color touches your territory\'s border in several separate spots, all of those chains get absorbed in the same pick.',
      },
      {
        q: 'How is the move budget set?',
        a: 'From an actual working solve of that day\'s specific board — not a flat guess — plus a small cushion, so it always reflects the real board.',
      },
      {
        q: 'Is there a fastest possible solution I should aim for?',
        a: 'Finding the true mathematical optimum is a famously hard problem in general, so the budget is built from a solid working solve rather than a guaranteed-minimum claim.',
      },
    ],
  },
  {
    slug: 'apex',
    index: '041',
    name: 'Apex',
    tagline: 'Carry your speed. Mind the line.',
    description:
      'A turn-based racing line puzzle: pick an acceleration each turn, and your speed carries forward into the next one. Reach the finish without sliding off the track.',
    color: 'apex',
    avgSolveTime: '3:00',
    difficulty: 'Hard',
    category: 'movement',
    howToPlay: [
      'Your car starts stationary on the track. Each turn, pick one of the 9 directions (including "no change") to adjust your speed.',
      'Your new speed carries over into your position \u2014 the car then moves exactly that many tiles in one step, in a straight line.',
      'If that line ever leaves the drivable track, even briefly, the run ends immediately.',
      'Reach the green finish zone before you run out of turns to win.',
    ],
    designNotes: [
      'This is a classic turn-based racing format sometimes called vector racing: velocity, not just position, carries from turn to turn, so a sharp turn at high speed genuinely doesn\u2019t work the way it would at walking pace \u2014 you have to plan your braking in advance, the same way a real racing line does.',
      'Every day\u2019s track is generated and then solved by searching every reachable combination of position and speed before you ever see it, so the move budget is set from a real, found solution rather than a guess at how curvy the track looks.',
      'A fast, straight run and a cautious, braking run can both finish \u2014 the move budget has enough room for a sensible line that isn\u2019t necessarily the mathematically fastest one.',
    ],
    strategyTips: [
      'Speed you build up doesn\u2019t disappear on its own \u2014 you have to actively decelerate before a turn, ideally a move or two before you actually need to change direction.',
      'The diagonal options change both axes of your speed at once, which is often the most efficient way to both slow down and start turning in the same move.',
      'Picking "no change" is a real move, not a wasted one, when your current speed is already lined up with where the track goes next.',
      'On a straightaway, building speed early pays off more than braking late costs you \u2014 save your caution for the turns you can actually see coming.',
    ],
    faq: [
      {
        q: 'Does picking "no change" ever make sense?',
        a: 'Yes, it\'s a real move — when your current speed already lines up with where the track goes next, holding steady is often correct.',
      },
      {
        q: 'What happens if my line briefly leaves the track?',
        a: 'The run ends immediately, even if only part of the straight-line move crosses off the drivable area.',
      },
      {
        q: 'Do diagonal acceleration choices change both axes at once?',
        a: 'Yes, a diagonal pick adjusts your speed on both axes simultaneously, which is often the most efficient way to slow down and start turning together.',
      },
      {
        q: 'Is the move budget based on the fastest possible route?',
        a: 'No, it\'s set from a real solved run with enough room for a sensible line, not necessarily the mathematically fastest one.',
      },
    ],
  },
  {
    slug: 'pulse',
    index: '042',
    name: 'Pulse',
    tagline: 'Time it right or don\u2019t bother.',
    description:
      'A marker sweeps back and forth across a track. Tap to stop it inside the target zone \u2014 the zone shrinks and the sweep speeds up every round.',
    color: 'pulse',
    avgSolveTime: '2 min',
    difficulty: 'Medium',
    category: 'arcade',
    howToPlay: [
      'A marker slides back and forth across a horizontal track, bouncing between the two ends.',
      'Tap anywhere on the track (or press space) to stop it \u2014 land it inside the highlighted target zone to score a hit.',
      'The target zone gets narrower and the marker moves faster with each attempt, so the run gets harder as it goes.',
      'Land enough hits within your attempt budget to win \u2014 too many misses and the run ends early.',
    ],
    designNotes: [
      'Pulse is the site\u2019s first pure-reflex entry \u2014 no move budget to plan around, just a track, a target, and your sense of timing. It\u2019s built on the same seeded-difficulty idea as every other game here: the zone width and sweep speed for each attempt are generated from the day\u2019s seed, so the exact sequence of hard/easy taps is identical for everyone.',
      'The difficulty ramp is intentional rather than random noise \u2014 attempt one is genuinely forgiving, and the track tightens smoothly toward attempt eight, so a loss usually means the pace caught up with you rather than an unlucky roll.',
      'Under the hood, the marker\u2019s position at any instant is pure math (a triangle wave over elapsed time), not a physics simulation \u2014 same philosophy as the rest of the index: plain, deterministic, dependency-free.',
    ],
    strategyTips: [
      'Watch a full sweep before your first tap on a new attempt \u2014 the period changes each round, and half a second of observation is cheap compared to a wasted attempt.',
      'Aim for the center of the target zone, not the edge \u2014 your reaction time has natural jitter, and a center tap survives that jitter better than a tap timed for the edge.',
      'The zone shrinks gradually, not suddenly \u2014 if you\u2019re missing early attempts, the problem is timing, not the zone size yet.',
      'You can afford some misses \u2014 the budget has slack built in, so don\u2019t panic-tap early; a rushed miss costs the same as a late one.',
    ],
    faq: [
      {
        q: 'How many misses can I afford?',
        a: 'You need 6 hits out of 8 attempts to win, so you have room for 2 misses \u2014 the run only ends early once a win becomes mathematically impossible.',
      },
      {
        q: 'Does the marker move at a constant speed all game?',
        a: 'No \u2014 it speeds up gradually from your first attempt to your last, alongside the target zone getting narrower.',
      },
      {
        q: 'Is there a physics engine behind the marker?',
        a: 'No \u2014 its position is calculated directly from elapsed time with a simple back-and-forth formula, so it\u2019s perfectly consistent every run.',
      },
      {
        q: 'Can I play Pulse more than once a day?',
        a: 'Today\u2019s run is once-daily like every other game here, but Coin Mode unlocks right after \u2014 unlimited replays on a fresh random layout each time.',
      },
    ],
  },
  {
    slug: 'blip',
    index: '043',
    name: 'Blip',
    tagline: 'Look first, tap second.',
    description:
      'One cell in a 3\u00d73 grid lights up at a time. Tap that exact cell before it fades \u2014 the window gets shorter every round.',
    color: 'blip',
    avgSolveTime: '2 min',
    difficulty: 'Medium',
    category: 'arcade',
    howToPlay: [
      'A 3\u00d73 grid sits in front of you. Each attempt, exactly one cell lights up.',
      'Tap that lit cell before it fades \u2014 tapping any other cell, or letting it fade untouched, counts as a miss.',
      'The lit window gets shorter with each attempt, so later rounds demand a faster read of where the light landed.',
      'Land enough correct taps within your attempt budget to win \u2014 too many misses and the run ends early.',
    ],
    designNotes: [
      'Blip is deliberately a different kind of reflex test than Pulse or Sprout \u2014 those are about timing a single continuous sweep, this is about spatial recognition: seeing where something happened and confirming it, fast, rather than predicting a moving target.',
      'The grid position for each attempt is drawn from the day\u2019s seed, same as everywhere else on the site, so nobody gets an easier or harder sequence of cells than anyone else on a given day.',
      'The shrinking window is the only difficulty lever \u2014 there\u2019s no trick placement or decoy cells, on purpose. It keeps the rules learnable in one glance while the challenge still ramps up honestly.',
    ],
    strategyTips: [
      'Keep your eyes on the center of the grid, not one corner \u2014 peripheral vision picks up a flash anywhere on a 3\u00d73 grid faster than waiting to scan corner by corner.',
      'React to the light, not to where you expect it \u2014 the cell is fully random each attempt, so anticipating a pattern will cost you more misses than it saves.',
      'A late-but-correct tap beats a fast-but-wrong one \u2014 there\u2019s no bonus for speed within the window, only a penalty for missing it.',
      'If you\u2019re missing late-game attempts, it\u2019s the shrinking window catching up with you, not bad luck \u2014 the early misses are usually the ones worth reviewing.',
    ],
    faq: [
      {
        q: 'Is there any pattern to which cell lights up?',
        a: 'No \u2014 each attempt\u2019s cell is drawn independently from the day\u2019s seed, so there\u2019s nothing to predict, only react to.',
      },
      {
        q: 'Does tapping early (before the cell lights) do anything?',
        a: 'It registers as a miss on the current attempt, the same as tapping the wrong cell \u2014 wait for the light.',
      },
      {
        q: 'How many misses can I afford?',
        a: 'You need 6 hits out of 8 attempts to win, so you have room for 2 misses \u2014 the run only ends early once a win becomes mathematically impossible.',
      },
      {
        q: 'Can I play Blip more than once a day?',
        a: 'Today\u2019s run is once-daily like every other game here, but Coin Mode unlocks right after \u2014 unlimited replays on a fresh random layout each time.',
      },
    ],
  },
  {
    slug: 'croak',
    index: '044',
    name: 'Croak',
    tagline: 'One frog. One pond. Ten hops.',
    description:
      'Hop a little frog across a pond of lily pads to reach the goal pad before you run out of hops. Fireflies along the way are worth a detour \u2014 catching one earns an extra hop.',
    color: 'croak',
    avgSolveTime: '2 min',
    difficulty: 'Easy',
    category: 'movement',
    howToPlay: [
      'A frog sits on a lily pad in a 5\u00d75 pond. Some tiles are open water \u2014 the frog can\u2019t land there.',
      'Use the arrow pad to hop one tile at a time, up, down, left, or right. Hopping toward open water just fails quietly \u2014 it doesn\u2019t cost a hop.',
      'Reach the marked goal pad before your hop budget runs out to win.',
      'A few pads have a firefly sitting on them. Land on one and it\u2019s yours \u2014 each firefly caught adds one extra hop to your budget for the rest of the run.',
    ],
    designNotes: [
      'Croak is the first game on the index built entirely around a character rather than an abstract token \u2014 the little green frog is modeled from plain spheres in Three.js, in keeping with the site\u2019s no-external-assets rule: everything you see is generated geometry, not an imported model.',
      'The pond layout is carved from the day\u2019s seed the same way Shadow\u2019s walls are: random water tiles are added and the layout is discarded and retried until a breadth-first search confirms the goal is actually reachable, so every seed is guaranteed solvable.',
      'Fireflies are a pure bonus by design \u2014 they can only ever add hops, never remove them, which means sprinkling them onto a layout can never turn a solvable pond into an unsolvable one. That let us add a genuine risk/reward detour without having to re-verify solvability around it.',
    ],
    strategyTips: [
      'The direct route usually beats detouring for every firefly \u2014 the hop budget already has slack built in, so only detour for a firefly if it\u2019s roughly on your way.',
      'A failed hop toward open water doesn\u2019t cost you anything, so if you\u2019re unsure whether a tile is a pad, it\u2019s free to just try.',
      'Plan two hops ahead rather than one \u2014 the pond is small enough that a single wrong turn can cost you a firefly detour you didn\u2019t need.',
      'If you\u2019re short on hops late in a run, prioritize any remaining firefly that sits directly between you and the goal \u2014 it\u2019s the only kind of detour that\u2019s never a net loss.',
    ],
    faq: [
      {
        q: 'Does hopping toward open water cost a move?',
        a: 'No \u2014 the frog just stays put and it doesn\u2019t count against your hop budget. Only hops that actually move the frog are counted.',
      },
      {
        q: 'Can I lose a firefly bonus once I\u2019ve collected it?',
        a: 'No \u2014 once caught, the extra hop is yours for the rest of that run, whether it\u2019s the daily puzzle or a Coin Mode round.',
      },
      {
        q: 'Is every layout guaranteed to be solvable?',
        a: 'Yes \u2014 the pond is regenerated until a clear path from the start pad to the goal pad is confirmed to exist before the puzzle is ever shown.',
      },
      {
        q: 'Can I play Croak more than once a day?',
        a: 'Today\u2019s run is once-daily like every other game here, but Coin Mode unlocks right after \u2014 unlimited replays on a fresh random pond each time.',
      },
    ],
  },
  {
    slug: 'bounce',
    index: '045',
    name: 'Bounce',
    tagline: 'One bunny. One sky. Ten hops.',
    description:
      'Bounce a chibi bunny across a field of floating cloud platforms to reach the rainbow goal before you run out of hops. Stars along the way are worth a detour \u2014 each one earns an extra hop.',
    color: 'bounce',
    avgSolveTime: '2 min',
    difficulty: 'Easy',
    category: 'movement',
    howToPlay: [
      'A bunny stands on a cloud platform floating in a 5\u00d75 sky field. Some tiles are open sky \u2014 the bunny can\u2019t land there.',
      'Use the arrow pad to hop one tile at a time, up, down, left, or right. Hopping toward open sky just fails quietly \u2014 it doesn\u2019t cost a hop.',
      'Reach the marked rainbow platform before your hop budget runs out to win.',
      'A few platforms have a star sitting on them. Land on one and it\u2019s yours \u2014 each star caught adds one extra hop to your budget for the rest of the run.',
    ],
    designNotes: [
      'Bounce shares its generator with Croak on purpose \u2014 that layout logic already proved itself (BFS-verified solvable, retried until a path exists) across hundreds of seeds, so reusing it here means the puzzle itself is a known quantity and all the new work could go into the character and the sky setting instead.',
      'The bunny is built entirely from Three.js primitive spheres at a higher segment count than the site\u2019s earlier 3D character, specifically to read as smooth and rounded rather than faceted \u2014 a deliberately chibi proportion, oversized head, small body, big glossy eyes with a tiny highlight sphere for sparkle.',
      'Where Croak leans into an earthy pond palette, Bounce is built around saturated pastel pop color \u2014 cotton-candy clouds, a rainbow goal platform, a bright pink bunny \u2014 as a genuinely different visual mood from the rest of the index rather than a reskin in name only.',
    ],
    strategyTips: [
      'The direct route usually beats detouring for every star \u2014 the hop budget already has slack built in, so only detour for a star if it\u2019s roughly on your way.',
      'A failed hop toward open sky doesn\u2019t cost you anything, so if you\u2019re unsure whether a tile is a platform, it\u2019s free to just try.',
      'Plan two hops ahead rather than one \u2014 the field is small enough that a single wrong turn can cost you a star detour you didn\u2019t need.',
      'If you\u2019re short on hops late in a run, prioritize any remaining star that sits directly between you and the goal \u2014 it\u2019s the only kind of detour that\u2019s never a net loss.',
    ],
    faq: [
      {
        q: 'Is Bounce just Croak with a different skin?',
        a: 'The layout generator is the same proven logic, yes \u2014 but the character, the color palette, and the setting are all built fresh for this one.',
      },
      {
        q: 'Does hopping toward open sky cost a move?',
        a: 'No \u2014 the bunny just stays put and it doesn\u2019t count against your hop budget. Only hops that actually move the bunny are counted.',
      },
      {
        q: 'Is every layout guaranteed to be solvable?',
        a: 'Yes \u2014 the sky field is regenerated until a clear path from the start platform to the goal platform is confirmed to exist before the puzzle is ever shown.',
      },
      {
        q: 'Can I play Bounce more than once a day?',
        a: 'Today\u2019s run is once-daily like every other game here, but Coin Mode unlocks right after \u2014 unlimited replays on a fresh random sky each time.',
      },
    ],
  },
  {
    slug: 'wiggle',
    index: '046',
    name: 'Wiggle',
    tagline: 'Every step you take, you can never take back.',
    description:
      'Guide a caterpillar around a small grid to eat every leaf \u2014 but every cell it crosses becomes part of its own body, and it can never cross itself again.',
    color: 'wiggle',
    avgSolveTime: '2 min',
    difficulty: 'Medium',
    category: 'movement',
    howToPlay: [
      'A caterpillar sits on a 6\u00d76 grid. Use the arrow pad to move it one cell at a time, up, down, left, or right.',
      'Every cell it has ever stood on stays part of its body \u2014 trying to move back onto it just fails quietly, for free.',
      'Eat every leaf on the grid before you run out of moves to win.',
      'There are no walls and no preset obstacles anywhere \u2014 the only thing that can ever block you is your own trail.',
    ],
    designNotes: [
      'Wiggle is deliberately the odd one out among the site\u2019s movement games. Croak, Bounce, Shadow, Tether, Phase, Drift, Burrow, and Clearway are all built around navigating a fixed layout decided at generation time. Wiggle has no layout at all \u2014 the entire challenge is self-inflicted, and the puzzle is really about choosing an order to visit things in that doesn\u2019t paint you into a corner.',
      'Solvability here isn\u2019t verified after the fact, it\u2019s guaranteed by how the puzzle is built: generation performs a random self-avoiding walk across the grid first, then places every leaf directly on top of that walk. Simply retracing the generated route always clears the board \u2014 confirmed by simulating that exact retrace on 500 separate seeds during development.',
      'Because a player is free to leave the generated route at any point, it\u2019s entirely possible to box yourself in early and lose with leaves still on the board. That\u2019s treated as a normal, intended outcome \u2014 the same way running out of a move budget is elsewhere on the site \u2014 not a sign anything is broken.',
    ],
    strategyTips: [
      'Think one move further than you need to \u2014 a cell that looks fine to enter can still trap you if both of its other exits are already part of your trail.',
      'Hug the edges and corners early, and save the open middle of the grid for later \u2014 the middle has more escape routes if a plan falls through.',
      'A blocked move costs nothing, so if you\u2019re unsure whether a direction is safe, it\u2019s free to just try it and see.',
      'When two leaves are close together, eat them back-to-back before wandering off \u2014 doubling back later to grab a leaf you skipped is often what causes a self-trap.',
    ],
    faq: [
      {
        q: 'Does bumping into my own trail cost a move?',
        a: 'No \u2014 it fails quietly and doesn\u2019t count against your move budget, so it\u2019s always safe to test a direction you\u2019re unsure about.',
      },
      {
        q: 'Can I get stuck with no legal moves left?',
        a: 'Yes \u2014 if every cell next to you is already part of your trail, the run ends there. This is an intended way to lose, not a bug.',
      },
      {
        q: 'Are there ever walls or obstacles placed on the grid?',
        a: 'No \u2014 the grid starts completely open. Your own trail is the only thing that can ever block a move.',
      },
      {
        q: 'Can I play Wiggle more than once a day?',
        a: 'Today\u2019s run is once-daily like every other game here, but Coin Mode unlocks right after \u2014 unlimited replays on a fresh random grid each time.',
      },
    ],
  },
  {
    slug: 'stax',
    index: '047',
    name: 'Stax',
    tagline: 'Perfect it, or lose it.',
    description:
      'A block slides back and forth on top of the tower \u2014 tap to drop it. Land it perfectly to keep the tower at full width and build a combo; a sloppy drop slices it down; miss entirely and the run is over.',
    color: 'stax',
    avgSolveTime: '2 min',
    difficulty: 'Medium',
    category: 'arcade',
    howToPlay: [
      'A colored block slides left and right on top of your tower. Tap, click, or press space to drop it.',
      'Landing exactly on top of the block below keeps the tower at full width and adds to your combo.',
      'A partial landing slices the block down to only the part that overlapped \u2014 the tower gets a little narrower.',
      'Miss the tower completely and the run ends there. Reach the target height before that happens to win.',
    ],
    designNotes: [
      'Stax is the site\u2019s first game where the daily challenge isn\u2019t a fixed layout at all \u2014 the target height and the speed ramp are identical for everyone, but the actual outcome is pure reflex and timing, the same spirit as Boo Rush or Cloud Hop rather than a solvable-by-construction puzzle.',
      'Every three perfect drops in a row widens the tower back a little, up to its original starting width \u2014 a small comeback mechanic so an early rough patch isn\u2019t a permanent sentence for the rest of the run.',
      'The overlap math \u2014 what counts as perfect, what gets sliced, what counts as a total miss \u2014 lives entirely in a small set of plain functions with no rendering code in them at all, and was unit tested against perfect, partial, and total-miss drops before any 3D was built on top of it.',
    ],
    strategyTips: [
      'Watch the block\u2019s rhythm for a moment before your first tap of a run \u2014 the swing is smooth and repeating, so a beat of observation pays for itself.',
      'Chasing perfects is worth it \u2014 three in a row visibly widens your margin for the next few drops, which compounds.',
      'The swing gets faster as you climb, so don\u2019t rely on a reaction speed that only worked for the first few blocks.',
      'If the tower has gotten narrow, play it safer rather than greedier \u2014 a near-perfect keeps you alive; a miss for the sake of style ends the run outright.',
    ],
    faq: [
      {
        q: 'Is the daily layout different for everyone, like the puzzle games?',
        a: 'No \u2014 Stax has no fixed layout to solve. Everyone gets the same target height and the same speed ramp; what happens after that is entirely down to your own timing.',
      },
      {
        q: 'What exactly counts as a "perfect" drop?',
        a: 'Landing close enough that almost nothing gets sliced off. It doesn\u2019t have to be pixel-exact, just close.',
      },
      {
        q: 'Can the tower recover after a bad drop?',
        a: 'Yes \u2014 three perfect drops in a row widens it back a step, up to its original width, so one mistake isn\u2019t permanent.',
      },
      {
        q: 'Can I play Stax more than once a day?',
        a: 'Today\u2019s run is once-daily like every other game here, but Coin Mode unlocks right after \u2014 unlimited replays any time.',
      },
    ],
  },
  {
    slug: 'clash',
    index: '048',
    name: 'Clash',
    tagline: 'The enemy\u2019s whole plan is right there. Beat it anyway.',
    description:
      'A turn-based battle against a slime with its entire attack sequence shown up front. Attack, Defend, or unleash a cooldown-limited Special each turn to bring it down before your own HP runs out.',
    color: 'clash',
    avgSolveTime: '3 min',
    difficulty: 'Medium',
    category: 'puzzle',
    howToPlay: [
      'The enemy\u2019s full incoming-damage sequence for the battle is shown before you make a single move \u2014 nothing about its attacks is hidden or random.',
      'Each turn, choose Attack (steady damage out), Defend (halves the damage you take that turn, deals none back), or Special (heavy damage, but goes on a 2-turn cooldown after use).',
      'Bring the enemy\u2019s HP to zero before your own HP runs out, within the turn budget, to win.',
      'Using Special on cooldown just fails quietly \u2014 it doesn\u2019t cost a turn, so it\u2019s always safe to check.',
    ],
    designNotes: [
      'Clash is built closer to a tactics game\u2019s telegraphed-intent screen than to a normal RPG\u2019s hidden dice rolls \u2014 you always know exactly what\u2019s coming, so a loss means a planning mistake, not bad luck.',
      'Solvability is guaranteed the same way it is for Croak, Bounce, and Wiggle: generation runs a simple, deliberately non-optimal greedy strategy against the candidate battle and only keeps battles that strategy can actually win. A thoughtful player can usually beat that baseline with better Special timing, so the guaranteed floor still leaves real room for skill.',
      'The slime enemy visibly shrinks and flashes as its HP drops \u2014 a small piece of direct visual feedback so the numbers on screen aren\u2019t the only thing telling you the fight is going your way.',
    ],
    strategyTips: [
      'Scan the whole incoming sequence before your first move \u2014 you already have all the information you\u2019ll ever get, so there\u2019s no benefit to deciding turn-by-turn only.',
      'Save Special for a turn right after a big hit you\u2019re about to Defend \u2014 Defend doesn\u2019t deal damage, so pairing a defensive turn with an offensive one nearby keeps your overall damage output on track.',
      'Don\u2019t Defend on small hits \u2014 the cost of Defending (dealing zero damage) is the same whether the incoming hit is small or large, so it only pays off against the bigger numbers.',
      'Track the cooldown, not just your instinct \u2014 Special is only usable every third turn at best, so plan two attacks ahead rather than reaching for it on cooldown out of habit.',
    ],
    faq: [
      {
        q: 'Is any part of the enemy\u2019s pattern hidden or randomized during the fight?',
        a: 'No \u2014 the entire incoming-damage sequence for the battle is shown before your first move and never changes.',
      },
      {
        q: 'What happens if I try to use Special while it\u2019s on cooldown?',
        a: 'Nothing \u2014 it fails quietly and doesn\u2019t use up a turn, so it\u2019s free to check whether it\u2019s available.',
      },
      {
        q: 'Is every battle guaranteed to be winnable?',
        a: 'Yes \u2014 a battle is only ever shown if a simple baseline strategy can already beat it, so a better plan than that baseline is never required, just rewarded.',
      },
      {
        q: 'Can I play Clash more than once a day?',
        a: 'Today\u2019s run is once-daily like every other game here, but Coin Mode unlocks right after \u2014 unlimited replays on a fresh battle each time.',
      },
    ],
  },
  {
    slug: 'carom',
    index: '049',
    name: 'Carom',
    tagline: 'Shields stop what comes straight at them.',
    description:
      'Five lanes of stacked invaders. Fire straight up a lane to clear it \u2014 unless it\u2019s shielded, in which case a direct shot is wasted. Fire from the mirror lane instead and the shot banks in off the side wall, past the shield entirely.',
    color: 'carom',
    avgSolveTime: '3 min',
    difficulty: 'Medium',
    category: 'arcade',
    howToPlay: [
      'Five lanes stand in front of you, each stacked with one to three invaders. Clearing a lane means clearing every invader in it, frontmost first.',
      'Direct fire goes straight up the lane you\u2019re standing in.',
      'Bank fire goes in off the side wall instead \u2014 fired from lane N, it lands in the mirrored lane on the far side (lane 4 mirrors lane 0, lane 3 mirrors lane 1, and so on).',
      'A shielded lane blocks Direct fire aimed at it completely \u2014 the shot is wasted. Bank fire ignores shields entirely, since it never comes in from below.',
      'Clear every lane within your shot budget to win.',
    ],
    designNotes: [
      'The whole game is built around one rule: a shield only defends against fire from directly below it. Bank shots approach from the side, so they\u2019re never blocked \u2014 which means "fire Direct at every open lane, Bank at every shielded one" is always a valid clear, and that guarantee doesn\u2019t need a solver or a generation retry loop to prove. It\u2019s true by construction, the same way a rule works in a card game rather than a puzzle that has to be checked.',
      'That also means Carom never needed the retry-until-solvable generation every other guaranteed puzzle here uses \u2014 the daily layout is just picked once per seed, straight through, because the fallback strategy always works regardless of what gets rolled.',
      'The little UFO invaders are built from the same smooth, oversized-eye primitive style as Bounce and Croak \u2014 continuing the site\u2019s look rather than switching to a harsher, more typically "alien invasion" aesthetic for this one game.',
    ],
    strategyTips: [
      'Clear open (unshielded) lanes with Direct fire first \u2014 there\u2019s no reason to spend a Bank shot on a lane that doesn\u2019t need one.',
      'For a shielded lane, remember you fire FROM the mirror lane, not from the shielded lane itself \u2014 lane 0\u2019s shield is cleared by Banking from lane 4.',
      'Firing Direct at a shielded lane is a complete waste \u2014 it never chips the shield or the invaders behind it, so treat it the same as a miss.',
      'Your shot budget has a few spares built in, but not many \u2014 double-check which mode you\u2019re about to fire before committing, especially on lanes with three stacked invaders.',
    ],
    faq: [
      {
        q: 'What happens if I fire Direct at a shielded lane?',
        a: 'Nothing \u2014 the shot is completely wasted and the lane is untouched. It still counts against your shot budget, so it\u2019s worth avoiding.',
      },
      {
        q: 'Does Bank fire ever get blocked by a shield?',
        a: 'No, never \u2014 shields only stop fire coming straight up from below, and a Bank shot always comes in off the side wall instead.',
      },
      {
        q: 'How do I know which lane a Bank shot will hit?',
        a: 'It always lands in the mirror lane: lane 0 \u2194 lane 4, and lane 1 \u2194 lane 3. Lane 2 mirrors itself.',
      },
      {
        q: 'Can I play Carom more than once a day?',
        a: 'Today\u2019s run is once-daily like every other game here, but Coin Mode unlocks right after \u2014 unlimited replays on a fresh formation each time.',
      },
    ],
  },
  {
    slug: 'prowl',
    index: '050',
    name: 'Prowl',
    tagline: 'One city block. Guards on patrol. Don\u2019t be seen.',
    description:
      'Slip an agent across a night-lit city block to the extraction point without walking into a patrol guard\u2019s cone of vision. Collect jammers to survive one close call, and data shards for bonus score.',
    color: 'prowl',
    avgSolveTime: '5\u20136 min',
    difficulty: 'Medium',
    category: 'stealth',
    howToPlay: [
      'Move one street block at a time with the arrow pad or arrow keys.',
      'Guards patrol fixed routes and look straight ahead in a cone \u2014 tiles currently in view are highlighted red.',
      'Stepping into a red tile with no jammer in reserve ends the run immediately.',
      'Walk over a blue jammer to bank one free pass through a guard\u2019s cone, and over a gold shard for bonus score.',
      'Reach the green marker before your move budget runs out to win the day\u2019s run.',
    ],
    designNotes: [
      'Every other game on the site is a fixed-budget puzzle you can fully solve in your head before moving; Prowl is deliberately the one entry where the board reacts back \u2014 the guards keep walking whether you\u2019re ready or not.',
      'The city street grid is fixed (streets sit on every third row and column) so reachability is guaranteed by construction, the same way Shadow retries wall placement until a path exists \u2014 here it just never has to retry.',
      'Getting caught is an instant loss rather than a time penalty on purpose: it keeps the vision-cone read-and-react loop meaningful instead of turning guards into background decoration.',
    ],
    strategyTips: [
      'Watch a guard complete one full patrol lap before committing to a route past them \u2014 the reversal point at each end of their patrol is when their cone briefly swings the other way.',
      'Bank jammers early. A charge in reserve is what turns a risky corner into a free one.',
      'The shortest path is rarely the safest one \u2014 a one-block detour around a patrol line is usually cheaper than the moves you\u2019d lose getting caught and restarting.',
    ],
    faq: [
      {
        q: 'Does getting spotted end the run even with moves left?',
        a: 'Yes, unless you have a banked jammer charge \u2014 spending one lets you pass through a guard\u2019s cone unnoticed that turn.',
      },
      {
        q: 'Do guards react to me, or just walk fixed routes?',
        a: 'Fixed routes \u2014 each guard walks back and forth along one patrol line and looks whichever way they\u2019re currently walking, so their vision is predictable if you track their pattern.',
      },
      {
        q: 'What sets the difficulty in Coin Mode?',
        a: 'Easy/Normal/Hard changes guard count and vision range together with the move budget, since the challenge here is about patrol density more than raw move efficiency.',
      },
    ],
  },
  {
    slug: 'regent',
    index: '051',
    name: 'Regent',
    tagline: 'One crown per row, per column, per color. None touching.',
    description:
      'A 6\u00d76 board split into six colored regions. Place exactly one crown in every row, every column, and every color \u2014 with no two crowns touching, even diagonally.',
    color: 'regent',
    avgSolveTime: '3\u20134 min',
    difficulty: 'Hard',
    category: 'puzzle',
    howToPlay: [
      'The board is divided into six colored regions. Tap a cell to place a crown; tap it again to remove it.',
      'When finished, there must be exactly one crown in every row, every column, and every color region.',
      'No two crowns may touch \u2014 not even diagonally. A cell directly beside, above, below, or diagonal to a crown can\u2019t hold another one.',
      'Cells flash red when a crown you\u2019ve placed conflicts with another \u2014 use that to find and fix the problem.',
      'Solve it within your tap budget.',
    ],
    designNotes: [
      'This is Loophole\u2019s take on the region-constrained placement puzzle format that spread quickly overseas in 2025 \u2014 one clean rule (row, column, color, no touching) that\u2019s simple to state and genuinely hard to hold in your head at once.',
      'The color regions aren\u2019t hand-drawn: each day\u2019s solution is generated first (six crown positions, one per row and column, none touching), then the board is grown outward from those six points like a randomized flood fill until every cell belongs to a region. A solver then checks the board and nudges region boundaries \u2014 always keeping every color a single connected shape \u2014 to squeeze out alternate solutions before publishing.',
      'Touching is deliberately limited to immediate neighbors (including diagonals) rather than full chess-queen diagonal lines \u2014 it keeps the reasoning about color regions, not long-range line-of-sight, at the center of the puzzle.',
    ],
    strategyTips: [
      'Start with the smallest color region \u2014 a region with only a few cells leaves you the least room to be wrong, so it narrows the rest of the board fastest.',
      'Once a row, column, or color has a crown, every other cell sharing that row, column, or color is eliminated \u2014 mentally cross those off before you consider your next placement.',
      'A region that\u2019s confined entirely to one row or column must have its crown at the intersection \u2014 look for those forced cells before guessing.',
      'The touching rule quietly eliminates a lot of a region\u2019s cells too: any cell diagonally beside an already-placed crown is dead, even if its row and column are still open.',
    ],
    faq: [
      {
        q: 'Does "touching" include diagonal neighbors?',
        a: 'Yes \u2014 no two crowns can be placed in cells that are adjacent in any of the eight directions, including diagonally.',
      },
      {
        q: 'Is there always exactly one solution?',
        a: 'Almost always \u2014 each board is generated and then checked against a solver, which nudges the color regions until alternate solutions are gone. On the rare board where a second arrangement slips through, either one still counts as solving it.',
      },
      {
        q: 'Does removing a crown cost me anything?',
        a: 'Only a tap from your budget, the same as placing one \u2014 there\u2019s no separate penalty for correcting a mistake.',
      },
      {
        q: 'Can I play Regent more than once a day?',
        a: 'Today\u2019s run is once-daily like every other game here, but Coin Mode unlocks right after \u2014 unlimited replays on a fresh board each time.',
      },
    ],
  },
  {
    slug: 'skein',
    index: '052',
    name: 'Skein',
    tagline: 'Drag the knots until no two threads cross.',
    description:
      'A tangled web of knots and threads that\u2019s secretly untangleable: drag each knot to a new spot until every thread lies flat with no crossings left \u2014 all within your move budget.',
    color: 'skein',
    avgSolveTime: '3\u20134 min',
    difficulty: 'Medium',
    category: 'puzzle',
    howToPlay: [
      'You\u2019re looking at a graph: knots (circles) connected by threads (lines). It starts in a tangled mess where several threads cross each other.',
      'Drag any knot to a new position on the board. The lines connected to it follow along as you drag.',
      'Threads currently crossing another thread are highlighted in red \u2014 clear those first.',
      'You win once every thread lies flat with zero crossings, all within your move budget. Each drag-and-release counts as one move.',
    ],
    designNotes: [
      'Skein is Loophole\u2019s take on graph planarity puzzles (in the spirit of games like Planarity/Untangle): every board starts life as a planar graph \u2014 one that CAN be drawn with zero crossings \u2014 which is then scrambled by moving its knots to random positions until the tangle looks hopeless.',
      'Because the underlying graph is planar by construction, a zero-crossing arrangement is always guaranteed to exist. The challenge is entirely about figuring out where each knot belongs, not about the puzzle secretly being unsolvable.',
      'The crossing count updates live as you drag, before you even let go \u2014 so you can preview whether a spot will help before you commit the move.',
    ],
    strategyTips: [
      'Start with the knot that has the most red (crossing) threads attached to it \u2014 moving it clears the most conflicts per move.',
      'Drag toward open space near the edge of the board first. It\u2019s easier to untangle outward than to shuffle knots around each other in a crowded center.',
      'Watch the live crossing count while you drag \u2014 if it ticks up as you approach a spot, keep moving past it rather than dropping there.',
      'Threads between knots that are already crossing-free can still get pulled into a new crossing by an unrelated move \u2014 recheck the whole board after every drag, not just the knot you moved.',
    ],
    faq: [
      {
        q: 'Is every board actually solvable?',
        a: 'Yes \u2014 each board is generated from a graph that\u2019s planar by design, so an arrangement with zero crossings always exists before it\u2019s ever scrambled.',
      },
      {
        q: 'What counts as one move?',
        a: 'One drag-and-release of a single knot, regardless of how far you move it or how many threads it\u2019s connected to.',
      },
      {
        q: 'Do I need to worry about threads I\u2019m not dragging?',
        a: 'Yes \u2014 moving one knot can create a new crossing between two threads that were previously fine. Recheck the whole board after each move.',
      },
      {
        q: 'Can I play Skein more than once a day?',
        a: 'Today\u2019s run is once-daily like every other game here, but Coin Mode unlocks right after \u2014 unlimited replays on a fresh tangle each time.',
      },
    ],
  },
  {
    slug: 'vials',
    index: '053',
    name: 'Vials',
    tagline: 'Pour until every color sits in its own tube.',
    description:
      'A water-sort style pouring puzzle: tubes start stacked with a jumble of colored liquid. Tap one tube to pick it up, tap another to pour \u2014 sort every color into its own tube within your move budget.',
    color: 'vials',
    avgSolveTime: '3\u20135 min',
    difficulty: 'Medium',
    category: 'puzzle',
    howToPlay: [
      'Tap a tube to pick it up \u2014 it lifts slightly to show it\u2019s selected.',
      'Tap a second tube to pour the top color from the first tube into it.',
      'A pour only works if the receiving tube is empty or its top color matches what you\u2019re pouring \u2014 an invalid pour shakes the tube instead.',
      'You win once every color sits together in a single tube, all within your move budget.',
    ],
    designNotes: [
      'Vials is Loophole\u2019s take on the water-sort puzzle genre \u2014 tap-to-pour rather than drag-and-drop, which keeps it equally comfortable on mobile and desktop.',
      'Each day\u2019s tube arrangement is generated by starting from a fully sorted state and pouring backward a set number of times, which guarantees a solution exists without needing a separate solver pass.',
      'The shake animation on an invalid pour is deliberate immediate feedback \u2014 you find out a move doesn\u2019t work before it costs you anything, since invalid pours don\u2019t consume a move.',
    ],
    strategyTips: [
      'Look for a tube that\u2019s already one color, fully full \u2014 that\u2019s solved and can be ignored for the rest of the puzzle.',
      'Keep at least one tube empty as long as you can. An empty tube is your only way to temporarily park a color that\u2019s blocking one underneath it.',
      'Pour the smallest possible amount when you\u2019re just repositioning \u2014 pouring an entire matching run at once can bury a color you needed access to.',
      'Work from the top color down: a tube\u2019s bottom colors are inaccessible until everything above them is cleared, so plan which top color to clear first.',
    ],
    faq: [
      {
        q: 'Does an invalid pour cost me a move?',
        a: 'No \u2014 if the receiving tube can\u2019t accept the color, the tube just shakes and nothing is used from your move budget.',
      },
      {
        q: 'How many colors are there?',
        a: 'The exact count can vary slightly by difficulty, but every board is generated from a fully sorted state, so a solution always exists.',
      },
      {
        q: 'What happens if I pour a partial stack?',
        a: 'Only the contiguous run of the same color on top of the tube pours over \u2014 it stops as soon as it hits a different color or the receiving tube fills up.',
      },
      {
        q: 'Can I play Vials more than once a day?',
        a: 'Today\u2019s run is once-daily like every other game here, but Coin Mode unlocks right after \u2014 unlimited replays on a fresh set of tubes each time.',
      },
    ],
  },
  {
    slug: 'oni-smash',
    index: '054',
    name: 'Oni Smash',
    tagline: 'Punch the rocks before they land.',
    description:
      'A fast reflex arcade game: rocks fall from the top of the screen and you tap them before they hit the ground. Chain hits for a combo bonus, miss three and it\u2019s over. No daily limit \u2014 play as many rounds as you want.',
    color: 'oni',
    avgSolveTime: '1\u20132 min per round',
    difficulty: 'Medium',
    category: 'arcade',
    href: '/arcade/oni-smash',
    howToPlay: [
      'Rocks fall from the top of the screen. Tap or click one before it reaches the ground to smash it.',
      'Each smash adds to your score, and chaining smashes without a miss builds a combo multiplier.',
      'Missing a rock (letting it hit the ground) resets your combo and costs a life. Lose three lives and the round ends.',
      'The game speeds up the longer you survive \u2014 rocks fall faster and spawn more often over time.',
    ],
    designNotes: [
      'Unlike every other game on Loophole, Oni Smash isn\u2019t a once-a-day puzzle \u2014 it\u2019s an endless, replay-as-much-as-you-want arcade game, built around chasing a personal high score rather than solving a fixed daily challenge.',
      'It\u2019s the debut appearance of ONI, Loophole Arcade\u2019s mascot \u2014 read his full bio on his character page.',
    ],
    strategyTips: [
      'Stay centered and let your eyes relax across the whole board rather than tracking one rock at a time \u2014 peripheral vision catches new spawns faster than focused tunnel vision.',
      'Prioritize whichever rock is closest to the ground, not whichever is biggest or most recently spawned \u2014 losing a combo costs more than the few extra points a bigger rock is worth.',
      'When the pace ramps up, resist the urge to speed up your taps randomly \u2014 a clean, deliberate rhythm keeps your combo alive longer than a frantic one.',
    ],
    faq: [
      {
        q: 'Is there a daily limit like the other games?',
        a: 'No \u2014 Oni Smash is endless. Play as many rounds as you want, any time.',
      },
      {
        q: 'Is my high score saved?',
        a: 'Yes, locally in your browser, and it\u2019s shown at the end of every round.',
      },
      {
        q: 'Who is Oni?',
        a: 'Loophole Arcade\u2019s mascot \u2014 see his character page for the full story.',
      },
    ],
  },
  {
    slug: 'wanderwood',
    index: '055',
    name: 'Wanderwood',
    tagline: 'Roam the glade. Collect every gem.',
    description:
      'A free 3D exploration game: pick a fox, bunny, raccoon, mouse, or wanderer and roam an open glade collecting glowing gems as fast as you can. No daily limit \u2014 play as many rounds as you want.',
    color: 'wanderwood',
    avgSolveTime: '1\u20133 min per round',
    difficulty: 'Easy',
    category: 'arcade',
    href: '/arcade/wanderwood',
    howToPlay: [
      'Pick a character on the select screen \u2014 four animals or two human wanderers, all playable.',
      'Use the arrow keys or WASD to move (or the on-screen joystick on mobile).',
      'Walk into a glowing gem to collect it. Collect all of them to clear the glade.',
      'Your time is tracked from the moment you start \u2014 try to beat your best.',
    ],
    designNotes: [
      'Wanderwood is Loophole Arcade\u2019s first fully 3D game, built with the same no-daily-limit, endless-replay philosophy as Oni Smash.',
      'Every character \u2014 human and animal \u2014 shares one consistent, rounded "toy figurine" art style and the same underlying walk-cycle rig, so switching characters changes who you\u2019re playing as without changing how the game feels to control.',
      'The glade layout is randomized each time you start a round, so the gem locations are never in exactly the same place twice.',
    ],
    strategyTips: [
      'Gems glow and bob in place, which makes them easiest to spot against the grass at a glance from a slight distance \u2014 no need to hug the ground looking for them.',
      'Plan a rough loop around the glade rather than chasing the nearest gem one at a time \u2014 backtracking costs more time than a wider, more deliberate path.',
      'The camera trails slightly behind your character, so slow down a touch before sharp turns to keep your bearings.',
    ],
    faq: [
      {
        q: 'Is there a daily limit like the other games?',
        a: 'No \u2014 Wanderwood is endless. Play as many rounds as you want, any time, with a new gem layout each time.',
      },
      {
        q: 'Can I switch characters between rounds?',
        a: 'Yes \u2014 finishing a round or refreshing takes you back to the character select screen.',
      },
      {
        q: 'Is my best time saved?',
        a: 'Yes, locally in your browser, and it\u2019s shown when you clear a glade.',
      },
    ],
  },
  {
    slug: 'yokai-bridge',
    index: '056',
    name: 'Yokai Bridge',
    tagline: 'Some planks are missing. Cross carefully.',
    description:
      'A free 3D crossing game: guide a friendly tanuki-yokai across an old lantern-lit bridge one hop at a time. Shift lanes to dodge missing planks and reach the torii gate on the far shore.',
    color: 'yokai-bridge',
    avgSolveTime: '2\u20134 min per crossing',
    difficulty: 'Medium',
    category: 'arcade',
    href: '/arcade/yokai-bridge',
    howToPlay: [
      'Shift left or right to line up with a lane, then hop forward one plank at a time.',
      'Some planks are missing \u2014 hopping onto a gap drops you gently into the mist below and ends the run.',
      'At least one lane is always safe on every row, so a way across always exists if you look for it.',
      'Reach the torii gate at the far end to complete the crossing. Collect glowing fireflies along the way for a bit of extra light on the path.',
    ],
    designNotes: [
      'Yokai Bridge is Loophole Arcade\u2019s calmest game by design \u2014 movement is deliberate, one hop at a time, rather than a fast-twitch endless runner, to match the quiet, lantern-lit mood of the setting.',
      'The tanuki is a classic figure in Japanese folklore associated with roadside shrines and river crossings, which made it a natural fit as a friendly, distinctly non-scary yokai for a nighttime bridge game.',
      'Falling through a gap is deliberately gentle \u2014 a soft drop into misty water, not a jump-scare \u2014 in keeping with the game\u2019s whimsical rather than horror tone.',
      'Every crossing is laid out from a fresh random seed, so the pattern of missing planks is different each time you play.',
    ],
    strategyTips: [
      'Rows near the start and the torii gate itself are always fully safe \u2014 the real decision-making begins a few steps in.',
      'Missing planks get more frequent (and occasionally appear in two lanes at once) the further you get \u2014 stay attentive rather than hopping on autopilot once you\u2019ve built a rhythm.',
      'You can shift lanes before committing to a hop \u2014 there\u2019s no rush, so take the moment to look at the row ahead before you jump.',
    ],
    faq: [
      {
        q: 'Is it actually scary?',
        a: 'No \u2014 the yokai here is a friendly tanuki, and falling just means a soft splash into the mist before you try again.',
      },
      {
        q: 'Is it possible to get stuck with no safe way across?',
        a: 'No \u2014 every row always has at least one lane with a plank, so a path across always exists.',
      },
      {
        q: 'Do the fireflies do anything?',
        a: 'They\u2019re a small bonus to look out for along the way \u2014 collecting them isn\u2019t required to reach the torii gate.',
      },
      {
        q: 'Is there a daily limit like the other games?',
        a: 'No \u2014 Yokai Bridge is endless. Cross as many times as you want, with a new layout each time.',
      },
    ],
  },
];

export function getGame(slug: string): GameMeta | undefined {
  return GAMES.find((g) => g.slug === slug);
}

/**
 * Same-category games first (closest match for "if you liked this, try this"),
 * padded out with same-difficulty games if the category alone doesn't have enough,
 * excluding the game itself. Deterministic (no randomness) so it's stable for SSR/SEO.
 */
export function getSimilarGames(game: GameMeta, count = 3): GameMeta[] {
  const others = GAMES.filter((g) => g.slug !== game.slug);
  const sameCategory = others.filter((g) => g.category === game.category);
  const sameDifficulty = others.filter(
    (g) => g.category !== game.category && g.difficulty === game.difficulty
  );
  const rest = others.filter(
    (g) => g.category !== game.category && g.difficulty !== game.difficulty
  );
  return [...sameCategory, ...sameDifficulty, ...rest].slice(0, count);
}
