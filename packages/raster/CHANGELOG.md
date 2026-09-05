# @novi-ui/raster

## 0.7.0

### Minor Changes

- ff9ce76: ComboBox を追加（業務部品 2/5）。`useImeSafeKeys` が変換中のキーを同じ要素の他のハンドラにも渡さなくなった
  
  文字を打って絞り込み、一覧から1つ選ぶ。Select の双子で、選択肢が 20 件を超える
  ときはこちら。`allowsCustomValue` で一覧に無い値も受けられる。
  一覧は Raster では入力欄の隣に浮き、Tactile では画面下端のシート、Flatlay では
  フロー内に展開して後続を押し下げる（打つたびに一覧の高さが変わる）。
  
  core の `useImeSafeKeys` は `onKeyDownCapture` を返すようになり、IME 変換中の
  Enter / 矢印が React Aria 側のハンドラ（ComboBox の決定、NumberField の増減）にも
  届かない。Input / TextArea / NumberField も同じ props を spread しているので、
  変換中の挙動が揃う。
- 9c0dfed: DatePicker を追加（業務部品 5/5）
  
  日付を入力する。年 / 月 / 日のマスに直接打つか、カレンダーを開いて選ぶ。
  値は React Aria の `DateValue`（`@internationalized/date` の `CalendarDate`）で、
  文字列や `Date` は受けない。`parseDate('2026-09-05')` で作る。Novi にランタイム
  依存は増えない（ADR-B6）。`minValue` / `maxValue` / `isDateUnavailable` で選べない日を決める。
  
  カレンダーは Raster では入力欄の隣に浮き、Tactile では画面下端のシート（升目 44px）、
  Flatlay ではフロー内に展開して縦横の罫線で升目を切る。年月日のマスは
  24px 四方を確保する（WCAG 2.2 target-size）。
- 6774e57: NumberField を追加（業務部品 1/5）
  
  数量・単価・個数のような「増減する数」の入力。矢印キーと増減ボタンで
  `step` ずつ刻み、`formatOptions` で通貨・%・単位の書式を付けられる。
  空欄は `NaN` ではなく `null` で `onChange` に渡す。
  
  増減ボタンは任意 slot（`decrement` / `increment`）で、位置はテーマが決める。
  Raster は右端に細い線、Tactile は左右に枠いっぱいの面、Flatlay は罫線で
  区切った等幅の `−` `+`。
- 7bbf0e7: Pagination を追加（業務部品 3/5）
  
  一覧のページを移動する。現在ページは `aria-current="page"`、前へ / 次へは端で
  無効、先頭と末尾のあいだが空くときだけ省略記号で詰める。並べる数列は core の
  `paginationRange`（`@novi-ui/core/client`）が決め、マスの総数はページによらず
  一定なので進めても幅が揺れない。
  
  React Aria に土台の無い唯一の部品。`nav > ul > li > Button` で組み、
  Raster は数字だけを並べて現在地を下線で、Tactile は面を持ち現在地を primary で塗り、
  Flatlay は罫線で区切った 1 本の帯で現在地を反転させる。
- cae73f8: Table を追加（業務部品 4/5）
  
  一覧を行と列で見せる。`Table > TableHeader > TableColumn` と
  `TableBody > TableRow > TableCell` で組み、見出しを押して並べ替え
  （`sortDescriptor` / `onSortChange`、`aria-sort`）、行を押して選ぶ
  （`selectionMode`。チェックボックスは出さず行そのものを押す）、
  矢印キーで行と列を移動する。行が 0 件なら `renderEmptyState` の内容が出る。
  
  Raster は横罫だけ、Tactile は行が指で押せる面、Flatlay は縦横の罫線で升目を
  切った帳票（見出しは等幅、数字は等幅の右詰め）。狭い画面では表そのものが
  横にスクロールする。`overflow-x-auto` の枠で包むこと。

### Patch Changes

- Updated dependencies [ff9ce76]
- Updated dependencies [9c0dfed]
- Updated dependencies [6774e57]
- Updated dependencies [7bbf0e7]
- Updated dependencies [cae73f8]
  - @novi-ui/core@0.5.0

## 0.6.0

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

## 0.5.0

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

## 0.4.1

### Patch Changes

- Updated dependencies [26bed1e]
  - @novi-ui/core@0.3.0

## 0.4.0

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
