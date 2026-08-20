# Prowl を組み込むための変更点

新規ファイルはそのまま配置すれば動きますが、以下の既存共有ファイルは
中身をお見せいただいた範囲でしか把握できないため、自動編集ではなく
「どこに何を足すか」を明記します。コピペで数分の作業です。

## 1. `lib/games/registry.ts`

### 1-a. `GameSlug` 型に追加
```ts
export type GameSlug =
  | 'echo-merge' | ... | 'carom'
  | 'prowl';   // ← 追加
```

### 1-b. `GameCategory` 型に `'stealth'` を追加(新ジャンルなので新設)
```ts
export type GameCategory = 'puzzle' | 'movement' | 'word' | 'arcade' | 'cards' | 'stealth';
```
`CATEGORY_LABEL` にも追加:
```ts
export const CATEGORY_LABEL: Record<GameCategory, string> = {
  puzzle: 'Puzzle',
  movement: 'Movement',
  word: 'Word',
  arcade: 'Arcade',
  cards: 'Cards',
  stealth: 'Stealth', // ← 追加
};
```

### 1-c. `GAMES` 配列の末尾に追加
```ts
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
```

## 2. `components/GameCatalog.tsx`

`TABS`(カテゴリタブ)配列に `stealth` を追加してください。既存の並びと
同じ形式(絵文字 + ラベル)で、末尾に:
```ts
{ id: 'stealth', label: CATEGORY_LABEL.stealth, icon: '\ud83c\udf03' }, // \ud83c\udf03 = night-city emoji
```
実際のプロパティ名は既存の他タブに合わせてください(見た限り `id`/`label` に加えて
アイコン用フィールドがあるはずです)。

## 3. `tailwind.config.ts`

`theme.extend.colors` の末尾(`carom` の後)に追加:
```ts
prowl: {
  DEFAULT: '#C6432E',
  soft: '#F7DEDA',
},
```
※ 既存の `clearway` と近い赤系なので、被りが気になる場合は例えば
`'#B8451F'`(ダークオレンジ寄り)に変えても構いません。

## 4. `components/SpecimenCard.tsx`

ゲーム一覧カードの帯色・淡色マッピング(`STRIPE_CLASS` / `SOFT_CLASS` のような
`Record<string, string>`)に他のゲームと同じパターンで `prowl: 'bg-prowl'` /
`prowl: 'bg-prowl-soft'` 相当の1行を追加してください。

## 5. 依存関係

`@react-three/fiber` / `@react-three/drei` / `three` は既存ゲーム
(Croak, Bounce, Vantage など)で使われているので追加インストール不要です。

## 6. 動作確認のポイント

- `lib/daily-seed.ts` の `getDailyContext('prowl')` は他ゲームと同じ関数なので
  スラッグを追加すれば自動的に機能します。
- Coin Mode のリーダーボードは `GLOBAL_LEADERBOARD_SLUG` を使う共通ボードなので
  追加設定不要です(ゲーム別リーダーボードにしたい場合は `croak` の該当箇所を参照)。
