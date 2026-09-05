import type { KeyboardEventHandler, ReactNode } from 'react'
import type { NoviBaseProps } from '../props'
import type { ClassNames } from '../slots'
import type { NoviRadius, NoviSize, NoviVariant } from '../tokens'

/**
 * NumberField を構成する部位。
 *
 * `inputWrapper` は境界線・背景を担う枠で、`input` は素の `<input>` にあたる。
 * `decrement` / `increment` は増減ボタン。矢印キーで同じ操作ができるので
 * 構造上は必須でなく、テーマが位置と有無を決める（ADR-B1）。
 */
export const numberFieldSlots = [
  'root',
  'label',
  'inputWrapper',
  'input',
  'decrement',
  'increment',
  'description',
  'errorMessage',
] as const

export const numberFieldRequiredSlots = ['root', 'inputWrapper', 'input'] as const

export type NumberFieldSlot = (typeof numberFieldSlots)[number]
export type NumberFieldRequiredSlot = (typeof numberFieldRequiredSlots)[number]

/**
 * 数値の入力。矢印キーと増減ボタンで `step` ずつ刻み、`Intl.NumberFormat` の書式（通貨・%・単位）で表示する。
 *
 * 空欄は `NaN` ではなく `null` として `onChange` に渡す（ADR-B2）。
 *
 * @keywords 数値入力 数量 金額 単価 個数 ステッパー スピンボタン number numberfield stepper
 *
 * @a11y `label` は必須。ArrowUp / ArrowDown で `step` ずつ増減し、`minValue` / `maxValue` で止まる。
 * 増減ボタンは名前を持つ。`description` と `errorMessage` は `aria-describedby` で関連付く。
 * IME 変換中の Enter は抑制される
 *
 * @example
 * <NumberField
 *   label="数量"
 *   defaultValue={1}
 *   minValue={0}
 *   step={1}
 * />
 */
export interface NumberFieldProps extends NoviBaseProps {
  variant?: NoviVariant
  size?: NoviSize
  radius?: NoviRadius
  label?: ReactNode
  placeholder?: string
  description?: ReactNode
  /** `isInvalid` のときに表示する。色だけに頼らずテキストを必ず伴う（WCAG 1.4.1） */
  errorMessage?: ReactNode
  name?: string
  /** 空欄は `null`。`NaN` は使わない */
  value?: number | null
  defaultValue?: number
  /** 空欄になったときは `null` を受け取る */
  onChange?: (value: number | null) => void
  minValue?: number
  maxValue?: number
  /** 矢印キーと増減ボタンの刻み。既定は 1 */
  step?: number
  /**
   * 表示の書式。`Intl.NumberFormat` のオプションをそのまま渡す。
   *
   * @example
   * { style: 'currency', currency: 'JPY' }
   * { style: 'percent' }
   * { style: 'unit', unit: 'kilogram' }
   */
  formatOptions?: Intl.NumberFormatOptions
  /**
   * キー操作。**IME 変換中のキーはここに届かない**（テーマが core の `useImeSafeKeys` を通す）。
   */
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>
  isDisabled?: boolean
  isReadOnly?: boolean
  isRequired?: boolean
  isInvalid?: boolean
  classNames?: ClassNames<typeof numberFieldSlots>
}
