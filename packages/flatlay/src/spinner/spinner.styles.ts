import type {
  NoviColor,
  NoviSize,
  SlotMap,
  spinnerRequiredSlots,
  spinnerSlots,
  VariantMap,
} from '@novi-ui/core'
import { tv } from 'tailwind-variants'
import { mono } from '../styles/mono'

/**
 * Spinner は `transform`（`animate-spin`）を使う**唯一の例外**。
 *
 * Flatlay は動きで飾らないテーマだが、ここだけは規律の外に置いている。
 * 代替（点滅・バーの往復）は「処理中」であることの視認性か情報量で必ず劣り、
 * 待たされている人にとっては世界観よりも「動いていると分かること」が先だから。
 * 例外は `design-rules.data.mjs` にも登録済みで、両テーマと同じ判断。
 *
 * `prefers-reduced-motion` のときは回転を止める。
 */
const slots = {
  root: 'inline-flex items-center gap-2',
  circle: 'shrink-0 motion-safe:animate-spin text-[var(--c)]',
  label: `text-[length:var(--novi-text-sm)] text-[var(--novi-color-muted)] ${mono}`,
} satisfies SlotMap<typeof spinnerSlots, (typeof spinnerRequiredSlots)[number]>

const color: VariantMap<NoviColor, { root: string }> = {
  default: { root: '[--c:var(--novi-color-fg)]' },
  primary: { root: '[--c:var(--novi-color-primary)]' },
  secondary: { root: '[--c:var(--novi-color-secondary)]' },
  success: { root: '[--c:var(--novi-color-success)]' },
  warning: { root: '[--c:var(--novi-color-warning)]' },
  danger: { root: '[--c:var(--novi-color-danger)]' },
}

const size: VariantMap<NoviSize, { circle: string }> = {
  sm: { circle: 'size-4' },
  md: { circle: 'size-5' },
  lg: { circle: 'size-6' },
}

/**
 * Spinner のスタイル定義。
 *
 * @example
 * const mySpinner = tv({ extend: spinnerStyles, slots: { label: 'text-[var(--novi-color-fg)]' } })
 */
export const spinnerStyles = tv({
  slots,
  variants: { color, size },
  defaultVariants: { color: 'default', size: 'md' },
})

export type SpinnerStyleProps = Parameters<typeof spinnerStyles>[0]
