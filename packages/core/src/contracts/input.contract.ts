import type { KeyboardEventHandler, ReactNode } from 'react'
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
 * @keywords 入力欄 テキスト入力 テキストフィールド 1行入力 input textfield
 *
 * @a11y `label` は必須。`description` と `errorMessage` は `aria-describedby` で関連付く。
 * IME 変換中の Enter は抑制されるため、変換確定が送信に化けない
 *
 * @keyboard Enter: フォームを送信（IME 変換中は送信しない）
 * @keyboard Tab: 次の欄へ
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
  /**
   * キー操作。**IME 変換中のキーはここに届かない**（テーマが core の `useImeSafeKeys` を通す）。
   * 変換確定の Enter で送信が暴発する事故を、利用側が意識せずに防げる。
   */
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>
  isDisabled?: boolean
  isReadOnly?: boolean
  isRequired?: boolean
  isInvalid?: boolean
  startContent?: ReactNode
  endContent?: ReactNode
  classNames?: ClassNames<typeof inputSlots>
}
