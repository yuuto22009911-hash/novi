import type {
  cardRequiredSlots,
  cardSlots,
  NoviRadius,
  NoviVariant,
  SlotMap,
  VariantMap,
} from '@novi-ui/core'
import { tv } from 'tailwind-variants'
import { disabledState, focusRing } from '../styles/focus-ring'

const slots = {
  // 影は使わない。面の区切りは 1px の境界線だけで表す
  root: [
    'text-[var(--novi-color-fg)]',
    'flex flex-col',
    'bg-[var(--novi-color-bg)]',
    'shadow-[var(--novi-shadow-sm)]',
    'overflow-hidden',
  ].join(' '),
  // header と footer は境界線で仕切る。背景色を変えて面を増やさない。
  // 3段とも同じ余白トークンを使う。以前は py-3 / py-4 / py-3 と実質 1:1 で、
  // 「区画の中」と「区画の境目」が同じ距離だったため詰まって見えていた
  header: [
    'px-[var(--novi-pad-surface-x)] py-[var(--novi-pad-surface-y)]',
    'border-b border-[var(--novi-color-border)]',
    // 見出しの声。別書体を積まず、字送りと行送りだけで本文と階層を分ける
    'font-[family-name:var(--novi-font-heading)]',
    'tracking-[var(--novi-tracking-tight)] leading-[var(--novi-leading-heading)]',
  ].join(' '),
  body: [
    'px-[var(--novi-pad-surface-x)] py-[var(--novi-pad-surface-y)] flex-1',
    'leading-[var(--novi-leading-body)]',
  ].join(' '),
  footer: [
    'px-[var(--novi-pad-surface-x)] py-[var(--novi-pad-surface-y)]',
    'border-t border-[var(--novi-color-border)]',
  ].join(' '),
  image: 'w-full object-cover',
} satisfies SlotMap<typeof cardSlots, (typeof cardRequiredSlots)[number]>

const variant: VariantMap<NoviVariant, { root: string }> = {
  solid: { root: 'bg-[var(--novi-color-subtle)] border-[var(--novi-color-border)]' },
  outline: { root: 'bg-[var(--novi-color-bg)] border-[var(--novi-color-border-strong)]' },
  soft: { root: 'bg-[var(--novi-color-subtle)] border-transparent' },
  ghost: { root: 'bg-transparent border-transparent' },
  plain: { root: 'bg-transparent border-transparent' },
}

const radius: VariantMap<NoviRadius, { root: string }> = {
  none: { root: 'rounded-[var(--novi-radius-none)]' },
  sm: { root: 'rounded-[var(--novi-radius-sm)]' },
  md: { root: 'rounded-[var(--novi-radius-md)]' },
  lg: { root: 'rounded-[var(--novi-radius-lg)]' },
  full: { root: 'rounded-[var(--novi-radius-full)]' },
}

/**
 * Card のスタイル定義。
 *
 * @example
 * const myCard = tv({ extend: cardStyles, slots: { body: 'p-6' } })
 */
export const cardStyles = tv({
  slots,
  variants: {
    variant,
    radius,
    isPressable: {
      true: {
        root: [
          'text-left cursor-pointer',
          'transition-[border-color]',
          'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
          'hover:border-[var(--novi-color-border-strong)]',
          focusRing,
          disabledState,
        ].join(' '),
      },
      false: {},
    },
  },
  defaultVariants: { variant: 'outline', radius: 'lg', isPressable: false },
})

export type CardStyleProps = Parameters<typeof cardStyles>[0]
