/**
 * lib/games/registry.ts に貼り付ける差分スニペットです。
 * このファイル自体はビルド対象ではありません(コピー用)。
 *
 * ビルドエラー
 *   "Type error: This comparison appears to be unintentional because
 *    the types 'GameSlug' and '"prowl"' have no overlap."
 * の直接の原因は 1) の GameSlug 型に 'prowl' が無いことです。
 * 2)〜4) も未適用なら合わせて反映してください(型エラーにはならなくても
 * 挙動やスタイルに影響します)。
 */

// ============================================================
// 1. GameSlug 型に 'prowl' を追加(★ビルドエラーの直接原因)
// ============================================================
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
  | 'prowl'; // ← 追加

// ============================================================
// 2. GameCategory 型に 'stealth' を追加
// ============================================================
export type GameCategory = 'puzzle' | 'movement' | 'word' | 'arcade' | 'cards' | 'stealth';

export const CATEGORY_LABEL: Record<GameCategory, string> = {
  puzzle: 'Puzzle',
  movement: 'Movement',
  word: 'Word',
  arcade: 'Arcade',
  cards: 'Cards',
  stealth: 'Stealth', // ← 追加
};

// ============================================================
// 3. GAMES 配列の末尾(carom の次)に Prowl のエントリを追加
//    ※ 既存の GAMES 配列の閉じ角カッコ `];` の直前に、
//      下のオブジェクトをカンマ区切りで挿入してください。
// ============================================================
/*
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
*/
