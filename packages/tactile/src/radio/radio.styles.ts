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
import { tapTarget } from '../styles/tap-target'

/**
 * Checkbox と同じく、視覚寸法とタップ寸法を分ける（AC-01-5）。
 * 行全体を押せるようにするのは、指がラベルに落ちても切り替わるようにするため。
 */
const slots = {
  root: [
    'inline-flex items-center gap-3 min-h-12 py-1',
    'cursor-pointer',
    tapTarget,
    disabledState,
  ].join(' '),
  // 円は radius-full を使う数少ない例外。Checkbox（四角）との形の差で
  // 「1つだけ選ぶ」ことを示すため、ここは丸を守る
  control: [
    'shrink-0 inline-grid place-items-center',
    'ring-1 ring-[var(--novi-color-border-strong)]',
    'rounded-[var(--novi-radius-full)]',
    'bg-[var(--novi-color-surface)]',
    'transition-[box-shadow,scale]',
    'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
    'group-data-[pressed]:scale-[0.92] motion-reduce:group-data-[pressed]:scale-100',
    'group-data-[selected]:ring-[var(--c)]',
    'group-data-[invalid]:ring-[var(--novi-color-danger)]',
    focusRing,
  ].join(' '),
  // 内側のドットで選択を示す。塗りつぶしにしない
  indicator: 'rounded-[var(--novi-radius-full)] bg-[var(--c)]',
  label: 'text-[var(--novi-color-fg)] leading-[var(--novi-leading-body)]',
  description: 'text-[length:var(--novi-text-sm)] text-[var(--novi-color-muted)]',
} satisfies SlotMap<typeof radioSlots, (typeof radioRequiredSlots)[number]>

const color: VariantMap<NoviColor, { root: string }> = {
  default: { root: '[--c:var(--novi-color-fg)]' },
  primary: { root: '[--c:var(--novi-color-primary)]' },
  secondary: { root: '[--c:var(--novi-color-secondary)]' },
  success: { root: '[--c:var(--novi-color-success)]' },
  warning: { root: '[--c:var(--novi-color-warning)]' },
  danger: { root: '[--c:var(--novi-color-danger)]' },
}

/** 視覚寸法。当たり判定は root の tapTarget が 44px を保つ。 */
const size: VariantMap<NoviSize, { control: string; indicator: string; label: string }> = {
  sm: { control: 'size-5', indicator: 'size-2', label: 'text-[length:var(--novi-text-sm)]' },
  md: { control: 'size-6', indicator: 'size-2.5', label: 'text-[length:var(--novi-text-base)]' },
  lg: { control: 'size-7', indicator: 'size-3', label: 'text-[length:var(--novi-text-base)]' },
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
  description: 'text-[length:var(--novi-text-sm)] text-[var(--novi-color-muted)]',
  errorMessage: 'text-[length:var(--novi-text-sm)] text-[var(--novi-color-danger)]',
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
