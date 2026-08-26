# @novi-ui/flatlay

Novi UI のテーマ3。**z 軸を持たない。**

浮く層が無いので、開くものは場所を取ります。展開はその場を押し下げ、
Modal は画面を占め、階層は罫線と地色と面積だけで作ります。

```bash
pnpm add @novi-ui/flatlay @novi-ui/core react-aria-components
```

```tsx
import '@novi-ui/core/base.css'
import '@novi-ui/flatlay/flatlay.css'
import { Button } from '@novi-ui/flatlay'

export function Example() {
  return <Button color="primary">保存</Button>
}
```

Provider は要りません。テーマは CSS 変数だけで効きます。

**`@novi-ui/raster` / `@novi-ui/tactile` と公開 API は完全に同一です。**
import 元を差し替えるだけで構造ごと切り替わります。

## 他の2つとどう違うか

| | Raster | Tactile | **Flatlay** |
|---|---|---|---|
| 前提の入力 | ポインタ | 指 | **ポインタ + キーボード** |
| 階層の作り方 | 線で切る | 面を持ち上げる | **罫線・地色・面積だけ** |
| 影 | 使う | 面にも使う | **全段が透明（存在しない）** |
| 展開（Select / Menu / Popover） | 隣に浮く | 下から出るシート | **その場を押し下げる** |
| Modal | 中央のダイアログ | 下から出るシート | **全画面テイクオーバー** |
| Toast | 右下に浮く | 上端に浮く | **フローに挿入される帯** |
| 押下の表現 | 色 | 0.97 倍に沈む | **面と文字が入れ替わる** |
| 高さ | 32 / 40 / 48px | 40 / 48 / 56px | **28 / 32 / 40px** |
| 中立色 | 染まらない紙 | 染まる生地 | **地は染まらず罫線だけが染まる** |

**指で触る画面なら Tactile を選んでください。** Flatlay はタッチの下限（44px）を
意図的に満たしていません。帳票の密度と両立しないためです。

## デザイン言語（数値定義）

「z 軸を持たない」を主観で運用すると必ず崩れるので、すべて規則にしています。
違反は CI（`scripts/check-design-rules.mjs`・9 ルール）が検出します。

| 項目 | 規則 |
|---|---|
| `z-index` | **禁止。例外なし。** 重なりの順序は DOM 順だけで表す |
| `position` | `fixed` / `absolute` / `sticky` は**例外2ファイルのみ**（Modal / Tooltip） |
| 影 | **全段 `0 0 #0000`。** `none` ではないのは ring が box-shadow に合成されるため |
| `transform` | 禁止（Spinner の回転のみ例外）。押下で沈む・縮むは z 軸の語彙 |
| 角丸 | `sm` 2px / `md` **2px** / `lg` 4px。**書類の直角** |
| コンポーネント高さ | `sm` 28px / `md` 32px / `lg` 40px |
| タイポスケール | 11 / 13 / **16** / 18 / 22 / 26 / 32px（比率 ≒1.18） |
| モーション | **1本（100ms）。** 展開・格納はアニメーションしない |
| 罫線の彩度 | chroma 0.02〜0.03。`border-strong` は地に対し 3:1 以上 |
| 中立色 | 地・文字は chroma 0（無彩）。染まるのは罫線2本だけ |

## 色を選ぶ

Flatlay は **Stationery** という8色のカラーセットを持ちます。全色が机の上の
事務道具の実名です。`data-novi-color` 属性ひとつで切り替わります。

```html
<html data-novi-color="blueprint">
```

| 色 | hue | 出自 | 差し色（バイカラー） |
|---|---|---|---|
| `fieldbook` **（既定）** | 172 | 測量野帳の表紙の緑 | `eraser` |
| `blueprint` | 215 | 青焼き図面の青 | `manila` |
| `carbon` | 288 | カーボン複写紙の紫 | `legalpad` |
| `ribbon` | 330 | タイプライターのインクリボン | `fieldbook` |
| `eraser` | 352 | ピンクの消しゴム | `pencil` |
| `manila` | 58 | マニラ封筒の黄土 | `blueprint` |
| `legalpad` | 98 | 黄色いリーガルパッド | `carbon` |
| `pencil` | 240 | 鉛筆の芯（無彩枠） | `eraser` |

- **トーンはテーマが持ちます。** どの色を選んでも L47% / C0.070（dark は L75% / C0.060）
- **染まるのは罫線だけです。** 地も文字も無彩のまま。唯一の階層表現である罫線に
  色を持たせないと、色を選んだ実感がどこにも出ません
