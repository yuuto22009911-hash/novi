import type {
  comboBoxRequiredSlots,
  comboBoxSlots,
  NoviRadius,
  NoviSize,
  NoviVariant,
  SlotMap,
  VariantMap,
} from '@novi-ui/core'
import { tv } from 'tailwind-variants'
import { disabledState, focusRing } from '../styles/focus-ring'

const slots = {
  root: 'flex flex-col gap-1.5',
  label: 'text-[length:var(--novi-text-sm)] font-medium text-[var(--novi-color-fg)]',
  // Input と同じ枠。開くボタンを枠の縁まで届かせるため、左右の余白は input 側に置く
  inputWrapper: [
    'text-[var(--novi-color-fg)]',
    'flex items-center w-full overflow-hidden',
    'bg-[var(--novi-color-bg)]',
    'border border-[var(--novi-color-border-strong)]',
    'transition-[border-color,opacity]',
    'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
    'data-[invalid]:border-[var(--novi-color-danger)]',
    focusRing,
    disabledState,
  ].join(' '),
  input: [
    'w-full min-w-0 bg-transparent outline-none',
    'text-[var(--novi-color-fg)]',
    'placeholder:text-[var(--novi-color-muted)]',
  ].join(' '),
  // 開くボタン。1px の縦線で区切るだけで面は持たない（NumberField の増減と同じ型）
  trigger: [
    'shrink-0 self-stretch inline-flex items-center justify-center w-8',
    'text-[var(--novi-color-muted)]',
    'border-l border-[var(--novi-color-border)]',
    'outline-none',
    'hover:text-[var(--novi-color-fg)] hover:bg-[var(--novi-color-subtle)]',
    'data-[focus-visible]:text-[var(--novi-color-fg)]',
    'data-[disabled]:opacity-40 data-[disabled]:cursor-default',
    'transition-[color,background-color]',
    'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
  ].join(' '),
  icon: 'shrink-0 inline-flex',
  // 影を使わず、1px の境界線と背景の差だけで浮かせる（Select と同じ）
  popover: [
    'bg-[var(--novi-color-bg)]',
    'text-[var(--novi-color-fg)]',
    'border border-[var(--novi-color-border)]',
    'rounded-[var(--novi-radius-lg)]',
    'shadow-[var(--novi-shadow-md)]',
    // 入力欄と同じ幅に揃える
    'w-[var(--trigger-width)]',
    'overflow-auto max-h-64',
  ].join(' '),
  listbox: 'outline-none p-1 flex flex-col',
  option: [
    'flex items-center justify-between gap-[var(--novi-gap-inline)]',
    'px-[var(--novi-pad-control-x-sm)] py-1.5 cursor-pointer outline-none',
    'text-[var(--novi-color-fg)]',
    'rounded-[var(--novi-radius-sm)]',
    'data-[focused]:bg-[var(--novi-color-subtle)]',
    'data-[selected]:font-medium',
    'data-[disabled]:opacity-40 data-[disabled]:cursor-default',
  ].join(' '),
  description: 'text-[length:var(--novi-text-xs)] text-[var(--novi-color-muted)]',
  errorMessage: 'text-[length:var(--novi-text-xs)] text-[var(--novi-color-danger)]',
} satisfies SlotMap<typeof comboBoxSlots, (typeof comboBoxRequiredSlots)[number]>

const variant: VariantMap<NoviVariant, { inputWrapper: string }> = {
  solid: {
    inputWrapper: 'bg-[var(--novi-color-subtle)] border-[var(--novi-color-border-strong)]',
  },
  outline: { inputWrapper: 'bg-[var(--novi-color-bg)] border-[var(--novi-color-border-strong)]' },
  soft: { inputWrapper: 'bg-[var(--novi-color-subtle)] border-transparent' },
  ghost: {
    inputWrapper: 'bg-transparent border-transparent border-b-[var(--novi-color-border-strong)]',
  },
  plain: { inputWrapper: 'bg-transparent border-transparent' },
}

/** 高さは Button / Input と揃える。32 / 40 / 48px。 */
const size: VariantMap<NoviSize, { inputWrapper: string; input: string; option: string }> = {
  sm: {
    inputWrapper: 'h-8',
    input: 'px-[var(--novi-pad-control-x-sm)] text-[length:var(--novi-text-sm)]',
    option: 'text-[length:var(--novi-text-sm)]',
  },
  md: {
    inputWrapper: 'h-10',
    input: 'px-[var(--novi-pad-control-x-md)] text-[length:var(--novi-text-base)]',
    option: 'text-[length:var(--novi-text-base)]',
  },
  lg: {
    inputWrapper: 'h-12',
    input: 'px-[var(--novi-pad-control-x-lg)] text-[length:var(--novi-text-base)]',
    option: 'text-[length:var(--novi-text-base)]',
  },
}

const radius: VariantMap<NoviRadius, { inputWrapper: string }> = {
  none: { inputWrapper: 'rounded-[var(--novi-radius-none)]' },
  sm: { inputWrapper: 'rounded-[var(--novi-radius-sm)]' },
  md: { inputWrapper: 'rounded-[var(--novi-radius-md)]' },
  lg: { inputWrapper: 'rounded-[var(--novi-radius-lg)]' },
  full: { inputWrapper: 'rounded-[var(--novi-radius-full)]' },
}

/**
 * ComboBox のスタイル定義。
 *
 * @example
 * import { comboBoxStyles } from '@novi-ui/raster'
 * import { tv } from 'tailwind-variants'
 *
 * const myComboBox = tv({ extend: comboBoxStyles, slots: { popover: 'max-h-96' } })
 */
export const comboBoxStyles = tv({
  slots,
  variants: { variant, size, radius },
  defaultVariants: { variant: 'outline', size: 'md', radius: 'md' },
})

export type ComboBoxStyleProps = Parameters<typeof comboBoxStyles>[0]
