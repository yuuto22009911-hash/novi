import type {
  datePickerRequiredSlots,
  datePickerSlots,
  NoviRadius,
  NoviSize,
  NoviVariant,
  SlotMap,
  VariantMap,
} from '@novi-ui/core'
import { tv } from 'tailwind-variants'
import { disabledState, focusRing } from '../styles/focus-ring'
import { heading, mono, monoNumeric } from '../styles/mono'

/** 月送りは活字の `‹` `›`。押した瞬間だけ反転する */
const monthButton = [
  'inline-flex items-center justify-center h-7 px-[var(--novi-pad-control-x-sm)]',
  `text-[var(--novi-color-muted)] outline-none ${mono}`,
  'hover:text-[var(--novi-color-fg)] hover:bg-[var(--novi-color-subtle)]',
  'data-[pressed]:bg-[var(--novi-color-fg)] data-[pressed]:text-[var(--novi-color-bg)]',
  'data-[disabled]:opacity-40',
  focusRing,
].join(' ')

const slots = {
  root: ['flex flex-col gap-1.5', '[&>[data-novi-inflow]:empty]:hidden'].join(' '),
  label: `text-[length:var(--novi-text-sm)] text-[var(--novi-color-fg)] ${mono}`,
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
  // 帳票の日付欄。等幅で「2026/09/05」の桁が揃う
  dateInput: `flex items-center flex-1 min-w-0 whitespace-nowrap ${monoNumeric}`,
  segment: [
    // 触れる対象として 24px 四方を確保する（WCAG 2.2 target-size）
    'inline-flex items-center justify-center min-w-6 min-h-6 px-0.5 outline-none',
    'data-[placeholder]:text-[var(--novi-color-muted)]',
    'data-[type=literal]:px-0 data-[type=literal]:text-[var(--novi-color-muted)]',
    // フォーカスは反転（スタンプ）
    'data-[focused]:bg-[var(--novi-color-fg)] data-[focused]:text-[var(--novi-color-bg)]',
    'data-[invalid]:text-[var(--novi-color-danger)]',
  ].join(' '),
  // 開くボタンは罫線で区切ったセル
  trigger: [
    'shrink-0 self-stretch inline-flex items-center justify-center',
    'px-[var(--novi-pad-control-x-sm)]',
    `text-[var(--novi-color-muted)] ${mono}`,
    'border-l',
    'outline-none',
    'hover:text-[var(--novi-color-fg)] hover:bg-[var(--novi-color-subtle)]',
    'data-[focus-visible]:text-[var(--novi-color-fg)]',
    'data-[pressed]:bg-[var(--novi-color-fg)] data-[pressed]:text-[var(--novi-color-bg)]',
    'data-[disabled]:opacity-40 data-[disabled]:cursor-default',
    'transition-[background-color,color]',
    'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
  ].join(' '),
  icon: 'shrink-0 leading-none',
  // 浮かないので、面の存在は罫線が引き受ける。押し下げて後続が下がる
  popover: [
    'border border-[var(--novi-color-border-strong)]',
    'bg-[var(--novi-color-bg)] text-[var(--novi-color-fg)]',
    'rounded-[var(--novi-radius-sm)]',
    'p-[var(--novi-pad-surface-y)]',
    'self-start',
  ].join(' '),
  calendar: 'flex flex-col gap-[var(--novi-gap-inline)] outline-none',
  calendarHeader: 'flex items-center justify-between gap-[var(--novi-gap-inline)]',
  calendarTitle: `text-[length:var(--novi-text-sm)] ${heading}`,
  prevButton: monthButton,
  nextButton: monthButton,
  // 升目は縦横の罫線。曜日の見出しは等幅
  calendarGrid: [
    'border-collapse border border-[var(--novi-color-border)]',
    `[&_th]:h-7 [&_th]:w-9 [&_th]:font-normal [&_th]:text-[length:var(--novi-text-xs)] [&_th]:text-[var(--novi-color-muted)] [&_th]:border [&_th]:border-[var(--novi-color-border)] [&_th]:${mono.replace(/ /g, '_')}`,
    '[&_td]:border [&_td]:border-[var(--novi-color-border)] [&_td]:p-0',
  ].join(' '),
  calendarCell: [
    'h-7 w-9 inline-flex items-center justify-center',
    `text-[length:var(--novi-text-sm)] cursor-pointer outline-none ${monoNumeric}`,
    'data-[hovered]:bg-[var(--novi-color-subtle)]',
    'data-[pressed]:bg-[var(--novi-color-fg)] data-[pressed]:text-[var(--novi-color-bg)]',
    'data-[selected]:bg-[var(--novi-color-fg)] data-[selected]:text-[var(--novi-color-bg)]',
    'data-[focus-visible]:outline-2 data-[focus-visible]:-outline-offset-2 data-[focus-visible]:outline-[var(--novi-color-ring)]',
    'data-[disabled]:opacity-40 data-[disabled]:cursor-default',
    'data-[unavailable]:line-through data-[unavailable]:text-[var(--novi-color-muted)]',
    'data-[outside-month]:invisible',
  ].join(' '),
  description: `text-[length:var(--novi-text-sm)] text-[var(--novi-color-muted)] ${mono}`,
  errorMessage: `text-[length:var(--novi-text-sm)] text-[var(--novi-color-danger)] ${mono}`,
} satisfies SlotMap<typeof datePickerSlots, (typeof datePickerRequiredSlots)[number]>

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

/** 高さは行の階級に載せる。28 / 32 / 40px */
const size: VariantMap<NoviSize, { inputWrapper: string; dateInput: string }> = {
  sm: {
    inputWrapper: 'h-7',
    dateInput: 'px-[var(--novi-pad-control-x-sm)] text-[length:var(--novi-text-sm)]',
  },
  md: {
    inputWrapper: 'h-8',
    dateInput: 'px-[var(--novi-pad-control-x-md)] text-[length:var(--novi-text-base)]',
  },
  lg: {
    inputWrapper: 'h-10',
    dateInput: 'px-[var(--novi-pad-control-x-lg)] text-[length:var(--novi-text-base)]',
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
 * DatePicker のスタイル定義。
 *
 * @example
 * import { datePickerStyles } from '@novi-ui/flatlay'
 * import { tv } from 'tailwind-variants'
 *
 * const myPicker = tv({ extend: datePickerStyles, slots: { calendarCell: 'w-10' } })
 */
export const datePickerStyles = tv({
  slots,
  // `variant` は最後に宣言する。先に書くと size のクラスに負ける
  variants: { size, radius, variant },
  defaultVariants: { size: 'md', radius: 'sm', variant: 'outline' },
})

export type DatePickerStyleProps = Parameters<typeof datePickerStyles>[0]
