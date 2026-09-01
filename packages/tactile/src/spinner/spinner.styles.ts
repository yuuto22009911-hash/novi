import type {
  NoviColor,
  NoviSize,
  SlotMap,
  spinnerRequiredSlots,
  spinnerSlots,
  VariantMap,
} from '@novi-ui/core'
import { tv } from 'tailwind-variants'

/**
 * Spinner は `rotate` を使う**唯一の例外**（ADR-R2）。
 *
 * 代替のローディング表現（点滅・バーの往復）は視認性か情報量で劣るため、
 * ここだけ回転を許可している。デザイン規律の検査でも例外登録済み。
 * `prefers-reduced-motion` のときは回転を止める。
 */
const slots = {
  root: 'inline-flex items-center gap-[var(--novi-gap-inline)]',
  circle: 'shrink-0 motion-safe:animate-spin text-[var(--c)]',
  label: 'text-[length:var(--novi-text-sm)] text-[var(--novi-color-muted)]',
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
  sm: { circle: 'size-5' },
  md: { circle: 'size-6' },
  lg: { circle: 'size-7' },
}

/**
 * Spinner のスタイル定義。
 *
 * @example
 * const mySpinner = tv({ extend: spinnerStyles, slots: { label: 'font-medium' } })
 */
export const spinnerStyles = tv({
  slots,
  variants: { color, size },
  defaultVariants: { color: 'default', size: 'md' },
})

export type SpinnerStyleProps = Parameters<typeof spinnerStyles>[0]
