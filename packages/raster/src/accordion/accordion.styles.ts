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
  trigger: [
    'flex items-center justify-between gap-4 w-full text-left',
    'cursor-pointer outline-none',
    'text-[var(--novi-color-fg)]',
    'transition-colors duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
    'hover:bg-[var(--novi-color-subtle)]',
    'data-[disabled]:opacity-40 data-[disabled]:cursor-default',
    focusRing,
  ].join(' '),
  indicator: 'shrink-0 text-[var(--novi-color-muted)]',
  panel: 'text-[var(--novi-color-fg)] leading-[var(--novi-leading-body)]',
} satisfies SlotMap<typeof accordionSlots, (typeof accordionRequiredSlots)[number]>

const variant: VariantMap<NoviVariant, { root: string; item: string }> = {
  solid: { root: 'border-t-0 gap-1', item: 'bg-[var(--novi-color-subtle)] border-b-0' },
  outline: { root: 'border-t border-[var(--novi-color-border)]', item: 'border-b' },
  soft: { root: 'border-t-0 gap-1', item: 'bg-[var(--novi-color-subtle)] border-b-0' },
  ghost: { root: 'border-t-0', item: 'border-b border-[var(--novi-color-border)]' },
  plain: { root: 'border-t-0 gap-2', item: 'border-b-0' },
}

const size: VariantMap<NoviSize, { trigger: string; panel: string }> = {
  sm: { trigger: 'px-3 py-2.5 text-[length:var(--novi-text-sm)]', panel: 'px-3 pb-2.5' },
  md: { trigger: 'px-4 py-3 text-[length:var(--novi-text-base)]', panel: 'px-4 pb-3' },
  lg: { trigger: 'px-5 py-4 text-[length:var(--novi-text-base)]', panel: 'px-5 pb-4' },
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
