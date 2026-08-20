import type { ReactNode } from 'react'
import type { NoviBaseProps } from '../props'
import type { ClassNames } from '../slots'
import type { NoviColor, NoviRadius, NoviSize, NoviVariant } from '../tokens'

/** Badge を構成する部位。`dot` は文言なしで状態だけを示すときに使う。 */
export const badgeSlots = ['root', 'dot', 'label'] as const

export const badgeRequiredSlots = ['root', 'label'] as const

export type BadgeSlot = (typeof badgeSlots)[number]
export type BadgeRequiredSlot = (typeof badgeRequiredSlots)[number]

/**
 * 短いラベルで状態や分類を示す。
 *
 * @keywords バッジ 状態ラベル ステータス表示 badge chip
 *
 * @a11y `dot` は `aria-hidden`。色や点だけで状態を伝えず、必ずテキストでも読めるようにする
 *
 * @example
 * <Badge color="success" variant="soft">公開中</Badge>
 */
export interface BadgeProps extends NoviBaseProps {
  variant?: NoviVariant
  size?: NoviSize
  color?: NoviColor
  radius?: NoviRadius
  /** 先頭にドットを表示する */
  withDot?: boolean
  children?: ReactNode
  classNames?: ClassNames<typeof badgeSlots>
}
