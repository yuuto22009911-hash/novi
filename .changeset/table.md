---
'@novi-ui/core': minor
'@novi-ui/raster': minor
'@novi-ui/tactile': minor
'@novi-ui/flatlay': minor
'@novi-ui/mcp': patch
---

Table を追加（業務部品 4/5）

一覧を行と列で見せる。`Table > TableHeader > TableColumn` と
`TableBody > TableRow > TableCell` で組み、見出しを押して並べ替え
（`sortDescriptor` / `onSortChange`、`aria-sort`）、行を押して選ぶ
（`selectionMode`。チェックボックスは出さず行そのものを押す）、
矢印キーで行と列を移動する。行が 0 件なら `renderEmptyState` の内容が出る。

Raster は横罫だけ、Tactile は行が指で押せる面、Flatlay は縦横の罫線で升目を
切った帳票（見出しは等幅、数字は等幅の右詰め）。狭い画面では表そのものが
横にスクロールする。`overflow-x-auto` の枠で包むこと。
