---
'@novi-ui/core': minor
'@novi-ui/raster': minor
'@novi-ui/tactile': minor
'@novi-ui/flatlay': minor
---

余白と書体をテーマの所有物にする

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