- **赤がありません。** 校正の朱書きはエラーの道具なので、赤は `danger` に予約しています。
  primary が danger と紛れる事故を、規則ではなく世界観で防いでいます
- **差し色が組で付いてきます。** `--novi-color-secondary` に表の相方が入ります
- **知らない名前を書いても壊れません。** 既定の `fieldbook` で描画されます

Raster（`ink` / `brick` など）・Tactile（`indigo` / `madder` など）の色名とは
**1つも重なりません。** テーマを切り替えると既定色に戻ります。

## 基準パターン（コンポーネント実装の型）

Button がこの型を定義しています。以降のコンポーネントはこれを踏襲します。

### ファイル構成

```
src/<name>/
  <name>.tsx          コンポーネント本体（'use client' はエントリ側で宣言）
  <name>.styles.ts    tv() 定義。named export する
  <name>.test.tsx     5点セット + Flatlay 固有の差分
  index.ts            2行の再輸出
```

### スタイル定義の型

- slot は型注釈ではなく `satisfies SlotMap<...>` で書く。型注釈だと任意 slot が
  `undefined` 扱いになり、`s.startContent()` が呼べなくなる（ADR-R5）
- 色は `--c` / `--c-fg` / `--c-text` / `--c-line` のローカル変数に落としてから
  variant が参照する。variant 5 × color 6 = 30 通りを書かないため
- `variants` は `{ color, size, radius, variant }` の順で宣言する。
  **`variant` を先に書くと size のクラスに負ける**
- **base に色を書かない。** tailwind-merge が同族クラスを後勝ちでマージするため、
  全 variant が上書きする性質（border 色など）を base に置くと死ぬコードになる

### テストの5点セット

1. デフォルト props でレンダリングできる
2. slot 契約を満たす（`testSlotContract`）
3. a11y 違反がない
4. 全 variant / size / color が**互いに異なる**クラスを適用する
5. `classNames` が該当 slot に反映される

これに Flatlay 固有の3点を足します。

6. 押下で面と文字が入れ替わる。**離すと元に戻る**（Button は状態を持たない）
7. z 軸の語彙（`scale` / `translate` / `rotate` / `shadow-` / `z-`）を持たない
8. 色はすべてトークン経由（リテラルを書かない）

合成後のクラスに対する検査は `src/styles/cross-cutting.test.ts` が担当します。
公開エントリから `*Styles` を自動収集するので、**コンポーネントを足すだけで対象が増えます。**

## 知っておくべき仕様

### 押すと反転します

対話要素は押下中に面の色と文字の色が入れ替わります。**スタンプを押した跡**の
見え方で、沈む・浮くを使わずに押した瞬間を返します。離すと元に戻ります。

面積のある変化なので、要素が1px も動かなくても押下が伝わります。

### 既定で罫線を持ちます

影の無い紙面で輪郭を示せるのは線だけです。すべての variant が罫線の幅を持ち、
線の色を variant が決めます（`ghost` / `plain` だけが `transparent` を選ぶ）。

### 記号と数値は等幅です

`startContent` / `endContent` / ショートカット / 数値の slot は `--novi-font-mono` と
`tabular-nums` を既定で持ちます。ボタンや行が並んだときに幅が暴れないためです。

Flatlay は `--novi-font-*` を実際に上書きする初のテーマです。Web フォントは
同梱せず（依存ゼロ原則）、フォールバックスタックを精密に組んでいます。

## スタイルの拡張

すべての `tv()` 定義を named export しています。

```tsx
import { buttonStyles } from '@novi-ui/flatlay'
import { tv } from 'tailwind-variants'

// slot ベースの定義なので `base` ではなく `slots` で足す（`base` は無視されます）
const myButton = tv({
  extend: buttonStyles,
  slots: { root: 'uppercase tracking-widest' },
})
```

size variant のクラスに負ける場合は、呼び出し時に渡してください。

```tsx
// ✗ size の px-3 に負ける
tv({ extend: buttonStyles, slots: { root: 'px-10' } })

// ✓ 呼び出し時なら勝つ
<Button classNames={{ root: 'px-10' }} />
```

## slot

全コンポーネントは構成部位に `data-slot="<名前>"` を出力します。
テスト・CSS の上書き・視覚回帰がすべてこれに乗ります。

**他テーマ向けに書いた `classNames` をそのまま渡しても壊れません。** Flatlay が
描画しない slot のキーは黙って無視されます。

## 日本語入力

テキスト入力と一覧選択は、IME の変換中に Enter を押しても送信・選択が起きません。
`useImeSafeKeys` を経由しています。

## ライセンス

MIT
