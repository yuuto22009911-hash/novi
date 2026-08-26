import { NOVI_CONTRACTS } from '@novi-ui/core'
import { testSlotContract } from '@novi-ui/core/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { tv } from 'tailwind-variants'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '../button'
import { Menu, MenuItemComponent as MenuItem, MenuSection, MenuSeparator } from './menu'
import { menuStyles } from './menu.styles'

/** 全 slot が出る状態。展開部はフローの中なので `container` から辿れる。 */
const openMenu = (props: Partial<Parameters<typeof Menu>[0]> = {}) => (
  <Menu defaultOpen {...props}>
    <Button>操作</Button>
    <MenuSection title="ファイル">
      <MenuItem id="rename" description="この場で書き換える" shortcut="⌘R">
        名前を変更
      </MenuItem>
    </MenuSection>
    <MenuSeparator />
    <MenuItem id="delete" shortcut="⌘⌫">
      削除
    </MenuItem>
  </Menu>
)

testSlotContract({
  name: 'Menu',
  contract: NOVI_CONTRACTS.Menu,
  render: () => openMenu(),
})

describe('Menu: 描画', () => {
  it('閉じているときは一覧を描画しない', () => {
    const { container } = render(
      <Menu>
        <Button>操作</Button>
        <MenuItem id="rename">名前を変更</MenuItem>
      </Menu>,
    )
    expect(container.querySelector('[data-slot="popover"]')).toBeNull()
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('最初の子がトリガーになり、残りが項目になる', () => {
    render(openMenu())
    expect(screen.getByRole('button', { name: '操作' })).toBeDefined()
    expect(screen.getAllByRole('menuitem')).toHaveLength(2)
  })

  it('description と shortcut を渡したときだけ描く', () => {
    const { container } = render(
      <Menu defaultOpen>
        <Button>操作</Button>
        <MenuItem id="rename">名前を変更</MenuItem>
      </Menu>,
    )
    expect(container.querySelector('[data-slot="itemDescription"]')).toBeNull()
    expect(container.querySelector('[data-slot="itemShortcut"]')).toBeNull()
  })
})

describe('Menu: インフロー押し下げ（FR-05）', () => {
  it('展開部はトリガーの直後、フローの中に出る（body 直下へ浮かない）', () => {
    const { container } = render(openMenu())
    const trigger = container.querySelector('[data-slot="trigger"]')
    const popover = container.querySelector('[data-slot="popover"]')

    expect(popover).not.toBeNull()
    expect(trigger?.compareDocumentPosition(popover as Node)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING as number,
    )
  })

  it('上流のインライン座標を打ち消してフローに戻す', () => {
    const { container } = render(openMenu())
    const popover = container.querySelector('[data-slot="popover"]')?.className
    expect(popover).toContain('static!')
    expect(popover).toContain('z-auto!')
  })

  it('背後を inert にしない（押し下げられた後続を読めなくなるため）', () => {
    const { container } = render(
      <div>
        {openMenu()}
        <p data-testid="after">後続</p>
      </div>,
    )
    expect(container.querySelector('[data-testid="after"]')?.closest('[inert]')).toBeNull()
  })

  it('placement / offset を渡しても浮かない（受け取るが効かない）', () => {
    const { container } = render(openMenu({ placement: 'right', offset: 24 }))
    expect(container.querySelector('[data-slot="popover"]')?.className).toContain('static!')
  })
})

describe('Menu: 操作とキーボード', () => {
  it('トリガーを押すと開く', async () => {
    render(
      <Menu>
        <Button>操作</Button>
        <MenuItem id="rename">名前を変更</MenuItem>
      </Menu>,
    )
    await userEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('menu')).toBeDefined()
  })

  it('項目を選ぶと onAction に id が渡る', async () => {
    const onAction = vi.fn()
    render(
      <Menu defaultOpen onAction={onAction}>
        <Button>操作</Button>
        <MenuItem id="rename">名前を変更</MenuItem>
      </Menu>,
    )
    await userEvent.click(screen.getByRole('menuitem', { name: /名前を変更/ }))
    expect(onAction).toHaveBeenCalledWith('rename')
  })

  it('disabledKeys の項目は選べない', async () => {
    const onAction = vi.fn()
    render(
      <Menu defaultOpen onAction={onAction} disabledKeys={['delete']}>
        <Button>操作</Button>
        <MenuItem id="delete">削除</MenuItem>
      </Menu>,
    )
    await userEvent.click(screen.getByRole('menuitem', { name: /削除/ }))
    expect(onAction).not.toHaveBeenCalled()
  })

  it('Escape で閉じ、フォーカスがトリガーへ戻る', async () => {
    render(
      <Menu>
        <Button>操作</Button>
        <MenuItem id="rename">名前を変更</MenuItem>
      </Menu>,
    )
    const trigger = screen.getByRole('button')

    await userEvent.click(trigger)
    await userEvent.keyboard('{Escape}')

    await waitFor(() => {
      expect(screen.queryByRole('menu')).toBeNull()
      expect(document.activeElement).toBe(trigger)
    })
  })
})

describe('Menu: ショートカットが主役（FR-10）', () => {
  it('本文と同じ濃さで、注記に落とさない', () => {
    const shortcut = menuStyles().itemShortcut()
    expect(shortcut).toContain('text-[var(--novi-color-fg)]')
    expect(shortcut).not.toContain('text-[var(--novi-color-muted)]')
  })

  it('等幅で桁が揃う（列として読ませる・ADR-F7）', () => {
    const shortcut = menuStyles().itemShortcut()
    expect(shortcut).toContain('font-(family-name:--novi-font-mono)')
    expect(shortcut).toContain('tabular-nums')
  })

  it('行の右端に置かれる（項目名と両端揃え）', () => {
    expect(menuStyles().item()).toContain('justify-between')
    expect(menuStyles().itemShortcut()).toContain('shrink-0')
  })

  it('説明よりも大きい（注記ではなく見出しの一部）', () => {
    expect(menuStyles().itemShortcut()).toContain('text-[length:var(--novi-text-sm)]')
    expect(menuStyles().itemDescription()).toContain('text-[length:var(--novi-text-xs)]')
  })
})

describe('Menu: Flatlay のデザイン規律', () => {
  it('展開面は罫線で示す（影を持たない）', () => {
    const popover = menuStyles().popover()
    expect(popover).toContain('border')
    expect(popover).not.toMatch(/(?<![\w-])shadow-/)
  })

  it('行の切れ目も線（帳票の目）', () => {
    expect(menuStyles().list()).toContain('divide-y')
  })

  it('区切りは行の線より濃い', () => {
    expect(menuStyles().separator()).toContain('bg-[var(--novi-color-border-strong)]')
    expect(menuStyles().list()).toContain('divide-[var(--novi-color-border)]')
  })

  it('見出しは地を落として作る（浮かせない）', () => {
    expect(menuStyles().sectionLabel()).toContain('bg-[var(--novi-color-subtle)]')
  })

  it('押下は反転スタンプ（ADR-F3）', () => {
    const item = menuStyles().item()
    expect(item).toContain('data-[pressed]:bg-[var(--novi-color-fg)]')
    expect(item).toContain('data-[pressed]:text-[var(--novi-color-bg)]')
  })

  it('z-index も transform も持たない（FR-02 / FR-11）', () => {
    const classes = Object.values(menuStyles())
      .map((slot) => slot())
      .join(' ')
    expect(classes).not.toMatch(/(?<![\w-])z-(?:\d+|\[[^\]]*\])/)
    expect(classes).not.toMatch(/(?<![\w-])(?:scale|rotate|translate)-/)
  })
})

describe('Menu: 拡張', () => {
  it('tv({ extend }) で拡張できる', () => {
    const my = tv({ extend: menuStyles, slots: { popover: 'min-w-56' } })
    expect(my().popover()).toContain('min-w-56')
  })

  it('classNames が該当 slot に反映される', () => {
    const { container } = render(
      openMenu({
        classNames: { trigger: 'm-trigger', popover: 'm-popover', list: 'm-list' },
      }),
    )
    for (const [slot, cls] of [
      ['trigger', 'm-trigger'],
      ['popover', 'm-popover'],
      ['list', 'm-list'],
    ] as const) {
      expect(container.querySelector(`[data-slot="${slot}"]`)?.className, slot).toContain(cls)
    }
  })
})
