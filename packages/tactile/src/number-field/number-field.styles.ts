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

/**
 * 増減ボタン。**指で押す面**なので、枠の高さいっぱいの正方形にする（40 / 48 / 56px）。
 * 入力欄の左右に置き、親指で届く位置に来る（Raster は右端に細く並べる）。
 * 押した手応えは Button と同じ縮み（scale は押下にだけ許される）。
 */
const stepper = [
  'shrink-0 self-stretch aspect-square inline-flex items-center justify-center',
  'text-[var(--novi-color-fg)]',
  'bg-[var(--novi-color-subtle)]',
  'outline-none',
  'data-[pressed]:scale-[0.97]',
  'motion-reduce:data-[pressed]:scale-100',
  'data-[focus-visible]:bg-[var(--novi-color-border)]',
  'data-[disabled]:opacity-40 data-[disabled]:cursor-default',
  'transition-[background-color,transform]',
  'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
].join(' ')

const slots = {
  root: 'flex flex-col gap-1.5',
  label: 'text-[length:var(--novi-text-sm)] font-medium text-[var(--novi-color-fg)]',
  // Input と同じ持ち上がった面。増減ボタンが左右の縁に付くので、余白は input 側に置く
  inputWrapper: [
    'text-[var(--novi-color-fg)]',
    'flex items-center w-full overflow-hidden',
    'bg-[var(--novi-color-surface)]',
    'shadow-[var(--novi-shadow-sm)]',
    'rounded-[var(--novi-radius-md)]',
    'transition-[opacity,box-shadow]',
    'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
    'data-[invalid]:ring-1 data-[invalid]:ring-[var(--novi-color-danger)]',
    focusRing,
    disabledState,
  ].join(' '),
  input: [
    'w-full min-w-0 bg-transparent outline-none text-center',
    'text-[var(--novi-color-fg)] tabular-nums',
    'placeholder:text-[var(--novi-color-muted)]',
  ].join(' '),
  decrement: stepper,
  increment: stepper,
  description: 'text-[length:var(--novi-text-sm)] text-[var(--novi-color-muted)]',
  // 色だけに頼らずテキストを必ず伴う（WCAG 1.4.1）
  errorMessage: 'text-[length:var(--novi-text-sm)] text-[var(--novi-color-danger)]',
} satisfies SlotMap<typeof numberFieldSlots, (typeof numberFieldRequiredSlots)[number]>

const variant: VariantMap<NoviVariant, { inputWrapper: string }> = {
  solid: { inputWrapper: 'bg-[var(--novi-color-surface)] shadow-[var(--novi-shadow-sm)]' },
  outline: {
    inputWrapper:
      'bg-transparent shadow-[var(--novi-shadow-none)] ring-1 ring-[var(--novi-color-border-strong)]',
  },
  soft: { inputWrapper: 'bg-[var(--novi-color-subtle)] shadow-[var(--novi-shadow-none)]' },
  ghost: { inputWrapper: 'bg-transparent shadow-[var(--novi-shadow-none)]' },
  plain: {
    inputWrapper:
      'bg-transparent shadow-[var(--novi-shadow-none)] rounded-[var(--novi-radius-none)] border-b border-[var(--novi-color-border-strong)]',
  },
}

/** 高さは Button / Input と揃える。40 / 48 / 56px。 */
const size: VariantMap<NoviSize, { inputWrapper: string; input: string }> = {
  sm: {
    inputWrapper: 'h-10',
    input: 'px-[var(--novi-pad-control-x-sm)] text-[length:var(--novi-text-base)]',
  },
  md: {
    inputWrapper: 'h-12',
    input: 'px-[var(--novi-pad-control-x-md)] text-[length:var(--novi-text-base)]',
  },
  lg: {
    inputWrapper: 'h-14',
    input: 'px-[var(--novi-pad-control-x-lg)] text-[length:var(--novi-text-lg)]',
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
 * import { numberFieldStyles } from '@novi-ui/tactile'
 * import { tv } from 'tailwind-variants'
 *
 * const myField = tv({ extend: numberFieldStyles, slots: { input: 'text-left' } })
 */
export const numberFieldStyles = tv({
  slots,
  variants: { variant, size, radius },
  defaultVariants: { variant: 'outline', size: 'md', radius: 'md' },
})

export type NumberFieldStyleProps = Parameters<typeof numberFieldStyles>[0]
