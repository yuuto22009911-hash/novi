# Novi UI

> 1つの core に、複数の美学。AI に書かせても崩れない。

React Aria Components を土台にした React UI ライブラリ。
挙動とアクセシビリティを `@novi-ui/core` が一手に引き受け、テーマパッケージは**構造とスタイルだけ**を持つ。
同じコンポーネントが、テーマを切り替えるだけで別人になる。

> **開発初期です。** まだ公開していません。

## パッケージ

| パッケージ | 役割 |
|---|---|
| `@novi-ui/core` | 挙動・a11y・型契約・トークン規約。**スタイルを1行も持たない** |
| `@novi-ui/raster` | 美学1: ミニマル / スイス系（予定） |
| `@novi-ui/mcp` | AI エージェント向け MCP サーバ（予定） |

## なぜ core と テーマ を分けるのか

テーマごとに本物の美学差（= DOM 構造の差）を出したい。
しかしドキュメントは1本で、公開 API はテーマ横断で完全に同一にしたい。
さらに a11y の修正は1箇所で直したい。

この3つを同時に満たすため、**core は slot の「名前」だけを決め、JSX は決めない**。

```ts
// core が決めるのは名前と型だけ
export const modalSlots = ['backdrop', 'panel', 'header', 'title', 'closeButton', 'body', 'footer'] as const
export const modalRequiredSlots = ['backdrop', 'panel', 'body'] as const
```

テーマは必須 slot さえ描画すれば、順序も入れ子も要素種別も自由に決めてよい。
閉じるボタンをヘッダー右上に置くテーマと、フッターにフルワイドで置くテーマが、
**同じ props・同じ slot 名**で共存できる。

全テーマは slot に `data-slot="<名前>"` を出力する。これ1つで、テスト・視覚回帰・
ユーザーの CSS 上書き・AI の構造理解がすべてテーマ横断で成立する。

## 開発

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm build
pnpm lint
```

## 設計書

本リポジトリは実装のみを持つ。要件・設計・タスクは別リポジトリの設計書を参照する。

- `steering.md` — 全体の不変ルール
- `architecture.md` — core × theme 分離設計、slot 契約
- `specs/01-core/` 〜 `specs/04-ai-integration/`

## ライセンス

MIT
