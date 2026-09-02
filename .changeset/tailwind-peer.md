---
'@novi-ui/raster': minor
'@novi-ui/tactile': minor
'@novi-ui/flatlay': minor
---

`tailwindcss ^4` を peerDependencies に追加

テーマの CSS はトークン定義だけを持ち、コンポーネントのクラスは利用側の
Tailwind が `@source` で生成する。この前提はこれまで暗黙で、README も
「CSS を2行 import すれば動く」と書いていた。宣言に変え、README と
はじめにページに必須であることと `@source` の書き方を明記した。
