import type { ReactNode } from 'react'
import type { NoviBaseProps } from '../props'
import type { ClassNames } from '../slots'
import type { NoviColor, NoviSize } from '../tokens'

/** Radio を構成する部位。`control` が外側の円、`indicator` が内側のドット。 */
export const radioSlots = ['root', 'control', 'indicator', 'label', 'description'] as const

export const radioRequiredSlots = ['root', 'control'] as const

export type RadioSlot = (typeof radioSlots)[number]
export type RadioRequiredSlot = (typeof radioRequiredSlots)[number]

/**
 * ラジオボタン。単体では使わず、必ず RadioGroup の中に置く。
 *
 * @example
 * <Radio value="express">速達</Radio>
 */
export interface RadioProps extends NoviBaseProps {
  /** グループ内で一意の値。必須 */
  value: string
  size?: NoviSize
  color?: NoviColor
  isDisabled?: boolean
  description?: ReactNode
  children?: ReactNode
  classNames?: ClassNames<typeof radioSlots>
}

/** RadioGroup を構成する部位。 */
export const radioGroupSlots = ['root', 'label', 'list', 'description', 'errorMessage'] as const

export const radioGroupRequiredSlots = ['root', 'list'] as const

export type RadioGroupSlot = (typeof radioGroupSlots)[number]
export type RadioGroupRequiredSlot = (typeof radioGroupRequiredSlots)[number]

/**
 * ラジオボタンのグループ。矢印キーで項目間を移動できる。
 *
 * @example
 * <RadioGroup label="配送方法" value={method} onChange={setMethod}>
 *   <Radio value="standard">通常</Radio>
 *   <Radio value="express">速達</Radio>
 * </RadioGroup>
 */
export interface RadioGroupProps extends NoviBaseProps {
  size?: NoviSize
  color?: NoviColor
  label?: ReactNode
  description?: ReactNode
  errorMessage?: ReactNode
  name?: string
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  orientation?: 'horizontal' | 'vertical'
  isDisabled?: boolean
  isReadOnly?: boolean
  isRequired?: boolean
  isInvalid?: boolean
  children?: ReactNode
  classNames?: ClassNames<typeof radioGroupSlots>
}
