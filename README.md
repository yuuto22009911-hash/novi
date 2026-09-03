# Novi UI

> 1つの core に、複数の美学。AI に書かせても崩れない。

React Aria Components を土台にした React UI ライブラリ。
挙動とアクセシビリティを `@novi-ui/core` が一手に引き受け、テーマパッケージは**構造とスタイルだけ**を持つ。
同じコンポーネントが、テーマを切り替えるだけで別人になる。見た目だけでなく DOM の組み立て方まで変わる。

> **開発初期です。** API は変わる可能性があります。

**English**: [README.en.md](./README.en.md)

- ドキュメント: https://novi-42r.pages.dev
- AI 向け: [llms.txt](https://novi-42r.pages.dev/llms.txt) / [llms-full.txt](https://novi-42r.pages.dev/llms-full.txt) / [MCP サーバ](./packages/mcp/README.md)

## パッケージ

| パッケージ                                                           | 役割                                                                    |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| [`@novi-ui/core`](https://www.npmjs.com/package/@novi-ui/core)       | 挙動・a11y・型契約・トークン規約。**スタイルを1行も持たない**           |
| [`@novi-ui/raster`](https://www.npmjs.com/package/@novi-ui/raster)   | テーマ1: ミニマル / スイス系。線と余白で階層を作る                      |
| [`@novi-ui/tactile`](https://www.npmjs.com/package/@novi-ui/tactile) | テーマ2: タッチファースト。面を持ち上げ、Modal は下から出るシートになる |
| [`@novi-ui/flatlay`](https://www.npmjs.com/package/@novi-ui/flatlay) | テーマ3: z 軸なし。浮く層が無く、Modal は全画面のテイクオーバーになる   |
| [`@novi-ui/mcp`](https://www.npmjs.com/package/@novi-ui/mcp)         | AI エージェント向け MCP サーバ。読み取り専用・オフライン                |

3テーマとも **22 コンポーネント（24 契約）** を実装し、公開 API は完全に同一。

## 使い始める

**前提: React 19 / Tailwind CSS v4。** テーマの CSS はトークン定義だけを持ち、
コンポーネントのクラスは利用側の Tailwind が生成する。Tailwind 無しでは動かない。

```bash
pnpm add @novi-ui/core @novi-ui/raster react-aria-components
```

```css
/* app/globals.css */
@import "tailwindcss";
@import "@novi-ui/core/base.css";
@import "@novi-ui/raster/raster.css";

/* テーマが出力するクラスを Tailwind に拾わせる。パスはこの CSS からの相対 */
@source "../node_modules/@novi-ui/raster/dist";
```

```tsx
import { Button, Input } from "@novi-ui/raster";

export function SignInForm() {
  return (
    <form>
      <Input label="メールアドレス" type="email" isRequired />
      <Button type="submit" color="primary">
        送信
      </Button>
    </form>
  );
}
```

Provider は要らない。テーマ・配色・ダークは `<html>` の属性で決まる。

```html
<html
  data-novi-theme="raster"
  data-novi-scheme="dark"
  data-novi-color="brick"
></html>
```

詳しくは [はじめに](https://novi-42r.pages.dev/docs/getting-started/) と [Lookbook](https://novi-42r.pages.dev/docs/lookbook/)。

## なぜ core と テーマ を分けるのか

テーマごとに本物の美学差（= DOM 構造の差）を出したい。
しかしドキュメントは1本で、公開 API はテーマ横断で完全に同一にしたい。
さらに a11y の修正は1箇所で直したい。

この3つを同時に満たすため、**core は slot の「名前」だけを決め、JSX は決めない**。

```ts
// core が決めるのは名前と型だけ
export const modalSlots = [
  "backdrop",
  "panel",
  "header",
  "title",
  "closeButton",
  "body",
  "footer",
] as const;
export const modalRequiredSlots = ["backdrop", "panel", "body"] as const;
```

テーマは必須 slot さえ描画すれば、順序も入れ子も要素種別も自由に決めてよい。
閉じるボタンをヘッダー右上に置くテーマと、フッターにフルワイドで置くテーマと、
そもそも浮かばず画面そのものになるテーマが、**同じ props・同じ slot 名**で共存できる。

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

開発者向けの規約は [AGENTS.md](./AGENTS.md) にある。

## 設計書

本リポジトリは実装のみを持つ。要件・設計・タスク（steering / architecture / specs）は
非公開の設計書リポジトリにあり、ADR の要点は各パッケージの README と `AGENTS.md` に転記している。

## ライセンス

[MIT](./LICENSE)
