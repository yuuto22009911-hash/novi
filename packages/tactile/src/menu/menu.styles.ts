import type { menuRequiredSlots, menuSlots, SlotMap } from '@novi-ui/core'
import { tv } from 'tailwind-variants'

const slots = {
  trigger: 'outline-none',
  // Select と同じ下端シート。RAC の位置決めを奪えるのは !important だけ（ADR-T2）
  popover: [
    'text-[var(--novi-color-fg)]',
    'outline-none',
    '!fixed !top-auto !inset-x-0 !bottom-0 !max-w-none !w-full',
    '!max-h-[70dvh]',
    'bg-[var(--novi-color-surface)]',
    'rounded-t-[var(--novi-radius-lg)]',
    'shadow-[var(--novi-shadow-lg)]',
    'pb-[env(safe-area-inset-bottom,0px)]',
    'data-[entering]:motion-safe:animate-[novi-fade-in_120ms_ease-out]',
  ].join(' '),
  list: 'outline-none p-2 flex flex-col',
  item: [
    'flex items-center gap-3 justify-between',
    // 一覧は誤タップが最も起きる場所。行高は 48px を下回らせない
    'min-h-12 px-3 cursor-pointer outline-none',
    'text-[var(--novi-color-fg)]',
    'rounded-[var(--novi-radius-md)]',
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
