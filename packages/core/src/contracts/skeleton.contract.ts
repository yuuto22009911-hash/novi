import type { NoviBaseProps } from '../props'
import type { ClassNames } from '../slots'
import type { NoviRadius } from '../tokens'

/** Skeleton を構成する部位。単一要素なので root のみ。 */
export const skeletonSlots = ['root'] as const

export const skeletonRequiredSlots = ['root'] as const

export type SkeletonSlot = (typeof skeletonSlots)[number]
export type SkeletonRequiredSlot = (typeof skeletonRequiredSlots)[number]

/**
 * 読み込み中の場所取り。
 *
 * 支援技術には読ませない（`aria-hidden`）。読み込み状態は Spinner か live region で伝える。
 * `prefers-reduced-motion` が有効なときはアニメーションを減衰させる。
 *
 * @keywords スケルトン 場所取り プレースホルダ skeleton
 *
 * @a11y `aria-hidden` で支援技術には読ませない。読み込み中であることは Spinner か live region で別に伝える
 *
 * @example
 * <Skeleton className="h-4 w-40" />
 */
export interface SkeletonProps extends NoviBaseProps {
  radius?: NoviRadius
  classNames?: ClassNames<typeof skeletonSlots>
}
