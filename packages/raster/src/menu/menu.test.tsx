import { NOVI_CONTRACTS } from '@novi-ui/core'
import { testSlotContract } from '@novi-ui/core/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { tv } from 'tailwind-variants'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '../button'
import { Menu, MenuItemComponent as MenuItem, MenuSection } from './menu'
import { menuStyles } from './menu.styles'

testSlotContract({
  name: 'Menu',
  contract: NOVI_CONTRACTS.Menu,
  render: () => (
    <Menu defaultOpen>
      <Button>操作</Button>
      <MenuItem id="rename" shortcut="⌘R" description="名前だけを変える">
        名前を変更
      </MenuItem>
    </Menu>
  ),
})

function Subject(props: { onAction?: (key: string) => void } = {}) {
  return (
    <Menu onAction={props.onAction}>
      <Button>操作</Button>
      <MenuItem id="rename">名前を変更</MenuItem>
      <MenuItem id="duplicate">複製</MenuItem>
      <MenuItem id="delete" isDisabled>
        削除
      </MenuItem>
    </Menu>
  )
}

describe('Menu: 操作', () => {
  it('閉じているときは項目を描画しない', () => {
    render(<Subject />)
    expect(screen.queryByRole('menuitem')).toBeNull()
  })

  it('クリックで開き、選ぶと onAction が呼ばれる', async () => {
    const onAction = vi.fn()
    render(<Subject onAction={onAction} />)

    await userEvent.click(screen.getByRole('button', { name: '操作' }))
    await userEvent.click(screen.getByRole('menuitem', { name: '複製' }))

    expect(onAction).toHaveBeenCalledWith('duplicate')
  })

  it('矢印キーで項目間を移動できる（AC-04-4）', async () => {
    const onAction = vi.fn()
    render(<Subject onAction={onAction} />)

    await userEvent.click(screen.getByRole('button', { name: '操作' }))
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}')

    expect(onAction).toHaveBeenCalled()
  })

  it('Escape で閉じる（AC-04-3）', async () => {
    render(<Subject />)

    await userEvent.click(screen.getByRole('button', { name: '操作' }))
    expect(screen.getByRole('menu')).toBeDefined()

    await userEvent.keyboard('{Escape}')

    await waitFor(() => {
      expect(screen.queryByRole('menu')).toBeNull()
    })
  })

  it('isDisabled の項目は選べない', async () => {
    const onAction = vi.fn()
    render(<Subject onAction={onAction} />)

    await userEvent.click(screen.getByRole('button', { name: '操作' }))
    await userEvent.click(screen.getByRole('menuitem', { name: '削除' }))

    expect(onAction).not.toHaveBeenCalled()
  })
})

describe('Menu: Raster のデザイン規律', () => {
  it('ショートカットは等幅数字で桁を揃える', () => {
    expect(menuStyles().itemShortcut()).toContain('tabular-nums')
  })

  it('浮く層としてトークンの影を持つ（ADR-R8）', () => {
    expect(menuStyles().popover()).toContain('shadow-[var(--novi-shadow-md)]')
  })
})

describe('Menu: 拡張', () => {
  it('tv({ extend }) で拡張できる', () => {
    const my = tv({ extend: menuStyles, slots: { popover: 'min-w-56' } })
    expect(my().popover()).toContain('min-w-56')
  })
})

describe('MenuSection（T-41 で判明した実装漏れ）', () => {
  it('見出し付きグループを描画し、section / sectionLabel slot を満たす', async () => {
    const { baseElement } = render(
      <Menu defaultOpen>
        <Button>操作</Button>
        <MenuSection title="ファイル">
          <MenuItem id="rename">名前を変更</MenuItem>
        </MenuSection>
      </Menu>,
    )

    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: '名前を変更' })).toBeDefined()
    })

    expect(baseElement.querySelector('[data-slot="section"]')).not.toBeNull()
    expect(baseElement.querySelector('[data-slot="sectionLabel"]')?.textContent).toBe('ファイル')
  })
})
