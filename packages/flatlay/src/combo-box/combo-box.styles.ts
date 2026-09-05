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
import { mono } from '../styles/mono'

const slots = {
  root: [
    'flex flex-col gap-1.5',
    // 展開部の置き場所（`data-novi-inflow`）は閉じている間も残る。flex の gap は
    // 空の子にも掛かるので、畳まないと閉じたまま余白が 1 つ増える（Select と同じ）
    '[&>[data-novi-inflow]:empty]:hidden',
  ].join(' '),
  label: `text-[length:var(--novi-text-sm)] text-[var(--novi-color-fg)] ${mono}`,
  // 記入欄の枠。罫線の幅は全 variant が持ち、色だけを variant が決める
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
  input: [
    'w-full min-w-0 bg-transparent outline-none',
    'text-[var(--novi-color-fg)]',
    'placeholder:text-[var(--novi-color-muted)]',
  ].join(' '),
  // 開くボタンは罫線で区切ったセル。押した瞬間だけ反転する（ADR-F3）
  trigger: [
    'shrink-0 self-stretch inline-flex items-center justify-center',
    'px-[var(--novi-pad-control-x-sm)]',
    'text-[var(--novi-color-muted)]',
    'border-l',
    'outline-none',
    'hover:text-[var(--novi-color-fg)] hover:bg-[var(--novi-color-subtle)]',
    'data-[focus-visible]:text-[var(--novi-color-fg)]',
    'data-[pressed]:bg-[var(--novi-color-fg)] data-[pressed]:text-[var(--novi-color-bg)]',
    'data-[disabled]:opacity-40 data-[disabled]:cursor-default',
    'transition-[background-color,color]',
    'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
  ].join(' '),
  // 開閉の向きは記号で示す。回すのは z 軸の語彙なので、字を差し替える
  icon: `shrink-0 leading-none ${mono}`,
  popover: [
    // ここが構造差そのもの。浮かないので、面の存在は罫線が引き受ける
    'border border-[var(--novi-color-border-strong)]',
    'bg-[var(--novi-color-bg)] text-[var(--novi-color-fg)]',
    'rounded-[var(--novi-radius-sm)]',
    'overflow-hidden',
  ].join(' '),
  listbox: 'outline-none flex flex-col divide-y divide-[var(--novi-color-border)]',
  option: [
    'flex items-center gap-[var(--novi-gap-inline)] px-[var(--novi-pad-control-x-sm)]',
    'cursor-pointer outline-none',
    'text-[var(--novi-color-fg)]',
    'data-[focused]:bg-[var(--novi-color-subtle)]',
    'data-[selected]:font-medium',
    'transition-[background-color,color]',
    'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
    disabledState,
  ].join(' '),
  description: `text-[length:var(--novi-text-sm)] text-[var(--novi-color-muted)] ${mono}`,
  errorMessage: `text-[length:var(--novi-text-sm)] text-[var(--novi-color-danger)] ${mono}`,
} satisfies SlotMap<typeof comboBoxSlots, (typeof comboBoxRequiredSlots)[number]>

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

/** 高さは Button / Input と揃える。28 / 32 / 40px。一覧の行は Select と同じ 24 / 28 / 32px。 */
const size: VariantMap<NoviSize, { inputWrapper: string; input: string; option: string }> = {
  sm: {
    inputWrapper: 'h-7',
    input: 'px-[var(--novi-pad-control-x-sm)] text-[length:var(--novi-text-sm)]',
    option: 'h-6 text-[length:var(--novi-text-sm)]',
  },
  md: {
    inputWrapper: 'h-8',
    input: 'px-[var(--novi-pad-control-x-md)] text-[length:var(--novi-text-base)]',
    option: 'h-7 text-[length:var(--novi-text-base)]',
  },
  lg: {
    inputWrapper: 'h-10',
    input: 'px-[var(--novi-pad-control-x-lg)] text-[length:var(--novi-text-base)]',
    option: 'h-8 text-[length:var(--novi-text-base)]',
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
 * import { comboBoxStyles } from '@novi-ui/flatlay'
 * import { tv } from 'tailwind-variants'
 *
 * const myComboBox = tv({ extend: comboBoxStyles, slots: { option: 'h-8' } })
 */
export const comboBoxStyles = tv({
  slots,
  // `variant` は最後に宣言する。先に書くと size のクラスに負ける
  variants: { size, radius, variant },
  defaultVariants: { size: 'md', radius: 'sm', variant: 'outline' },
})

export type ComboBoxStyleProps = Parameters<typeof comboBoxStyles>[0]

/** 選択済みの印 `▸`。Select と同じ幅の等幅セルに置く。 */
export const optionMarkerClass = `w-[1ch] shrink-0 text-[var(--novi-color-primary)] ${mono}`
