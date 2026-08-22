---
'@novi-ui/core': minor
'@novi-ui/raster': minor
'@novi-ui/tactile': minor
---

`ColorPicker` を追加。テーマのカラーセットから1色を選ぶ。

**色の一覧はモデルが持つ。** 同じ `<ColorPicker />` でも Raster では Print Inks、
Tactile では Textile Dyes が並ぶ。利用側は色名を1つも書かない。

```tsx
const [color, setColor] = useState(COLOR_OPTIONS[0].id)

<div data-novi-color={color}>
  <ColorPicker label="配色" value={color} onChange={setColor} showLabels />
</div>
```

- core: `colorPicker` 契約（slots 9 / props）と `NoviColorOption` を追加
- 両モデル: `ColorPicker` と `COLOR_OPTIONS` を公開。実装は radiogroup で、
  矢印キー移動・選択の印（色だけに頼らない）・名前の読み上げを持つ
- 生成 CSS に色見本用の変数 `--novi-swatch-<id>` を追加（light / dark の両方）

見た目はモデルの美学に従う。Raster は角丸の小さい矩形を見本帳のように詰めて並べ、
Tactile は丸い玉を間隔をあけて置き、実効タップ領域を 44px 以上に広げる。
