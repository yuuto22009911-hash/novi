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

/** 月送りのボタン。指で押す面なので 44px の正方形 */
const monthButton = [
  'inline-flex items-center justify-center size-11',
  'text-[var(--novi-color-fg)] outline-none',
  'rounded-[var(--novi-radius-full)]',
  'bg-[var(--novi-color-subtle)]',
  'data-[pressed]:scale-[0.97]',
  'motion-reduce:data-[pressed]:scale-100',
  'data-[disabled]:opacity-40',
  focusRing,
].join(' ')

const slots = {
  root: 'flex flex-col gap-1.5',
  label: 'text-[length:var(--novi-text-sm)] font-medium text-[var(--novi-color-fg)]',
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
  dateInput: 'flex items-center flex-1 min-w-0 whitespace-nowrap',
  segment: [
    // 触れる対象として 24px 四方を確保する（WCAG 2.2 target-size）
    'inline-flex items-center justify-center min-w-6 min-h-6 px-1 tabular-nums outline-none',
    'rounded-[var(--novi-radius-sm)]',
    'data-[placeholder]:text-[var(--novi-color-muted)]',
    'data-[type=literal]:px-0 data-[type=literal]:text-[var(--novi-color-muted)]',
    'data-[focused]:bg-[var(--novi-color-primary)] data-[focused]:text-[var(--novi-color-primary-fg)]',
    'data-[invalid]:text-[var(--novi-color-danger)]',
  ].join(' '),
  // 開くボタンは指で押す面。枠の高さいっぱいの正方形
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
    // ここが Raster との構造差そのもの。入力欄の隣ではなく画面下端に張り付く
    '!fixed !top-auto !inset-x-0 !bottom-0 !max-w-none !w-full',
    'bg-[var(--novi-color-surface)]',
    'text-[var(--novi-color-fg)]',
    'rounded-t-[var(--novi-radius-lg)]',
    'shadow-[var(--novi-shadow-lg)]',
    'p-[var(--novi-pad-surface-y)]',
    'pb-[max(var(--novi-pad-surface-y),env(safe-area-inset-bottom,0px))]',
    'pl-[max(var(--novi-pad-surface-x),env(safe-area-inset-left,0px))] pr-[max(var(--novi-pad-surface-x),env(safe-area-inset-right,0px))]',
    'data-[entering]:motion-safe:animate-[novi-slide-up_260ms_var(--novi-ease-emphasized)]',
  ].join(' '),
  // シートの中で中央に置く。升目は指で押せる 44px
  calendar: 'flex flex-col gap-[var(--novi-gap-stack)] items-center outline-none',
  calendarHeader:
    'flex items-center justify-between gap-[var(--novi-gap-inline)] w-full max-w-[22rem]',
  calendarTitle: 'text-[length:var(--novi-text-lg)] font-medium tabular-nums',
  prevButton: monthButton,
  nextButton: monthButton,
  calendarGrid: [
    'border-collapse',
    '[&_th]:size-11 [&_th]:font-normal [&_th]:text-[length:var(--novi-text-sm)] [&_th]:text-[var(--novi-color-muted)]',
  ].join(' '),
  calendarCell: [
    'size-11 inline-flex items-center justify-center',
    'text-[length:var(--novi-text-base)] tabular-nums cursor-pointer outline-none',
    'rounded-[var(--novi-radius-full)]',
    'data-[hovered]:bg-[var(--novi-color-subtle)]',
    'data-[pressed]:scale-[0.97]',
    'motion-reduce:data-[pressed]:scale-100',
    'data-[selected]:bg-[var(--novi-color-primary)] data-[selected]:text-[var(--novi-color-primary-fg)] data-[selected]:font-bold',
    'data-[focus-visible]:outline-2 data-[focus-visible]:-outline-offset-2 data-[focus-visible]:outline-[var(--novi-color-ring)]',
    'data-[disabled]:opacity-40 data-[disabled]:cursor-default',
    'data-[unavailable]:line-through data-[unavailable]:text-[var(--novi-color-muted)]',
    'data-[outside-month]:invisible',
  ].join(' '),
  description: 'text-[length:var(--novi-text-sm)] text-[var(--novi-color-muted)]',
  errorMessage: 'text-[length:var(--novi-text-sm)] text-[var(--novi-color-danger)]',
} satisfies SlotMap<typeof datePickerSlots, (typeof datePickerRequiredSlots)[number]>

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

/** 高さは Button / Input と揃える。40 / 48 / 56px。マスの文字は 16px 以上 */
const size: VariantMap<NoviSize, { inputWrapper: string; dateInput: string }> = {
  sm: {
    inputWrapper: 'h-10',
    dateInput: 'px-[var(--novi-pad-control-x-sm)] text-[length:var(--novi-text-base)]',
  },
  md: {
    inputWrapper: 'h-12',
    dateInput: 'px-[var(--novi-pad-control-x-md)] text-[length:var(--novi-text-base)]',
  },
  lg: {
    inputWrapper: 'h-14',
    dateInput: 'px-[var(--novi-pad-control-x-lg)] text-[length:var(--novi-text-lg)]',
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
 * import { datePickerStyles } from '@novi-ui/tactile'
 * import { tv } from 'tailwind-variants'
 *
 * const myPicker = tv({ extend: datePickerStyles, slots: { calendarCell: 'size-12' } })
 */
export const datePickerStyles = tv({
  slots,
  variants: { variant, size, radius },
  defaultVariants: { variant: 'outline', size: 'md', radius: 'md' },
})

export type DatePickerStyleProps = Parameters<typeof datePickerStyles>[0]
