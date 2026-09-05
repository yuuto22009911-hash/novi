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
 * @keywords セレクト プルダウン ドロップダウン 選択肢 一覧から選ぶ select
 *
 * @a11y 矢印キーで移動、Enter で決定、Escape で閉じてトリガーへフォーカスが戻る。
 * IME 変換中の Enter は抑制されるため、変換確定で誤決定しない
 *
 * @keyboard Enter / Space / ↓: 開く
 * @keyboard ↑ ↓: 項目を移動
 * @keyboard Enter: 決定
 * @keyboard Escape: 閉じてトリガーへ戻る
 * @keyboard 文字: 頭文字の項目へ飛ぶ
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
  /** 開閉状態。制御したい場合に使う */
  isOpen?: boolean
  defaultOpen?: boolean
  onOpenChange?: (isOpen: boolean) => void
  isDisabled?: boolean
  isRequired?: boolean
  isInvalid?: boolean
  children?: ReactNode
  classNames?: ClassNames<typeof selectSlots>
}
