import type { menuRequiredSlots, menuSlots, SlotMap } from '@novi-ui/core'
import { tv } from 'tailwind-variants'

const slots = {
  trigger: 'outline-none',
  popover: [
    'text-[var(--novi-color-fg)]',
    'min-w-40 outline-none',
    'bg-[var(--novi-color-bg)]',
    'border border-[var(--novi-color-border-strong)]',
    'rounded-[var(--novi-radius-lg)]',
    'shadow-[var(--novi-shadow-md)]',
    'data-[entering]:motion-safe:animate-[novi-fade-in_120ms_ease-out]',
  ].join(' '),
  list: 'outline-none p-1 flex flex-col',
  item: [
    'flex items-center gap-[var(--novi-gap-inline)] justify-between',
    // 縦は 6px。行を詰めて一覧性を稼ぐ場所なので、面の縦余白は当てない
    'px-[var(--novi-pad-control-x-sm)] py-1.5 cursor-pointer outline-none',
    'text-[var(--novi-color-fg)]',
    'rounded-[var(--novi-radius-sm)]',
    'data-[focused]:bg-[var(--novi-color-subtle)]',
    'data-[disabled]:opacity-40 data-[disabled]:cursor-default',
  ].join(' '),
  itemLabel: 'truncate',
  itemDescription: 'text-[length:var(--novi-text-xs)] text-[var(--novi-color-muted)]',
  // ショートカットは桁を揃える。等幅数字にしないと縦の線が揃わない
  itemShortcut: [
    'shrink-0 text-[length:var(--novi-text-xs)] text-[var(--novi-color-muted)]',
    '[font-variant-numeric:var(--novi-font-numeric)]',
  ].join(' '),
  separator: 'my-1 h-px bg-[var(--novi-color-border)]',
  section: 'flex flex-col',
  // 上の余白だけ広いのは、見出しが「下の項目群のもの」だと近接で示すため
  sectionLabel: [
    'px-[var(--novi-pad-control-x-sm)] pt-[var(--novi-gap-inline)] pb-1',
    'text-[length:var(--novi-text-xs)] text-[var(--novi-color-muted)] tracking-wide',
  ].join(' '),
} satisfies SlotMap<typeof menuSlots, (typeof menuRequiredSlots)[number]>

/**
 * Menu のスタイル定義。
 *
 * @example
 * const myMenu = tv({ extend: menuStyles, slots: { popover: 'min-w-56' } })
 */
export const menuStyles = tv({ slots })

export type MenuStyleProps = Parameters<typeof menuStyles>[0]
