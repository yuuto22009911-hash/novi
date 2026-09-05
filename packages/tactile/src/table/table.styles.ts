import type { NoviSize, SlotMap, tableRequiredSlots, tableSlots, VariantMap } from '@novi-ui/core'
import { tv } from 'tailwind-variants'
import { focusRing } from '../styles/focus-ring'

/**
 * Tactile の表は**行が面**。1 行が指で押せる高さと余白を持ち、選んだ行は面が沈む
 * （Raster は横罫だけ、Flatlay は縦横の罫線）。罫線は行のあいだの細い線だけ。
 */
const slots = {
  root: [
    'w-full border-separate border-spacing-0 text-left',
    'text-[var(--novi-color-fg)]',
    'outline-none',
  ].join(' '),
  header: '',
  column: [
    'font-medium text-[var(--novi-color-muted)] text-[length:var(--novi-text-sm)]',
    'border-b border-[var(--novi-color-border)]',
    'whitespace-nowrap align-middle',
    'outline-none',
    'data-[allows-sorting]:cursor-pointer',
    'data-[allows-sorting]:hover:text-[var(--novi-color-fg)]',
    'data-[focus-visible]:text-[var(--novi-color-fg)]',
    'aria-[sort=ascending]:text-[var(--novi-color-fg)] aria-[sort=descending]:text-[var(--novi-color-fg)]',
    focusRing,
  ].join(' '),
  sortIcon: [
    'ml-1.5 inline-flex align-middle text-[var(--novi-color-muted)]',
    'opacity-40 group-aria-[sort=ascending]:opacity-100 group-aria-[sort=descending]:opacity-100',
  ].join(' '),
  body: '',
  row: [
    'outline-none',
    // 面（hover / 選択）を持つので文字色も持つ。ダークで不可視にならない
    'text-[var(--novi-color-fg)]',
    'data-[hovered]:bg-[var(--novi-color-subtle)]',
    'data-[selected]:bg-[var(--novi-color-subtle)] data-[selected]:font-medium',
    'data-[pressed]:bg-[var(--novi-color-border)]',
    'data-[disabled]:opacity-40',
    'data-[focus-visible]:outline-2 data-[focus-visible]:-outline-offset-2 data-[focus-visible]:outline-[var(--novi-color-ring)]',
    'transition-[background-color]',
    'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
  ].join(' '),
  cell: [
    'align-middle tabular-nums',
    'border-b border-[var(--novi-color-border)]',
    'outline-none',
    'data-[focus-visible]:outline-2 data-[focus-visible]:-outline-offset-2 data-[focus-visible]:outline-[var(--novi-color-ring)]',
  ].join(' '),
  empty: [
    'flex items-center justify-center',
    'py-[var(--novi-pad-surface-y)] px-[var(--novi-pad-surface-x)]',
    'text-[var(--novi-color-muted)] text-[length:var(--novi-text-base)]',
  ].join(' '),
} satisfies SlotMap<typeof tableSlots, (typeof tableRequiredSlots)[number]>

/** 行の高さは Button と揃える。40 / 48 / 56px。指で押せる行 */
const size: VariantMap<NoviSize, { column: string; cell: string }> = {
  sm: {
    column: 'h-10 px-[var(--novi-pad-control-x-sm)]',
    cell: 'h-10 px-[var(--novi-pad-control-x-sm)] text-[length:var(--novi-text-sm)]',
  },
  md: {
    column: 'h-12 px-[var(--novi-pad-control-x-md)]',
    cell: 'h-12 px-[var(--novi-pad-control-x-md)] text-[length:var(--novi-text-base)]',
  },
  lg: {
    column: 'h-14 px-[var(--novi-pad-control-x-lg)]',
    cell: 'h-14 px-[var(--novi-pad-control-x-lg)] text-[length:var(--novi-text-lg)]',
  },
}

/**
 * Table のスタイル定義。
 *
 * @example
 * import { tableStyles } from '@novi-ui/tactile'
 * import { tv } from 'tailwind-variants'
 *
 * const myTable = tv({ extend: tableStyles, slots: { cell: 'h-16' } })
 */
export const tableStyles = tv({
  slots,
  variants: { size },
  defaultVariants: { size: 'md' },
})

export type TableStyleProps = Parameters<typeof tableStyles>[0]

/** 右寄せの列（金額・数量）。見出しとセルの両方に付ける */
export const alignEndClass = 'text-right'
