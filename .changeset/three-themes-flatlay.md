---
'@novi-ui/flatlay': minor
'@novi-ui/core': minor
'@novi-ui/tactile': patch
'@novi-ui/mcp': patch
---

3本目のテーマ `@novi-ui/flatlay` を追加しました。

z 軸を持たないテーマです。影は全段が `0 0 #0000` で、階層は罫線・地色・面積だけで作ります。
Select / Menu / Popover は浮かずにフローへ入り、後続を押し下げます。Modal は全画面の
テイクオーバーになります。色は帳票・文具の8色（fieldbook / blueprint / carbon / ribbon /
eraser / manila / legalpad / pencil）で、赤は danger に予約してあるため意図的に不在です。

`@novi-ui/core` に `unstable/portal` を追加しました。オーバーレイをフローに展開するために
必要な React Aria の不安定 API を、ADR-07 に従って core の1ファイルへ封じ込めたものです。
