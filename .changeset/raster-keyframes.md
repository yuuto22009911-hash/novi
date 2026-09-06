---
"@novi-ui/raster": patch
"@novi-ui/mcp": patch
---

開閉と不確定表示のアニメーションが定義漏れで一切効いていなかったのを直した

`modal` / `popover` / `menu` / `toast` が `animate-[novi-fade-in_120ms_ease-out]` を、
`progress` が `animate-[novi-indeterminate_1.2s_linear_infinite]` を参照していたが、
対応する `@keyframes` がリポジトリのどこにも無かった。CSS は未定義の animation 名を
参照しても何も起こさず例外も出さないため、これまで**アニメーションが無音で消えていた**。
実測（Chromium）では該当要素の `getAnimations()` が 0 件を返しており、
修正後は 2 件とも実際のキーフレームに解決される。

静止画としては正しく描画されるので、単体テストも視覚回帰も気づけない種類の欠落だった。
そこで生成 CSS（`raster.css` / `raster.scoped.css`）の `@layer novi.base` 冒頭に
keyframes を出力し、あわせて**参照と定義を突き合わせる検査**を追加した。
`src` 配下の `animate-[…]` を静的に集めて生成 CSS の `@keyframes` と照合するので、
片方だけ足した／消した時点で落ちる。

モーションはテーマの美学に属するため、keyframes は core ではなくテーマの CSS が持つ
（core は CSS を持たないという原則を崩さない）。`@novi-ui/tactile` と同じ形。
`prefers-reduced-motion` の尊重は従来どおり利用側の `motion-safe:` 修飾子が担う。

- 公開 API・DOM 構造・トークンの値は変更していない
- `novi-indeterminate` の移動量は Progress の indicator が軌道の 1/3 幅であることに
  合わせてあり、両端で完全に隠れる。動きは translate のみ（ADR-R2）
