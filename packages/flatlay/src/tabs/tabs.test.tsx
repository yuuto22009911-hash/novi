import { NOVI_CONTRACTS, NOVI_SIZES, NOVI_VARIANTS } from '@novi-ui/core'
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

  it('無効なタブは選べない', async () => {
    const onSelectionChange = vi.fn()
    render(
      <Tabs onSelectionChange={onSelectionChange}>
        <TabItems>
          <TabItem id="profile">プロフィール</TabItem>
          <TabItem id="settings" isDisabled>
            設定
          </TabItem>
        </TabItems>
        <TabContent id="profile">プロフィールの中身</TabContent>
        <TabContent id="settings">設定の中身</TabContent>
      </Tabs>,
    )

    await userEvent.click(screen.getByRole('tab', { name: '設定' }))

    expect(onSelectionChange).not.toHaveBeenCalledWith('settings')
    expect(screen.queryByText('設定の中身')).toBeNull()
  })
})

describe('Tabs: 地続きタブ（AC-02-3）', () => {
  // 3モデルの構造差の3つ目。Raster は下線1本、Tactile はセグメンテッドの塗り面。
  // Flatlay は選択タブとパネルが1枚の紙になり、罫線の切れ目だけが「いまここ」を示す。

  it('見出しが見出し列の罫線に 1px 重なる', () => {
    // この重なりが無いと、下辺を地色で塗っても罫線は残ったままになる
    expect(tabsStyles().tab()).toContain('-mb-px')
  })

  it('選択中の見出しは下辺を地色で塗り、罫線に切れ目を作る', () => {
    const tab = tabsStyles().tab()
    expect(tab).toContain('data-[selected]:border-b-[var(--novi-color-bg)]')
    // 三辺は罫線として残る。下辺だけが抜ける
    expect(tab).toContain('data-[selected]:border-[var(--novi-color-border-strong)]')
  })

  it('切れ目を描く要素を持たない（indicator は塗り面ではない）', () => {
    // 実体のある印を置くと「罫線が抜けている」ではなく「上に何か乗っている」に見える。
    // それは Tactile のセグメンテッドで、Flatlay が避けたい表現そのもの
    expect(tabsStyles().indicator()).toBe('hidden')
    render(<Subject />)
    expect(document.querySelector('[data-slot="indicator"]')).toBeNull()
  })

  it('見出し列とパネルの間に余白を置かない', () => {
    // 離した時点で罫線が繋がらず、ただ隣り合った2つの面に戻る
    expect(tabsStyles().root()).not.toMatch(/(?<![\w-])(?:gap|space)-/)
  })

  it('パネルが囲みを持ち、上辺は見出し列の罫線と共有する', () => {
    const panel = tabsStyles().panel()
    expect(panel).toContain('border-x')
    expect(panel).toContain('border-b')
    // 上辺を自分で引くと罫線が二重になる
    expect(panel).not.toMatch(/(?<![\w-])border-t(?![\w-])/)
  })

  it('囲みを消す variant でも罫線の切れ目は残る', () => {
    // 枠が無くても「そこだけ罫線が抜けている」は成立する
    expect(tabsStyles({ variant: 'ghost' }).tab()).toContain(
      'data-[selected]:border-b-[var(--novi-color-bg)]',
    )
  })
})

describe('Tabs: Flatlay のデザイン規律', () => {
  it('押下で面と文字が反転する（ADR-F3）', () => {
    const tab = tabsStyles().tab()
    expect(tab).toContain('data-[pressed]:bg-[var(--novi-color-fg)]')
    expect(tab).toContain('data-[pressed]:text-[var(--novi-color-bg)]')
  })

  it('影も z-index も持たない（FR-02）', () => {
    for (const variant of NOVI_VARIANTS) {
      const classes = Object.values(tabsStyles({ variant }))
        .map((slot) => slot())
        .join(' ')
      expect(classes, variant).not.toMatch(/(?<![\w-])shadow-/)
      expect(classes, variant).not.toMatch(/(?<![\w-])z-(?:\d+|\[[^\]]*\])/)
    }
  })

  it('全 size が異なるクラスを生む', () => {
    const classes = NOVI_SIZES.map((size) => tabsStyles({ size }).tab())
    expect(new Set(classes).size).toBe(NOVI_SIZES.length)
  })
})

describe('Tabs: 拡張', () => {
  it('tv({ extend }) で拡張できる', () => {
    const my = tv({ extend: tabsStyles, slots: { list: 'w-full' } })
    expect(my().list()).toContain('w-full')
  })

  it('className が slot に届く', () => {
    render(
      <Tabs className="my-root" classNames={{ root: 'my-slot' }}>
        <TabItems className="my-list">
          <TabItem id="a" className="my-tab">
            A
          </TabItem>
        </TabItems>
        <TabContent id="a" className="my-panel">
          中身
        </TabContent>
      </Tabs>,
    )

    expect(document.querySelector('[data-slot="root"]')?.className).toContain('my-root')
    expect(document.querySelector('[data-slot="root"]')?.className).toContain('my-slot')
    expect(document.querySelector('[data-slot="list"]')?.className).toContain('my-list')
    expect(document.querySelector('[data-slot="tab"]')?.className).toContain('my-tab')
    expect(document.querySelector('[data-slot="panel"]')?.className).toContain('my-panel')
  })
})
