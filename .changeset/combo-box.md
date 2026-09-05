---
'@novi-ui/core': minor
'@novi-ui/raster': minor
'@novi-ui/tactile': minor
'@novi-ui/flatlay': minor
'@novi-ui/mcp': patch
---

ComboBox を追加（業務部品 2/5）。`useImeSafeKeys` が変換中のキーを同じ要素の他のハンドラにも渡さなくなった

文字を打って絞り込み、一覧から1つ選ぶ。Select の双子で、選択肢が 20 件を超える
ときはこちら。`allowsCustomValue` で一覧に無い値も受けられる。
一覧は Raster では入力欄の隣に浮き、Tactile では画面下端のシート、Flatlay では
フロー内に展開して後続を押し下げる（打つたびに一覧の高さが変わる）。

core の `useImeSafeKeys` は `onKeyDownCapture` を返すようになり、IME 変換中の
Enter / 矢印が React Aria 側のハンドラ（ComboBox の決定、NumberField の増減）にも
届かない。Input / TextArea / NumberField も同じ props を spread しているので、
変換中の挙動が揃う。
