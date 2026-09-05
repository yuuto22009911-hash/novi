import type { KeyboardEventHandler, ReactNode } from 'react'
import type { NoviBaseProps } from '../props'
import type { ClassNames } from '../slots'
import type { NoviRadius, NoviSize, NoviVariant } from '../tokens'

/**
 * ComboBox を構成する部位。Select の双子で、`trigger` / `value` の代わりに
 * `inputWrapper` / `input` を持つ（ADR-B3）。
 *
 * `trigger` は一覧を開くボタン。入力欄からも開けるので任意。
 * `popover` は開いた時の外枠、`listbox` はその中の一覧、`option` は各項目。
 */
export const comboBoxSlots = [
  'root',
  'label',
  'inputWrapper',
  'input',
  'trigger',
  'icon',
  'popover',
  'listbox',
  'option',
  'description',
  'errorMessage',
] as const

export const comboBoxRequiredSlots = [
  'root',
  'inputWrapper',
  'input',
  'popover',
  'listbox',
  'option',
] as const

export type ComboBoxSlot = (typeof comboBoxSlots)[number]
export type ComboBoxRequiredSlot = (typeof comboBoxRequiredSlots)[number]

/**
 * 文字を打って絞り込み、一覧から1つ選ぶ。選択肢が 20 件を超えるなら Select ではなくこちら。
 *
 * 絞り込みは入力文字を含む項目（大文字小文字・全角半角の差を吸収）。
 * IME 変換中の Enter と矢印キーは一覧に届かない（変換確定で誤選択しない）。
 *
 * @keywords コンボボックス オートコンプリート 入力補完 検索して選ぶ 絞り込み サジェスト combobox autocomplete typeahead
 *
 * @a11y 入力欄は `role="combobox"`、一覧は `role="listbox"`。ArrowDown で開いて項目を移動、
 * Enter で決定、Escape で閉じる。IME 変換中の Enter と矢印キーは抑制される。
 * `description` と `errorMessage` は `aria-describedby` で関連付く
 *
 * @keyboard 文字を打つ: 絞り込んで開く
 * @keyboard ↓ ↑: 開いて項目を移動
 * @keyboard Enter: 決定
 * @keyboard Escape: 閉じる
 *
 * @example
 * <ComboBox label="都道府県" onSelectionChange={setPref}>
 *   <ComboBoxItem id="tokyo">東京都</ComboBoxItem>
 *   <ComboBoxItem id="osaka">大阪府</ComboBoxItem>
 * </ComboBox>
 */
export interface ComboBoxProps extends NoviBaseProps {
  variant?: NoviVariant
  size?: NoviSize
  radius?: NoviRadius
  label?: ReactNode
  placeholder?: string
  description?: ReactNode
  /** `isInvalid` のときに表示する。色だけに頼らずテキストを必ず伴う（WCAG 1.4.1） */
  errorMessage?: ReactNode
  name?: string
  selectedKey?: string | null
  defaultSelectedKey?: string
  onSelectionChange?: (key: string | null) => void
  /** 入力欄の文字列。制御したい場合に使う */
  inputValue?: string
  defaultInputValue?: string
  onInputChange?: (value: string) => void
  /** 一覧に無い文字列をそのまま値として残す。既定は選択肢に戻す */
  allowsCustomValue?: boolean
  /** 一覧を開くきっかけ。既定は `input`（文字を打つと開く） */
  menuTrigger?: 'focus' | 'input' | 'manual'
  /**
   * 開閉の通知。開閉そのものは制御できない（React Aria の ComboBox は入力とキー操作から
   * 開閉を導くため）。開きたいときは `menuTrigger="focus"` を使う
   */
  onOpenChange?: (isOpen: boolean) => void
  /**
   * 入力欄のキー操作。**IME 変換中のキーはここに届かない**（テーマが core の `useImeSafeKeys` を通す）。
   */
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>
  isDisabled?: boolean
  isReadOnly?: boolean
  isRequired?: boolean
  isInvalid?: boolean
  children?: ReactNode
  classNames?: ClassNames<typeof comboBoxSlots>
}
