---
'@novi-ui/tactile': patch
---

実機確認（T-50）で見つかった2件を修正。

**outline variant の境界線が描画されない。**
`--novi-shadow-none` が `none` だったため、`ring-*`（Tailwind は `box-shadow` に合成する）
と併記した宣言が `box-shadow: <ring>, none` という不正値になり、宣言ごと破棄されていた。
既定 variant が `outline` の **Input と TextArea で、入力欄の枠が完全に消えていた**
（ライト・ダーク両方）。`Select` / `Tabs` に `variant="outline"` を指定した場合も同じ。
影を持たせない意図は透明な影（`0 0 #0000`）で表す。

**横向きでシートの中身がノッチに潜る。**
画面端に固定する面が `env(safe-area-inset-bottom)` しか加算しておらず、
ノッチが左右に回り込む横向きで、Modal / Select / Menu / Toast の文字とボタンが
ノッチの下に入っていた。左右の inset も加算する（FR-13）。
縦向きでは `env()` が 0 を返すため見た目は変わらない。

どちらもトークンとスタイル定義の変更で、コンポーネントの実装と public API は変わらない。
