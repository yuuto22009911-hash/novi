'use client'

import type { TabsProps } from '@novi-ui/core'
import type { ReactNode } from 'react'
import { Tabs as RACTabs, Tab, TabList, TabPanel } from 'react-aria-components'
import { tabsStyles } from './tabs.styles'

/**
 * Tabs の見出し列。下辺に罫線が1本走る。
 *
 * @example
 * <TabItems>
 *   <TabItem id="profile">プロフィール</TabItem>
 * </TabItems>
 */
export function TabItems({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <TabList data-slot="list" className={tabsStyles().list({ class: className })}>
      {children}
    </TabList>
  )
}

/**
 * Tabs の見出し1つ。
 *
 * 選ばれると見出し列の罫線に切れ目が入り、そのままパネルへ繋がる。
 * 切れ目を作るのは要素ではなく**自分の下辺罫線を地色で塗ること**なので、
 * ここには印を描く子要素が無い（Tactile は塗り面を1枚敷く）。
 *
 * @example
 * <TabItem id="profile">プロフィール</TabItem>
 */
export function TabItem({
  id,
  isDisabled,
  children,
  className,
}: {
  id: string
  isDisabled?: boolean
  children?: ReactNode
  className?: string
}) {
  return (
    <Tab
      id={id}
      isDisabled={isDisabled}
      data-slot="tab"
      className={tabsStyles().tab({ class: className })}
    >
      {children}
    </Tab>
  )
}

/**
 * Tabs の中身1つ。`id` を見出しと合わせる。
 *
 * @example
 * <TabContent id="profile">…</TabContent>
 */
export function TabContent({
  id,
  children,
  className,
}: {
  id: string
  children?: ReactNode
  className?: string
}) {
  return (
    <TabPanel id={id} data-slot="panel" className={tabsStyles().panel({ class: className })}>
      {children}
    </TabPanel>
  )
}

/**
 * 同じ階層の内容を切り替える。矢印キーでタブ間を移動できる。
 *
 * Flatlay では**地続きタブ**にする。選ばれている見出しとパネルが1枚の紙になり、
 * 見出し列の罫線はその見出しの下でだけ途切れる。浮く層が無いので、
 * 「いま開いているのはここ」を面の高さではなく罫線の連続で示す。
 *
 * 見出しとパネルの間に余白を置かないのは意図で、離すと罫線が繋がらず、
 * ただ隣り合った2つの面に戻ってしまう。
 *
 * @example
 * <Tabs selectedKey={tab} onSelectionChange={setTab}>
 *   <TabItems>
 *     <TabItem id="profile">プロフィール</TabItem>
 *   </TabItems>
 *   <TabContent id="profile">…</TabContent>
 * </Tabs>
 */
export function Tabs({
  variant,
  size,
  orientation,
  selectedKey,
  defaultSelectedKey,
  onSelectionChange,
  isDisabled,
  disabledKeys,
  children,
  className,
  classNames,
  id,
}: TabsProps) {
  const s = tabsStyles({ variant, size })

  return (
    <RACTabs
      id={id}
      orientation={orientation}
      selectedKey={selectedKey}
      defaultSelectedKey={defaultSelectedKey}
      onSelectionChange={(key) => onSelectionChange?.(String(key))}
      isDisabled={isDisabled}
      disabledKeys={disabledKeys}
      data-slot="root"
      className={s.root({ class: [className, classNames?.root] })}
    >
      {children}
    </RACTabs>
  )
}
