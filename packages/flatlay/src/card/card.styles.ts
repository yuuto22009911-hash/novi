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
import { heading } from '../styles/mono'

/**
 * Flatlay の Card は**書類の枠**。両テーマも影は使わないが、こちらは
 * 「影を使わない」ではなく「影が存在しない」ので、枠と区切りが唯一の表現になる。
 *
 * `surface` が `bg` と同値（浮く面の概念が無い）ため、地の色で面を持ち上げることも
 * できない。header / footer を仕切るのも背景ではなく罫線1本。
 */
const slots = {
  root: [
    'text-[var(--novi-color-fg)]',
    'flex flex-col',
    'border',
    'rounded-[var(--novi-radius-sm)]',
    'overflow-hidden',
  ].join(' '),
  // header と footer は罫線で仕切る。地の色を変えて面を増やさない。
  // 見出しが mono なのは Flatlay だけ（spec 08）。書体そのものが header の役割を示す
  header: [
    'px-[var(--novi-pad-surface-x)] py-[var(--novi-pad-surface-y)]',
    'border-b border-[var(--novi-color-border)]',
    heading,
  ].join(' '),
  // 上下 14px でも詰まって見えないのは、行送り 1.7 が余白を引き受けているから
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
  solid: { root: 'bg-[var(--novi-color-subtle)] border-[var(--novi-color-border-strong)]' },
  outline: { root: 'bg-[var(--novi-color-bg)] border-[var(--novi-color-border-strong)]' },
  soft: { root: 'bg-[var(--novi-color-subtle)] border-[var(--novi-color-border)]' },
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
 * 押せるカードも押下は反転する（ADR-F3）。面積が大きいぶん声も大きいが、
 * 沈む・浮くが使えない以上ここだけ別の語彙にはできない。100ms で戻る。
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
          'hover:border-[var(--novi-color-border-strong)]',
          'data-[pressed]:bg-[var(--novi-color-fg)] data-[pressed]:text-[var(--novi-color-bg)]',
          'transition-[background-color,border-color,color]',
          'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
          focusRing,
          disabledState,
        ].join(' '),
      },
      false: {},
    },
  },
  // 書類の角。Raster の lg（12px）に対して 2px
  defaultVariants: { variant: 'outline', radius: 'sm', isPressable: false },
})

export type CardStyleProps = Parameters<typeof cardStyles>[0]
