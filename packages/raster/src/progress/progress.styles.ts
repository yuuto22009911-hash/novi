import type {
  NoviColor,
  NoviSize,
  progressRequiredSlots,
  progressSlots,
  SlotMap,
  VariantMap,
} from '@novi-ui/core'
import { tv } from 'tailwind-variants'

const slots = {
  root: 'flex flex-col gap-1.5 w-full',
  label: 'text-[length:var(--novi-text-sm)] text-[var(--novi-color-fg)]',
  // 細い線1本。面を作らない
  track: [
    'w-full overflow-hidden',
    'bg-[var(--novi-color-subtle)]',
    'rounded-[var(--novi-radius-full)]',
  ].join(' '),
  indicator: [
    'h-full bg-[var(--c)]',
    'transition-[width,transform]',
    'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
  ].join(' '),
  // 数字の字形はテーマが決める。Raster は等幅なので、値が更新されても行が横に踊らない
  valueLabel: [
    'text-[length:var(--novi-text-xs)] text-[var(--novi-color-muted)]',
    '[font-variant-numeric:var(--novi-font-numeric)]',
  ].join(' '),
} satisfies SlotMap<typeof progressSlots, (typeof progressRequiredSlots)[number]>

const color: VariantMap<NoviColor, { root: string }> = {
  default: { root: '[--c:var(--novi-color-fg)]' },
  primary: { root: '[--c:var(--novi-color-primary)]' },
  secondary: { root: '[--c:var(--novi-color-secondary)]' },
  success: { root: '[--c:var(--novi-color-success)]' },
  warning: { root: '[--c:var(--novi-color-warning)]' },
  danger: { root: '[--c:var(--novi-color-danger)]' },
}

const size: VariantMap<NoviSize, { track: string }> = {
  sm: { track: 'h-0.5' },
  md: { track: 'h-1' },
  lg: { track: 'h-1.5' },
}

/**
 * Progress のスタイル定義。
 *
 * @example
 * const myProgress = tv({ extend: progressStyles, slots: { track: 'h-2' } })
 */
export const progressStyles = tv({
  slots,
  variants: {
    color,
    size,
    // 不確定表示。translate のみで表現する（scale や rotate は使わない）
    isIndeterminate: {
      true: { indicator: 'w-1/3 motion-safe:animate-[novi-indeterminate_1.2s_linear_infinite]' },
      false: {},
    },
  },
  defaultVariants: { color: 'default', size: 'md', isIndeterminate: false },
})

export type ProgressStyleProps = Parameters<typeof progressStyles>[0]
