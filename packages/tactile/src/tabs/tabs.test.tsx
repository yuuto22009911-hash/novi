import { NOVI_CONTRACTS, NOVI_SIZES } from '@novi-ui/core'
import { testSlotContract } from '@novi-ui/core/testing'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { tv } from 'tailwind-variants'
import { describe, expect, it, vi } from 'vitest'
import { TabContent, TabItem, TabItems, Tabs } from './tabs'
import { tabsStyles } from './tabs.styles'

function Subject(props: { onSelectionChange?: (k: string) => void } = {}) {
  return (
    <Tabs onSelectionChange={props.onSelectionChange}>
      <TabItems>
        <TabItem id="profile">プロフィール</TabItem>
        <TabItem id="settings">設定</TabItem>
      </TabItems>
      <TabContent id="profile">プロフィールの中身</TabContent>
      <TabContent id="settings">設定の中身</TabContent>
    </Tabs>
  )
}

testSlotContract({
  name: 'Tabs',
  contract: NOVI_CONTRACTS.Tabs,
  render: () => <Subject />,
})

describe('Tabs: 操作', () => {
  it('既定で最初のタブが選ばれる', () => {
    render(<Subject />)
    expect(screen.getByText('プロフィールの中身')).toBeDefined()
    expect(screen.queryByText('設定の中身')).toBeNull()
  })

  it('クリックで切り替わる', async () => {
    const onSelectionChange = vi.fn()
    render(<Subject onSelectionChange={onSelectionChange} />)

    await userEvent.click(screen.getByRole('tab', { name: '設定' }))

    expect(onSelectionChange).toHaveBeenCalledWith('settings')
    expect(screen.getByText('設定の中身')).toBeDefined()
  })

  it('矢印キーで移動できる（AC-04-4）', async () => {
    const onSelectionChange = vi.fn()
    render(<Subject onSelectionChange={onSelectionChange} />)

    await userEvent.tab()
    await userEvent.keyboard('{ArrowRight}')

    expect(onSelectionChange).toHaveBeenCalledWith('settings')
  })
})

describe('Tabs: Tactile の構造（セグメンテッドコントロール）', () => {
  it('選択中の区画に indicator の面が敷かれる', () => {
    const { container } = render(
      <Tabs defaultSelectedKey="a">
        <TabItems>
          <TabItem id="a">A</TabItem>
          <TabItem id="b">B</TabItem>
        </TabItems>
        <TabContent id="a">1</TabContent>
      </Tabs>,
    )
    const indicators = container.querySelectorAll('[data-slot="indicator"]')
    // 選択中の1つだけが持つ。全タブに出ると「どれが選択中か」が消える
    expect(indicators.length).toBe(1)
    expect(indicators[0]?.getAttribute('aria-hidden')).toBe('true')
  })

  it('list が塗られたトラックになる（Raster は下辺の罫線だけ）', () => {
    expect(tabsStyles().list()).toContain('bg-[var(--novi-color-subtle)]')
    expect(tabsStyles().list()).not.toMatch(/border-b/)
  })
})

describe('Tabs: 拡張', () => {
  it('tv({ extend }) で拡張できる', () => {
    const my = tv({ extend: tabsStyles, slots: { list: 'gap-6' } })
    expect(my().list()).toContain('gap-6')
  })
})
