import type {
  NoviColor,
  NoviSize,
  SlotMap,
  switchRequiredSlots,
  switchSlots,
  VariantMap,
} from '@novi-ui/core'
import { tv } from 'tailwind-variants'
import { disabledState, focusRing } from '../styles/focus-ring'

/**
 * Tactile の Switch は **iOS 相当の 51×31px**。パーツ自体がタップ下限を満たす。
 *
 * 押下フィードバックは `scale` ではなく**サムの横伸長**で出す。
 * トグルは「掴んで動かす」ものなので、沈むより伸びる方が動作の予告になる。
 */
const slots = {
  root: ['inline-flex items-center gap-2', 'cursor-pointer', disabledState].join(' '),
  track: [
    'shrink-0 inline-flex items-center',
    'rounded-[var(--novi-radius-full)]',
    'bg-[var(--novi-color-subtle)]',
    'ring-1 ring-[var(--novi-color-border)]',
    'transition-[background-color,box-shadow]',
    'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
    'group-data-[selected]:bg-[var(--c)] group-data-[selected]:ring-[var(--c)]',
    focusRing,
  ].join(' '),
  // 押下でサムが横に伸びる。scale を使わないのは、掴んでいる感触は
  // 「縮む」より「引き伸ばされる」方が近いため（ADR-T5 の scale はボタン用）
  thumb: [
    'rounded-[var(--novi-radius-full)]',
    'bg-[var(--novi-color-surface)]',
    'shadow-[var(--novi-shadow-sm)]',
    'transition-[transform,width]',
    'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
  ].join(' '),
  label: 'text-[var(--novi-color-fg)] leading-[var(--novi-leading-body)]',
  description: 'text-[length:var(--novi-text-sm)] text-[var(--novi-color-muted)]',
} satisfies SlotMap<typeof switchSlots, (typeof switchRequiredSlots)[number]>

const color: VariantMap<NoviColor, { root: string }> = {
  default: { root: '[--c:var(--novi-color-fg)]' },
  primary: { root: '[--c:var(--novi-color-primary)]' },
  secondary: { root: '[--c:var(--novi-color-secondary)]' },
  success: { root: '[--c:var(--novi-color-success)]' },
  warning: { root: '[--c:var(--novi-color-warning)]' },
  danger: { root: '[--c:var(--novi-color-danger)]' },
}

/** md の 51×31px は iOS のスイッチ寸法。パーツ自体が 44px 相当のタップ域を持つ。 */
const size: VariantMap<NoviSize, { track: string; thumb: string; label: string }> = {
  sm: {
    track: 'h-7 w-12 p-0.5',
    thumb: 'size-6 group-data-[selected]:translate-x-5',
    label: 'text-[length:var(--novi-text-sm)]',
  },
  md: {
    track: 'h-[31px] w-[51px] p-0.5',
    thumb: 'size-[27px] group-data-[selected]:translate-x-5',
    label: 'text-[length:var(--novi-text-base)]',
  },
  lg: {
    track: 'h-9 w-[60px] p-0.5',
    thumb: 'size-8 group-data-[selected]:translate-x-6',
    label: 'text-[length:var(--novi-text-base)]',
  },
}

/**
 * Switch のスタイル定義。
 *
 * @example
 * const mySwitch = tv({ extend: switchStyles, slots: { track: 'w-12' } })
 */
export const switchStyles = tv({
  slots,
  variants: { color, size },
  defaultVariants: { color: 'default', size: 'md' },
})

export type SwitchStyleProps = Parameters<typeof switchStyles>[0]
