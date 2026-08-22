import type {
  checkboxGroupRequiredSlots,
  checkboxGroupSlots,
  checkboxRequiredSlots,
  checkboxSlots,
  NoviColor,
  NoviSize,
  SlotMap,
  VariantMap,
} from '@novi-ui/core'
import { tv } from 'tailwind-variants'
import { disabledState, focusRing } from '../styles/focus-ring'
import { tapTarget } from '../styles/tap-target'

/**
 * Tactile の Checkbox は**視覚寸法とタップ寸法を分ける**（AC-01-5）。
 *
 * 箱は 24px 前後で小さく見せてよいが、指が当たる範囲は 44px 以上ないと押し直しが起きる。
 * 擬似要素で当たり判定だけを広げるので、見た目を変えずに下限を満たせる。
 * 行全体（root）も押せるようにして、ラベルを狙っても切り替わるようにする。
 */
const slots = {
  root: [
    'inline-flex items-center gap-3 min-h-12 py-1',
    'cursor-pointer',
    tapTarget,
    disabledState,
  ].join(' '),
  control: [
    'shrink-0 inline-grid place-items-center',
    'ring-1 ring-[var(--novi-color-border-strong)]',
    'rounded-[var(--novi-radius-sm)]',
    'bg-[var(--novi-color-surface)]',
    'transition-[background-color,box-shadow,scale]',
    'group-data-[pressed]:scale-[0.92] motion-reduce:group-data-[pressed]:scale-100',
    'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
    'group-data-[selected]:bg-[var(--c)] group-data-[selected]:ring-[var(--c)]',
    'group-data-[indeterminate]:bg-[var(--c)] group-data-[indeterminate]:ring-[var(--c)]',
    'group-data-[invalid]:ring-[var(--novi-color-danger)]',
    focusRing,
  ].join(' '),
  indicator: 'text-[var(--c-fg)] pointer-events-none',
  label: 'text-[var(--novi-color-fg)] leading-[var(--novi-leading-body)]',
  description: 'text-[length:var(--novi-text-sm)] text-[var(--novi-color-muted)]',
} satisfies SlotMap<typeof checkboxSlots, (typeof checkboxRequiredSlots)[number]>

const color: VariantMap<NoviColor, { root: string }> = {
  default: {
    root: '[--c:var(--novi-color-fg)] [--c-fg:var(--novi-color-bg)]',
  },
  primary: {
    root: '[--c:var(--novi-color-primary)] [--c-fg:var(--novi-color-primary-fg)]',
  },
  secondary: {
    root: '[--c:var(--novi-color-secondary)] [--c-fg:var(--novi-color-secondary-fg)]',
  },
  success: {
    root: '[--c:var(--novi-color-success)] [--c-fg:var(--novi-color-success-fg)]',
  },
  warning: {
    root: '[--c:var(--novi-color-warning)] [--c-fg:var(--novi-color-warning-fg)]',
  },
  danger: {
    root: '[--c:var(--novi-color-danger)] [--c-fg:var(--novi-color-danger-fg)]',
  },
}

/**
 * 20 / 24 / 28px。**これは視覚寸法**で、当たり判定は root の `tapTarget` が 44px を保つ。
 * 小さく見せることと押しやすさは両立できる（AC-01-5）。
 */
const size: VariantMap<NoviSize, { control: string; label: string }> = {
  sm: { control: 'size-5', label: 'text-[length:var(--novi-text-sm)]' },
  md: { control: 'size-6', label: 'text-[length:var(--novi-text-base)]' },
  lg: { control: 'size-7', label: 'text-[length:var(--novi-text-base)]' },
}

/**
 * Checkbox のスタイル定義。
 *
 * @example
 * import { checkboxStyles } from '@novi-ui/tactile'
 * import { tv } from 'tailwind-variants'
 *
 * const myCheckbox = tv({ extend: checkboxStyles, slots: { label: 'font-medium' } })
 */
export const checkboxStyles = tv({
  slots,
  variants: { color, size },
  defaultVariants: { color: 'default', size: 'md' },
})

const groupSlots = {
  root: 'flex flex-col gap-2',
  label: 'text-[length:var(--novi-text-sm)] font-medium text-[var(--novi-color-fg)]',
  list: 'flex flex-col gap-2',
  description: 'text-[length:var(--novi-text-sm)] text-[var(--novi-color-muted)]',
  errorMessage: 'text-[length:var(--novi-text-sm)] text-[var(--novi-color-danger)]',
} satisfies SlotMap<typeof checkboxGroupSlots, (typeof checkboxGroupRequiredSlots)[number]>

/**
 * CheckboxGroup のスタイル定義。
 *
 * @example
 * const myGroup = tv({ extend: checkboxGroupStyles, slots: { list: 'gap-4' } })
 */
export const checkboxGroupStyles = tv({
  slots: groupSlots,
  variants: {
    orientation: {
      vertical: { list: 'flex-col gap-2' },
      horizontal: { list: 'flex-row gap-4 flex-wrap' },
    },
  },
  defaultVariants: { orientation: 'vertical' },
})

export type CheckboxStyleProps = Parameters<typeof checkboxStyles>[0]
export type CheckboxGroupStyleProps = Parameters<typeof checkboxGroupStyles>[0]
