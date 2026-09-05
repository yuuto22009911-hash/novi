---
'@novi-ui/core': minor
'@novi-ui/raster': minor
'@novi-ui/tactile': minor
'@novi-ui/flatlay': minor
'@novi-ui/mcp': patch
---

NumberField を追加（業務部品 1/5）

数量・単価・個数のような「増減する数」の入力。矢印キーと増減ボタンで
`step` ずつ刻み、`formatOptions` で通貨・%・単位の書式を付けられる。
空欄は `NaN` ではなく `null` で `onChange` に渡す。

増減ボタンは任意 slot（`decrement` / `increment`）で、位置はテーマが決める。
Raster は右端に細い線、Tactile は左右に枠いっぱいの面、Flatlay は罫線で
区切った等幅の `−` `+`。
