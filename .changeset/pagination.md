---
'@novi-ui/core': minor
'@novi-ui/raster': minor
'@novi-ui/tactile': minor
'@novi-ui/flatlay': minor
'@novi-ui/mcp': patch
---

Pagination を追加（業務部品 3/5）

一覧のページを移動する。現在ページは `aria-current="page"`、前へ / 次へは端で
無効、先頭と末尾のあいだが空くときだけ省略記号で詰める。並べる数列は core の
`paginationRange`（`@novi-ui/core/client`）が決め、マスの総数はページによらず
一定なので進めても幅が揺れない。

React Aria に土台の無い唯一の部品。`nav > ul > li > Button` で組み、
Raster は数字だけを並べて現在地を下線で、Tactile は面を持ち現在地を primary で塗り、
Flatlay は罫線で区切った 1 本の帯で現在地を反転させる。
