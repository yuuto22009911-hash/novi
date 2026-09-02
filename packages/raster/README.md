# @novi-ui/raster

Novi UI のテーマ1。**ミニマル / スイス系。**

角を立て、影を使わず、線は 1px だけ。余白と整列で階層を作る。
ごまかしが効かないぶん、実装の精度がそのまま出る。

```bash
pnpm add @novi-ui/raster @novi-ui/core react-aria-components
```

> **Tailwind CSS v4 が必要です。** テーマの CSS はトークン定義だけで、コンポーネントのクラスは利用側の Tailwind が生成します。
> `globals.css` に `@source "../node_modules/@novi-ui/raster/dist";` を足してください（パスは CSS ファイルからの相対）。

```tsx
import '@novi-ui/core/base.css'
import '@novi-ui/raster/raster.css'
import { Button, Input } from '@novi-ui/raster'

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

## デザイン言語（数値定義）

「ミニマル」を主観で運用すると必ずブレるので、すべて数値で固定しています。
違反は CI（`scripts/check-design-rules.mjs`）が検出します。

| 項目 | 規則 |
|---|---|
| ベースグリッド | 垂直リズムは 4px、ブロック間余白は 8px の倍数 |
| コンポーネント高さ | `sm` 32px / `md` 40px / `lg` 48px |
| タイポスケール | 比率 1.2。12 / 14 / 16 / 20 / 24 / 30 / 36px |
| 境界線 | **1px のみ。** 2px 以上は使わない |
| 影 | **浮いている層だけ**が持つ（メニュー・ダイアログ）。面は平ら |
| 角丸 | 3段。`sm` 6px / `md` 8px / `lg` 12px |
| 彩度 | 中立色は chroma 0。意味を持つ色のみ有彩（上限 0.19） |
| ブランド色 | トーン L44% / C0.090（light）・L74% / C0.090（dark）に固定 |
| モーション | `--novi-duration-fast`(120ms) のみ。`opacity` と `translate` だけ |

## 知っておくべき仕様

### `radius` は3段の階調です

`sm` 6px / `md` 8px / `lg` 12px。部位ごとの既定は 小さな部品 `sm` / 操作類 `md` / 浮く面 `lg`。
かつては全段 2px に潰していましたが、完全な直角は「古い」と読まれるため改めました（ADR-R8）。

語彙は core が共通で固定し、解釈はテーマの自由、という設計です。
おかげでドキュメントのコード例がテーマを跨いでそのまま動きます。

```tsx
<Switch isSelected={enabled} onChange={setEnabled}>
  メール通知を受け取る
</Switch>
```

### Tabs は背景を変えません

選択中は**下線 1px と文字色**だけで示します。背景の塗り分けは面を増やすため使いません。

### Spinner だけ回転します

「動きで飾らない」原則の唯一の例外です。
代替のローディング表現（点滅・バーの往復）は視認性か情報量で劣るため、ここだけ許可しています。
`prefers-reduced-motion` が有効なときは止まります。

## スタイルの拡張

全コンポーネントの `tv()` 定義を named export しています。

```ts
import { buttonStyles } from '@novi-ui/raster'
import { tv } from 'tailwind-variants'

// slot ベースの定義なので `slots` で足す。`base` は効かない
const myButton = tv({
  extend: buttonStyles,
  slots: { root: 'uppercase tracking-widest' },
})
```

**variant のクラスを上書きしたい場合は `classNames` を使います。**
`extend` の `slots` は base に足されるため、後から適用される variant に負けます。

```tsx
// ✗ size variant の w-9 に負ける
tv({ extend: switchStyles, slots: { track: 'w-14' } })

// ✓ 呼び出し時に渡せば勝つ
<Switch classNames={{ track: 'w-14' }} />
```

ブランド色を変えるだけなら、**まず用意された8色から選べます**（下記）。
それでも合わなければ CSS 変数を上書きしてください。

```css
:root {
  --novi-color-primary: oklch(44% 0.09 20);
}
```

## 色を選ぶ

Raster は **Print Inks** という8色のカラーセットを持ちます。全色が顔料・インクの実名です。
`data-novi-color` 属性ひとつで切り替わります。**JavaScript も追加の import も不要**です。

```html
<html data-novi-color="brick">
```

| 色 | hue | 出自 | 差し色（2色刷り） |
|---|---|---|---|
| `ink` **（既定）** | 268 | 万年筆の藍黒。書き物の色 | `brick` |
| `prussian` | 235 | 紺青。18世紀からある合成顔料 | `ochre` |
| `forest` | 160 | 深い常緑。製図インクの緑 | `ochre` |
| `olive` | 125 | オリーブドラブ。土に近い緑 | `ink` |
| `ochre` | 70 | 黄土。最古の顔料のひとつ | `prussian` |
| `brick` | 35 | 煉瓦の朱。スイスポスターの赤の末裔 | `ink` |
| `bordeaux` | 12 | ワインの澱の赤 | `ochre` |
| `graphite` | 無彩 | 黒鉛。色を消すという選択肢 | `brick` |

- **トーンはテーマが持ちます。** どの色を選んでも明度と彩度は L44% / C0.090（dark は L74%）。
  色相だけが変わるので、選び方で画面の印象が壊れません
- **差し色が組で付いてきます。** `--novi-color-secondary` には表の「差し色」の値が入ります。
  新しい色を作らず同じセット内で組む、印刷の2色刷りと同じ考え方です
- **意味を持つ色は変わりません。** `success` / `warning` / `danger` は色選択の影響を受けません
- **知らない名前を書いても壊れません。** 該当する色が無ければ既定の `ink` で描画されます

8色 × light/dark のすべてについて、sRGB 色域内にあること・地に対して 4.5:1 以上・
面の上の文字が 4.5:1 以上であることを CI が検査しています。

> **`data-novi-color` はテーマを宣言している要素に置いてください。**
> `raster.scoped.css` を使っていて `data-novi-theme` を入れ子にしている場合、
> 内側の要素が既定色を宣言し直すため、外側に置いた色指定はそこで止まります。

## slot

全コンポーネントは構成部位に `data-slot="<名前>"` を出力します。
テスト・CSS の上書き・視覚回帰がすべてこれに乗ります。

```css
[data-slot='panel'] { max-width: 40rem; }
```

slot 名の一覧は `@novi-ui/core` の `NOVI_CONTRACTS` から取得できます。

## 日本語入力

`Input` と `TextArea` の `onKeyDown` は、**IME 変換中のキーを受け取りません**。
変換確定の Enter でフォーム送信が暴発する事故を、利用側が意識せずに防げます。

## ライセンス

MIT
