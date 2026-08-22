/**
 * 全コンポーネント共通のフォーカスリング。
 *
 * 個別に書くと必ずどこかで揺れる。1箇所に定義して全コンポーネントが import する。
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

/** 無効状態の共通表現。色は変えず、透明度と操作不能だけで示す（色数を増やさない）。 */
export const disabledState = 'data-[disabled]:opacity-40 data-[disabled]:pointer-events-none'
