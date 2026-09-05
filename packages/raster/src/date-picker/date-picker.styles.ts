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

/** 月送りのボタン。線で区切らず、記号だけを置く */
const monthButton = [
  'inline-flex items-center justify-center size-8',
  'text-[var(--novi-color-muted)] outline-none',
  'rounded-[var(--novi-radius-sm)]',
  'hover:text-[var(--novi-color-fg)] hover:bg-[var(--novi-color-subtle)]',
  'data-[disabled]:opacity-40',
  focusRing,
].join(' ')

const slots = {
  root: 'flex flex-col gap-1.5',
  label: 'text-[length:var(--novi-text-sm)] font-medium text-[var(--novi-color-fg)]',
  // Input と同じ枠。開くボタンを縁まで届かせるため、左右の余白は dateInput 側に置く
  inputWrapper: [
    'text-[var(--novi-color-fg)]',
    'flex items-center w-full overflow-hidden',
    'bg-[var(--novi-color-bg)]',
    'border border-[var(--novi-color-border-strong)]',
    'transition-[border-color,opacity]',
    'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
    'data-[invalid]:border-[var(--novi-color-danger)]',
    focusRing,
    disabledState,
  ].join(' '),
  dateInput: 'flex items-center flex-1 min-w-0 whitespace-nowrap',
  // 年 / 月 / 日の 1 マス。フォーカスは反転で示す（マス自体が小さく、リングでは潰れる）
  segment: [
    // 触れる対象として 24px 四方を確保する（WCAG 2.2 target-size）。文字幅 1〜2 桁のマスが小さくなりすぎる
    'inline-flex items-center justify-center min-w-6 min-h-6 px-0.5 tabular-nums outline-none',
    'rounded-[var(--novi-radius-sm)]',
    'data-[placeholder]:text-[var(--novi-color-muted)]',
    'data-[type=literal]:px-0 data-[type=literal]:text-[var(--novi-color-muted)]',
    'data-[focused]:bg-[var(--novi-color-primary)] data-[focused]:text-[var(--novi-color-primary-fg)]',
    'data-[invalid]:text-[var(--novi-color-danger)]',
  ].join(' '),
  trigger: [
    'shrink-0 self-stretch inline-flex items-center justify-center w-8',
    'text-[var(--novi-color-muted)]',
    'border-l border-[var(--novi-color-border)]',
    'outline-none',
    'hover:text-[var(--novi-color-fg)] hover:bg-[var(--novi-color-subtle)]',
    'data-[focus-visible]:text-[var(--novi-color-fg)]',
    'data-[disabled]:opacity-40 data-[disabled]:cursor-default',
    'transition-[color,background-color]',
    'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
  ].join(' '),
  icon: 'shrink-0 inline-flex',
  // 影を使わず、1px の境界線と背景の差だけで浮かせる（Select と同じ）
  popover: [
    'bg-[var(--novi-color-bg)]',
    'text-[var(--novi-color-fg)]',
    'border border-[var(--novi-color-border)]',
    'rounded-[var(--novi-radius-lg)]',
    'shadow-[var(--novi-shadow-md)]',
    'p-[var(--novi-pad-surface-y)]',
  ].join(' '),
  calendar: 'flex flex-col gap-[var(--novi-gap-inline)] outline-none',
  calendarHeader: 'flex items-center justify-between gap-[var(--novi-gap-inline)]',
  calendarTitle: 'text-[length:var(--novi-text-sm)] font-medium tabular-nums',
  prevButton: monthButton,
  nextButton: monthButton,
  // 曜日の見出しと日の升目。升目は 7 列の正方形
  calendarGrid: [
    'border-collapse',
    '[&_th]:size-8 [&_th]:font-normal [&_th]:text-[length:var(--novi-text-xs)] [&_th]:text-[var(--novi-color-muted)]',
  ].join(' '),
  calendarCell: [
    'size-8 inline-flex items-center justify-center',
    'text-[length:var(--novi-text-sm)] tabular-nums cursor-pointer outline-none',
    'rounded-[var(--novi-radius-sm)]',
    'data-[hovered]:bg-[var(--novi-color-subtle)]',
    'data-[selected]:bg-[var(--novi-color-primary)] data-[selected]:text-[var(--novi-color-primary-fg)]',
    'data-[focus-visible]:outline-2 data-[focus-visible]:-outline-offset-2 data-[focus-visible]:outline-[var(--novi-color-ring)]',
    'data-[disabled]:opacity-40 data-[disabled]:cursor-default',
    'data-[unavailable]:line-through data-[unavailable]:text-[var(--novi-color-muted)]',
    'data-[outside-month]:invisible',
  ].join(' '),
  description: 'text-[length:var(--novi-text-xs)] text-[var(--novi-color-muted)]',
  errorMessage: 'text-[length:var(--novi-text-xs)] text-[var(--novi-color-danger)]',
} satisfies SlotMap<typeof datePickerSlots, (typeof datePickerRequiredSlots)[number]>

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

/** 高さは Button / Input と揃える。32 / 40 / 48px */
const size: VariantMap<NoviSize, { inputWrapper: string; dateInput: string }> = {
  sm: {
    inputWrapper: 'h-8',
    dateInput: 'px-[var(--novi-pad-control-x-sm)] text-[length:var(--novi-text-sm)]',
  },
  md: {
    inputWrapper: 'h-10',
    dateInput: 'px-[var(--novi-pad-control-x-md)] text-[length:var(--novi-text-base)]',
  },
  lg: {
    inputWrapper: 'h-12',
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
 * import { datePickerStyles } from '@novi-ui/raster'
 * import { tv } from 'tailwind-variants'
 *
 * const myPicker = tv({ extend: datePickerStyles, slots: { calendarCell: 'size-9' } })
 */
export const datePickerStyles = tv({
  slots,
  variants: { variant, size, radius },
  defaultVariants: { variant: 'outline', size: 'md', radius: 'md' },
})

export type DatePickerStyleProps = Parameters<typeof datePickerStyles>[0]
