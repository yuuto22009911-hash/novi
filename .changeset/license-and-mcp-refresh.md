---
'@novi-ui/core': patch
'@novi-ui/raster': patch
'@novi-ui/tactile': patch
'@novi-ui/flatlay': patch
'@novi-ui/mcp': patch
---

LICENSE ファイルを同梱し、MCP の同梱データを最新の IR で再生成する

package.json は MIT を宣言していたが本文がリポジトリにも配布物にも無く、
GitHub はライセンス未設定と表示していた。

MCP は core 0.4.0 で入った余白・書体トークン（pad / gap / tracking /
font-heading）の規約を含まないまま公開されていた。core やテーマが変わると
MCP の応答も変わるので、以後は同時に changeset を要求する検査を lint に入れた。
