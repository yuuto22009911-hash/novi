# @novi-ui/flatlay

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
