import type { ReactNode } from 'react'
import type { NoviBaseProps } from '../props'
import type { ClassNames } from '../slots'
import type { NoviRadius, NoviVariant } from '../tokens'

/** Card を構成する部位。 */
export const cardSlots = ['root', 'header', 'body', 'footer', 'image'] as const

export const cardRequiredSlots = ['root', 'body'] as const

export type CardSlot = (typeof cardSlots)[number]
export type CardRequiredSlot = (typeof cardRequiredSlots)[number]

/**
 * 情報のまとまりを囲む器。
 *
 * @example
 * <Card>
 *   <CardHeader>売上</CardHeader>
 *   <CardBody>¥1,240,000</CardBody>
 * </Card>
 */
export interface CardProps extends NoviBaseProps {
  variant?: NoviVariant
  radius?: NoviRadius
  /** 押せるカードにする。指定すると role とキーボード操作が付く */
  onPress?: () => void
  isDisabled?: boolean
  children?: ReactNode
  classNames?: ClassNames<typeof cardSlots>
}
