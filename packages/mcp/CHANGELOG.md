# @novi-ui/mcp

## 0.1.3

### Patch Changes

- c1ec6d9: LICENSE ファイルを同梱し、MCP の同梱データを最新の IR で再生成する
  
  package.json は MIT を宣言していたが本文がリポジトリにも配布物にも無く、
  GitHub はライセンス未設定と表示していた。
  
  MCP は core 0.4.0 で入った余白・書体トークン（pad / gap / tracking /
  font-heading）の規約を含まないまま公開されていた。core やテーマが変わると
  MCP の応答も変わるので、以後は同時に changeset を要求する検査を lint に入れた。

## 0.1.2

### Patch Changes

- 26bed1e: 3本目のテーマ `@novi-ui/flatlay` を追加しました。
  
  z 軸を持たないテーマです。影は全段が `0 0 #0000` で、階層は罫線・地色・面積だけで作ります。
  Select / Menu / Popover は浮かずにフローへ入り、後続を押し下げます。Modal は全画面の
  テイクオーバーになります。色は帳票・文具の8色（fieldbook / blueprint / carbon / ribbon /
  eraser / manila / legalpad / pencil）で、赤は danger に予約してあるため意図的に不在です。
  
  `@novi-ui/core` に `unstable/portal` を追加しました。オーバーレイをフローに展開するために
  必要な React Aria の不安定 API を、ADR-07 に従って core の1ファイルへ封じ込めたものです。

## 0.1.1

### Patch Changes

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
