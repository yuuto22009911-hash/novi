# Novi UI — Project Steering

> プロジェクト初回のみ作成。以降の全 Spec が参照する不変ルール。
> 変更する場合は ADR を architecture.md に追記してから行う。

| 項目 | 値 |
|------|-----|
| Status | **Approved** |
| Last Updated | 2026-08-19 |

---

## Tech Stack

| 領域 | 選定 | 補足 |
|------|------|------|
| ランタイム | Node.js >= 22 / React 19 | RAC 1.20+ の要求に合わせる |
| モノレポ | pnpm workspace + Turborepo | |
| 言語 | TypeScript **6.0.3** strict | `noUncheckedIndexedAccess` も有効。**TS 7 は使わない**（下記） |
| ヘッドレス基盤 | react-aria-components 1.20+ | peerDependency として単一コピーを共有 |
| スタイル | Tailwind CSS v4 + tailwind-variants v3 | v4 は CSS-first 設定（`@theme`） |
| ビルド | tsdown (rolldown) | **ESM 専用**（`.mjs` / `.d.mts`）。tree-shaking / `sideEffects: false` |
| テスト | Vitest + @testing-library/react + vitest-axe | a11y は axe を必須ゲートにする |
| 視覚回帰 | Playwright | テーマ切替の見た目差分を守る |
| Lint / Format | Biome | ESLint + Prettier は使わない |
| バージョン管理 | Changesets | |
| ドキュメント | Next.js 16 App Router + Fumadocs (MDX) | |
| デプロイ | Cloudflare Pages | docs サイトのみ。静的エクスポート（`output: 'export'`）で配信する |
| アナリティクス | Cloudflare Web Analytics | 無料。Cookie を使わないため同意バナーが不要 |

### なぜ TypeScript 7 を使わないか（2026-08-19 判断）

TS 7.0 は Go 製ネイティブコンパイラで型チェックが約10倍速いが、**安定した programmatic API を持たない**（7.1 予定）。
そのため TypeScript を組み込んで使うツール（`react-docgen-typescript` 等）が動かない。

本プロジェクトは **props 表・`llms.txt`・MCP 応答をすべて TS ソースから自動生成する**設計
（[03-docs-site](../specs/03-docs-site/requirements.md) FR-05 / [04-ai-integration](../specs/04-ai-integration/requirements.md) FR-01）
を採っており、この API が使えないと中核の「唯一の真実から生成する」構造が成立しない。

20 コンポーネント規模のライブラリでは型チェック速度は律速ではないため、
**10倍速のために中核設計を捨てるのは割に合わない**。TS 7.1 で programmatic API が安定したら移行する。

なお tsconfig は TS 7 移行を見据えて書いてある（`baseUrl` 不使用 / `rootDir` 明示 / `types` 明示 / `strict` 明示）。

### 依存を増やすときの原則
UI ライブラリの依存は**そのままユーザーのバンドルに乗る**。次を満たさない依存は入れない。

- `react-aria-components` / `react` / `react-dom` は **peerDependencies**（多重ロードを防ぐ）
- ランタイム依存は `tailwind-variants` のみを原則とし、それ以外の追加は ADR 必須
- アニメーションライブラリ（Framer Motion 等）は**使わない**。CSS アニメーションのみ
  （HeroUI v3 も同じ判断でバンドルを削っている）
- polyfill を同梱しない。対応環境を切る方を選ぶ

---

## リポジトリ構成

```
novi/
├── packages/
│   ├── core/            @novi-ui/core      挙動・a11y・型契約・トークン規約
│   ├── raster/          @novi-ui/raster    美学1: ミニマル/スイス系
│   └── mcp/             @novi-ui/mcp       MCP サーバ
├── apps/
│   └── docs/                               Next.js ドキュメントサイト
├── .changeset/
├── biome.json
├── turbo.json
└── pnpm-workspace.yaml
```

各パッケージ内:
```
packages/raster/
├── src/
│   ├── button/
│   │   ├── button.tsx
│   │   ├── button.styles.ts     ← tv() 定義。named export する
│   │   ├── button.test.tsx
│   │   └── index.ts
│   ├── ...
│   └── index.ts                 ← 唯一の公開エントリ
├── package.json
└── tsdown.config.ts
```

---

## Code Style

