import type { menuRequiredSlots, menuSlots, SlotMap } from '@novi-ui/core'
import { tv } from 'tailwind-variants'

const slots = {
  trigger: 'outline-none',
  popover: [
    'text-[var(--novi-color-fg)]',
    'min-w-40 outline-none',
    'bg-[var(--novi-color-bg)]',
    'border border-[var(--novi-color-border-strong)]',
    'rounded-[var(--novi-radius-none)]',
    'shadow-none',
    'data-[entering]:motion-safe:animate-[novi-fade-in_120ms_ease-out]',
  ].join(' '),
  list: 'outline-none p-1 flex flex-col',
  item: [
    'flex items-center gap-3 justify-between',
    'px-2 py-1.5 cursor-pointer outline-none',
    'text-[var(--novi-color-fg)]',
    'rounded-[var(--novi-radius-none)]',
    'data-[focused]:bg-[var(--novi-color-subtle)]',
    'data-[disabled]:opacity-40 data-[disabled]:cursor-default',
  ].join(' '),
  itemLabel: 'truncate',
  itemDescription: 'text-[length:var(--novi-text-xs)] text-[var(--novi-color-muted)]',
  // ショートカットは桁を揃える。等幅数字にしないと縦の線が揃わない
  itemShortcut:
    'shrink-0 text-[length:var(--novi-text-xs)] text-[var(--novi-color-muted)] tabular-nums',
  separator: 'my-1 h-px bg-[var(--novi-color-border)]',
  section: 'flex flex-col',
  sectionLabel:
    'px-2 pt-2 pb-1 text-[length:var(--novi-text-xs)] text-[var(--novi-color-muted)] tracking-wide',
} satisfies SlotMap<typeof menuSlots, (typeof menuRequiredSlots)[number]>

/**
 * Menu のスタイル定義。
 *
 * @example
 * const myMenu = tv({ extend: menuStyles, slots: { popover: 'min-w-56' } })
 */
export const menuStyles = tv({ slots })

export type MenuStyleProps = Parameters<typeof menuStyles>[0]
