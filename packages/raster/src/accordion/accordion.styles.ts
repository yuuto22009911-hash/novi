import type {
  accordionRequiredSlots,
  accordionSlots,
  NoviSize,
  NoviVariant,
  SlotMap,
  VariantMap,
} from '@novi-ui/core'
import { tv } from 'tailwind-variants'
import { focusRing } from '../styles/focus-ring'

/**
 * インジケータは `+` と `−` の線で示す。
 * 三角矢印を回転させる表現は Raster の「動きで飾らない」原則に反するため使わない。
 */
const slots = {
  root: 'flex flex-col border-t border-[var(--novi-color-border)]',
  item: 'border-b border-[var(--novi-color-border)]',
  // 見出し要素とその中のボタンを分ける。支援技術のために必要
  heading: 'm-0',
  // 行の縦余白は面の縦余白と同じ。アコーディオンの1行は Card の header と同じ役目の面で、
  // size で変えるのは横のインセットと文字サイズだけにする
  trigger: [
    'flex items-center justify-between gap-[var(--novi-gap-inline)] w-full text-left',
    'py-[var(--novi-pad-surface-y)]',
    'cursor-pointer outline-none',
    'text-[var(--novi-color-fg)]',
    'font-[family-name:var(--novi-font-heading)]',
    'tracking-[var(--novi-tracking-tight)] leading-[var(--novi-leading-heading)]',
    'transition-colors duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
    'hover:bg-[var(--novi-color-subtle)]',
    'data-[disabled]:opacity-40 data-[disabled]:cursor-default',
    focusRing,
  ].join(' '),
  indicator: 'shrink-0 text-[var(--novi-color-muted)]',
  // 上の余白は trigger の下余白が兼ねる。下だけ自分で持つ
  panel: [
    'pb-[var(--novi-pad-surface-y)]',
    'text-[var(--novi-color-fg)] leading-[var(--novi-leading-body)]',
  ].join(' '),
} satisfies SlotMap<typeof accordionSlots, (typeof accordionRequiredSlots)[number]>

const variant: VariantMap<NoviVariant, { root: string; item: string }> = {
  solid: { root: 'border-t-0 gap-1', item: 'bg-[var(--novi-color-subtle)] border-b-0' },
  outline: { root: 'border-t border-[var(--novi-color-border)]', item: 'border-b' },
  soft: { root: 'border-t-0 gap-1', item: 'bg-[var(--novi-color-subtle)] border-b-0' },
  ghost: { root: 'border-t-0', item: 'border-b border-[var(--novi-color-border)]' },
  // 境界線を持たない plain は、項目の切れ目を余白だけで示す必要がある
  plain: { root: 'border-t-0 gap-[var(--novi-gap-stack)]', item: 'border-b-0' },
}

/** trigger と panel の左右は必ず同じ値にする。ズレると開閉で文字の左端が動く。 */
const size: VariantMap<NoviSize, { trigger: string; panel: string }> = {
  sm: {
    trigger: 'px-[var(--novi-pad-control-x-sm)] text-[length:var(--novi-text-sm)]',
    panel: 'px-[var(--novi-pad-control-x-sm)]',
  },
  md: {
    trigger: 'px-[var(--novi-pad-control-x-md)] text-[length:var(--novi-text-base)]',
    panel: 'px-[var(--novi-pad-control-x-md)]',
  },
  lg: {
    trigger: 'px-[var(--novi-pad-control-x-lg)] text-[length:var(--novi-text-base)]',
    panel: 'px-[var(--novi-pad-control-x-lg)]',
  },
}

/**
 * Accordion のスタイル定義。
 *
 * @example
 * const myAccordion = tv({ extend: accordionStyles, slots: { panel: 'pt-2' } })
 */
export const accordionStyles = tv({
  slots,
  variants: { size, variant },
  defaultVariants: { variant: 'outline', size: 'md' },
})

export type AccordionStyleProps = Parameters<typeof accordionStyles>[0]
