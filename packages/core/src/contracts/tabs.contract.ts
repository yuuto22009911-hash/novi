import type { ReactNode } from 'react'
import type { NoviBaseProps } from '../props'
import type { ClassNames } from '../slots'
import type { NoviSize, NoviVariant } from '../tokens'

/** Tabs を構成する部位。`indicator` は選択中を示す線などで、任意。 */
export const tabsSlots = ['root', 'list', 'tab', 'indicator', 'panel'] as const

export const tabsRequiredSlots = ['root', 'list', 'tab', 'panel'] as const

export type TabsSlot = (typeof tabsSlots)[number]
export type TabsRequiredSlot = (typeof tabsRequiredSlots)[number]

/**
 * 同じ階層の内容を切り替える。矢印キーでタブ間を移動できる。
 *
 * @keywords タブ タブ切り替え tab tabs
 *
 * @a11y 矢印キーでタブ間を移動し、Tab キーはパネルへ移る。選択中のタブは `aria-selected`
 *
 * @keyboard ← →（縦は ↑ ↓）: タブを移動して選ぶ
 * @keyboard Home / End: 最初 / 最後のタブへ
 * @keyboard Tab: パネルの中へ
 *
 * @example
 * <Tabs selectedKey={tab} onSelectionChange={setTab}>
 *   <TabItems>
 *     <TabItem id="profile">プロフィール</TabItem>
 *     <TabItem id="settings">設定</TabItem>
 *   </TabItems>
 *   <TabContent id="profile">プロフィールの中身</TabContent>
 *   <TabContent id="settings">設定の中身</TabContent>
 * </Tabs>
 */
export interface TabsProps extends NoviBaseProps {
  variant?: NoviVariant
  size?: NoviSize
  orientation?: 'horizontal' | 'vertical'
  selectedKey?: string
  defaultSelectedKey?: string
  onSelectionChange?: (key: string) => void
  isDisabled?: boolean
  disabledKeys?: string[]
  children?: ReactNode
  classNames?: ClassNames<typeof tabsSlots>
}
