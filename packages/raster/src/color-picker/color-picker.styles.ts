import type {
  colorPickerRequiredSlots,
  colorPickerSlots,
  NoviSize,
  SlotMap,
  VariantMap,
} from '@novi-ui/core'
import { tv } from 'tailwind-variants'
import { disabledState, focusRing } from '../styles/focus-ring'

/**
 * Raster のカラー選択は**見本帳**。インクの試し刷りを方眼に並べた形にする。
 *
 * スウォッチが角丸の小さい矩形なのは Raster の語彙そのもので、
 * 円にすると Radio と見分けがつかなくなる（あちらは「1つ選ぶ」の形）。
 */
const slots = {
  root: ['flex flex-col gap-2', disabledState].join(' '),
  label: 'text-[length:var(--novi-text-sm)] font-medium text-[var(--novi-color-fg)]',
  description: 'text-[length:var(--novi-text-xs)] text-[var(--novi-color-muted)]',
  errorMessage: 'text-[length:var(--novi-text-xs)] text-[var(--novi-color-danger)]',
  // 見本帳なので折り返して並べる。縦1列にすると色同士を比べられない
  list: 'flex flex-wrap items-start gap-2',
  item: [
    'inline-flex flex-col items-center gap-1',
    'cursor-pointer',
    'data-[disabled]:cursor-default',
  ].join(' '),
  /**
   * 色そのものを見せる面。
   *
   * **色は生成 CSS の `--novi-swatch-*` が解決する。** 実装が色値を持たないので、
   * カラーセットが増えてもここは変わらず、light / dark の追従も生成 CSS 任せになる。
   */
  swatch: [
    'inline-grid place-items-center',
    'border border-[var(--novi-color-border-strong)]',
    'rounded-[var(--novi-radius-sm)]',
    'transition-[border-color]',
    'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
    // 選択は枠でも示す。色面だけだと「どれが選択中か」が色の違いに埋もれる
    'group-data-[selected]:border-[var(--novi-color-fg)]',
    focusRing,
  ].join(' '),
  // 色だけに頼らず印でも示す（WCAG 1.4.1）
  indicator: 'leading-none',
  itemLabel: 'text-[length:var(--novi-text-xs)] text-[var(--novi-color-muted)]',
} satisfies SlotMap<typeof colorPickerSlots, (typeof colorPickerRequiredSlots)[number]>

const size: VariantMap<NoviSize, { swatch: string }> = {
  sm: { swatch: 'size-6' },
  md: { swatch: 'size-8' },
  lg: { swatch: 'size-10' },
}

/**
 * ColorPicker のスタイル定義。
 *
 * @example
 * import { colorPickerStyles } from '@novi-ui/raster'
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
