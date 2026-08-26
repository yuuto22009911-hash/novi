import type {
  NoviColor,
  NoviSize,
  progressRequiredSlots,
  progressSlots,
  SlotMap,
  VariantMap,
} from '@novi-ui/core'
import { tv } from 'tailwind-variants'
import { mono, monoNumeric } from '../styles/mono'

const slots = {
  root: 'flex flex-col gap-1.5 w-full',
  label: `text-[length:var(--novi-text-sm)] text-[var(--novi-color-fg)] ${mono}`,
  /**
   * 引かれた罫線そのもの。地に `subtle` を使わないのは、2px の帯では L の差が
   * 見えず線が消えるため。罫線の色を使うことで「まだ引かれていない部分」も
   * 罫線として読める。
   */
  track: [
    'w-full overflow-hidden',
    'bg-[var(--novi-color-border)]',
    'rounded-[var(--novi-radius-none)]',
  ].join(' '),
  // 伸びるのは幅だけ。transform は持たない（FR-11）
  indicator: [
    'h-full bg-[var(--c)]',
    'transition-[width]',
    'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
  ].join(' '),
  valueLabel: `text-[length:var(--novi-text-xs)] text-[var(--novi-color-muted)] ${monoNumeric}`,
} satisfies SlotMap<typeof progressSlots, (typeof progressRequiredSlots)[number]>

const color: VariantMap<NoviColor, { root: string }> = {
  default: { root: '[--c:var(--novi-color-fg)]' },
  primary: { root: '[--c:var(--novi-color-primary)]' },
  secondary: { root: '[--c:var(--novi-color-secondary)]' },
  success: { root: '[--c:var(--novi-color-success)]' },
  warning: { root: '[--c:var(--novi-color-warning)]' },
  danger: { root: '[--c:var(--novi-color-danger)]' },
}

/** 罫線の太さ。面ではなく線なので、両テーマ（2/4/6px）より1段細い。 */
const size: VariantMap<NoviSize, { track: string }> = {
  sm: { track: 'h-px' },
  md: { track: 'h-0.5' },
  lg: { track: 'h-1' },
}

/**
 * Progress のスタイル定義。
 *
 * @example
 * const myProgress = tv({ extend: progressStyles, slots: { track: 'h-1' } })
 */
export const progressStyles = tv({
  slots,
  variants: {
    color,
    size,
    /**
     * 不確定表示。両テーマは細い帯を translate で往復させるが、Flatlay は
     * transform を持たない（FR-11）。線を全幅で引いたまま濃さを脈打たせる。
     * 「進んでいるが量は分からない」を、動かさずに示す唯一の手段。
     */
    isIndeterminate: {
      true: { indicator: 'w-full motion-safe:animate-pulse' },
      false: {},
    },
  },
  defaultVariants: { color: 'default', size: 'md', isIndeterminate: false },
})

export type ProgressStyleProps = Parameters<typeof progressStyles>[0]
