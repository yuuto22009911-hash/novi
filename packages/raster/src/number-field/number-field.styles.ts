import type {
  NoviRadius,
  NoviSize,
  NoviVariant,
  numberFieldRequiredSlots,
  numberFieldSlots,
  SlotMap,
  VariantMap,
} from '@novi-ui/core'
import { tv } from 'tailwind-variants'
import { disabledState, focusRing } from '../styles/focus-ring'

/** 増減ボタン。1px の縦線で区切るだけで、面は持たない（Raster の規律）。 */
const stepper = [
  'shrink-0 self-stretch inline-flex items-center justify-center w-7',
  'text-[var(--novi-color-muted)]',
  'border-l border-[var(--novi-color-border)]',
  'outline-none',
  'hover:text-[var(--novi-color-fg)] hover:bg-[var(--novi-color-subtle)]',
  'data-[focus-visible]:text-[var(--novi-color-fg)]',
  'data-[disabled]:opacity-40 data-[disabled]:cursor-default',
  'transition-[color,background-color]',
  'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
].join(' ')

const slots = {
  root: 'flex flex-col gap-1.5',
  label: 'text-[length:var(--novi-text-sm)] font-medium text-[var(--novi-color-fg)]',
  // Input と同じ枠。右端の増減ボタンを枠の縁まで届かせるため、左右の余白は input 側に置く
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
    'text-[var(--novi-color-fg)] tabular-nums',
    'placeholder:text-[var(--novi-color-muted)]',
  ].join(' '),
  decrement: stepper,
  increment: stepper,
  description: 'text-[length:var(--novi-text-xs)] text-[var(--novi-color-muted)]',
  // 色だけに頼らずテキストを必ず伴う（WCAG 1.4.1）
  errorMessage: 'text-[length:var(--novi-text-xs)] text-[var(--novi-color-danger)]',
} satisfies SlotMap<typeof numberFieldSlots, (typeof numberFieldRequiredSlots)[number]>

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
const size: VariantMap<NoviSize, { inputWrapper: string; input: string }> = {
  sm: {
    inputWrapper: 'h-8',
    input: 'px-[var(--novi-pad-control-x-sm)] text-[length:var(--novi-text-sm)]',
  },
  md: {
    inputWrapper: 'h-10',
    input: 'px-[var(--novi-pad-control-x-md)] text-[length:var(--novi-text-base)]',
  },
  lg: {
    inputWrapper: 'h-12',
    input: 'px-[var(--novi-pad-control-x-lg)] text-[length:var(--novi-text-base)]',
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
 * NumberField のスタイル定義。
 *
 * @example
 * import { numberFieldStyles } from '@novi-ui/raster'
 * import { tv } from 'tailwind-variants'
 *
 * const myField = tv({ extend: numberFieldStyles, slots: { input: 'text-right' } })
 */
export const numberFieldStyles = tv({
  slots,
  variants: { variant, size, radius },
  defaultVariants: { variant: 'outline', size: 'md', radius: 'md' },
})

export type NumberFieldStyleProps = Parameters<typeof numberFieldStyles>[0]
