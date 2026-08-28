import type {
  avatarRequiredSlots,
  avatarSlots,
  NoviRadius,
  NoviSize,
  SlotMap,
  VariantMap,
} from '@novi-ui/core'
import { tv } from 'tailwind-variants'
import { mono } from '../styles/mono'

/**
 * Flatlay の Avatar は Radio と並ぶ **`radius-full` の例外**。
 * 人を丸で示す慣習は書類の直角より強い（顔写真の枠だけは角を落とす）。
 *
 * **badge は浮かない。** 両テーマは `absolute` で枠の外に出すが、Flatlay の
 * `position` 例外は Modal と Tooltip の2つで凍結してある（NG1）。
 * 代わりに画像と同じグリッドの升に重ね、枠の**内側**の下端に収める。
 * 重なりの順序は z-index ではなく DOM 順が決める（FR-02）。
 */
const slots = {
  root: [
    'inline-grid shrink-0',
    'bg-[var(--novi-color-subtle)]',
    'border border-[var(--novi-color-border-strong)]',
    'overflow-hidden select-none',
    'text-[var(--novi-color-muted)]',
  ].join(' '),
  image: 'size-full object-cover [grid-area:1/1]',
  // イニシャルは名前の略号なので等幅（ADR-F7）
  fallback: `[grid-area:1/1] place-self-center uppercase tracking-wide ${mono}`,
  // 同じ升に重ね、枠の内側の下端に収める。外へはみ出させない
  badge: '[grid-area:1/1] self-end justify-self-center pb-0.5',
} satisfies SlotMap<typeof avatarSlots, (typeof avatarRequiredSlots)[number]>

/** 28 / 32 / 40px。Button の高さと同じ寸法で、行に混ぜても列が揃う。 */
const size: VariantMap<NoviSize, { root: string }> = {
  sm: { root: 'size-7 text-[length:var(--novi-text-xs)]' },
  md: { root: 'size-8 text-[length:var(--novi-text-sm)]' },
  lg: { root: 'size-10 text-[length:var(--novi-text-base)]' },
}

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
