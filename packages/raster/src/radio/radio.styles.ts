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

const slots = {
  root: ['inline-flex items-start gap-2', 'cursor-pointer', disabledState].join(' '),
  // 円は radius-full を使う数少ない例外。Checkbox（四角）との形の差で
  // 「1つだけ選ぶ」ことを示すため、ここは丸を守る
  control: [
    'shrink-0 inline-grid place-items-center',
    'border border-[var(--novi-color-border-strong)]',
    'rounded-[var(--novi-radius-full)]',
    'bg-[var(--novi-color-bg)]',
    'transition-[border-color]',
    'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
    'group-data-[selected]:border-[var(--c)]',
    'group-data-[invalid]:border-[var(--novi-color-danger)]',
    focusRing,
  ].join(' '),
  // 内側のドットで選択を示す。塗りつぶしにしない
  indicator: 'rounded-[var(--novi-radius-full)] bg-[var(--c)]',
  label: 'text-[var(--novi-color-fg)] leading-[var(--novi-leading-body)]',
  description: 'text-[length:var(--novi-text-xs)] text-[var(--novi-color-muted)]',
} satisfies SlotMap<typeof radioSlots, (typeof radioRequiredSlots)[number]>

const color: VariantMap<NoviColor, { root: string }> = {
  default: { root: '[--c:var(--novi-color-fg)]' },
  primary: { root: '[--c:var(--novi-color-primary)]' },
  secondary: { root: '[--c:var(--novi-color-secondary)]' },
  success: { root: '[--c:var(--novi-color-success)]' },
  warning: { root: '[--c:var(--novi-color-warning)]' },
  danger: { root: '[--c:var(--novi-color-danger)]' },
}

const size: VariantMap<NoviSize, { control: string; indicator: string; label: string }> = {
  sm: { control: 'size-4', indicator: 'size-1.5', label: 'text-[length:var(--novi-text-sm)]' },
  md: { control: 'size-5', indicator: 'size-2', label: 'text-[length:var(--novi-text-base)]' },
  lg: { control: 'size-6', indicator: 'size-2.5', label: 'text-[length:var(--novi-text-base)]' },
}

/**
 * Radio のスタイル定義。
 *
 * @example
 * const myRadio = tv({ extend: radioStyles, slots: { label: 'font-medium' } })
 */
export const radioStyles = tv({
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
