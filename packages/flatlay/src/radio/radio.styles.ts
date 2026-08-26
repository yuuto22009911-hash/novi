import type {
  NoviColor,
  NoviSize,
  radioGroupRequiredSlots,
  radioGroupSlots,
  radioRequiredSlots,
  radioSlots,
  SlotMap,
  VariantMap,
} from '@novi-ui/core'
import { tv } from 'tailwind-variants'
import { disabledState, focusRing } from '../styles/focus-ring'
import { mono } from '../styles/mono'

/**
 * Flatlay の Radio は**円**。書類の直角（radius 0/2/2/4）に対する数少ない例外。
 *
 * ここで角を守ると Checkbox と同じ形になり、「複数選べる」のか
 * 「1つだけ」なのかが形から読めなくなる。角丸の規律より**形の弁別**が優先する。
 * Avatar と並ぶ `radius-full` の例外で、どちらも意味を形が担っている。
 *
 * 印が Checkbox のような文字ではなく塗りの点なのは、円の中に字を置くと
 * 小さすぎて読めないため。ここだけは記号ではなく面が状態を持つ。
 */
const slots = {
  root: ['inline-flex items-start gap-2', 'cursor-pointer', disabledState].join(' '),
  control: [
    'shrink-0 inline-grid place-items-center',
    'border border-[var(--novi-color-border-strong)]',
    'rounded-[var(--novi-radius-full)]',
    'bg-[var(--novi-color-bg)]',
    'group-data-[selected]:border-[var(--c)]',
    'group-data-[invalid]:border-[var(--novi-color-danger)]',
    'transition-[border-color]',
    'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
    focusRing,
  ].join(' '),
  // 内側の点で示す。枠ごと塗り潰すと Checkbox の選択と同じ見え方になる
  indicator: 'rounded-[var(--novi-radius-full)] bg-[var(--c)]',
  label: 'text-[var(--novi-color-fg)] leading-[var(--novi-leading-body)]',
  description: `text-[length:var(--novi-text-sm)] text-[var(--novi-color-muted)] ${mono}`,
} satisfies SlotMap<typeof radioSlots, (typeof radioRequiredSlots)[number]>

const color: VariantMap<NoviColor, { root: string }> = {
  default: { root: '[--c:var(--novi-color-fg)]' },
  primary: { root: '[--c:var(--novi-color-primary)]' },
  secondary: { root: '[--c:var(--novi-color-secondary)]' },
  success: { root: '[--c:var(--novi-color-success)]' },
  warning: { root: '[--c:var(--novi-color-warning)]' },
  danger: { root: '[--c:var(--novi-color-danger)]' },
}

/** Checkbox と同じ 14 / 16 / 20px。並べたときに列が揃わないと帳票として読めない。 */
const size: VariantMap<NoviSize, { control: string; indicator: string; label: string }> = {
  sm: { control: 'size-3.5', indicator: 'size-1.5', label: 'text-[length:var(--novi-text-sm)]' },
  md: { control: 'size-4', indicator: 'size-2', label: 'text-[length:var(--novi-text-base)]' },
  lg: { control: 'size-5', indicator: 'size-2.5', label: 'text-[length:var(--novi-text-base)]' },
}

/**
 * Radio のスタイル定義。
 *
 * @example
 * import { radioStyles } from '@novi-ui/flatlay'
 * import { tv } from 'tailwind-variants'
 *
 * const myRadio = tv({ extend: radioStyles, slots: { label: 'font-medium' } })
 */
export const radioStyles = tv({
  slots,
  variants: { color, size },
  defaultVariants: { color: 'default', size: 'md' },
})

const groupSlots = {
  root: 'flex flex-col gap-2',
  // 項目名は等幅（Input / CheckboxGroup と同じ扱い・ADR-F7）
  label: `text-[length:var(--novi-text-sm)] text-[var(--novi-color-fg)] ${mono}`,
  list: 'flex flex-col gap-2',
  description: `text-[length:var(--novi-text-sm)] text-[var(--novi-color-muted)] ${mono}`,
  errorMessage: `text-[length:var(--novi-text-sm)] text-[var(--novi-color-danger)] ${mono}`,
} satisfies SlotMap<typeof radioGroupSlots, (typeof radioGroupRequiredSlots)[number]>

/**
 * RadioGroup のスタイル定義。
 *
 * @example
 * const myGroup = tv({ extend: radioGroupStyles, slots: { list: 'gap-4' } })
 */
export const radioGroupStyles = tv({
  slots: groupSlots,
  variants: {
    orientation: {
      vertical: { list: 'flex-col gap-2' },
      horizontal: { list: 'flex-row gap-4 flex-wrap' },
    },
  },
  defaultVariants: { orientation: 'vertical' },
})

export type RadioStyleProps = Parameters<typeof radioStyles>[0]
export type RadioGroupStyleProps = Parameters<typeof radioGroupStyles>[0]
