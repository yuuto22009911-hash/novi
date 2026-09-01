import type {
  NoviRadius,
  NoviSize,
  NoviVariant,
  SlotMap,
  textareaRequiredSlots,
  textareaSlots,
  VariantMap,
} from '@novi-ui/core'
import { tv } from 'tailwind-variants'
import { disabledState, focusRing } from '../styles/focus-ring'

const slots = {
  root: 'flex flex-col gap-1.5',
  label: 'text-[length:var(--novi-text-sm)] font-medium text-[var(--novi-color-fg)]',
  inputWrapper: [
    'text-[var(--novi-color-fg)]',
    'flex w-full',
    'bg-[var(--novi-color-bg)]',
    'border border-[var(--novi-color-border-strong)]',
    'transition-[border-color,opacity]',
    'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
    'data-[invalid]:border-[var(--novi-color-danger)]',
    focusRing,
    disabledState,
  ].join(' '),
  textarea: [
    'w-full min-w-0 bg-transparent outline-none',
    'text-[var(--novi-color-fg)]',
    'placeholder:text-[var(--novi-color-muted)]',
    // 横に伸ばすとレイアウトが崩れるので縦のみ許可する
    'resize-y',
    'leading-[var(--novi-leading-body)]',
  ].join(' '),
  // 文字数カウンタもここに置く。専用 slot を増やさない
  description: 'text-[length:var(--novi-text-xs)] text-[var(--novi-color-muted)]',
  errorMessage: 'text-[length:var(--novi-text-xs)] text-[var(--novi-color-danger)]',
} satisfies SlotMap<typeof textareaSlots, (typeof textareaRequiredSlots)[number]>

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

/**
 * 1行入力と違い高さは固定しない。左右は Input と同じトークン、
 * 縦だけは生値のまま残す — この値が Input の h-8 / h-10 / h-12 に対応する
 * 実効の高さを作っており、面の縦余白（16px）を当てると1行入力との連続性が壊れる。
 */
const size: VariantMap<NoviSize, { inputWrapper: string; textarea: string }> = {
  sm: {
    inputWrapper: 'px-[var(--novi-pad-control-x-sm)] py-1.5',
    textarea: 'text-[length:var(--novi-text-sm)]',
  },
  md: {
    inputWrapper: 'px-[var(--novi-pad-control-x-md)] py-2',
    textarea: 'text-[length:var(--novi-text-base)]',
  },
  lg: {
    inputWrapper: 'px-[var(--novi-pad-control-x-lg)] py-2.5',
    textarea: 'text-[length:var(--novi-text-base)]',
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
 * TextArea のスタイル定義。
 *
 * @example
 * import { textareaStyles } from '@novi-ui/raster'
 * import { tv } from 'tailwind-variants'
 *
 * const myTextarea = tv({
 *   extend: textareaStyles,
 *   slots: { textarea: 'font-mono' },
 * })
 */
export const textareaStyles = tv({
  slots,
  variants: { variant, size, radius },
  defaultVariants: { variant: 'outline', size: 'md', radius: 'md' },
})

export type TextareaStyleProps = Parameters<typeof textareaStyles>[0]
