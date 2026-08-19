import type { ReactNode } from 'react'
import type { NoviBaseProps } from '../props'
import type { ClassNames } from '../slots'
import type { NoviRadius, NoviSize, NoviVariant } from '../tokens'

/**
 * Select を構成する部位。
 *
 * `trigger` は閉じている時に見えるボタン、`value` はその中の選択値表示、
 * `popover` は開いた時の外枠、`listbox` はその中の一覧、`option` は各項目。
 */
export const selectSlots = [
  'root',
  'label',
  'trigger',
  'value',
  'icon',
  'popover',
  'listbox',
  'option',
  'description',
  'errorMessage',
] as const

export const selectRequiredSlots = [
  'root',
  'trigger',
  'value',
  'popover',
  'listbox',
  'option',
] as const

export type SelectSlot = (typeof selectSlots)[number]
export type SelectRequiredSlot = (typeof selectRequiredSlots)[number]

/**
 * 一覧から1つ選ぶ。矢印キーで移動、Escape で閉じてトリガーへフォーカスが戻る。
 *
 * IME 変換中の Enter は core の `useImeSafeKeys` により抑制される。
 *
 * @example
 * <Select label="都道府県" selectedKey={pref} onSelectionChange={setPref}>
 *   <SelectItem id="tokyo">東京都</SelectItem>
 *   <SelectItem id="osaka">大阪府</SelectItem>
 * </Select>
 */
export interface SelectProps extends NoviBaseProps {
  variant?: NoviVariant
  size?: NoviSize
  radius?: NoviRadius
  label?: ReactNode
  placeholder?: string
  description?: ReactNode
  errorMessage?: ReactNode
  name?: string
  selectedKey?: string | null
  defaultSelectedKey?: string
  onSelectionChange?: (key: string | null) => void
  isDisabled?: boolean
  isRequired?: boolean
  isInvalid?: boolean
  children?: ReactNode
  classNames?: ClassNames<typeof selectSlots>
}
