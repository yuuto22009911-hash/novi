# @novi-ui/tactile

## 0.4.0

### Minor Changes

- c1ec6d9: `tailwindcss ^4` を peerDependencies に追加
  
  テーマの CSS はトークン定義だけを持ち、コンポーネントのクラスは利用側の
  Tailwind が `@source` で生成する。この前提はこれまで暗黙で、README も
  「CSS を2行 import すれば動く」と書いていた。宣言に変え、README と
  はじめにページに必須であることと `@source` の書き方を明記した。

### Patch Changes

- c1ec6d9: LICENSE ファイルを同梱し、MCP の同梱データを最新の IR で再生成する
  
  package.json は MIT を宣言していたが本文がリポジトリにも配布物にも無く、
  GitHub はライセンス未設定と表示していた。
  
  MCP は core 0.4.0 で入った余白・書体トークン（pad / gap / tracking /
  font-heading）の規約を含まないまま公開されていた。core やテーマが変わると
  MCP の応答も変わるので、以後は同時に changeset を要求する検査を lint に入れた。
- Updated dependencies [c1ec6d9]
  - @novi-ui/core@0.4.1

## 0.3.0

### Minor Changes

- 6236510: 余白と書体をテーマの所有物にする
  
  これまで余白は各テーマの `*.styles.ts` に生の Tailwind クラスで直書きされており、
  Card の padding は3テーマで1バイトも違わなかった。余白がテーマの所有物でない以上、
  「余白を増やす」も「テーマごとの個性を出す」も原理的に不可能だった。
  
  core に固定語彙 `NOVI_PAD_TOKENS` / `NOVI_GAP_TOKENS` / `NOVI_TRACKING_TOKENS` を足し、
  各テーマが `--novi-pad-*` / `--novi-gap-*` / `--novi-tracking-*` / `--novi-leading-*` /
  `--novi-font-heading` / `--novi-font-numeric` に値を与えるようにした。
  コンポーネントはトークンだけを消費する（生の余白ユーティリティは design rule で禁止）。
  
  要素間の距離は絶対値ではなく **inline < stack < section の比**が「余白の多さ」の知覚を作るため、
  比をテーマごとに変えている（Raster 8/16/24、Tactile 10/20/32、Flatlay 8/12/24）。
  
  副次的に、参照されていたのに一度も出力されていなかった `--novi-leading-body` が
  Raster と Tactile で実際に効くようになった。
  
  寸法（コントロールの高さ）と文字サイズ、色の値は変えていない。

### Patch Changes

- Updated dependencies [6236510]
  - @novi-ui/core@0.4.0

## 0.2.1

### Patch Changes

- 26bed1e: 3本目のテーマ `@novi-ui/flatlay` を追加しました。
  
  z 軸を持たないテーマです。影は全段が `0 0 #0000` で、階層は罫線・地色・面積だけで作ります。
  Select / Menu / Popover は浮かずにフローへ入り、後続を押し下げます。Modal は全画面の
  テイクオーバーになります。色は帳票・文具の8色（fieldbook / blueprint / carbon / ribbon /
  eraser / manila / legalpad / pencil）で、赤は danger に予約してあるため意図的に不在です。
  
  `@novi-ui/core` に `unstable/portal` を追加しました。オーバーレイをフローに展開するために
  必要な React Aria の不安定 API を、ADR-07 に従って core の1ファイルへ封じ込めたものです。
- Updated dependencies [26bed1e]
  - @novi-ui/core@0.3.0

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

### Patch Changes

- 3255acf: 実機確認（T-50）で見つかった2件を修正。
  
  **outline variant の境界線が描画されない。**
  `--novi-shadow-none` が `none` だったため、`ring-*`（Tailwind は `box-shadow` に合成する）
  と併記した宣言が `box-shadow: <ring>, none` という不正値になり、宣言ごと破棄されていた。
  既定 variant が `outline` の **Input と TextArea で、入力欄の枠が完全に消えていた**
  （ライト・ダーク両方）。`Select` / `Tabs` に `variant="outline"` を指定した場合も同じ。
  影を持たせない意図は透明な影（`0 0 #0000`）で表す。
  
  **横向きでシートの中身がノッチに潜る。**
  画面端に固定する面が `env(safe-area-inset-bottom)` しか加算しておらず、
  ノッチが左右に回り込む横向きで、Modal / Select / Menu / Toast の文字とボタンが
  ノッチの下に入っていた。左右の inset も加算する（FR-13）。
  縦向きでは `env()` が 0 を返すため見た目は変わらない。
  
  どちらもトークンとスタイル定義の変更で、コンポーネントの実装と public API は変わらない。
- Updated dependencies [1ca276a]
  - @novi-ui/core@0.2.0

## 0.1.0

### Minor Changes

- タッチファーストのテーマ `@novi-ui/tactile` を追加
  
  指で触る前提で寸法を決め、面を持ち上げて階層を作る2本目のテーマ。
  `@novi-ui/raster` と公開 API は完全に同一で、import 元を差し替えるだけで
  見た目だけでなく DOM の組み立て方ごと切り替わる。
  
  - Modal は下から出るシートで、閉じるボタンはフッターのフルワイド（親指の届く位置）
  - Select と Menu は選択肢を画面下端のシートで出す
  - Tabs はセグメンテッドコントロール、Toast は上端（下端はシートとキーボードが占有する）
  - 対話要素の実効タップ領域は 44×44px 以上。視覚寸法とは独立に確保する
  - 入力欄の文字は 16px を下回らない（iOS Safari の自動ズーム回避）
  - 8色のカラーセット Textile Dyes を持ち、`data-novi-color` で切り替える。
    Tactile は染まる生地なので、中立色まで選んだ染料の色相を帯びる
  
  23契約すべてを実装し、`@novi-ui/core` の変更は 0 行。
