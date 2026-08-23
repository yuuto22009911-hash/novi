# @novi-ui/core

## 0.2.0

### Minor Changes

- 1ca276a: `ColorPicker` を追加。テーマのカラーセットから1色を選ぶ。
  
  **色の一覧はモデルが持つ。** 同じ `<ColorPicker />` でも Raster では Print Inks、
  Tactile では Textile Dyes が並ぶ。利用側は色名を1つも書かない。
  
  ```tsx
  // 色 id を書かない。未指定ならモデルの既定色から始まる
  const [color, setColor] = useState<string>()
  
  <div data-novi-color={color}>
    <ColorPicker label="配色" onChange={setColor} showLabels />
  </div>
  ```
  
  - core: `colorPicker` 契約（slots 9 / props）と `NoviColorOption` を追加
  - 両モデル: `ColorPicker` と `COLOR_OPTIONS` を公開。実装は radiogroup で、
    矢印キー移動・選択の印（色だけに頼らない）・名前の読み上げを持つ
  - 生成 CSS に色見本用の変数 `--novi-swatch-<id>` を追加（light / dark の両方）
  
  見た目はモデルの美学に従う。Raster は角丸の小さい矩形を見本帳のように詰めて並べ、
  Tactile は丸い玉を間隔をあけて置き、実効タップ領域を 44px 以上に広げる。

## 0.1.1

### Patch Changes

- 30e59a9: 契約の JSDoc に `@a11y` と `@keywords` を追加した。
  
  型定義に含まれるためエディタの補完でも読める。実行時の API は変わらない。
  
  これらは AI 向け出力（`llms.txt` / `@novi-ui/mcp`）の生成元になる。
  アクセシビリティ注記を契約に置くことで、docs・llms・MCP の3箇所が
  同じ記述を読むようになり、書き分けによるズレが起きなくなる。
- ac225c2: Tabs と Toast の JSDoc の使用例を実装に合わせた。
  
  Tabs の例は `<Tab>` / `<TabPanel>` を使っていたが、実体は `TabItem` / `TabContent`。
  そのまま写すとコンパイルが通らない。Toast の例は `toast.add(...)` とだけ書かれており、
  `toast` の作り方（`createToastQueue()`）が示されていなかった。
  
  例は最も忠実に真似される部分なので、間違っていると全員が同じ間違いをする。
  再発しないよう、例が実在する export だけを使っているかをビルド時に検査するようにした。
