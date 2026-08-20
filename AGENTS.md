# このリポジトリで作業するエージェントへ

Novi UI のモノレポ。**このファイルはリポジトリを触る側の規約**で、
ライブラリ利用者向けの情報は `apps/docs/public/llms.txt`（ビルド時生成）にある。

```
packages/core     挙動・a11y・型契約・トークン規約。スタイルを1行も持たない
packages/raster   テーマ1: ミニマル / スイス系
apps/docs         ドキュメントサイト（静的エクスポート）
```

## 絶対にやらないこと

これらはすべて、**過去に実際に壊れた**ことがある。

- `packages/core` に CSS を書く（`base.css` はビルド時生成）
- `packages/core` のメインエントリで React を import する（RSC が壊れる）
- テーマから `UNSTABLE_` 接頭辞の API を直接 import する（`core/src/unstable/` 経由のみ）
- テーマから `@react-aria/*` / `@react-stately/*` を直接 import する（core 経由のみ）
- `shadow-*` / `rounded-md` 以上 / `border-2` 以上 / `scale-*` / `rotate-*` を使う
- リテラルの色値（`#fff` / `rgb()`）を書く。必ず `--novi-color-*` を経由する
- Provider を必要とする設計を入れる
- CSS リセットで `color` や `font` を触る（`@layer` 順序が詳細度に優先し、利用者のユーティリティに勝ってしまう）
- `npm publish` / `changeset publish` を使う（`workspace:*` が置換されず壊れたパッケージが公開される）

違反は CI が検出する。`pnpm lint` と `pnpm check:dist` で確認できる。

## 新しいコンポーネントを追加する手順

1. `packages/core/src/contracts/<name>.contract.ts` に slot 語彙と props 型を追加
2. `packages/core/src/contracts/registry.ts` に登録
3. `packages/raster/src/<name>/<name>.styles.ts` — `tv()` を **`satisfies` で型付け**して named export
4. `packages/raster/src/<name>/<name>.tsx` — RAC を組み立て、**全 slot に `data-slot` を出力**
5. `<name>.test.tsx` に5点セット（レンダリング / 契約 / axe / variant / classNames）
6. 横断検査に登録（`src/styles/variant-distinctness.test.ts` と `coverage.test.ts`）
7. `apps/docs/demos/` にテーマ非依存のデモを追加

基準となる実装は `packages/raster/src/button/`。**迷ったらこれに戻る。**

## 落とし穴（すべて実際に踏んだ）

| 症状 | 原因と対処 |
|---|---|
| 任意 slot を呼ぶと型エラー | slot 定義に型注釈を付けている。`satisfies` を使う |
| `'use client'` が成果物に無い | import 先のディレクティブは引き上げられない。**エントリ自身**に書く |
| `tv({ extend, base })` が効かない | slot ベースでは `base` は無視される。`slots` を使う |
| 拡張したクラスが variant に負ける | `extend` は base に足される。呼び出し側の `classNames` を使う |
| 2つの variant が同じ見た目 | `variant` を最後に宣言する。先に書くと `size` に負ける |
| ダークで文字が見えない | 背景を設定する面は**文字色も設定する**。`surface-contrast.test.ts` が検出 |
| 契約テストで必須 slot が全部欠落 | オーバーレイは portal に描画される。`baseElement` を見る |
| 1コンポーネント import が重い | 1ファイルにバンドルすると tree-shaking が効かない。`unbundle: true` |
| ビルドが Node で落ちる | `.node-version`（22.22.2）に合わせる。tsdown が `^22.18.0 \|\| >=24.11.0` を要求 |

## 検証の原則

- **測る対象を間違えない。** バンドルサイズは dist のファイルサイズではなく「消費者が取り込む量」
- **テストは変異させて確かめる。** わざと壊して落ちなければ、その検査は意味がない
- **jsdom では足りない。** axe・カラースキームのカスケード・ホバーはブラウザでしか検証できない
- **推測せず実物を読む。** RAC がどの `data-*` を出すかは型定義を読んで初めて分かる

## コマンド

```bash
pnpm lint          # Biome + 設計制約
pnpm typecheck
pnpm test          # 617件
pnpm build
pnpm check:dist    # exports実在 / RSC安全 / use client / tree-shaking
pnpm size

pnpm --filter @novi-ui/docs test:browser   # axe + テーマ切替 + 視覚回帰（要ビルド）
```

docs のビルドは **turbo 経由**（`pnpm turbo run build --filter=@novi-ui/docs`）。
IR 生成がビルド済みの core を読むため、依存順序が必要。

## リリース

`pnpm changeset` で変更を記録して push するだけ。
Changesets が version PR を作り、マージで **OIDC 自動公開**される。
OTP もトークンも要らない。`NODE_AUTH_TOKEN` を設定してはいけない（OIDC に切り替わらなくなる）。
