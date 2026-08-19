# @novi-ui/raster

Novi UI のテーマ1。**ミニマル / スイス系。**

角を立て、影を使わず、線は 1px だけ。余白と整列で階層を作る。
ごまかしが効かないぶん、実装の精度がそのまま出る。

```bash
pnpm add @novi-ui/raster @novi-ui/core react-aria-components
```

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
| 影 | **使わない。** 階層は境界線と背景色の差で表す |
| 角丸 | 既定 0。**最大でも 2px** |
| 彩度 | 中立色は chroma 0。意味を持つ色のみ有彩（上限 0.19） |
| モーション | `--novi-duration-fast`(120ms) のみ。`opacity` と `translate` だけ |

## 知っておくべき仕様

### `radius` は効きません（意図的）

API としては `radius="lg"` を受け付けますが、Raster では **`md` も `lg` も 2px に潰れます**。
角を立てるのが Raster の思想だからです。不具合ではありません。

語彙は core が共通で固定し、解釈はテーマの自由、という設計です。
おかげでドキュメントのコード例がテーマを跨いでそのまま動きます。

### Switch は矩形です

一般的なピル型トグルは「角を立てる」原則と衝突するため、
トラックもサムも角丸 0 の矩形にしています。
形が見慣れないぶん状態が読み取りにくいので、**ラベルの併記を強く推奨**します。

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

ブランド色を変えるだけなら CSS 変数の上書きで足ります。

```css
:root {
  --novi-color-primary: oklch(50% 0.18 20);
}
```

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
