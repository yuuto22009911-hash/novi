'use client'

import type { TabsProps } from '@novi-ui/core'
import type { ReactNode } from 'react'
import { Tabs as RACTabs, Tab, TabList, TabPanel } from 'react-aria-components'
import { tabsStyles } from './tabs.styles'

/**
 * Tabs の見出し列。塗られたトラックになる。
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
  const s = tabsStyles()
  return (
    <Tab id={id} isDisabled={isDisabled} data-slot="tab" className={s.tab({ class: className })}>
      {({ isSelected }) => (
        <>
          {/* 選択中の区画に敷く面。トラックから1段持ち上がって見える。
              先に置いて後続の文字が上に乗るようにする */}
          {isSelected && (
            <span data-slot="indicator" aria-hidden="true" className={s.indicator()} />
          )}
          {children}
        </>
      )}
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
 * Tactile では**セグメンテッドコントロール**にする。塗られたトラックの内側で、
 * 選択中の区画だけが1段持ち上がる。指で切り替える前提では、どこまでが
 * 自分の押せる範囲かを面で示す必要があるため（Raster は下線1本・ADR-R4）。
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
