import type { NoviSize, SlotMap, tableRequiredSlots, tableSlots, VariantMap } from '@novi-ui/core'
import { tv } from 'tailwind-variants'
import { focusRing } from '../styles/focus-ring'

/**
 * Raster の表は**横罫だけ**。縦罫も面も持たず、列の揃えと余白で読ませる
 * （Tactile は行に面と余白、Flatlay は縦横の罫線の帳票）。
 */
const slots = {
  root: ['w-full border-collapse text-left', 'text-[var(--novi-color-fg)]', 'outline-none'].join(
    ' ',
  ),
  header: '',
  column: [
    'font-medium text-[var(--novi-color-muted)] text-[length:var(--novi-text-sm)]',
    'border-b border-[var(--novi-color-border-strong)]',
    'whitespace-nowrap align-middle',
    'outline-none',
    // 並べ替えできる見出しだけが押せる
    'data-[allows-sorting]:cursor-pointer',
    'data-[allows-sorting]:hover:text-[var(--novi-color-fg)]',
    'data-[focus-visible]:text-[var(--novi-color-fg)]',
    'aria-[sort=ascending]:text-[var(--novi-color-fg)] aria-[sort=descending]:text-[var(--novi-color-fg)]',
    focusRing,
  ].join(' '),
  // 並べ替えの印。方向が決まっている間だけ濃くなる
  sortIcon: [
    'ml-1 inline-flex align-middle text-[var(--novi-color-muted)]',
    'opacity-40 group-aria-[sort=ascending]:opacity-100 group-aria-[sort=descending]:opacity-100',
  ].join(' '),
  body: '',
  row: [
    'border-b border-[var(--novi-color-border)]',
    'outline-none',
    // 面（hover / 選択）を持つので文字色も持つ。ダークで不可視にならない
    'text-[var(--novi-color-fg)]',
    'data-[hovered]:bg-[var(--novi-color-subtle)]',
    'data-[selected]:bg-[var(--novi-color-subtle)] data-[selected]:font-medium',
    'data-[disabled]:opacity-40',
    // 行のフォーカスは内側のリングで示す（表の縁を越えない）
    'data-[focus-visible]:outline-2 data-[focus-visible]:-outline-offset-2 data-[focus-visible]:outline-[var(--novi-color-ring)]',
    'transition-[background-color]',
    'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
  ].join(' '),
  cell: [
    'align-middle tabular-nums',
    'outline-none',
    'data-[focus-visible]:outline-2 data-[focus-visible]:-outline-offset-2 data-[focus-visible]:outline-[var(--novi-color-ring)]',
  ].join(' '),
  empty: [
    'flex items-center justify-center',
    'py-[var(--novi-pad-surface-y)] px-[var(--novi-pad-surface-x)]',
    'text-[var(--novi-color-muted)] text-[length:var(--novi-text-sm)]',
  ].join(' '),
} satisfies SlotMap<typeof tableSlots, (typeof tableRequiredSlots)[number]>

/** 行の高さは Button と揃える。32 / 40 / 48px。左右はコントロールの刻み */
const size: VariantMap<NoviSize, { column: string; cell: string }> = {
  sm: {
    column: 'h-8 px-[var(--novi-pad-control-x-sm)]',
    cell: 'h-8 px-[var(--novi-pad-control-x-sm)] text-[length:var(--novi-text-sm)]',
  },
  md: {
    column: 'h-10 px-[var(--novi-pad-control-x-md)]',
    cell: 'h-10 px-[var(--novi-pad-control-x-md)] text-[length:var(--novi-text-base)]',
  },
  lg: {
    column: 'h-12 px-[var(--novi-pad-control-x-lg)]',
    cell: 'h-12 px-[var(--novi-pad-control-x-lg)] text-[length:var(--novi-text-base)]',
  },
}

/**
 * Table のスタイル定義。
 *
 * @example
 * import { tableStyles } from '@novi-ui/raster'
 * import { tv } from 'tailwind-variants'
 *
 * const myTable = tv({ extend: tableStyles, slots: { row: 'h-12' } })
 */
export const tableStyles = tv({
  slots,
  variants: { size },
  defaultVariants: { size: 'md' },
})

export type TableStyleProps = Parameters<typeof tableStyles>[0]

/** 右寄せの列（金額・数量）。見出しとセルの両方に付ける */
export const alignEndClass = 'text-right'
