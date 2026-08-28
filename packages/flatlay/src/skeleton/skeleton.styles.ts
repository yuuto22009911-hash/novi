import type {
  NoviRadius,
  SlotMap,
  skeletonRequiredSlots,
  skeletonSlots,
  VariantMap,
} from '@novi-ui/core'
import { tv } from 'tailwind-variants'

const slots = {
  /**
   * 濃さのパルスだけ。シマー（グラデーションを translate させる光沢）は
   * 光源を前提にした表現で、影を持たない Flatlay では成立しない（FR-11）。
   */
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
 * 既定は `none`。場所取りは記入前の空欄そのもので、両テーマのように
 * 中身の角丸を先取りしない（Flatlay の `sm` は 2px なので差は僅かだが、
 * 空欄が角を持たないことは書類の見た目として意味がある）。
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
