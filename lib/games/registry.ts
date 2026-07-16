export type GameSlug =
  | 'echo-merge' | 'mirror-loop' | 'color-debt' | 'gravity-word'
  | 'fold' | 'carry-chain' | 'brace-yard' | 'splice'
  | 'heatmap' | 'signal' | 'overflow' | 'polarity'
  | 'shadow' | 'tether' | 'drift' | 'phase'
  | 'boo-rush';

export type GameCategory = 'puzzle' | 'movement' | 'word' | 'arcade';

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
  },
  {
    slug: 'shadow',
    index: '13',
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
  },
  {
    slug: 'tether',
    index: '14',
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
  },
  {
    slug: 'drift',
    index: '15',
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
  },
  {
    slug: 'phase',
    index: '16',
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
  },
  {
    slug: 'boo-rush',
    index: '17',
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
  },
];

export function getGame(slug: string): GameMeta | undefined {
  return GAMES.find((g) => g.slug === slug);
}
