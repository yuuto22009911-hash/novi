# @novi-ui/raster

## 0.4.0

### Minor Changes

- 1ca276a: `ColorPicker` を追加。テーマのカラーセットから1色を選ぶ。
  
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

### Patch Changes

- Updated dependencies [1ca276a]
  - @novi-ui/core@0.2.0

## 0.3.0

### Minor Changes

- 25ae231: カラーセット「Print Inks」を追加し、`data-novi-color` 属性で8色から選べるようにした
  
  テーマの既定 primary をこれまでの indigo（C 0.18）から Ink（hue 268 / C 0.090）へ改める。
  彩度を一段落とした muted な帯域（0.06〜0.12）に統一したのは、UI は服より長く「着る」もので、
  一日中見ていられる濃度が要るという判断による（specs/06-tones-and-colors）。
  secondary は相方の Brick になる。差し色を新しい色として足さず、同じセット内の別の色を
  組み合わせる（印刷の2色刷りと同じ考え方）ため、検査していない色が増えない。
  
  トーン（L / C）はテーマが所有し、色は hue だけを持つ。どの色を選んでも明度と彩度が
  変わらないため、選び方で画面の印象が壊れない。8色 × light/dark のすべてについて
  sRGB 色域内・地に対する 4.5:1・面上の文字の 4.5:1 を CI が検査する。
  
  - 実装はテーマの CSS 生成のみで、コンポーネントと `@novi-ui/core` は 1 行も変えていない
  - 未知の色名を渡しても壊れず、既定の `ink` で描画される（該当するセレクタが無いだけ）
  - `success` / `warning` / `danger` は色選択の影響を受けない
  
  あわせて、視覚回帰の許容差が緩すぎて色の変更を検出できていなかった問題を直した
  （`threshold` 既定 0.2 では primary を差し替えても差分 0 ピクセルと判定されていた）。
  基準画像 36 枚を更新し、ADR-R8 の時点で取り残されていた分もここで揃えている。

## 0.2.0

### Minor Changes

- 8a8e4e1: Raster をモダン化した（ADR-R8）。
  
  - 角丸を3段の階調に（sm=6 / md=8 / lg=12px）。旧: 全て 2px。
    ボタン・入力は md、カードやメニューなど浮く面は lg、Switch は錠剤形になる
  - 影を浮いている層（メニュー・ポップオーバー・ダイアログ・トースト）にだけ導入。
    面は今までどおり平らで、境界線と背景色の差で階層を作る
  - primary を hue 250 の古典的な青から 265 の indigo へ。warning を琥珀（hue 60）へ。
    境界線を一段柔らかく（92% / 27%）
  
  「ミニマル＝数値で縛る」という運用は変わらない。全値はトークンとテストで固定され、
  禁止クラス検査も `shadow-[var(--novi-shadow-*)]` を許可形に加えた以外そのまま。
  コンポーネントの API は一切変わらない。
  
  mcp は同梱の design rules（禁止クラスの文言・数値）が更新されるため patch。

## 0.1.1

### Patch Changes

- Updated dependencies [30e59a9]
- Updated dependencies [ac225c2]
  - @novi-ui/core@0.1.1
