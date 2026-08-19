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
 * @example
 * <Tabs selectedKey={tab} onSelectionChange={setTab}>
 *   <Tab id="profile">プロフィール</Tab>
 *   <TabPanel id="profile">…</TabPanel>
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
