import type {
  NoviRadius,
  NoviSize,
  paginationRequiredSlots,
  paginationSlots,
  SlotMap,
  VariantMap,
} from '@novi-ui/core'
import { tv } from 'tailwind-variants'
import { disabledState, focusRing } from '../styles/focus-ring'
import { monoNumeric } from '../styles/mono'

/**
 * ページ番号と前後のボタンに共通のセル。**罫線で区切った 1 本の帯**に並び、
 * 現在地は反転（スタンプ）。押した瞬間も反転する（ADR-F3）。
 * 数字は等幅で、帳票のページ番号と同じ字形（ADR-F7）。
 */
const cell = [
  'inline-flex items-center justify-center',
  `text-[var(--novi-color-fg)] ${monoNumeric}`,
  'outline-none',
  'hover:bg-[var(--novi-color-subtle)]',
  'data-[pressed]:bg-[var(--novi-color-fg)] data-[pressed]:text-[var(--novi-color-bg)]',
  'aria-[current=page]:bg-[var(--novi-color-fg)] aria-[current=page]:text-[var(--novi-color-bg)]',
  'transition-[background-color,color]',
  'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
  focusRing,
  disabledState,
].join(' ')

const slots = {
  root: 'inline-flex',
  // 帯そのものが枠。行の切れ目は縦の罫線
  list: [
    'flex items-stretch list-none m-0 p-0',
    'border border-[var(--novi-color-border-strong)]',
    'divide-x divide-[var(--novi-color-border)]',
    'overflow-hidden',
  ].join(' '),
  item: cell,
  prev: cell,
  next: cell,
  ellipsis: `inline-flex items-center justify-center text-[var(--novi-color-muted)] select-none ${monoNumeric}`,
} satisfies SlotMap<typeof paginationSlots, (typeof paginationRequiredSlots)[number]>

/** 高さは行の階級に載せる。28 / 32 / 40px */
const size: VariantMap<NoviSize, { item: string; prev: string; next: string; ellipsis: string }> = {
  sm: {
    item: 'h-7 min-w-7 px-1.5 text-[length:var(--novi-text-sm)]',
    prev: 'h-7 min-w-7 px-1.5 text-[length:var(--novi-text-sm)]',
    next: 'h-7 min-w-7 px-1.5 text-[length:var(--novi-text-sm)]',
    ellipsis: 'h-7 min-w-7 text-[length:var(--novi-text-sm)]',
  },
  md: {
    item: 'h-8 min-w-8 px-1.5 text-[length:var(--novi-text-base)]',
    prev: 'h-8 min-w-8 px-1.5 text-[length:var(--novi-text-base)]',
    next: 'h-8 min-w-8 px-1.5 text-[length:var(--novi-text-base)]',
    ellipsis: 'h-8 min-w-8 text-[length:var(--novi-text-base)]',
  },
  lg: {
    item: 'h-10 min-w-10 px-[var(--novi-pad-control-x-sm)] text-[length:var(--novi-text-base)]',
    prev: 'h-10 min-w-10 px-[var(--novi-pad-control-x-sm)] text-[length:var(--novi-text-base)]',
    next: 'h-10 min-w-10 px-[var(--novi-pad-control-x-sm)] text-[length:var(--novi-text-base)]',
    ellipsis: 'h-10 min-w-10 text-[length:var(--novi-text-base)]',
  },
}

// 角丸は帯（list）だけが持つ。セルは隣と罫線で接しているので角を持たない
const radius: VariantMap<NoviRadius, { list: string }> = {
  none: { list: 'rounded-[var(--novi-radius-none)]' },
  sm: { list: 'rounded-[var(--novi-radius-sm)]' },
  md: { list: 'rounded-[var(--novi-radius-md)]' },
  lg: { list: 'rounded-[var(--novi-radius-lg)]' },
  full: { list: 'rounded-[var(--novi-radius-full)]' },
}

/**
 * Pagination のスタイル定義。
 *
 * @example
 * import { paginationStyles } from '@novi-ui/flatlay'
 * import { tv } from 'tailwind-variants'
 *
 * const myPagination = tv({ extend: paginationStyles, slots: { item: 'min-w-10' } })
 */
export const paginationStyles = tv({
  slots,
  variants: { size, radius },
  defaultVariants: { size: 'md', radius: 'sm' },
})

export type PaginationStyleProps = Parameters<typeof paginationStyles>[0]
