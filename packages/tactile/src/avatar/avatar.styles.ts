import type {
  avatarRequiredSlots,
  avatarSlots,
  NoviRadius,
  NoviSize,
  SlotMap,
  VariantMap,
} from '@novi-ui/core'
import { tv } from 'tailwind-variants'

const slots = {
  root: [
    'relative inline-grid place-items-center shrink-0',
    'bg-[var(--novi-color-subtle)]',
    'shadow-[var(--novi-shadow-sm)]',
    'overflow-hidden select-none',
    'text-[var(--novi-color-muted)] font-medium',
  ].join(' '),
  image: 'size-full object-cover',
  fallback: 'uppercase tracking-wide',
  // 右下に重ねる。地色で縁取りして境目を作る（影を使わない）
  badge: 'absolute -bottom-0.5 -right-0.5 ring-2 ring-[var(--novi-color-bg)]',
} satisfies SlotMap<typeof avatarSlots, (typeof avatarRequiredSlots)[number]>

const size: VariantMap<NoviSize, { root: string }> = {
  sm: { root: 'size-10 text-[length:var(--novi-text-sm)]' },
  md: { root: 'size-12 text-[length:var(--novi-text-base)]' },
  lg: { root: 'size-14 text-[length:var(--novi-text-lg)]' },
}

/** Avatar は `full` を既定にする唯一のコンポーネント。人を表すものは丸で示す慣習に従う。 */
const radius: VariantMap<NoviRadius, { root: string }> = {
  none: { root: 'rounded-[var(--novi-radius-none)]' },
  sm: { root: 'rounded-[var(--novi-radius-sm)]' },
  md: { root: 'rounded-[var(--novi-radius-md)]' },
  lg: { root: 'rounded-[var(--novi-radius-lg)]' },
  full: { root: 'rounded-[var(--novi-radius-full)]' },
}

/**
 * Avatar のスタイル定義。
 *
 * @example
 * const myAvatar = tv({ extend: avatarStyles, slots: { root: 'border-2' } })
 */
export const avatarStyles = tv({
  slots,
  variants: { size, radius },
  defaultVariants: { size: 'md', radius: 'full' },
})

export type AvatarStyleProps = Parameters<typeof avatarStyles>[0]
