import type { ReactNode } from 'react'
import type { NoviBaseProps } from '../props'
import type { ClassNames } from '../slots'
import type { NoviRadius, NoviSize, NoviVariant } from '../tokens'

/** TextArea を構成する部位。文字数カウンタは `description` slot に置く。 */
export const textareaSlots = [
  'root',
  'label',
  'inputWrapper',
  'textarea',
  'description',
  'errorMessage',
] as const

export const textareaRequiredSlots = ['root', 'inputWrapper', 'textarea'] as const

export type TextareaSlot = (typeof textareaSlots)[number]
export type TextareaRequiredSlot = (typeof textareaRequiredSlots)[number]

/**
 * 複数行テキスト入力。
 *
 * @example
 * <TextArea label="備考" rows={4} maxLength={500} />
 */
export interface TextareaProps extends NoviBaseProps {
  variant?: NoviVariant
  size?: NoviSize
  radius?: NoviRadius
  label?: ReactNode
  placeholder?: string
  description?: ReactNode
  errorMessage?: ReactNode
  name?: string
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  rows?: number
  maxLength?: number
  isDisabled?: boolean
  isReadOnly?: boolean
  isRequired?: boolean
  isInvalid?: boolean
  classNames?: ClassNames<typeof textareaSlots>
}
