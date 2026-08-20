import type { ReactNode } from 'react'
import type { NoviBaseProps } from '../props'
import type { ClassNames } from '../slots'
import type { NoviColor, NoviRadius, NoviSize, NoviVariant } from '../tokens'

/** Button を構成する部位。テーマは順序・入れ子・要素種別を自由に決めてよい。 */
export const buttonSlots = ['root', 'startContent', 'label', 'endContent', 'spinner'] as const

/** テーマが必ず描画しなければならない slot。 */
export const buttonRequiredSlots = ['root', 'label'] as const

export type ButtonSlot = (typeof buttonSlots)[number]
export type ButtonRequiredSlot = (typeof buttonRequiredSlots)[number]

/**
 * ボタン。
 *
 * @keywords ボタン 押下 送信ボタン button
 *
 * @a11y Enter / Space で発火する。`onPress` はマウス・タッチ・ペン・キーボードを統一的に扱う。
 * `isLoading` 中の spinner は `aria-hidden`
 *
 * @example
 * <Button variant="solid" color="primary" onPress={() => save()}>
 *   保存
 * </Button>
 */
export interface ButtonProps extends NoviBaseProps {
  variant?: NoviVariant
  size?: NoviSize
  color?: NoviColor
  radius?: NoviRadius
  /** 無効化する。`disabled` ではないので注意（React Aria 準拠） */
  isDisabled?: boolean
  /** 読み込み中。spinner slot を描画し、操作を受け付けない */
  isLoading?: boolean
  type?: 'button' | 'submit' | 'reset'
  /** 押下時。`onClick` ではないので注意（タッチ・ペン・キーボードを統一的に扱う） */
  onPress?: () => void
  startContent?: ReactNode
  endContent?: ReactNode
  children?: ReactNode
  classNames?: ClassNames<typeof buttonSlots>
}
