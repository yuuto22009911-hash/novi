import type { ReactNode } from 'react'
import type { NoviBaseProps } from '../props'
import type { ClassNames } from '../slots'
import type { NoviColor, NoviSize } from '../tokens'

/** Progress を構成する部位。`track` が地、`indicator` が進捗を示す部分。 */
export const progressSlots = ['root', 'label', 'track', 'indicator', 'valueLabel'] as const

export const progressRequiredSlots = ['root', 'track', 'indicator'] as const

export type ProgressSlot = (typeof progressSlots)[number]
export type ProgressRequiredSlot = (typeof progressRequiredSlots)[number]

/**
 * 進捗の表示。`value` を省略すると不確定（indeterminate）表示になる。
 *
 * `prefers-reduced-motion` が有効なときはアニメーションを停止する。
 *
 * @example
 * <Progress label="アップロード中" value={62} />
 */
export interface ProgressProps extends NoviBaseProps {
  size?: NoviSize
  color?: NoviColor
  label?: ReactNode
  /** 省略すると不確定表示になる */
  value?: number
  minValue?: number
  maxValue?: number
  /** 数値ラベルを表示する */
  showValueLabel?: boolean
  classNames?: ClassNames<typeof progressSlots>
}

/** Spinner を構成する部位。 */
export const spinnerSlots = ['root', 'circle', 'label'] as const

export const spinnerRequiredSlots = ['root', 'circle'] as const

export type SpinnerSlot = (typeof spinnerSlots)[number]
export type SpinnerRequiredSlot = (typeof spinnerRequiredSlots)[number]

/**
 * 処理中であることを示す回転表示。
 *
 * `prefers-reduced-motion` が有効なときは回転を止める。
 *
 * @example
 * <Spinner label="読み込み中" />
 */
export interface SpinnerProps extends NoviBaseProps {
  size?: NoviSize
  color?: NoviColor
  /** 視覚的に表示するか、支援技術向けにのみ読ませるラベル */
  label?: ReactNode
  classNames?: ClassNames<typeof spinnerSlots>
}
