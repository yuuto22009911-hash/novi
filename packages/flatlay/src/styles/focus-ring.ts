/**
 * 全コンポーネント共通のフォーカスリング。
 *
 * 両テーマと**同じ書き方をそのまま採る**。ここで独自色を出さないのは意図で、
 * フォーカスの見え方はテーマの表現ではなく操作の保証だから。3本のモデルで
 * 挙動が揺れると、テーマを差し替えた瞬間にキーボード操作の手応えが変わる。
 *
 * React Aria Components はキーボード操作時にのみ `data-focus-visible` を立てるため、
 * `:focus-visible` 擬似クラスではなくその属性を使う。
 * ポインタで押しただけでリングが出る誤動作を避けられる。
 */
export const focusRing = [
  'outline-none',
  'data-[focus-visible]:outline',
  'data-[focus-visible]:outline-[length:var(--novi-focus-ring-width)]',
  'data-[focus-visible]:outline-[var(--novi-focus-ring-color)]',
  'data-[focus-visible]:outline-offset-[var(--novi-focus-ring-offset)]',
].join(' ')

/**
 * 無効状態の共通表現。色は変えず、透明度と操作不能だけで示す。
 *
 * Flatlay では特に効く。罫線しか階層の手がかりが無いので、無効色を別に持つと
 * 「染まる罫線」と紛れる。薄くするだけなら罫線の意味を壊さない。
 */
export const disabledState = 'data-[disabled]:opacity-40 data-[disabled]:pointer-events-none'
