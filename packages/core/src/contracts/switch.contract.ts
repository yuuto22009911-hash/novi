import type { ReactNode } from 'react'
import type { NoviBaseProps } from '../props'
import type { ClassNames } from '../slots'
import type { NoviColor, NoviSize } from '../tokens'

/**
 * Switch を構成する部位。
 *
 * `track` は地の部分、`thumb` は動く部分。
 * **形状はテーマの自由**で、ピル型である必要はない（Raster は角丸 0 の矩形にする）。
 */
export const switchSlots = ['root', 'track', 'thumb', 'label', 'description'] as const

export const switchRequiredSlots = ['root', 'track', 'thumb'] as const

export type SwitchSlot = (typeof switchSlots)[number]
export type SwitchRequiredSlot = (typeof switchRequiredSlots)[number]

/**
 * オン / オフの切り替え。
 *
 * 状態が形状だけで伝わりにくいテーマもあるため、ラベルの併記を推奨する。
 *
 * @example
 * <Switch isSelected={enabled} onChange={setEnabled}>
 *   メール通知を受け取る
 * </Switch>
 */
export interface SwitchProps extends NoviBaseProps {
  size?: NoviSize
  color?: NoviColor
  name?: string
  value?: string
  isSelected?: boolean
  defaultSelected?: boolean
  onChange?: (isSelected: boolean) => void
  isDisabled?: boolean
  isReadOnly?: boolean
  description?: ReactNode
  children?: ReactNode
  classNames?: ClassNames<typeof switchSlots>
}
