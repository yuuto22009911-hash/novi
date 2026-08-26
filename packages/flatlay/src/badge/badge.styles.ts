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
import { mono } from '../styles/mono'

/**
 * Flatlay の Badge は**書類に押した区分印**。
 *
 * ラベルが等幅なのは、状態や分類の語が帳票では「読ませる文」ではなく
 * 「読み取らせる記号」だから（ADR-F7）。列に並べたとき幅が揃う効果も兼ねる。
 *
 * 点も正方形。円は Radio と Avatar の2つに予約してあり、
 * ここで丸を使うと「1つ選ぶ」の形と紛れる。
 */
const slots = {
  root: [
    'inline-flex items-center gap-1.5',
    'whitespace-nowrap',
    'border border-transparent',
    'rounded-[var(--novi-radius-sm)]',
  ].join(' '),
  dot: 'shrink-0 rounded-[var(--novi-radius-none)] bg-current',
  label: `truncate ${mono}`,
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
  solid: { root: 'bg-[var(--c)] text-[var(--c-fg)] border-[var(--c)]' },
  outline: { root: 'border-[var(--c-line)] text-[var(--c-text)]' },
  soft: {
    root: 'bg-[var(--novi-color-subtle)] border-[var(--novi-color-border)] text-[var(--c-text)]',
  },
  ghost: { root: 'text-[var(--c-text)]' },
  plain: { root: 'text-[var(--c-text)] px-0' },
}

/** 16 / 20 / 24px。行の中に置いても行が膨らまない高さ（Raster は 20/24/28）。 */
const size: VariantMap<NoviSize, { root: string; dot: string }> = {
  sm: { root: 'h-4 px-1 text-[length:var(--novi-text-xs)]', dot: 'size-1.5' },
  md: { root: 'h-5 px-1.5 text-[length:var(--novi-text-xs)]', dot: 'size-1.5' },
  lg: { root: 'h-6 px-2 text-[length:var(--novi-text-sm)]', dot: 'size-2' },
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
  // `variant` は最後に宣言する。先に書くと `plain` の px-0 が size の px に負ける（申し送り6）
  variants: { color, size, radius, variant },
  defaultVariants: { color: 'default', variant: 'outline', size: 'md', radius: 'sm' },
})

export type BadgeStyleProps = Parameters<typeof badgeStyles>[0]
