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
  // Input と同じ持ち上がった面。開くボタンが右端に付くので、余白は input 側に置く
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
    'w-full min-w-0 bg-transparent outline-none',
    'text-[var(--novi-color-fg)]',
    'placeholder:text-[var(--novi-color-muted)]',
  ].join(' '),
  // 開くボタンは**指で押す面**。枠の高さいっぱいの正方形（NumberField の増減と同じ型）
  trigger: [
    'shrink-0 self-stretch aspect-square inline-flex items-center justify-center',
    'text-[var(--novi-color-muted)]',
    'outline-none',
    'data-[pressed]:scale-[0.97]',
    'motion-reduce:data-[pressed]:scale-100',
    'data-[focus-visible]:bg-[var(--novi-color-subtle)]',
    'data-[disabled]:opacity-40 data-[disabled]:cursor-default',
    'transition-[background-color,transform]',
    'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
  ].join(' '),
  icon: 'shrink-0 inline-flex',
  popover: [
    // ここが Raster との構造差そのもの。入力欄の隣ではなく画面下端に張り付く（Select と同じ）
    '!fixed !top-auto !inset-x-0 !bottom-0 !max-w-none !w-full',
    '!max-h-[70dvh]',
    'bg-[var(--novi-color-surface)]',
    'text-[var(--novi-color-fg)]',
    'rounded-t-[var(--novi-radius-lg)]',
    'shadow-[var(--novi-shadow-lg)]',
    'overflow-auto',
    'pb-[env(safe-area-inset-bottom,0px)]',
    'pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]',
    'data-[entering]:motion-safe:animate-[novi-slide-up_260ms_var(--novi-ease-emphasized)]',
  ].join(' '),
  listbox: 'outline-none p-1.5 flex flex-col',
  option: [
    'flex items-center justify-between gap-[var(--novi-gap-inline)]',
    'px-[var(--novi-pad-control-x-md)] cursor-pointer outline-none',
    'text-[var(--novi-color-fg)]',
    'rounded-[var(--novi-radius-md)]',
    'transition-[background-color] duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
    'data-[focused]:bg-[var(--novi-color-subtle)]',
    'data-[selected]:font-bold',
    disabledState,
  ].join(' '),
  description: 'text-[length:var(--novi-text-sm)] text-[var(--novi-color-muted)]',
  errorMessage: 'text-[length:var(--novi-text-sm)] text-[var(--novi-color-danger)]',
} satisfies SlotMap<typeof comboBoxSlots, (typeof comboBoxRequiredSlots)[number]>

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

/** 高さは Button / Input と揃える。40 / 48 / 56px。一覧の行は 48px 以上。 */
const size: VariantMap<NoviSize, { inputWrapper: string; input: string; option: string }> = {
  sm: {
    inputWrapper: 'h-10',
    input: 'px-[var(--novi-pad-control-x-sm)] text-[length:var(--novi-text-base)]',
    option: 'h-12 text-[length:var(--novi-text-sm)]',
  },
  md: {
    inputWrapper: 'h-12',
    input: 'px-[var(--novi-pad-control-x-md)] text-[length:var(--novi-text-base)]',
    option: 'h-14 text-[length:var(--novi-text-base)]',
  },
  lg: {
    inputWrapper: 'h-14',
    input: 'px-[var(--novi-pad-control-x-lg)] text-[length:var(--novi-text-lg)]',
    option: 'h-16 text-[length:var(--novi-text-base)]',
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
 * import { comboBoxStyles } from '@novi-ui/tactile'
 * import { tv } from 'tailwind-variants'
 *
 * const myComboBox = tv({ extend: comboBoxStyles, slots: { popover: '!max-h-[50dvh]' } })
 */
export const comboBoxStyles = tv({
  slots,
  variants: { variant, size, radius },
  defaultVariants: { variant: 'outline', size: 'md', radius: 'md' },
})

export type ComboBoxStyleProps = Parameters<typeof comboBoxStyles>[0]
