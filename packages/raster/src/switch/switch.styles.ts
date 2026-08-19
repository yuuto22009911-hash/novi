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
 * Raster の Switch は**ピル型ではなく矩形**（ADR-R3）。
 *
 * 一般的なピル型トグルは「角を立てる」という Raster の原則と正面から衝突する。
 * ここが「テーマ差は色と角丸ではなく構造」であることの最も分かりやすい実例になる。
 *
 * 形が見慣れないぶん ON/OFF が読み取りにくいので、**ラベルの併記を強く推奨**する。
 */
const slots = {
  root: ['inline-flex items-center gap-2', 'cursor-pointer', disabledState].join(' '),
  track: [
    'shrink-0 inline-flex items-center',
    'rounded-[var(--novi-radius-none)]',
    'border border-[var(--novi-color-border-strong)]',
    'bg-[var(--novi-color-subtle)]',
    'transition-[background-color,border-color]',
    'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
    'group-data-[selected]:bg-[var(--c)] group-data-[selected]:border-[var(--c)]',
    focusRing,
  ].join(' '),
  // サムも矩形。translate で滑らせる（scale や rotate は使わない）
  thumb: [
    'rounded-[var(--novi-radius-none)]',
    'bg-[var(--novi-color-bg)]',
    'transition-transform',
    'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
  ].join(' '),
  label: 'text-[var(--novi-color-fg)] leading-[var(--novi-leading-body)]',
  description: 'text-[length:var(--novi-text-xs)] text-[var(--novi-color-muted)]',
} satisfies SlotMap<typeof switchSlots, (typeof switchRequiredSlots)[number]>

const color: VariantMap<NoviColor, { root: string }> = {
  default: { root: '[--c:var(--novi-color-fg)]' },
  primary: { root: '[--c:var(--novi-color-primary)]' },
  secondary: { root: '[--c:var(--novi-color-secondary)]' },
  success: { root: '[--c:var(--novi-color-success)]' },
  warning: { root: '[--c:var(--novi-color-warning)]' },
  danger: { root: '[--c:var(--novi-color-danger)]' },
}

const size: VariantMap<NoviSize, { track: string; thumb: string; label: string }> = {
  sm: {
    track: 'h-4 w-7 p-0.5',
    thumb: 'size-3 group-data-[selected]:translate-x-3',
    label: 'text-[length:var(--novi-text-sm)]',
  },
  md: {
    track: 'h-5 w-9 p-0.5',
    thumb: 'size-4 group-data-[selected]:translate-x-4',
    label: 'text-[length:var(--novi-text-base)]',
  },
  lg: {
    track: 'h-6 w-11 p-0.5',
    thumb: 'size-5 group-data-[selected]:translate-x-5',
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
