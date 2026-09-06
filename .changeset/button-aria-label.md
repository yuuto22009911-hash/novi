---
'@novi-ui/core': minor
'@novi-ui/raster': minor
'@novi-ui/tactile': minor
'@novi-ui/flatlay': minor
'@novi-ui/mcp': patch
---

Button に `aria-label` を追加

アイコンだけのボタンに名前を付ける手段が無く、`sr-only` の span を入れる
回避策しか無かった。契約に `aria-label` を足し、3 テーマとも根の button に渡す。
