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

const slots = {
  root: ['inline-flex items-start gap-2', 'cursor-pointer', disabledState].join(' '),
  // 角丸 0 の四角。円にしない
  control: [
    'shrink-0 inline-grid place-items-center',
    'border border-[var(--novi-color-border-strong)]',
    'rounded-[var(--novi-radius-none)]',
    'bg-[var(--novi-color-bg)]',
    'transition-[background-color,border-color]',
    'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
    'group-data-[selected]:bg-[var(--c)] group-data-[selected]:border-[var(--c)]',
    'group-data-[indeterminate]:bg-[var(--c)] group-data-[indeterminate]:border-[var(--c)]',
    'group-data-[invalid]:border-[var(--novi-color-danger)]',
    focusRing,
  ].join(' '),
  indicator: 'text-[var(--c-fg)] pointer-events-none',
  label: 'text-[var(--novi-color-fg)] leading-[var(--novi-leading-body)]',
  description: 'text-[length:var(--novi-text-xs)] text-[var(--novi-color-muted)]',
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

/** 16 / 20 / 24px。いずれも実効タップ領域は root 側の余白で 24px 以上を確保する。 */
const size: VariantMap<NoviSize, { control: string; label: string }> = {
  sm: { control: 'size-4', label: 'text-[length:var(--novi-text-sm)]' },
  md: { control: 'size-5', label: 'text-[length:var(--novi-text-base)]' },
  lg: { control: 'size-6', label: 'text-[length:var(--novi-text-base)]' },
}

/**
 * Checkbox のスタイル定義。
 *
 * @example
 * import { checkboxStyles } from '@novi-ui/raster'
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
  description: 'text-[length:var(--novi-text-xs)] text-[var(--novi-color-muted)]',
  errorMessage: 'text-[length:var(--novi-text-xs)] text-[var(--novi-color-danger)]',
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
