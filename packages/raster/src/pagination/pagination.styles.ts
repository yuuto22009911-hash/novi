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

/**
 * ページ番号と前後のボタンに共通の面。**数字だけを並べ、面を持たない。**
 * 現在地は下辺の 1px の線で示す（塗らない。Raster は線と余白で階層を作る）。
 */
const cell = [
  'inline-flex items-center justify-center',
  'text-[var(--novi-color-fg)] tabular-nums',
  'border-b border-transparent',
  'outline-none',
  'hover:bg-[var(--novi-color-subtle)]',
  'aria-[current=page]:font-medium aria-[current=page]:border-[var(--novi-color-fg)]',
  'transition-[background-color,border-color]',
  'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
  focusRing,
  disabledState,
].join(' ')

const slots = {
  root: 'inline-flex',
  list: 'flex items-center gap-1 list-none m-0 p-0',
  item: cell,
  prev: cell,
  next: cell,
  ellipsis: 'inline-flex items-center justify-center text-[var(--novi-color-muted)] select-none',
} satisfies SlotMap<typeof paginationSlots, (typeof paginationRequiredSlots)[number]>

/** 高さは Button と揃える。32 / 40 / 48px。幅は最小で正方形 */
const size: VariantMap<NoviSize, { item: string; prev: string; next: string; ellipsis: string }> = {
  sm: {
    item: 'h-8 min-w-8 px-1.5 text-[length:var(--novi-text-sm)]',
    prev: 'h-8 min-w-8 px-1.5 text-[length:var(--novi-text-sm)]',
    next: 'h-8 min-w-8 px-1.5 text-[length:var(--novi-text-sm)]',
    ellipsis: 'h-8 min-w-8 text-[length:var(--novi-text-sm)]',
  },
  md: {
    item: 'h-10 min-w-10 px-[var(--novi-pad-control-x-sm)] text-[length:var(--novi-text-base)]',
    prev: 'h-10 min-w-10 px-[var(--novi-pad-control-x-sm)] text-[length:var(--novi-text-base)]',
    next: 'h-10 min-w-10 px-[var(--novi-pad-control-x-sm)] text-[length:var(--novi-text-base)]',
    ellipsis: 'h-10 min-w-10 text-[length:var(--novi-text-base)]',
  },
  lg: {
    item: 'h-12 min-w-12 px-[var(--novi-pad-control-x-sm)] text-[length:var(--novi-text-base)]',
    prev: 'h-12 min-w-12 px-[var(--novi-pad-control-x-sm)] text-[length:var(--novi-text-base)]',
    next: 'h-12 min-w-12 px-[var(--novi-pad-control-x-sm)] text-[length:var(--novi-text-base)]',
    ellipsis: 'h-12 min-w-12 text-[length:var(--novi-text-base)]',
  },
}

const radius: VariantMap<NoviRadius, { item: string; prev: string; next: string }> = {
  none: {
    item: 'rounded-[var(--novi-radius-none)]',
    prev: 'rounded-[var(--novi-radius-none)]',
    next: 'rounded-[var(--novi-radius-none)]',
  },
  sm: {
    item: 'rounded-[var(--novi-radius-sm)]',
    prev: 'rounded-[var(--novi-radius-sm)]',
    next: 'rounded-[var(--novi-radius-sm)]',
  },
  md: {
    item: 'rounded-[var(--novi-radius-md)]',
    prev: 'rounded-[var(--novi-radius-md)]',
    next: 'rounded-[var(--novi-radius-md)]',
  },
  lg: {
    item: 'rounded-[var(--novi-radius-lg)]',
    prev: 'rounded-[var(--novi-radius-lg)]',
    next: 'rounded-[var(--novi-radius-lg)]',
  },
  full: {
    item: 'rounded-[var(--novi-radius-full)]',
    prev: 'rounded-[var(--novi-radius-full)]',
    next: 'rounded-[var(--novi-radius-full)]',
  },
}

/**
 * Pagination のスタイル定義。
 *
 * @example
 * import { paginationStyles } from '@novi-ui/raster'
 * import { tv } from 'tailwind-variants'
 *
 * const myPagination = tv({ extend: paginationStyles, slots: { list: 'gap-2' } })
 */
export const paginationStyles = tv({
  slots,
  variants: { size, radius },
  defaultVariants: { size: 'md', radius: 'md' },
})

export type PaginationStyleProps = Parameters<typeof paginationStyles>[0]
