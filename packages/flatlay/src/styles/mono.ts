/**
 * 等幅の断片（ADR-F7）。**Flatlay のタイポの声はここに集約する。**
 *
 * 影も奥行きも持たないテーマで、階層の次に効く区別が書体の切り替えになる。
 * 帳票や伝票がそうであるように、「読ませる文」と「読み取らせる値」は別の顔を持つ。
 *
 * Web フォントは同梱しない（依存ゼロ原則）。`--novi-font-mono` に精度の高い
 * システムスタックを積み、各 slot はこの断片経由でのみそれを消費する。
 * 個別に `font-mono` と書くと Tailwind 既定のスタックに落ち、トークンを外れる。
 */

/** 等幅の地。コード・ショートカット・記号インジケータなど、値ではない等幅に使う。 */
export const mono = 'font-(family-name:--novi-font-mono)'

/**
 * 数値用。**桁が縦に揃うことが情報になる**列（金額・件数・進捗）に使う。
 *
 * `tabular-nums` を等幅と併せるのは、等幅フォントでも比例数字を持つ環境があるため。
 * 揃わない数字は、書類として読むときに一覧性を丸ごと失う。
 *
 * `--novi-font-numeric` はそこに `slashed-zero` を重ねる。帳票は数字を突き合わせて
 * 読むので、0 と O が判別できないと転記のたびに読み違える。
 */
export const monoNumeric = `${mono} tabular-nums [font-variant-numeric:var(--novi-font-numeric)]`

/**
 * 見出しの声。**3モデルで唯一、見出しが sans を使わない**（spec 08）。
 *
 * Web フォントを足せない以上、テーマごとに書体で語れるのは既存2スタックの
 * 使い分けだけになる。本文 sans / 見出し mono という分担は帳票の作法そのもので、
 * ここが Flatlay の最大の識別子になる。
 *
 * 字を詰めない（`tracking-tight` は 0em）のは意図。詰めるのは複数の語を1つの
 * まとまりに見せる操作で、帳票の見出しは各項目が独立している。
 */
export const heading = [
  'font-[family-name:var(--novi-font-heading)]',
  'tracking-[var(--novi-tracking-tight)]',
  'leading-[var(--novi-leading-heading)]',
].join(' ')
