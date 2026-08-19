import type {
  NoviRadius,
  NoviSize,
  NoviVariant,
  SlotMap,
  selectRequiredSlots,
  selectSlots,
  VariantMap,
} from '@novi-ui/core'
import { tv } from 'tailwind-variants'
import { disabledState, focusRing } from '../styles/focus-ring'

const slots = {
  root: 'flex flex-col gap-1.5',
  label: 'text-[length:var(--novi-text-sm)] font-medium text-[var(--novi-color-fg)]',
  trigger: [
    'flex items-center justify-between gap-2 w-full',
    'text-left',
    'bg-[var(--novi-color-bg)]',
    'border border-[var(--novi-color-border-strong)]',
    'transition-[border-color,opacity]',
    'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
    'group-data-[invalid]:border-[var(--novi-color-danger)]',
    focusRing,
    disabledState,
  ].join(' '),
  value: [
    'truncate text-[var(--novi-color-fg)]',
    // 未選択時のプレースホルダは補助色にする
    'data-[placeholder]:text-[var(--novi-color-muted)]',
  ].join(' '),
  icon: 'shrink-0 text-[var(--novi-color-muted)]',
  // 影を使わず、1px の境界線と背景の差だけで浮かせる
  popover: [
    'bg-[var(--novi-color-bg)]',
    'border border-[var(--novi-color-border)]',
    'rounded-[var(--novi-radius-none)]',
    'shadow-none',
    // トリガーと同じ幅に揃える
    'w-[var(--trigger-width)]',
    'overflow-auto max-h-64',
  ].join(' '),
  listbox: 'outline-none p-1 flex flex-col',
  option: [
    'flex items-center justify-between gap-2',
    'px-2 py-1.5 cursor-pointer outline-none',
    'text-[var(--novi-color-fg)]',
    'rounded-[var(--novi-radius-none)]',
    // 選択中は面ではなく文字の強さで示す。面を増やさない
    'data-[focused]:bg-[var(--novi-color-subtle)]',
    'data-[selected]:font-medium',
    'data-[disabled]:opacity-40 data-[disabled]:cursor-default',
  ].join(' '),
  description: 'text-[length:var(--novi-text-xs)] text-[var(--novi-color-muted)]',
  errorMessage: 'text-[length:var(--novi-text-xs)] text-[var(--novi-color-danger)]',
} satisfies SlotMap<typeof selectSlots, (typeof selectRequiredSlots)[number]>

const variant: VariantMap<NoviVariant, { trigger: string }> = {
  solid: { trigger: 'bg-[var(--novi-color-subtle)] border-[var(--novi-color-border-strong)]' },
  outline: { trigger: 'bg-[var(--novi-color-bg)] border-[var(--novi-color-border-strong)]' },
  soft: { trigger: 'bg-[var(--novi-color-subtle)] border-transparent' },
  ghost: {
    trigger: 'bg-transparent border-transparent border-b-[var(--novi-color-border-strong)]',
  },
  plain: { trigger: 'bg-transparent border-transparent' },
}

/** 高さは Button / Input と揃える。32 / 40 / 48px。 */
const size: VariantMap<NoviSize, { trigger: string; option: string }> = {
  sm: {
    trigger: 'h-8 px-2.5 text-[length:var(--novi-text-sm)]',
    option: 'text-[length:var(--novi-text-sm)]',
  },
  md: {
    trigger: 'h-10 px-3 text-[length:var(--novi-text-base)]',
    option: 'text-[length:var(--novi-text-base)]',
  },
  lg: {
    trigger: 'h-12 px-3.5 text-[length:var(--novi-text-base)]',
    option: 'text-[length:var(--novi-text-base)]',
  },
}

const radius: VariantMap<NoviRadius, { trigger: string }> = {
  none: { trigger: 'rounded-[var(--novi-radius-none)]' },
  sm: { trigger: 'rounded-[var(--novi-radius-sm)]' },
  md: { trigger: 'rounded-[var(--novi-radius-md)]' },
  lg: { trigger: 'rounded-[var(--novi-radius-lg)]' },
  full: { trigger: 'rounded-[var(--novi-radius-full)]' },
}

/**
 * Select のスタイル定義。
 *
 * @example
 * import { selectStyles } from '@novi-ui/raster'
 * import { tv } from 'tailwind-variants'
 *
 * const mySelect = tv({ extend: selectStyles, slots: { popover: 'max-h-96' } })
 */
export const selectStyles = tv({
  slots,
  variants: { variant, size, radius },
  defaultVariants: { variant: 'outline', size: 'md', radius: 'none' },
})

export type SelectStyleProps = Parameters<typeof selectStyles>[0]
