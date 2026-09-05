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
import { mono, monoNumeric } from '../styles/mono'

/**
 * 増減ボタン。**罫線で区切ったセル**に等幅の `−` `+` を置く（ADR-F7）。
 * 面も影も持たず、押した瞬間だけ反転する（スタンプ。ADR-F3）。
 * 記号は文字で描く。帳票の語彙は活字であって図形ではない。
 */
const stepper = [
  'shrink-0 self-stretch inline-flex items-center justify-center',
  'px-[var(--novi-pad-control-x-sm)]',
  'text-[var(--novi-color-muted)]',
  'border-l',
  'outline-none',
  monoNumeric,
  'hover:text-[var(--novi-color-fg)] hover:bg-[var(--novi-color-subtle)]',
  'data-[focus-visible]:text-[var(--novi-color-fg)]',
  'data-[pressed]:bg-[var(--novi-color-fg)] data-[pressed]:text-[var(--novi-color-bg)]',
  'data-[disabled]:opacity-40 data-[disabled]:cursor-default',
  'transition-[background-color,color]',
  'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
].join(' ')

const slots = {
  root: 'flex flex-col gap-1.5',
  label: `text-[length:var(--novi-text-sm)] text-[var(--novi-color-fg)] ${mono}`,
  /**
   * 記入欄の枠。罫線の幅は全 variant が持ち、色だけを variant が決める（Flatlay の型）。
   * 増減セルの縦罫線も同じ色を継ぐので、`border-color` は枠にだけ書く。
   */
  inputWrapper: [
    'flex items-center w-full overflow-hidden',
    'text-[var(--novi-color-fg)]',
    'border',
    'rounded-[var(--novi-radius-sm)]',
    'data-[invalid]:border-[var(--novi-color-danger)]',
    'transition-[border-color,opacity]',
    'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
    focusRing,
    disabledState,
  ].join(' '),
  // 数値は右詰めの等幅。帳票の金額欄と同じ
  input: [
    'w-full min-w-0 bg-transparent outline-none text-right',
    `text-[var(--novi-color-fg)] ${monoNumeric}`,
    'placeholder:text-[var(--novi-color-muted)]',
  ].join(' '),
  decrement: stepper,
  increment: stepper,
  description: `text-[length:var(--novi-text-sm)] text-[var(--novi-color-muted)] ${mono}`,
  // 色だけに頼らずテキストを必ず伴う（WCAG 1.4.1）
  errorMessage: `text-[length:var(--novi-text-sm)] text-[var(--novi-color-danger)] ${mono}`,
} satisfies SlotMap<typeof numberFieldSlots, (typeof numberFieldRequiredSlots)[number]>

const variant: VariantMap<NoviVariant, { inputWrapper: string }> = {
  solid: {
    inputWrapper: 'bg-[var(--novi-color-surface)] border-[var(--novi-color-border-strong)]',
  },
  outline: { inputWrapper: 'bg-transparent border-[var(--novi-color-border-strong)]' },
  soft: { inputWrapper: 'bg-[var(--novi-color-subtle)] border-[var(--novi-color-border)]' },
  ghost: {
    inputWrapper: 'bg-transparent border-transparent border-b-[var(--novi-color-border-strong)]',
  },
  plain: { inputWrapper: 'bg-transparent border-transparent' },
}

/** 高さは Button / Input と揃える。28 / 32 / 40px。 */
const size: VariantMap<NoviSize, { inputWrapper: string; input: string }> = {
  sm: {
    inputWrapper: 'h-7',
    input: 'px-[var(--novi-pad-control-x-sm)] text-[length:var(--novi-text-sm)]',
  },
  md: {
    inputWrapper: 'h-8',
    input: 'px-[var(--novi-pad-control-x-md)] text-[length:var(--novi-text-base)]',
  },
  lg: {
    inputWrapper: 'h-10',
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
 * import { numberFieldStyles } from '@novi-ui/flatlay'
 * import { tv } from 'tailwind-variants'
 *
 * const myField = tv({ extend: numberFieldStyles, slots: { input: 'text-left' } })
 */
export const numberFieldStyles = tv({
  slots,
  // `variant` は最後に宣言する。先に書くと size のクラスに負ける
  variants: { size, radius, variant },
  defaultVariants: { size: 'md', radius: 'sm', variant: 'outline' },
})

export type NumberFieldStyleProps = Parameters<typeof numberFieldStyles>[0]
