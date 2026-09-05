import type { ReactNode } from 'react'
import type { NoviBaseProps } from '../props'
import type { ClassNames } from '../slots'
import type { NoviColor, NoviSize } from '../tokens'

/** Checkbox を構成する部位。`control` が実際の四角、`indicator` がチェック記号。 */
export const checkboxSlots = ['root', 'control', 'indicator', 'label', 'description'] as const

export const checkboxRequiredSlots = ['root', 'control'] as const

export type CheckboxSlot = (typeof checkboxSlots)[number]
export type CheckboxRequiredSlot = (typeof checkboxRequiredSlots)[number]

/**
 * チェックボックス。
 *
 * @keywords チェックボックス チェック 同意 checkbox
 *
 * @a11y Space でトグルする。ラベルは入力と関連付けられ、ラベル文字の押下でも反応する
 *
 * @keyboard Space: 切り替える
 *
 * @example
 * <Checkbox isSelected={agreed} onChange={setAgreed}>
 *   利用規約に同意する
 * </Checkbox>
 */
export interface CheckboxProps extends NoviBaseProps {
  size?: NoviSize
  color?: NoviColor
  value?: string
  /** 選択状態。`checked` ではないので注意（React Aria 準拠） */
  isSelected?: boolean
  defaultSelected?: boolean
  onChange?: (isSelected: boolean) => void
  /** 一部だけ選択されている状態 */
  isIndeterminate?: boolean
  isDisabled?: boolean
  isReadOnly?: boolean
  isRequired?: boolean
  isInvalid?: boolean
  description?: ReactNode
  children?: ReactNode
  classNames?: ClassNames<typeof checkboxSlots>
}

/** CheckboxGroup を構成する部位。 */
export const checkboxGroupSlots = ['root', 'label', 'list', 'description', 'errorMessage'] as const

export const checkboxGroupRequiredSlots = ['root', 'list'] as const

export type CheckboxGroupSlot = (typeof checkboxGroupSlots)[number]
export type CheckboxGroupRequiredSlot = (typeof checkboxGroupRequiredSlots)[number]

/**
 * チェックボックスのグループ。ラベル・エラーをまとめて扱う。
 *
 * @keywords チェックボックスグループ 複数選択 複数選べる checkboxgroup
 *
 * @a11y group として提示され、`label` がグループ名になる。エラーはグループに対して1つ出し、
 * `aria-describedby` で各入力から参照される
 *
 * @keyboard Tab: 項目を順に移動
 * @keyboard Space: 切り替える
 *
 * @example
 * <CheckboxGroup label="通知方法" value={ways} onChange={setWays}>
 *   <Checkbox value="email">メール</Checkbox>
 *   <Checkbox value="sms">SMS</Checkbox>
 * </CheckboxGroup>
 */
export interface CheckboxGroupProps extends NoviBaseProps {
  size?: NoviSize
  color?: NoviColor
  label?: ReactNode
  description?: ReactNode
  errorMessage?: ReactNode
  name?: string
  value?: string[]
  defaultValue?: string[]
  onChange?: (value: string[]) => void
  orientation?: 'horizontal' | 'vertical'
  isDisabled?: boolean
  isReadOnly?: boolean
  isRequired?: boolean
  isInvalid?: boolean
  children?: ReactNode
  classNames?: ClassNames<typeof checkboxGroupSlots>
}
