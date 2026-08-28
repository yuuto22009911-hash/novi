import type {
  colorPickerRequiredSlots,
  colorPickerSlots,
  NoviSize,
  SlotMap,
  VariantMap,
} from '@novi-ui/core'
import { tv } from 'tailwind-variants'
import { disabledState, focusRing } from '../styles/focus-ring'
import { mono } from '../styles/mono'

/**
 * Flatlay のカラー選択は**方眼に貼った色見本**。
 *
 * 両テーマは色面を隙間を空けて並べるが、ここは隙間を持たない。列は罫線で仕切られ、
 * 見本は升目の中に収まる。方眼紙に絵の具を試し塗りした形で、
 * 「階層は罫線でしか作れない」という原理がそのまま見本帳の形になる。
 *
 * **升目の罫線が見本の枠を兼ねる**ので、スウォッチ自身は枠を持たない。
 * 二重に線を引くと升目が太って方眼に見えなくなる。
 */
const slots = {
  root: ['flex flex-col gap-2', disabledState].join(' '),
  // 項目名は等幅（Input / CheckboxGroup と同じ扱い・ADR-F7）
  label: `text-[length:var(--novi-text-sm)] text-[var(--novi-color-fg)] ${mono}`,
  description: `text-[length:var(--novi-text-sm)] text-[var(--novi-color-muted)] ${mono}`,
  errorMessage: `text-[length:var(--novi-text-sm)] text-[var(--novi-color-danger)] ${mono}`,
  /**
   * 方眼。上辺と左辺だけを持ち、右辺と下辺は各升目が引く。
   * こうすると隣り合う升で線が二重にならず、1px の格子になる。
   */
  list: [
    'grid grid-cols-4 w-fit',
    'border-t border-l border-[var(--novi-color-border-strong)]',
  ].join(' '),
  item: [
    'inline-flex flex-col items-center gap-1',
    'p-1.5',
    'border-r border-b border-[var(--novi-color-border-strong)]',
    'cursor-pointer data-[disabled]:cursor-default',
    // 選択は**枠の反転**。升目の地が紙からインクに入れ替わり、見本が台紙に載る
    'bg-[var(--novi-color-bg)] data-[selected]:bg-[var(--novi-color-fg)]',
    'transition-[background-color]',
    'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
    focusRing,
  ].join(' '),
  /**
   * 色そのものを見せる面。
   *
   * **色は生成 CSS の `--novi-swatch-*` が解決する。** 実装が色値を持たないので、
   * カラーセットが増えてもここは変わらず、light / dark の追従も生成 CSS 任せになる。
   */
  swatch: 'inline-grid place-items-center rounded-[var(--novi-radius-none)]',
  // 色だけに頼らず印でも示す（WCAG 1.4.1）。印は Checkbox と同じ等幅の文字
  indicator: `leading-none ${mono}`,
  itemLabel: [
    'text-[length:var(--novi-text-sm)] text-[var(--novi-color-muted)]',
    'group-data-[selected]:text-[var(--novi-color-bg)]',
    mono,
  ].join(' '),
} satisfies SlotMap<typeof colorPickerSlots, (typeof colorPickerRequiredSlots)[number]>

/** md の見本は 28px 角。Button の高さ・Switch のトラック幅と同じ寸法で揃える。 */
const size: VariantMap<NoviSize, { swatch: string; indicator: string }> = {
  sm: { swatch: 'size-6', indicator: 'text-[length:var(--novi-text-xs)]' },
  md: { swatch: 'size-7', indicator: 'text-[length:var(--novi-text-sm)]' },
  lg: { swatch: 'size-9', indicator: 'text-[length:var(--novi-text-base)]' },
}

/**
 * ColorPicker のスタイル定義。
 *
 * @example
 * import { colorPickerStyles } from '@novi-ui/flatlay'
 * import { tv } from 'tailwind-variants'
 *
 * const myPicker = tv({ extend: colorPickerStyles, slots: { list: 'grid-cols-2' } })
 */
export const colorPickerStyles = tv({
  slots,
  variants: { size },
  defaultVariants: { size: 'md' },
})

export type ColorPickerStyleProps = Parameters<typeof colorPickerStyles>[0]
