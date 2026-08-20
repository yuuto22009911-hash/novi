import type { ReactNode } from 'react'
import type { NoviBaseProps } from '../props'
import type { ClassNames } from '../slots'
import type { NoviPlacement } from './popover.contract'

/**
 * Menu を構成する部位。
 *
 * `itemShortcut` はキーボードショートカットの表示に使う。
 * 桁を揃えるため `tabular-nums` を当てることを推奨する。
 */
export const menuSlots = [
  'trigger',
  'popover',
  'list',
  'item',
  'itemLabel',
  'itemDescription',
  'itemShortcut',
  'separator',
  'section',
  'sectionLabel',
] as const

export const menuRequiredSlots = ['trigger', 'popover', 'list', 'item'] as const

export type MenuSlot = (typeof menuSlots)[number]
export type MenuRequiredSlot = (typeof menuRequiredSlots)[number]

/**
 * トリガーから開く操作の一覧。矢印キーで移動、Escape で閉じる。
 *
 * IME 変換中の Enter は core の `useImeSafeKeys` により抑制される。
 *
 * @keywords メニュー ドロップダウンメニュー 操作一覧 コンテキストメニュー menu
 *
 * @a11y 矢印キーで移動、Enter で決定、Escape で閉じる。開いている間はメニュー外を読み上げ対象から外す。
 * IME 変換中の Enter は抑制される
 *
 * @example
 * <Menu onAction={(key) => run(key)}>
 *   <Button>操作</Button>
 *   <MenuItem id="rename">名前を変更</MenuItem>
 *   <MenuItem id="delete">削除</MenuItem>
 * </Menu>
 */
export interface MenuProps extends NoviBaseProps {
  placement?: NoviPlacement
  offset?: number
  isOpen?: boolean
  defaultOpen?: boolean
  onOpenChange?: (isOpen: boolean) => void
  /** 項目が選ばれたとき。id が渡る */
  onAction?: (key: string) => void
  isDisabled?: boolean
  /** 選択不可にする項目の id */
  disabledKeys?: string[]
  children?: ReactNode
  classNames?: ClassNames<typeof menuSlots>
}
