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
    // 横向きのノッチは左右に来る。面は全幅のまま、中身だけを内側へ寄せる（FR-13）
    'pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]',
    'data-[entering]:motion-safe:animate-[novi-fade-in_120ms_ease-out]',
  ].join(' '),
  // 行の背景が丸く抜けて見えるための溝。ここは「余白の設計」ではなく行の位置合わせなので
  // 生値のまま置く。シート端から文字までの実距離は溝 + 行の余白 = 26px で、
  // 面の余白（28px）とほぼ揃う
  list: 'outline-none p-1.5 flex flex-col',
  item: [
    'flex items-center gap-[var(--novi-gap-inline)] justify-between',
    // 一覧は誤タップが最も起きる場所。行高は 48px を下回らせない
    'min-h-12 px-[var(--novi-pad-control-x-md)] cursor-pointer outline-none',
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
  // 行の文字と左端を揃える。ラベルだけ内側にずれると、どの行に掛かる見出しか読めない
  sectionLabel: [
    'px-[var(--novi-pad-control-x-md)] pt-[var(--novi-gap-inline)] pb-1',
    'text-[length:var(--novi-text-xs)] text-[var(--novi-color-muted)]',
    'tracking-[var(--novi-tracking-normal)]',
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
