import type { NoviSize, SlotMap, tableRequiredSlots, tableSlots, VariantMap } from '@novi-ui/core'
import { tv } from 'tailwind-variants'
import { focusRing } from '../styles/focus-ring'
import { heading, monoNumeric } from '../styles/mono'

/**
 * Flatlay の表は**帳票**。縦横の罫線で升目を切り、見出しは等幅、数字は等幅の右詰め
 * （Raster は横罫だけ、Tactile は行が面）。選んだ行は反転しない — 行は押す面ではなく
 * 読む行なので、地色を変えるだけに留める。
 */
const slots = {
  root: [
    'w-full border-collapse text-left',
    'border border-[var(--novi-color-border-strong)]',
    'text-[var(--novi-color-fg)]',
    'outline-none',
  ].join(' '),
  header: 'bg-[var(--novi-color-subtle)]',
  column: [
    `text-[length:var(--novi-text-sm)] ${heading}`,
    'border border-[var(--novi-color-border)] border-b-[var(--novi-color-border-strong)]',
    'whitespace-nowrap align-middle',
    'outline-none',
    'data-[allows-sorting]:cursor-pointer',
    'data-[allows-sorting]:hover:bg-[var(--novi-color-border)]',
    'data-[pressed]:bg-[var(--novi-color-fg)] data-[pressed]:text-[var(--novi-color-bg)]',
    focusRing,
  ].join(' '),
  // 並べ替えの印は活字。方向が決まっている間だけ濃くなる
  sortIcon: [
    `ml-1 inline-flex align-middle text-[var(--novi-color-muted)] ${monoNumeric}`,
    'group-aria-[sort=ascending]:text-[var(--novi-color-fg)] group-aria-[sort=descending]:text-[var(--novi-color-fg)]',
  ].join(' '),
  body: '',
  row: [
    'outline-none',
    // 面（hover / 選択）を持つので文字色も持つ。ダークで不可視にならない
    'text-[var(--novi-color-fg)]',
    'data-[hovered]:bg-[var(--novi-color-subtle)]',
    'data-[selected]:bg-[var(--novi-color-subtle)] data-[selected]:font-medium',
    'data-[disabled]:opacity-40',
    'data-[focus-visible]:outline-2 data-[focus-visible]:-outline-offset-2 data-[focus-visible]:outline-[var(--novi-color-ring)]',
    'transition-[background-color]',
    'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
  ].join(' '),
  cell: [
    'align-middle',
    'border border-[var(--novi-color-border)]',
    'outline-none',
    'data-[focus-visible]:outline-2 data-[focus-visible]:-outline-offset-2 data-[focus-visible]:outline-[var(--novi-color-ring)]',
  ].join(' '),
  empty: [
    'flex items-center justify-center',
    'py-[var(--novi-pad-surface-y)] px-[var(--novi-pad-surface-x)]',
    `text-[var(--novi-color-muted)] text-[length:var(--novi-text-sm)] ${heading}`,
  ].join(' '),
} satisfies SlotMap<typeof tableSlots, (typeof tableRequiredSlots)[number]>

/** 行の高さは行の階級に載せる。28 / 32 / 40px */
const size: VariantMap<NoviSize, { column: string; cell: string }> = {
  sm: {
    column: 'h-7 px-[var(--novi-pad-control-x-sm)]',
    cell: 'h-7 px-[var(--novi-pad-control-x-sm)] text-[length:var(--novi-text-sm)]',
  },
  md: {
    column: 'h-8 px-[var(--novi-pad-control-x-sm)]',
    cell: 'h-8 px-[var(--novi-pad-control-x-sm)] text-[length:var(--novi-text-base)]',
  },
  lg: {
    column: 'h-10 px-[var(--novi-pad-control-x-md)]',
    cell: 'h-10 px-[var(--novi-pad-control-x-md)] text-[length:var(--novi-text-base)]',
  },
}

/**
 * Table のスタイル定義。
 *
 * @example
 * import { tableStyles } from '@novi-ui/flatlay'
 * import { tv } from 'tailwind-variants'
 *
 * const myTable = tv({ extend: tableStyles, slots: { header: 'bg-transparent' } })
 */
export const tableStyles = tv({
  slots,
  variants: { size },
  defaultVariants: { size: 'md' },
})

export type TableStyleProps = Parameters<typeof tableStyles>[0]

/** 右寄せの列（金額・数量）。帳票の数字は等幅で右詰め */
export const alignEndClass = `text-right ${monoNumeric}`
