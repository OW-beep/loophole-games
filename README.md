# このzipについて

前回・前々回のビルドが両方とも同じ場所で落ちていたのは、`lib/games/registry.ts`
の `GameSlug` 型に `'prowl'` を追加する変更が、実際のコミットに反映されていな
かったためです(型定義とGAMES配列は別の変更なので、片方だけ入っていた可能性が
あります)。

今回は、貼っていただいた実際の `registry.ts` の中身にそのまま3箇所の変更を
加えた**完全な差し替え用ファイル**を同梱しています。前回までのような「どこに
何を足すか」のメモ書きではなく、このファイルでまるごと上書きしていただければ
確実です。

## このzipの中身

- `lib/games/registry.ts` — お送りいただいた内容 + 以下3箇所を追加済み
  1. `GameSlug` 型の末尾に `| 'prowl'`
  2. `GameCategory` 型に `'stealth'` を追加、`CATEGORY_LABEL` にも `stealth: 'Stealth'` を追加
  3. `GAMES` 配列の末尾(`carom` の次、index `'050'`)に Prowl のエントリを追加
  他の部分は一切変更していません(diffなしでそのまま置き換え可能です)。

- `lib/games/prowl.ts` — Prowl のゲームロジック(変更なし、前回と同じ)
- `app/games/prowl/ProwlBoard.tsx` — 3Dボード本体(変更なし、前回と同じ)
- `app/games/prowl/page.tsx` — ページ本体(変更なし、前回と同じ)

## 反映方法

1. `lib/games/registry.ts` をこのファイルで**まるごと置き換え**てください。
2. `lib/games/prowl.ts` と `app/games/prowl/` フォルダをリポジトリの同じ場所に配置してください。
3. コミット & プッシュ後、ビルドが通るか確認してください。

## まだ残っている作業(型エラーにはならないもの)

以下は `PATCH_INSTRUCTIONS.md` (前回zip)で触れた内容で、ビルドは通りますが
反映しないとカタログ一覧やヘッダーの色が正しく出ません。

- `tailwind.config.ts` に `prowl` カラー追加
- `components/GameCatalog.tsx` に `stealth` タブ追加
- `components/SpecimenCard.tsx` に `prowl` の帯色マッピング追加

これらのファイルの中身をまだお見せいただいていないため、前回同様に自動編集は
していません。同じ手順(貼っていただければこちらで直接反映します)で進められます。