```tsx
// 良い例: props 型は core の契約から導出し、variants は named export する
import { buttonStyles, type ButtonStyleProps } from './button.styles'
import type { NoviBaseProps } from '@novi-ui/core'

export interface ButtonProps extends NoviBaseProps, ButtonStyleProps {
  /** ボタン内に表示する内容 */
  children?: React.ReactNode
}

export function Button({ variant = 'solid', size = 'md', ...props }: ButtonProps) {
  const styles = buttonStyles({ variant, size })
  return <RACButton {...props} className={styles.root()} />
}
```

- public な関数・コンポーネントは引数と返り値の型を明示する
- 早期 return を推奨（`else` を避ける）
- マジックナンバー禁止（トークンか定数に切る）
- **コメントは WHY のみ。WHAT は命名で表現する**
- 「used by X」「fixed for issue Y」のような履歴コメントは書かない（diff と PR 本文に書く）

### このプロジェクト固有の規約

1. **`variants` 定義は必ず named export する**
   ユーザーが `tv({ extend: buttonStyles })` で拡張できるようにするため。
   npm 配布の「コードを所有できない」という弱点をここで埋める。

2. **API 命名は独自に作らず、React Aria / HeroUI / shadcn の慣習に寄せる**
   LLM は事前知識でコードを書くため、独自命名は生成精度を落とす。
   詳細な対応表は [architecture.md](../architecture.md) の「API 命名規約」を参照。

3. **`core` は CSS を1行も持たない**（`base.css` のリセット/レイヤ定義を除く）
   スタイルが core に漏れた瞬間、テーマが構造を変えられなくなる。

4. **不安定な上流 API は core の1ファイルに封じ込める**
   例: RAC の `UNSTABLE_Toast` は `core/src/unstable/toast.ts` からのみ import する。
   テーマ側は安定した Novi の API しか見ない。

5. **JSDoc に必ず使用例を1つ書く**
   IDE 経由で LLM が読むため、これが実質的な AI 向けドキュメントになる。

---

## Commands

| 用途 | コマンド |
|------|---------|
| 依存インストール | `pnpm install` |
| docs 開発サーバ | `pnpm dev` |
| 全パッケージビルド | `pnpm build` |
| テスト | `pnpm test` |
| テスト（watch） | `pnpm test:watch` |
| 型チェック | `pnpm typecheck` |
| Lint / Format | `pnpm lint` / `pnpm format` |
| a11y テストのみ | `pnpm test:a11y` |
| 視覚回帰 | `pnpm test:visual` |
| バンドルサイズ確認 | `pnpm size` |
| changeset 追加 | `pnpm changeset` |
| リリース | `pnpm release` |

---

## Testing

- **配置**: `*.test.tsx` を実装ファイルと同階層に置く
- **粒度**: 挙動（core）はユニット中心。テーマは「レンダリング + a11y + variant 適用」の3点
- **カバレッジ**: `core` 90% / テーマパッケージ 80%
- **必須**: 新規コンポーネントには最低限、次の3テストを併記する
  1. デフォルト props でレンダリングできる
  2. `vitest-axe` で violations が **0**
  3. 主要な variant / size が期待クラスを適用する
- **キーボード操作**: フォーカス移動・Escape・矢印キーを持つコンポーネントは操作テストを必須にする
- **視覚回帰**: 全テーマ × 全コンポーネントのスナップショットを Playwright で撮る。
  テーマ追加時に既存テーマが壊れていないことを保証する

---

## Git Workflow

- **ブランチ**: `feat/<spec-name>`, `fix/<issue>`
- **コミット**: Conventional Commits 厳守 `<type>(<scope>): <subject>`
  - scope はパッケージ名を使う: `feat(raster): add Tabs component`
  - 本文には**なぜ**を必ず含める（what は diff で分かる）
- **PR**: 1コンポーネント = 1PR を原則とし、tasks.md のチェックリストを本文に転記
- **マージ前**: `pnpm typecheck && pnpm test && pnpm lint` を通す
- **changeset**: public API に影響する変更は PR に changeset を必ず含める

### バージョニング方針
- `0.x` の間は minor を breaking change に使う
- `1.0` 以降は semver 厳守。**slot 契約の変更は必ず major**
- `core` と各テーマは**独立バージョン**。テーマは core を caret range で依存する

### 公開（publish）

**npm scope は `@novi-ui`（取得済み / owner: `kojimanpm__`）。** `@novi` は他者が占有済みのため使わない。

