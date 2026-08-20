import type { ReactNode } from 'react'
import type { NoviBaseProps } from '../props'
import type { ClassNames } from '../slots'
import type { NoviRadius, NoviSize } from '../tokens'

/**
 * Modal を構成する部位。
 *
 * **`closeButton` の位置はテーマの自由**。ヘッダー右上のアイコンにしても、
 * フッターのフルワイドボタンにしてもよい。名前が同じで位置が違う、という状態が成立する。
 * これが「構造は自由・API は同一」の最も分かりやすい実例になっている。
 */
export const modalSlots = [
  'backdrop',
  'panel',
  'header',
  'title',
  'closeButton',
  'body',
  'footer',
] as const

export const modalRequiredSlots = ['backdrop', 'panel', 'body'] as const

export type ModalSlot = (typeof modalSlots)[number]
export type ModalRequiredSlot = (typeof modalRequiredSlots)[number]

/**
 * モーダルダイアログ。開いている間フォーカスは内側に閉じ込められ、Escape で閉じる。
 *
 * @keywords モーダル ダイアログ ポップアップ 確認画面 modal dialog
 *
 * @a11y 開いている間フォーカスは内側に閉じ込められ、Escape で閉じる
 * （`isKeyboardDismissDisabled` で無効化できる）。閉じるボタンには `aria-label` がある
 *
 * @example
 * <Modal isOpen={isOpen} onOpenChange={setIsOpen} size="md">
 *   <ModalTitle>削除しますか</ModalTitle>
 *   <ModalBody>この操作は取り消せません。</ModalBody>
 * </Modal>
 */
export interface ModalProps extends NoviBaseProps {
  size?: NoviSize | 'full'
  radius?: NoviRadius
  isOpen?: boolean
  defaultOpen?: boolean
  onOpenChange?: (isOpen: boolean) => void
  /** 背景クリックで閉じられるようにする */
  isDismissable?: boolean
  /** Escape で閉じるのを無効にする */
  isKeyboardDismissDisabled?: boolean
  children?: ReactNode
  classNames?: ClassNames<typeof modalSlots>
}
