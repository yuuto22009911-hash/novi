import type {
  colorPickerRequiredSlots,
  colorPickerSlots,
  NoviSize,
  SlotMap,
  VariantMap,
} from '@novi-ui/core'
import { tv } from 'tailwind-variants'
import { disabledState, focusRing } from '../styles/focus-ring'
import { tapTarget } from '../styles/tap-target'

/**
 * Tactile のカラー選択は**染料の玉**。丸く、指で押せる大きさで並べる。
 *
 * Raster が見本帳（角のある矩形を方眼に敷き詰める）なのに対して、
 * こちらは1粒ずつ間隔をあけて置く。**寸法はテーマの美学**（ADR-06）で、
 * 小さく詰めた見本帳は指では押し分けられない。
 */
const slots = {
  root: ['flex flex-col gap-[var(--novi-gap-inline)]', disabledState].join(' '),
  label: 'text-[length:var(--novi-text-sm)] font-medium text-[var(--novi-color-fg)]',
  description: 'text-[length:var(--novi-text-sm)] text-[var(--novi-color-muted)]',
  errorMessage: 'text-[length:var(--novi-text-sm)] text-[var(--novi-color-danger)]',
  // 玉どうしは stack。44px の当たり判定が重なると押し間違えるので、
  // 玉の直径ではなく「玉と玉の距離」で誤タップを防ぐ
  list: 'flex flex-wrap items-start gap-[var(--novi-gap-stack)]',
  item: [
    'inline-flex flex-col items-center gap-1.5',
    'cursor-pointer',
    'data-[disabled]:cursor-default',
    // 見た目の玉は 32〜44px でも、指の当たる範囲は必ず 44px 以上にする
    tapTarget,
  ].join(' '),
  /**
   * 色そのものを見せる面。
   *
   * **色は生成 CSS の `--novi-swatch-*` が解決する。** 実装が色値を持たないので、
   * 染料が増えてもここは変わらず、light / dark の追従も生成 CSS 任せになる。
   */
  swatch: [
    'inline-grid place-items-center',
    'rounded-[var(--novi-radius-full)]',
    'shadow-[var(--novi-shadow-sm)]',
    'transition-[scale,box-shadow]',
    'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
    // 押した瞬間だけ沈む。触れている感触をここで返す
    'group-data-[pressed]:scale-[0.92] motion-reduce:group-data-[pressed]:scale-100',
    // 選択は「持ち上がり」でも示す。色面だけだと選択中が色の違いに埋もれる
    'group-data-[selected]:shadow-[var(--novi-shadow-md)]',
    focusRing,
  ].join(' '),
  // 色だけに頼らず印でも示す（WCAG 1.4.1）
  indicator: 'leading-none',
  itemLabel: 'text-[length:var(--novi-text-sm)] text-[var(--novi-color-muted)]',
} satisfies SlotMap<typeof colorPickerSlots, (typeof colorPickerRequiredSlots)[number]>

/**
 * 玉の直径。**最小でも 32px**（Raster の sm は 24px）。
 * 実効タップ領域は `tapTarget` が 44px を保証するので、視覚寸法はここで決めてよい。
 */
const size: VariantMap<NoviSize, { swatch: string }> = {
  sm: { swatch: 'size-8' },
  md: { swatch: 'size-11' },
  lg: { swatch: 'size-14' },
}

/**
 * ColorPicker のスタイル定義。
 *
 * @example
 * import { colorPickerStyles } from '@novi-ui/tactile'
 * import { tv } from 'tailwind-variants'
 *
 * const myPicker = tv({ extend: colorPickerStyles, slots: { list: 'gap-4' } })
 */
export const colorPickerStyles = tv({
  slots,
  variants: { size },
  defaultVariants: { size: 'md' },
})

export type ColorPickerStyleProps = Parameters<typeof colorPickerStyles>[0]
