import type {
  NoviRadius,
  SlotMap,
  skeletonRequiredSlots,
  skeletonSlots,
  VariantMap,
} from '@novi-ui/core'
import { tv } from 'tailwind-variants'

const slots = {
  // opacity のパルスのみ。シマー（translate するグラデーション）は使わない。
  // 動きで飾らないという Raster の原則に反するため。
  root: 'block bg-[var(--novi-color-subtle)] motion-safe:animate-pulse',
} satisfies SlotMap<typeof skeletonSlots, (typeof skeletonRequiredSlots)[number]>

const radius: VariantMap<NoviRadius, { root: string }> = {
  none: { root: 'rounded-[var(--novi-radius-none)]' },
  sm: { root: 'rounded-[var(--novi-radius-sm)]' },
  md: { root: 'rounded-[var(--novi-radius-md)]' },
  lg: { root: 'rounded-[var(--novi-radius-lg)]' },
  full: { root: 'rounded-[var(--novi-radius-full)]' },
}

/**
 * Skeleton のスタイル定義。
 *
 * @example
 * const mySkeleton = tv({ extend: skeletonStyles, slots: { root: 'opacity-50' } })
 */
export const skeletonStyles = tv({
  slots,
  variants: { radius },
  defaultVariants: { radius: 'none' },
})

export type SkeletonStyleProps = Parameters<typeof skeletonStyles>[0]
