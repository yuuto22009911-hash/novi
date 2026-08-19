import type { ReactNode } from 'react'
import type { NoviBaseProps } from '../props'
import type { ClassNames } from '../slots'
import type { NoviRadius, NoviSize, NoviVariant } from '../tokens'

/**
 * Input を構成する部位。
 *
 * `inputWrapper` は境界線・背景を担う枠で、`input` は素の `<input>` にあたる。
 * この2つを分けることで、テーマは枠の中に startContent / endContent を差し込める。
 */
export const inputSlots = [
  'root',
  'label',
  'inputWrapper',
  'input',
  'startContent',
  'endContent',
  'description',
  'errorMessage',
] as const

export const inputRequiredSlots = ['root', 'inputWrapper', 'input'] as const

export type InputSlot = (typeof inputSlots)[number]
export type InputRequiredSlot = (typeof inputRequiredSlots)[number]

/**
 * 1行テキスト入力。
 *
 * IME 変換中の Enter は core の `useImeSafeKeys` により抑制される。
 *
 * @example
 * <Input
 *   label="メールアドレス"
 *   type="email"
 *   isRequired
 *   description="ログインに使用します"
 * />
 */
export interface InputProps extends NoviBaseProps {
  variant?: NoviVariant
  size?: NoviSize
  radius?: NoviRadius
  label?: ReactNode
  placeholder?: string
  description?: ReactNode
  /** `isInvalid` のときに表示する。色だけに頼らずテキストを必ず伴う（WCAG 1.4.1） */
  errorMessage?: ReactNode
  type?: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url'
  name?: string
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  isDisabled?: boolean
  isReadOnly?: boolean
  isRequired?: boolean
  isInvalid?: boolean
  startContent?: ReactNode
  endContent?: ReactNode
  classNames?: ClassNames<typeof inputSlots>
}
