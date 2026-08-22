# @novi-ui/tactile

Novi UI のテーマ2。**タッチファースト。**

指で触る前提で寸法を決め、面を持ち上げて階層を作る。
下から出るシート、大きなタップ領域、押した手応え。

```bash
pnpm add @novi-ui/tactile @novi-ui/core react-aria-components
```

```tsx
import '@novi-ui/core/base.css'
import '@novi-ui/tactile/tactile.css'
import { Button, Input } from '@novi-ui/tactile'

export function Example() {
  return (
    <form>
      <Input label="メールアドレス" type="email" isRequired />
      <Button type="submit" color="primary">送信</Button>
    </form>
  )
}
```

Provider は要りません。テーマは CSS 変数だけで効きます。

**`@novi-ui/raster` と公開 API は完全に同一です。** import 元を差し替えるだけで
構造ごと切り替わります。上のコードは1文字も変えずに両方で動きます。

## Raster とどう違うか

| | Raster | **Tactile** |
|---|---|---|
| 前提の入力 | ポインタ | **指** |
| 階層の作り方 | 線で切る | **面を持ち上げる** |
| Modal | 中央のダイアログ・閉じるは右上の ✕ | **下から出るシート・閉じるはフッターのフルワイド** |
| Select / Menu | トリガーの隣に出る | **画面下端のシート** |
| Tabs | 下線1本 | **セグメンテッドコントロール** |
| Toast | 右下 | **上端**（下端はシートとキーボードが占有する） |
| 高さ | 32 / 40 / 48px | **40 / 48 / 56px** |
| 本文 | 16px | **17px** |

**デスクトップで情報密度が要るなら Raster を選んでください。** Tactile は
腕を伸ばした距離で指を使う前提で、画面あたりの情報量は意図的に少なくなっています。

## デザイン言語（数値定義）

「タッチファースト」を主観で運用すると必ずブレるので、すべて数値で固定しています。
違反は CI（`scripts/check-design-rules.mjs` と実ブラウザでの実測）が検出します。

| 項目 | 規則 |
|---|---|
| タップターゲット | 対話要素の**実効領域が最小 44×44px**（WCAG 2.2 AAA / Apple HIG） |
| 一覧の行高 | 選択可能な行は**最小 48px**（誤タップは一覧で最も起きる） |
| 入力の文字 | **16px 以上**（iOS Safari は下回るとフォーカス時にページごと拡大する） |
| コンポーネント高さ | `sm` 40px / `md` 48px / `lg` 56px |
| タイポスケール | 13 / 15 / **17** / 21 / 26 / 32 / 40px |
| 角丸 | `sm` 8px / `md` 14px / `lg` 20px。**`none` 以外は 8px 以上** |
| 影 | **面にも使う。** 不透明度は α ≤ 0.24。`lg` だけ上向き（シートは下から来る） |
| 境界線 | **補助的にのみ。** 既定は影と背景色差で分ける |
| モーション | 出現 260ms / 消失 200ms / 状態変化 120ms |
| 押下の表現 | `scale` を **押下状態にのみ**許可（0.96〜1.0）。装飾目的では使わない |
| 画面端 | `env(safe-area-inset-*)` を加算する |
| 彩度（中立色） | chroma 0.004〜0.02。**選んだ色の色相に染まる** |

## 色を選ぶ

Tactile は **Textile Dyes** という8色のカラーセットを持ちます。全色が布を染めてきた
染料の実名です。`data-novi-color` 属性ひとつで切り替わります。

```html
<html data-novi-color="madder">
```

| 色 | hue | 出自 | 差し色（バイカラー） |
|---|---|---|---|
| `indigo` **（既定）** | 255 | 藍。デニムを染めた染料 | `saffron` |
| `peacock` | 200 | 孔雀の青緑 | `madder` |
| `sage` | 148 | セージの葉 | `cochineal` |
| `saffron` | 78 | サフラン | `indigo` |
| `madder` | 28 | 茜。人類最古級の赤い染料 | `peacock` |
| `cochineal` | 5 | コチニール。紅を生む染料 | `sage` |
| `mauve` | 315 | モーブ。1856年、史上初の合成染料 | `sage` |
| `greige` | 無彩 | 生機。染める前の布の色 | `indigo` |

