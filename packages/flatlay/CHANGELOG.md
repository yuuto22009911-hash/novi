# @novi-ui/flatlay

## 0.4.1

### Patch Changes

- Updated dependencies [6100863]
  - @novi-ui/core@0.5.1

## 0.4.0

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

## 0.3.0

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

## 0.2.0

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

## 0.1.0

### Minor Changes

- 26bed1e: 3本目のテーマ `@novi-ui/flatlay` を追加しました。
  
  z 軸を持たないテーマです。影は全段が `0 0 #0000` で、階層は罫線・地色・面積だけで作ります。
  Select / Menu / Popover は浮かずにフローへ入り、後続を押し下げます。Modal は全画面の
  テイクオーバーになります。色は帳票・文具の8色（fieldbook / blueprint / carbon / ribbon /
  eraser / manila / legalpad / pencil）で、赤は danger に予約してあるため意図的に不在です。
  
  `@novi-ui/core` に `unstable/portal` を追加しました。オーバーレイをフローに展開するために
  必要な React Aria の不安定 API を、ADR-07 に従って core の1ファイルへ封じ込めたものです。

### Patch Changes

- Updated dependencies [26bed1e]
  - @novi-ui/core@0.3.0
