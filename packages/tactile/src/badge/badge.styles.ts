import type {
  badgeRequiredSlots,
  badgeSlots,
  NoviColor,
  NoviRadius,
  NoviSize,
  NoviVariant,
  SlotMap,
  VariantMap,
} from '@novi-ui/core'
import { tv } from 'tailwind-variants'

const slots = {
  root: [
    'inline-flex items-center gap-1.5',
    'font-medium whitespace-nowrap',
    'border border-transparent',
  ].join(' '),
  // 円ではなく正方形。Raster では点も角を立てる
  dot: 'shrink-0 rounded-[var(--novi-radius-full)] bg-current',
  label: 'truncate',
} satisfies SlotMap<typeof badgeSlots, (typeof badgeRequiredSlots)[number]>

const color: VariantMap<NoviColor, { root: string }> = {
  default: {
    root: [
      '[--c:var(--novi-color-default)]',
      '[--c-fg:var(--novi-color-default-fg)]',
      '[--c-text:var(--novi-color-fg)]',
      '[--c-line:var(--novi-color-border-strong)]',
    ].join(' '),
  },
  primary: {
    root: [
      '[--c:var(--novi-color-primary)]',
      '[--c-fg:var(--novi-color-primary-fg)]',
      '[--c-text:var(--novi-color-primary)]',
      '[--c-line:var(--novi-color-primary)]',
    ].join(' '),
  },
  secondary: {
    root: [
      '[--c:var(--novi-color-secondary)]',
      '[--c-fg:var(--novi-color-secondary-fg)]',
      '[--c-text:var(--novi-color-secondary)]',
      '[--c-line:var(--novi-color-secondary)]',
    ].join(' '),
  },
  success: {
    root: [
      '[--c:var(--novi-color-success)]',
      '[--c-fg:var(--novi-color-success-fg)]',
      '[--c-text:var(--novi-color-success)]',
      '[--c-line:var(--novi-color-success)]',
    ].join(' '),
  },
  warning: {
    root: [
      '[--c:var(--novi-color-warning)]',
      '[--c-fg:var(--novi-color-warning-fg)]',
      '[--c-text:var(--novi-color-warning)]',
      '[--c-line:var(--novi-color-warning)]',
    ].join(' '),
  },
  danger: {
    root: [
      '[--c:var(--novi-color-danger)]',
      '[--c-fg:var(--novi-color-danger-fg)]',
      '[--c-text:var(--novi-color-danger)]',
      '[--c-line:var(--novi-color-danger)]',
    ].join(' '),
  },
}

const variant: VariantMap<NoviVariant, { root: string }> = {
  solid: { root: 'bg-[var(--c)] text-[var(--c-fg)]' },
  outline: { root: 'border-[var(--c-line)] text-[var(--c-text)]' },
  soft: { root: 'bg-[var(--novi-color-subtle)] text-[var(--c-text)]' },
  ghost: { root: 'text-[var(--c-text)]' },
  plain: { root: 'text-[var(--c-text)] px-0' },
}

const size: VariantMap<NoviSize, { root: string; dot: string }> = {
  // Badge は表示専用でタップ対象ではないため、高さの下限（40px）の対象外。
  // 文字だけは読める大きさを保つ
  sm: { root: 'h-6 px-2 text-[length:var(--novi-text-xs)]', dot: 'size-1.5' },
  md: { root: 'h-7 px-2.5 text-[length:var(--novi-text-sm)]', dot: 'size-2' },
  lg: { root: 'h-8 px-3 text-[length:var(--novi-text-sm)]', dot: 'size-2.5' },
}

const radius: VariantMap<NoviRadius, { root: string }> = {
  none: { root: 'rounded-[var(--novi-radius-none)]' },
  sm: { root: 'rounded-[var(--novi-radius-sm)]' },
  md: { root: 'rounded-[var(--novi-radius-md)]' },
  lg: { root: 'rounded-[var(--novi-radius-lg)]' },
  full: { root: 'rounded-[var(--novi-radius-full)]' },
}

/**
 * Badge のスタイル定義。
 *
 * @example
 * const myBadge = tv({ extend: badgeStyles, slots: { label: 'uppercase' } })
 */
export const badgeStyles = tv({
  slots,
  // variant を最後に宣言する。tv は宣言順に適用するため、
  // 先に書くと `plain` の px-0 が size の px-2 に負けて ghost と同じ見た目になる。
  variants: { color, size, radius, variant },
  defaultVariants: { color: 'default', variant: 'soft', size: 'md', radius: 'sm' },
})

export type BadgeStyleProps = Parameters<typeof badgeStyles>[0]
