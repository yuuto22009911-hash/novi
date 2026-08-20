---
name: add-component
description: Novi UI に新しいコンポーネントを追加する。契約 → styles → tsx → 5点セットのテスト → 横断検査への登録 → docs デモ、の順に進める。「コンポーネントを追加」「Novi に <名前> を作って」と言われたときに使う。
---

# Novi UI にコンポーネントを追加する

**順番を守ること。** 契約より先に見た目を作ると、slot 語彙が実装の都合で決まり、
テーマを増やしたときに破綻する。

基準となる実装は `packages/raster/src/button/`。迷ったらこれを読む。

## 1. 契約（`packages/core/src/contracts/<name>.contract.ts`）

slot 語彙・必須 slot・props 型を決める。**core にスタイルは1行も書かない。**

```ts
export const <name>Slots = ['root', 'label'] as const
export const <name>RequiredSlots = ['root', 'label'] as const

/**
 * 1行の要約。ここが llms.txt と MCP の一覧に出る。
 *
 * @keywords <検索語をスペース区切りで>
 *
 * @a11y <キーボード操作と支援技術への見え方>
 *
 * @example
 * <Name prop="値">中身</Name>
 */
export interface <Name>Props extends NoviBaseProps {
  variant?: NoviVariant
  isDisabled?: boolean
  classNames?: ClassNames<typeof <name>Slots>
}
```

JSDoc の **要約1行 / `@keywords` / `@a11y` / `@example` は4つとも必須**。
欠けると IR の生成が失敗してビルドが落ちる。手で書けるのはここだけで、
props 表も `llms.txt` も MCP の応答も、すべてこの JSDoc から生成される。

`@keywords` に一般語（「表示」「選ぶ」単独）を入れない。
無関係な問い合わせに当たると、MCP が未実装のものを実装済みと答えることになる。

`@a11y` には**実装とテストで確認できることだけ**を書く。
「アクセシブルです」のような検証できない文言を書かない。

## 2. registry への登録（`packages/core/src/contracts/registry.ts`）

`NOVI_CONTRACTS` に追加する。ここに載って初めて契約テストと IR の対象になる。

## 3. styles（`packages/raster/src/<name>/<name>.styles.ts`）

```ts
export const <name>Styles = tv({
  slots: { root: '...', label: '...' },
  variants: {
    size: { ... },
    variant: { ... },   // ← variant は最後に宣言する
  },
}) satisfies SlotMap<typeof <name>Slots>
```

- **`satisfies` を使う**。型注釈にすると任意 slot が呼べなくなる
- **`variant` を最後に宣言する**。先に書くと `size` のクラスに負けて2つの variant が同じ見た目になる
- `shadow-*` / `rounded-md` 以上 / `border-2` 以上 / `scale-*` / `rotate-*` / リテラル色値は使えない
- 背景色を設定する面には**必ず文字色も設定する**。ダークで不可視になる

## 4. 実装（`packages/raster/src/<name>/<name>.tsx`）

react-aria-components を組み立てる。**全 slot に `data-slot` を出力する。**

- `@react-aria/*` / `@react-stately/*` を直接 import しない（core 経由のみ）
- `UNSTABLE_` 接頭辞の API を直接 import しない（`core/src/unstable/` 経由のみ）
- Provider を必要とする設計にしない

## 5. テスト（`packages/raster/src/<name>/<name>.test.tsx`）

5点セット。1つでも欠けたら未完成。

1. レンダリング（必要な要素が出るか）
2. 契約（`expectSlots` で全必須 slot が出るか）— **オーバーレイ系は `baseElement` を見る**
3. axe（違反 0 件）
4. variant（全 variant が互いに異なるクラスを生むか）
5. `classNames`（slot ごとの上書きが効くか）

## 6. 横断検査への登録

- `packages/raster/src/styles/variant-distinctness.test.ts`
- `packages/raster/src/styles/coverage.test.ts`

## 7. docs のデモ（`apps/docs/demos/`）

`meta.ts` に追加する。`note` は**使い分けの注意**だけを書く。
props や slot の説明を書かない（生成物とズレる。`pnpm check:handwritten` が検出する）。

## 完了の確認

```bash
pnpm build
pnpm lint
pnpm test
pnpm check:handwritten
pnpm check:dist
```

生成物に反映されたことも確かめる。

```bash
grep -A 5 "^### <Name>" apps/docs/public/llms-full.txt
```
