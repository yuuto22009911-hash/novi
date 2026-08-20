# @novi-ui/core

Novi UI の全テーマが共有する土台。**スタイルを1行も持たない。**

```bash
pnpm add @novi-ui/core
```

## 何を担い、何を担わないか

このパッケージの価値は、**担わないもの**をはっきりさせている点にある。

### 担う

| # | 責務 | 具体物 |
|---|---|---|
| 1 | 公開 API の型契約 | `NoviVariant` / `NoviSize` / `NoviColor` / `NoviRadius` と `VariantMap` |
| 2 | slot 語彙 | 20 コンポーネント分の slot 名と必須/任意の区別、`NOVI_CONTRACTS` |
| 3 | 挙動フック | `useImeSafeKeys`（日本語入力の誤送信対策） |
| 4 | トークン規約 | `--novi-*` の命名規則、`base.css`（reset / `@layer` / ライト・ダーク） |
| 5 | 不安定 API の封じ込め | 上流の `UNSTABLE_*` を安定名で再公開 |
| 6 | 契約テスト | テーマが slot 契約を守っているか自動検査する |

### 担わない

| 担わないもの | 理由 |
|---|---|
| **DOM 構造** | 固定した瞬間、テーマが構造を変えられなくなる。それは美学差が出せなくなるということ |
| **スタイル** | 1行でも漏れると、テーマがそれを上書きする戦いが始まる |
| **React Aria Components の再エクスポート** | 上流の改善が届かなくなる |
| **Provider** | AI が設置を忘れて壊れる。RSC の境界も汚れる |
| **実行時のコンポーネントファクトリ** | テーマが1本しかない段階で共通部分は分からない。想像で作った抽象は必ず外れる |

## エントリ

| エントリ | 内容 | React ランタイム |
|---|---|---|
| `@novi-ui/core` | 型契約・slot 語彙・トークン語彙 | **import しない**（RSC 安全） |
| `@novi-ui/core/client` | フック・Toast プリミティブ | `'use client'` |
| `@novi-ui/core/testing` | 契約テストスイート（dev 専用） | — |
| `@novi-ui/core/base.css` | reset / `@layer` / トークン | — |

**メインエントリが React を import しないことは CI で検査している。** 混入するとバンドラが
パッケージ全体をクライアント専用と判定し、型を import しただけで RSC が壊れる。

## slot 契約

core は「コンポーネントを構成する部位の名前」だけを決め、JSX は決めない。

```ts
import { modalSlots, modalRequiredSlots, type SlotMap } from '@novi-ui/core'

// modalSlots        = backdrop | panel | header | title | closeButton | body | footer
// modalRequiredSlots = backdrop | panel | body

const slots: SlotMap<typeof modalSlots, (typeof modalRequiredSlots)[number]> = {
  backdrop: 'fixed inset-0 bg-[--novi-color-overlay]',
  panel: 'bg-[--novi-color-bg] border border-[--novi-color-border]',
  body: 'px-6 py-4',
  // header は任意なので省略できる
  // wrapper のような語彙外のキーはコンパイルエラー
}
```

テーマは**必須 slot さえ描画すれば、順序も入れ子も要素種別も自由**。
閉じるボタンをヘッダー右上に置くテーマと、フッターにフルワイドで置くテーマが、
同じ props・同じ slot 名で共存できる。

全テーマは slot に対応する要素へ `data-slot="<名前>"` を出力する。
これ1つで、テスト・視覚回帰・ユーザーの CSS 上書き・AI の構造理解がテーマ横断で成立する。

## 契約テスト

```tsx
import { NOVI_CONTRACTS } from '@novi-ui/core'
import { testSlotContract } from '@novi-ui/core/testing'

testSlotContract({
  name: 'Modal',
  contract: NOVI_CONTRACTS.Modal,
  render: () => <Modal isOpen>本文</Modal>,
})
```

必須 slot の欠落と語彙外 slot を検出し、**どの slot が問題かを名指しで**報告する。

## 日本語入力

```tsx
'use client'
import { useImeSafeKeys } from '@novi-ui/core/client'

const keyProps = useImeSafeKeys<HTMLInputElement>((e) => {
  if (e.key === 'Enter') submit()
})
return <input {...keyProps} />
```

変換確定の Enter が送信として誤発火する問題を潰す。
`isComposing` / `keyCode 229` / `compositionend` 直後の3経路すべてに対処している。
どれか1つでは環境差を吸収できない。

## スタイルの拡張

各テーマは `tv()` 定義を named export している。

```ts
import { buttonStyles } from '@novi-ui/raster'
import { tv } from 'tailwind-variants'

// slot ベースなので `slots` で足す。`base` は効かないので注意
const myButton = tv({
  extend: buttonStyles,
  slots: { root: 'uppercase tracking-widest' },
})
```

## API の命名

**独自命名を作っていない。** React Aria の慣習に従う。

| 概念 | Novi | よくある別名 |
|---|---|---|
| 無効化 | `isDisabled` | ~~`disabled`~~ |
| 押下 | `onPress` | ~~`onClick`~~ |
| 選択状態 | `isSelected` | ~~`checked`~~ |
| 開閉 | `isOpen` / `onOpenChange` | ~~`open` / `onChange`~~ |

`variant` / `size` / `color` / `radius` の語彙は core が固定し、**全テーマが全値を実装する**。
テーマごとに variant 名が違うと、単一ドキュメント + テーマ切替という構想が崩れるため。

取りうる値は `NOVI_VARIANTS` などの定数と、そこから生成される
[llms.txt](https://novi-42r.pages.dev/llms.txt) を見てほしい。
ここに書き写すと、語彙が増えたときに片方だけ古くなる。

## ライセンス

MIT
