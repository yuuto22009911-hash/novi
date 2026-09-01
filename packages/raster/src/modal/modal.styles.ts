import type {
  modalRequiredSlots,
  modalSlots,
  NoviRadius,
  NoviSize,
  SlotMap,
  VariantMap,
} from '@novi-ui/core'
import { tv } from 'tailwind-variants'
import { focusRing } from '../styles/focus-ring'

/**
 * Raster の Modal は **中央配置・閉じるボタンはヘッダー右上**（architecture.md §5 テーマA）。
 *
 * 影を使わないので、階層は backdrop の暗転と 1px の境界線だけで作る。
 */
const slots = {
  backdrop: [
    // 画面端とパネルの距離。panel / full の max-h が引く 2rem はこの値の 2 倍を指す
    'fixed inset-0 z-50 grid place-items-center p-[var(--novi-pad-surface-y)]',
    'bg-[var(--novi-color-overlay)]',
    'data-[entering]:motion-safe:animate-[novi-fade-in_120ms_ease-out]',
  ].join(' '),
  panel: [
    'text-[var(--novi-color-fg)]',
    'w-full outline-none',
    'bg-[var(--novi-color-bg)]',
    'border border-[var(--novi-color-border-strong)]',
    'shadow-[var(--novi-shadow-lg)]',
    'max-h-[calc(100dvh-2rem)] overflow-auto',
  ].join(' '),
  // 見出しと閉じるを同じ行に置く。情報の階層を横方向で作る
  header: [
    'flex items-baseline justify-between gap-[var(--novi-gap-inline)]',
    'px-[var(--novi-pad-surface-x)] py-[var(--novi-pad-surface-y)]',
    'border-b border-[var(--novi-color-border)]',
  ].join(' '),
  title: [
    'text-[length:var(--novi-text-lg)] font-medium',
    'font-[family-name:var(--novi-font-heading)]',
    'tracking-[var(--novi-tracking-tight)] leading-[var(--novi-leading-heading)]',
    'text-[var(--novi-color-fg)]',
  ].join(' '),
  closeButton: [
    'shrink-0 grid place-items-center size-8 -mr-2',
    'text-[var(--novi-color-muted)] hover:text-[var(--novi-color-fg)]',
    'transition-colors duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
    focusRing,
  ].join(' '),
  body: [
    'px-[var(--novi-pad-surface-x)] py-[var(--novi-pad-surface-y)]',
    'text-[var(--novi-color-fg)] leading-[var(--novi-leading-body)]',
  ].join(' '),
  footer: [
    'flex justify-end gap-[var(--novi-gap-inline)]',
    'px-[var(--novi-pad-surface-x)] py-[var(--novi-pad-surface-y)]',
    'border-t border-[var(--novi-color-border)]',
  ].join(' '),
} satisfies SlotMap<typeof modalSlots, (typeof modalRequiredSlots)[number]>

const size: VariantMap<NoviSize | 'full', { panel: string }> = {
  sm: { panel: 'max-w-sm' },
  md: { panel: 'max-w-md' },
  lg: { panel: 'max-w-lg' },
  full: { panel: 'max-w-none h-[calc(100dvh-2rem)]' },
}

const radius: VariantMap<NoviRadius, { panel: string }> = {
  none: { panel: 'rounded-[var(--novi-radius-none)]' },
  sm: { panel: 'rounded-[var(--novi-radius-sm)]' },
  md: { panel: 'rounded-[var(--novi-radius-md)]' },
  lg: { panel: 'rounded-[var(--novi-radius-lg)]' },
  full: { panel: 'rounded-[var(--novi-radius-full)]' },
}

/**
 * Modal のスタイル定義。
 *
 * @example
 * const myModal = tv({ extend: modalStyles, slots: { panel: 'border-2' } })
 */
export const modalStyles = tv({
  slots,
  variants: { size, radius },
  defaultVariants: { size: 'md', radius: 'lg' },
})

export type ModalStyleProps = Parameters<typeof modalStyles>[0]
