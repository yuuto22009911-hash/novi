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

describe('Tabs: Raster のデザイン規律（ADR-R4）', () => {
  it('選択中は下線と文字色で示す（背景を変えない）', () => {
    const tab = tabsStyles().tab()
    expect(tab).toContain('data-[selected]:border-[var(--novi-color-fg)]')
    expect(tab).toContain('data-[selected]:text-[var(--novi-color-fg)]')
    expect(tab).not.toContain('data-[selected]:bg-')
  })

  it('下線の色は本文色（背景に対して 3:1 以上を満たす）', () => {
    expect(tabsStyles().tab()).toContain('border-[var(--novi-color-fg)]')
  })

  it('全 size が異なるクラスを生む', () => {
    const classes = NOVI_SIZES.map((size) => tabsStyles({ size }).tab())
    expect(new Set(classes).size).toBe(NOVI_SIZES.length)
  })
})

describe('Tabs: 拡張', () => {
  it('tv({ extend }) で拡張できる', () => {
    const my = tv({ extend: tabsStyles, slots: { list: 'gap-6' } })
    expect(my().list()).toContain('gap-6')
  })
})