- **トーンはテーマが持ちます。** どの色を選んでも明度と彩度は L50% / C0.080（dark は L76%）
- **Tactile は染まる生地です。** 選んだ染料の色相に**中立色まで追従**します。
  Raster（染まらない紙）との最も分かりやすい違いがここに出ます
- **差し色が組で付いてきます。** `--novi-color-secondary` に表の相方が入ります
- **意味を持つ色は変わりません。** `success` / `warning` / `danger` は色選択の影響を受けません
- **知らない名前を書いても壊れません。** 該当する色が無ければ既定の `indigo` で描画されます

Raster の色名（`ink` / `brick` など）とは**1つも重なりません**。モデルごとに
コンセプトから色を選んでいるためで、テーマを切り替えると既定色に戻ります。

> **`data-novi-color` はテーマを宣言している要素に置いてください。**
> `tactile.scoped.css` を使っていて `data-novi-theme` を入れ子にしている場合、
> 内側の要素が既定色を宣言し直すため、外側に置いた色指定はそこで止まります。

## 知っておくべき仕様

### `size` は幅ではなく最大高です（Modal）

全幅のシートに幅の段階は存在しないので、Modal の `size` は**シートの最大高**として
解釈します（`sm` 40dvh / `md` 60dvh / `lg` 80dvh / `full` 100dvh）。

語彙は core が共通で固定し、解釈はテーマの自由、という設計です。同じコードが
テーマを跨いでそのまま動くのはこのためで、不具合ではありません。

Select / Menu の `size` はトリガーの寸法と行の密度になります。

### シートの位置は `classNames` で変えられません

Select と Menu のシートは `!important` で位置を固定しています。React Aria が
トリガー基準の座標を**インラインスタイルで書き込む**ため、通常のクラスでは勝てません。

位置を変えたい場合は `tv({ extend })` を使ってください。

```tsx
const mySelect = tv({
  extend: selectStyles,
  slots: { popover: '!top-0 !bottom-auto' }, // 上から出す
})
```

### 掴み手はドラッグできません

シート上端の短い線は「下から出た面である」ことを示す装飾で、`data-slot` を持たず
`aria-hidden` です。ドラッグでの開閉は未実装です（キーボード利用者への代替経路を
含めて設計する必要があるため、別途対応します）。

閉じる手段は**フッターのフルワイドボタン / 背景タップ / Escape** の3つです。

### 押すと沈みます

対話要素は押下中に 0.97 倍に縮み、`solid` では影が消えます。持ち上がっていた面が
沈むという一連の動きで手応えを返します。`prefers-reduced-motion` では起きません。

`scale` を使うのはここだけです。装飾目的の `scale` は CI が拒否します。

## スタイルの拡張

すべての `tv()` 定義を named export しています。

```tsx
import { buttonStyles } from '@novi-ui/tactile'
import { tv } from 'tailwind-variants'

// slot ベースの定義なので `base` ではなく `slots` で足す（`base` は無視されます）
const myButton = tv({
  extend: buttonStyles,
  slots: { root: 'uppercase tracking-widest' },
})
```

size variant のクラスに負ける場合は、呼び出し時に渡してください。

```tsx
// ✗ size の px-5 に負ける
tv({ extend: buttonStyles, slots: { root: 'px-10' } })

// ✓ 呼び出し時なら勝つ
<Button classNames={{ root: 'px-10' }} />
```

ブランド色を変えるだけなら CSS 変数の上書きで足ります。

```css
:root {
  --novi-color-primary: oklch(50% 0.08 200);
}
```

## slot

全コンポーネントは構成部位に `data-slot="<名前>"` を出力します。
テスト・CSS の上書き・視覚回帰がすべてこれに乗ります。

```tsx
<Modal classNames={{ panel: 'max-h-[50dvh]' }} />
```

**Raster 向けに書いた `classNames` をそのまま渡しても壊れません。** Tactile が
描画しない slot（Modal の `header` など）のキーは黙って無視されます。

## 日本語入力

テキスト入力と一覧選択は、IME の変換中に Enter を押しても送信・選択が起きません。
`useImeSafeKeys` を経由しています。

## ライセンス

MIT
