# このリポジトリで作業するエージェントへ

Novi UI のモノレポ。**このファイルはリポジトリを触る側の規約**で、
ライブラリ利用者向けの情報は `apps/docs/public/llms.txt`（ビルド時生成）にある。

```
packages/core     挙動・a11y・型契約・トークン規約。スタイルを1行も持たない
packages/raster   テーマ1: ミニマル / スイス系
packages/mcp      AI エージェント向け MCP サーバ。読み取り専用・オフライン
apps/docs         ドキュメントサイト（静的エクスポート）
```

## AI 向けの出力はすべて生成物

props 表・`llms.txt`・MCP の応答は、**契約から生成した1つの中間表現（IR）だけ**を読む。

```
packages/core/src/contracts/*.contract.ts       props / JSDoc / @a11y / @keywords
packages/raster/scripts/design-rules.data.mjs   禁止クラス（CI の検査と同一の定義）
packages/raster/src/tokens/raster-tokens.ts     数値トークン
        ↓  scripts/generate-component-index.mjs
component-index.json  →  docs の props 表 / llms.txt / @novi-ui/mcp
```

**API の情報を手で書かない。** 手書きは必ず実装とズレ、ズレた情報は
人間には軽い不便だが AI には致命的（誤った API を自信を持って生成する）。
`pnpm check:handwritten` がこれを検査している。

## 絶対にやらないこと

これらはすべて、**過去に実際に壊れた**ことがある。

- `packages/core` に CSS を書く（`base.css` はビルド時生成）
- `packages/core` のメインエントリで React を import する（RSC が壊れる）
- テーマから `UNSTABLE_` 接頭辞の API を直接 import する（`core/src/unstable/` 経由のみ）
- テーマから `@react-aria/*` / `@react-stately/*` を直接 import する（core 経由のみ）
- 影・角丸をトークンを通さず書く（`shadow-[var(--novi-shadow-*)]` / `rounded-[var(--novi-radius-*)]` のみ可）。`border-2` 以上 / `scale-*` / `rotate-*` を使う
- リテラルの色値（`#fff` / `rgb()`）を書く。必ず `--novi-color-*` を経由する
- Provider を必要とする設計を入れる
- CSS リセットで `color` や `font` を触る（`@layer` 順序が詳細度に優先し、利用者のユーティリティに勝ってしまう）
- `npm publish` / `changeset publish` を使う（`workspace:*` が置換されず壊れたパッケージが公開される）

違反は CI が検出する。`pnpm lint` と `pnpm check:dist` で確認できる。

## 新しいコンポーネントを追加する手順

1. `packages/core/src/contracts/<name>.contract.ts` に slot 語彙と props 型を追加
   - Props インターフェースの JSDoc に **要約1行 / `@keywords` / `@a11y` / `@example` の4点が必須**。
     欠けると IR の生成が失敗してビルドが落ちる
2. `packages/core/src/contracts/registry.ts` に登録
3. `packages/raster/src/<name>/<name>.styles.ts` — `tv()` を **`satisfies` で型付け**して named export
4. `packages/raster/src/<name>/<name>.tsx` — RAC を組み立て、**全 slot に `data-slot` を出力**
5. `<name>.test.tsx` に5点セット（レンダリング / 契約 / axe / variant / classNames）
6. 横断検査に登録（`src/styles/variant-distinctness.test.ts` と `coverage.test.ts`）
7. `apps/docs/demos/` にテーマ非依存のデモを追加

基準となる実装は `packages/raster/src/button/`。**迷ったらこれに戻る。**

`@keywords` には一般語（「表示」「選ぶ」単独）を入れない。
無関係な問い合わせに当たると、MCP が未実装のものを実装済みと答えることになる。

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
| 視覚回帰の基準を手元で撮った | **撮ってはいけない。** 判定は CI（Linux）で行うため環境が違う。Actions の「視覚回帰の基準を更新」を対象ブランチで実行する |

## 検証の原則

- **測る対象を間違えない。** バンドルサイズは dist のファイルサイズではなく「消費者が取り込む量」
- **テストは変異させて確かめる。** わざと壊して落ちなければ、その検査は意味がない
- **jsdom では足りない。** axe・カラースキームのカスケード・ホバーはブラウザでしか検証できない
- **推測せず実物を読む。** RAC がどの `data-*` を出すかは型定義を読んで初めて分かる

## コマンド

```bash
pnpm lint               # Biome + 設計制約
pnpm typecheck
pnpm test               # core + raster + mcp
pnpm build
pnpm check:dist         # exports実在 / RSC安全 / use client / tree-shaking
pnpm check:handwritten  # 手書きの API 情報が混ざっていないか
pnpm size

pnpm --filter @novi-ui/mcp check:security   # MCP が env / FS / network に触れないこと
pnpm --filter @novi-ui/docs test:browser    # axe + テーマ切替 + 視覚回帰（要ビルド）
```

視覚回帰の基準を更新するときは、手元で `--update-snapshots` を実行せず
**Actions の「視覚回帰の基準を更新」ワークフロー**を対象ブランチで実行する。
判定するのと同じ Linux で撮らないと、環境差のぶん許容差を緩めることになり、
緩めた検査は本物の変化も見逃す（一度そうなっていた）。

docs のビルドは **turbo 経由**（`pnpm turbo run build --filter=@novi-ui/docs`）。
IR 生成がビルド済みの core を読むため、依存順序が必要。

## リリース

`pnpm changeset` で変更を記録して push するだけ。
Changesets が version PR を作り、マージで **OIDC 自動公開**される。
OTP もトークンも要らない。`NODE_AUTH_TOKEN` を設定してはいけない（OIDC に切り替わらなくなる）。

### version PR をマージする前に

- [ ] `pnpm lint && pnpm typecheck && pnpm test && pnpm check:dist`
- [ ] **精度回帰テストを手動で実行する**（`pnpm accuracy`）

精度回帰テストは CI で回さない（ADR-A5。LLM 呼び出しが従量課金になるため）。
**回し忘れがそのまま公開されるので、ここで担保する。** 手順は
[accuracy/README.md](./accuracy/README.md)。`llms` の生成ロジックを変えたときも実行する。
