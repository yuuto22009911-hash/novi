import type {
  NoviRadius,
  popoverRequiredSlots,
  popoverSlots,
  SlotMap,
  tooltipRequiredSlots,
  tooltipSlots,
  VariantMap,
} from '@novi-ui/core'
import { tv } from 'tailwind-variants'

const slots = {
  root: [
    'text-[var(--novi-color-fg)]',
    'outline-none',
    'bg-[var(--novi-color-bg)]',
    'ring-1 ring-[var(--novi-color-border)]',
    'shadow-[var(--novi-shadow-md)]',
    'data-[entering]:motion-safe:animate-[novi-fade-in_120ms_ease-out]',
  ].join(' '),
  // Raster では arrow を描画しない。任意 slot を省略する実例
  arrow: 'hidden',
  content: [
    'px-[var(--novi-pad-surface-x)] py-[var(--novi-pad-surface-y)]',
    'text-[var(--novi-color-fg)] leading-[var(--novi-leading-body)]',
  ].join(' '),
} satisfies SlotMap<typeof popoverSlots, (typeof popoverRequiredSlots)[number]>

const radius: VariantMap<NoviRadius, { root: string }> = {
  none: { root: 'rounded-[var(--novi-radius-none)]' },
  sm: { root: 'rounded-[var(--novi-radius-sm)]' },
  md: { root: 'rounded-[var(--novi-radius-md)]' },
  lg: { root: 'rounded-[var(--novi-radius-lg)]' },
  full: { root: 'rounded-[var(--novi-radius-full)]' },
}

/**
 * Popover のスタイル定義。
 *
 * @example
 * const myPopover = tv({ extend: popoverStyles, slots: { content: 'p-6' } })
 */
export const popoverStyles = tv({
  slots,
  variants: { radius },
  defaultVariants: { radius: 'lg' },
})

/**
 * Tooltip のスタイル定義。
 *
 * Popover と違い**反転色**（暗い面に明るい文字）で出す。
 * 補足であって操作対象ではない、という区別を色で伝える。
 */
export const tooltipStyles = tv({
  slots: {
    root: [
      'outline-none max-w-xs',
      'bg-[var(--novi-color-fg)] text-[var(--novi-color-bg)]',
      'border border-transparent',
      'rounded-[var(--novi-radius-sm)]',
      'shadow-[var(--novi-shadow-md)]',
      'data-[entering]:motion-safe:animate-[novi-fade-in_120ms_ease-out]',
    ].join(' '),
    arrow: 'hidden',
    // 補足の小片であって面ではないので、上下は面の余白を使わない。
    // 横だけコントロール段の余白に揃えると、隣接するボタンと縁が並んで見える
    content: [
      'px-[var(--novi-pad-control-x-sm)] py-1.5',
      'text-[length:var(--novi-text-xs)] leading-snug',
    ].join(' '),
  } satisfies SlotMap<typeof tooltipSlots, (typeof tooltipRequiredSlots)[number]>,
})

export type PopoverStyleProps = Parameters<typeof popoverStyles>[0]
export type TooltipStyleProps = Parameters<typeof tooltipStyles>[0]
