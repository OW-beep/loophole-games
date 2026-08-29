# 外部露出プラン(まとめサイト掲載・SNS投稿の下書き)

サイトSEOだけでは限界がある規模感のため、外部への露出導線を用意する。
このファイルはそのまま使える下書き集。実際の投稿・打診はコードでは自動化できないため、
担当者が該当欄をコピーして使う想定。

## 1. パズルゲームまとめサイト・ディレクトリへの掲載打診

対象になりやすいプラットフォームの例(無料ゲームを扱う一般的なディレクトリ/コミュニティ):
- itch.io(HTML5ゲームの投稿・タグ検索経由の流入が見込める)
- Reddit: r/WebGames, r/puzzles, r/incremental_games(ゲームによる)
- IndieDB / IndieGamesPlus のようなインディーゲーム系ディレクトリ
- Hacker News の "Show HN"(技術的に凝ったパズル生成ロジックなどはウケが良い)

### サイト全体の紹介文(打診・登録フォーム用、英語)

> Loophole is a collection of original, free daily puzzle games — no ads
> forcing you to watch, no download, no account required. Each game gets a
> brand-new, algorithmically generated puzzle every day, and every puzzle is
> guaranteed solvable. Genres range from mirror-reflection and tile-merge
> puzzles to match-3 and number puzzles.
> https://loophole-games.vercel.app/

### 個別ゲームの短い紹介文(1〜2文、掲載フォームの説明欄用)

**Mirror Loop**
> A daily mirror-reflection puzzle: rotate mirrors on a grid to route three
> colored light beams into their matching targets, sharing one tight
> rotation budget. Free, no download.

**Echo Merge**
> A daily tile-merge puzzle with a twist: every move you make echoes
> automatically one turn later, so you're always playing one move ahead of
> yourself. Free, no download.

**Color Debt**
> A daily match-3 puzzle where clearing tiles spawns "debt" tiles that lock
> the board if you ignore them too long. Free, no download.

**Carry Chain**
> A daily number puzzle: merge adjacent numbers down a row, but every merge
> carries +1 onto the next tile over. Land the total on the exact target.
> Free, no download.

## 2. SNS(X)投稿ドラフト

ゲームプレイのGIF/動画は別途画面収録が必要(このファイルはテキスト部分の下書きのみ)。
収録手順の目安:
1. 該当ゲームページをブラウザで開く
2. 画面収録ツール(macOSなら QuickTime の「新規画面収録」、Windowsなら
   Xbox Game Bar など)でプレイの様子を10〜20秒ほど録画
3. 動画を GIF に変換(ezgif.com などのオンライン変換で十分)するか、
   動画のまま添付してX(Twitter)に投稿

### 投稿文ドラフト(各ゲーム1〜2案、ハッシュタグ付き)

**Mirror Loop**
> Rotate the mirrors. Route the beams. One wrong turn and you can't see
> where it went. 🪞
> New puzzle every day, free to play:
> https://loophole-games.vercel.app/games/mirror-loop
> #puzzlegame #indiedev #dailypuzzle

**Echo Merge**
> The twist: your last move replays itself automatically one turn later.
> You're not just planning your next move — you're planning against your
> own past self.
> https://loophole-games.vercel.app/games/echo-merge
> #puzzlegame #mergegame #dailypuzzle

**Color Debt**
> Every match you make comes back to bite you. Clear tiles fast enough or
> the debt locks your board. 💸
> https://loophole-games.vercel.app/games/color-debt
> #match3 #puzzlegame #dailypuzzle

**Carry Chain**
> Merge the numbers. Hit the exact target. But every merge you make bumps
> the next number over by one — nothing stays where you left it.
> https://loophole-games.vercel.app/games/carry-chain
> #numbergame #puzzlegame #dailypuzzle

### 運用メモ
- 投稿は平日の夕方〜夜(現地時間)が一般的にエンゲージメントが高いとされる。
  Loopholeの主要想定読者層(海外・パズルゲーム好き)の時間帯に合わせて調整する。
- 反応が良かった投稿は同じゲームで少し切り口を変えて再投稿してよい
  (同じGIFでも文言を変えるだけで新しいインプレッションが得られることが多い)。
- 各投稿には必ずゲーム個別ページの直リンクを貼る(トップページへのリンクだと
  離脱率が上がりやすいため)。

## 3. 実施済み(コード側)の対応

以下はこのタスクの一部として、サイト側のコードに反映済み:
- `mirror-loop` / `echo-merge` / `color-debt` / `carry-chain` の
  `<title>` にジャンルキーワード + "Free" を追加(指名検索以外の
  流入導線を作る目的)
- 上記4ゲームの説明文(meta description・ページ本文)にも同じ
  ジャンルキーワードを自然な形で追加し、titleとの一貫性を確保
- 「遊び方」「攻略のコツ」「FAQ」は元々全ゲーム共通のコンポーネント
  (`components/GameDetails.tsx`)でサーバーサイドレンダリングされ
  クロール可能な状態になっていたため、追加のコード変更は不要と判断