公開は **Trusted Publishing（OIDC）** で行う。長期トークンを GitHub Secrets に置く従来手法は使わない（MUST NOT）。

| 理由 | 内容 |
|---|---|
| そもそも実用的でない | classic token は失効済み。granular token は**最長90日**かつ 2FA 必須で、CI 運用が成立しない |
| セキュリティ | 盗まれて悪用可能な長期トークンが、npm のサプライチェーン攻撃の共通の起点になっている |
| 無料の付加価値 | 公開パッケージに **SLSA Build Level 3 の provenance** が自動で付く |

#### 設定時の落とし穴

- **各パッケージの初回バージョンだけは手動 publish が必要。** Trusted Publisher は公開済みパッケージにしか設定できない
- ワークフローに `permissions: id-token: write` が必須
- **`NODE_AUTH_TOKEN` は完全に未設定にする。** 空文字列も「値」として扱われ、OIDC にフォールバックしない
- npm 11.5.1 以降が必要（ローカルは 11.9.0 で条件を満たす）
- GitHub / GitLab ホストランナーのみ対応。セルフホストランナーは非対応
- scoped パッケージは既定が private 扱いのため、`--access public` か `"publishConfig": { "access": "public" }` が必要

#### 初回リリースの手順

```
1. npm login（済）
2. 各パッケージを手動で1回 publish: npm publish --access public
3. npmjs.com の各パッケージ設定で Trusted Publisher を追加（リポジトリ + ワークフロー名を指定）
   ※ パッケージ数が増えたら `npm trust` で一括設定できる
4. 以降は Changesets + GitHub Actions から OIDC で自動公開
```

---

## Boundaries

### Always（常に守る）
- TypeScript strict を維持する
- `pnpm test` を通してから commit する
- 新規コンポーネントに axe テストを併記する
- `variants` を named export する
- 受け入れ基準（AC）に対するテストを必ず書く
- public API を変更したら changeset を書く

### Ask first（人間の確認が必要）
- **ランタイム依存の追加**（`pnpm add`）— バンドルに直接効くため
- **slot 契約の変更** — 全テーマに波及するため
- **API 命名の変更** — 既存ユーザーと LLM の生成精度の両方に効くため
- npm への初回 publish / scope の取得
- MVP 20 コンポーネントのスコープ変更

### Never（絶対にしない）
- `core` にスタイルを書く
- テーマパッケージから `UNSTABLE_` 接頭辞の API を直接 import する
- Provider を必須にする設計を入れる（AI が入れ忘れて壊れる）
- アニメーションライブラリを依存に追加する
- `.env` 系ファイルの読み書き
- 秘密情報のコミット

---

## Non-Functional Requirements（全 Spec 共通の下限）

| カテゴリ | 要件 | 測定方法 |
|---------|------|---------|
| バンドル | Button 単体 gzip < 3KB / 全パッケージ tree-shakable / `sideEffects: false` | `pnpm size` (size-limit) |
| Accessibility | axe violations **0** / WCAG 2.2 AA 準拠 | vitest-axe + 手動 SR 確認 |
| 型 | `tsc --noEmit` エラー **0**（strict） | `pnpm typecheck` |
| カバレッジ | core 90% / theme 80% | Vitest coverage |
| ビルド時間 | 全パッケージ < 60s | `pnpm build` |
| docs サイト | LCP <= 2.5s / INP <= 200ms / CLS <= 0.1 | Lighthouse CI / Cloudflare Web Analytics |
| 対応環境 | Chrome / Safari / Edge / Firefox 最新2バージョン、iOS 17+ / Android 13+ | 実機 + Playwright |
| SSR | React Server Components で動作する（Provider 不要） | docs サイトが RSC で動くこと |

---

## Glossary

| 用語 | 意味 |
|------|------|
| core | `@novi-ui/core`。挙動・a11y・型契約を持ち、スタイルを持たないパッケージ |
| テーマ / theme | 美学ひとつ分のパッケージ。`@novi-ui/raster` など |
| slot | コンポーネントを構成する名前付きの部位。例: Modal の `backdrop` / `panel` / `header` |
| slot 契約 | core が定義する slot 名の集合。テーマはこの契約の範囲で DOM を自由に組む |
| RAC | react-aria-components |
| tv | tailwind-variants の `tv()` 関数 |
| Raster | 1本目のテーマ名。スイスのグリッドシステム "Rastersystem" 由来 |
