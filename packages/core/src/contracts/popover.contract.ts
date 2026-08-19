import type { ReactNode } from 'react'
import type { NoviBaseProps } from '../props'
import type { ClassNames } from '../slots'
import type { NoviRadius } from '../tokens'

/** Popover を構成する部位。`arrow` は任意なので、描画しないテーマがあってよい。 */
export const popoverSlots = ['root', 'arrow', 'content'] as const

export const popoverRequiredSlots = ['root', 'content'] as const

export type PopoverSlot = (typeof popoverSlots)[number]
export type PopoverRequiredSlot = (typeof popoverRequiredSlots)[number]

/** 配置。RTL では left / right が自動で反転する。 */
export type NoviPlacement = 'top' | 'bottom' | 'start' | 'end' | 'left' | 'right'

/**
 * トリガーに紐づいて浮かぶ小さな面。Escape で閉じてトリガーへフォーカスが戻る。
 *
 * @example
 * <Popover placement="bottom">
 *   <Button>詳細</Button>
 *   <PopoverContent>ここに補足を書く</PopoverContent>
 * </Popover>
 */
export interface PopoverProps extends NoviBaseProps {
  radius?: NoviRadius
  placement?: NoviPlacement
  offset?: number
  isOpen?: boolean
  defaultOpen?: boolean
  onOpenChange?: (isOpen: boolean) => void
  children?: ReactNode
  classNames?: ClassNames<typeof popoverSlots>
}
