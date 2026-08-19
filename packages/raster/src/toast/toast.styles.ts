import type {
  NoviColor,
  NoviRadius,
  SlotMap,
  toastRequiredSlots,
  toastSlots,
  VariantMap,
} from '@novi-ui/core'
import { tv } from 'tailwind-variants'
import { focusRing } from '../styles/focus-ring'

const slots = {
  // 右下に固定する。操作の起点から遠く、視線移動が最小になる位置
  region: 'fixed bottom-4 right-4 z-50 flex flex-col gap-2 outline-none max-w-sm',
  root: [
    'flex items-start gap-3 px-4 py-3 outline-none',
    'bg-[var(--novi-color-bg)]',
    'border border-[var(--novi-color-border-strong)]',
    'shadow-none',
    'data-[entering]:motion-safe:animate-[novi-fade-in_120ms_ease-out]',
  ].join(' '),
  icon: 'shrink-0 mt-0.5 text-[var(--c)]',
  content: 'flex-1 min-w-0 flex flex-col gap-0.5',
  title: 'font-medium text-[var(--novi-color-fg)]',
  description:
    'text-[length:var(--novi-text-sm)] text-[var(--novi-color-muted)] leading-[var(--novi-leading-body)]',
  closeButton: [
    'shrink-0 grid place-items-center size-6 -mr-1',
    'text-[var(--novi-color-muted)] hover:text-[var(--novi-color-fg)]',
    'transition-colors duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
    focusRing,
  ].join(' '),
  action: 'shrink-0',
} satisfies SlotMap<typeof toastSlots, (typeof toastRequiredSlots)[number]>

const color: VariantMap<NoviColor, { root: string }> = {
  default: { root: '[--c:var(--novi-color-fg)]' },
  primary: { root: '[--c:var(--novi-color-primary)]' },
  secondary: { root: '[--c:var(--novi-color-secondary)]' },
  success: { root: '[--c:var(--novi-color-success)] border-l-[var(--novi-color-success)]' },
  warning: { root: '[--c:var(--novi-color-warning)] border-l-[var(--novi-color-warning)]' },
  danger: { root: '[--c:var(--novi-color-danger)] border-l-[var(--novi-color-danger)]' },
}

const radius: VariantMap<NoviRadius, { root: string }> = {
  none: { root: 'rounded-[var(--novi-radius-none)]' },
  sm: { root: 'rounded-[var(--novi-radius-sm)]' },
  md: { root: 'rounded-[var(--novi-radius-md)]' },
  lg: { root: 'rounded-[var(--novi-radius-lg)]' },
  full: { root: 'rounded-[var(--novi-radius-full)]' },
}

/**
 * Toast のスタイル定義。
 *
 * @example
 * const myToast = tv({ extend: toastStyles, slots: { region: 'bottom-8' } })
 */
export const toastStyles = tv({
  slots,
  variants: { color, radius },
  defaultVariants: { color: 'default', radius: 'none' },
})

export type ToastStyleProps = Parameters<typeof toastStyles>[0]
