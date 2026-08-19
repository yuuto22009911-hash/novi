import type { ReactNode } from 'react'
import type { NoviBaseProps } from '../props'
import type { ClassNames } from '../slots'
import type { NoviPlacement } from './popover.contract'

/** Tooltip を構成する部位。 */
export const tooltipSlots = ['root', 'arrow', 'content'] as const

export const tooltipRequiredSlots = ['root', 'content'] as const

export type TooltipSlot = (typeof tooltipSlots)[number]
export type TooltipRequiredSlot = (typeof tooltipRequiredSlots)[number]

/**
 * 要素の補足説明。ホバーとフォーカスの両方で開く。
 *
 * ツールチップだけに情報を置かない。触れないと読めないため、
 * 操作に必須の情報は本文かラベルに書く。
 *
 * @example
 * <Tooltip content="コピーする">
 *   <Button>複製</Button>
 * </Tooltip>
 */
export interface TooltipProps extends NoviBaseProps {
  content?: ReactNode
  placement?: NoviPlacement
  offset?: number
  /** 開くまでの遅延（ミリ秒） */
  delay?: number
  isOpen?: boolean
  defaultOpen?: boolean
  onOpenChange?: (isOpen: boolean) => void
  isDisabled?: boolean
  children?: ReactNode
  classNames?: ClassNames<typeof tooltipSlots>
}
