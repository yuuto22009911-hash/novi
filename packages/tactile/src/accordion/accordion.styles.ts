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
    'flex items-center justify-between gap-[var(--novi-gap-inline)] w-full text-left',
    'cursor-pointer outline-none',
    'text-[var(--novi-color-fg)]',
    // trigger のラベルがこの項目の見出し。別書体は積まず、字送りと行送りで階層を作る
    'font-[family-name:var(--novi-font-heading)]',
    'tracking-[var(--novi-tracking-tight)] leading-[var(--novi-leading-heading)]',
    'transition-colors duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
    'hover:bg-[var(--novi-color-subtle)]',
    'data-[disabled]:opacity-40 data-[disabled]:cursor-default',
    focusRing,
  ].join(' '),
  // シェブロンは開閉の「方向」そのものを示すので回転させる。
  // +/− に置き換えると向きの情報が消える（ADR-T4 の rotate 例外）
  indicator: [
    'shrink-0 text-[var(--novi-color-muted)]',
    'transition-transform duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
    'group-data-[expanded]:rotate-180',
    'motion-reduce:transition-none',
  ].join(' '),
  panel: 'text-[var(--novi-color-fg)] leading-[var(--novi-leading-body)]',
} satisfies SlotMap<typeof accordionSlots, (typeof accordionRequiredSlots)[number]>

const variant: VariantMap<NoviVariant, { root: string; item: string }> = {
  solid: { root: 'border-t-0 gap-1', item: 'bg-[var(--novi-color-subtle)] border-b-0' },
  outline: { root: 'border-t border-[var(--novi-color-border)]', item: 'border-b' },
  soft: { root: 'border-t-0 gap-1', item: 'bg-[var(--novi-color-subtle)] border-b-0' },
  ghost: { root: 'border-t-0', item: 'border-b border-[var(--novi-color-border)]' },
  // 罫線も面も持たないので、項目の切れ目は距離だけが示す
  plain: { root: 'border-t-0 gap-[var(--novi-gap-inline)]', item: 'border-b-0' },
}

/**
 * trigger は行全体が押せる。どの段でも 48px を下回らせない。
 *
 * 行は「面」なので余白は面のトークンで揃え、**段が変えるのは高さの下限と文字サイズだけ**。
 * trigger と panel が同じ左右余白を共有しないと、開いたときに見出しと本文の左端がずれ、
 * どの見出しに属する本文なのかが読めなくなる。
 */
const surface = 'px-[var(--novi-pad-surface-x)] py-[var(--novi-pad-surface-y)]'
const panelSurface = 'px-[var(--novi-pad-surface-x)] pb-[var(--novi-pad-surface-y)]'

const size: VariantMap<NoviSize, { trigger: string; panel: string }> = {
  sm: {
    trigger: `min-h-12 ${surface} text-[length:var(--novi-text-sm)]`,
    panel: panelSurface,
  },
  md: {
    trigger: `min-h-14 ${surface} text-[length:var(--novi-text-base)]`,
    panel: panelSurface,
  },
  lg: {
    trigger: `min-h-16 ${surface} text-[length:var(--novi-text-base)]`,
    panel: panelSurface,
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
