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
    'bg-[var(--novi-color-surface)]',
    'shadow-[var(--novi-shadow-sm)]',
    'rounded-[var(--novi-radius-md)]',
    'transition-[opacity,box-shadow]',
    'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
    'data-[invalid]:ring-1 data-[invalid]:ring-[var(--novi-color-danger)]',
    focusRing,
    disabledState,
  ].join(' '),
  textarea: [
    'w-full min-w-0 bg-transparent outline-none',
    'text-[var(--novi-color-fg)]',
    'placeholder:text-[var(--novi-color-muted)]',
    // 横に伸ばすとレイアウトが崩れるので縦のみ許可する
    'resize-y',
    // 指で書く前提なので最低でも3行ぶんの高さを確保する
    'min-h-24',
    'leading-[var(--novi-leading-body)]',
  ].join(' '),
  // 文字数カウンタもここに置く。専用 slot を増やさない
  description: 'text-[length:var(--novi-text-sm)] text-[var(--novi-color-muted)]',
  errorMessage: 'text-[length:var(--novi-text-sm)] text-[var(--novi-color-danger)]',
} satisfies SlotMap<typeof textareaSlots, (typeof textareaRequiredSlots)[number]>

/** Input と同じ解釈。面の重さで5段を作る（境界線ではなく影と背景で区別する）。 */
const variant: VariantMap<NoviVariant, { inputWrapper: string }> = {
  solid: { inputWrapper: 'bg-[var(--novi-color-surface)] shadow-[var(--novi-shadow-sm)]' },
  outline: {
    inputWrapper:
      'bg-transparent shadow-[var(--novi-shadow-none)] ring-1 ring-[var(--novi-color-border-strong)]',
  },
  soft: { inputWrapper: 'bg-[var(--novi-color-subtle)] shadow-[var(--novi-shadow-none)]' },
  ghost: { inputWrapper: 'bg-transparent shadow-[var(--novi-shadow-none)]' },
  plain: { inputWrapper: 'bg-transparent shadow-[var(--novi-shadow-none)] px-0' },
}

/** 1行入力と違い高さは固定しない。余白と文字サイズだけを段階で変える。 */
const size: VariantMap<NoviSize, { inputWrapper: string; textarea: string }> = {
  // 入力の文字は全段 base(17px)。16px を割ると iOS Safari が自動ズームする
  sm: { inputWrapper: 'px-3 py-2', textarea: 'text-[length:var(--novi-text-base)]' },
  md: { inputWrapper: 'px-4 py-3', textarea: 'text-[length:var(--novi-text-base)]' },
  lg: { inputWrapper: 'px-5 py-4', textarea: 'text-[length:var(--novi-text-base)]' },
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
 * import { textareaStyles } from '@novi-ui/tactile'
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
