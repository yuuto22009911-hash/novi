import { NOVI_CONTRACTS, NOVI_RADII } from '@novi-ui/core'
import { testSlotContract } from '@novi-ui/core/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { tv } from 'tailwind-variants'
import { describe, expect, it } from 'vitest'
import { Button } from '../button'
import { Popover, PopoverContent } from './popover'
import { popoverStyles } from './popover.styles'

const openPopover = (props: Partial<Parameters<typeof Popover>[0]> = {}) => (
  <Popover defaultOpen {...props}>
    <Button>詳細</Button>
    <PopoverContent>ここに補足を書く</PopoverContent>
  </Popover>
)

testSlotContract({
  name: 'Popover',
  contract: NOVI_CONTRACTS.Popover,
  render: () => openPopover(),
})

/**
 * 注記面そのもの。**トリガーの Button も `data-slot="root"` を持つ**ので、
 * 展開部の置き場所（`data-novi-inflow`）まで降りてから探す。
 */
const surfaceOf = (container: HTMLElement) =>
  container.querySelector('[data-novi-inflow] [data-slot="root"]')

describe('Popover: 描画', () => {
  it('閉じているときは中身を描画しない', () => {
    const { container } = render(
      <Popover>
        <Button>詳細</Button>
        <PopoverContent>ここに補足を書く</PopoverContent>
      </Popover>,
    )
    expect(surfaceOf(container)).toBeNull()
    expect(screen.queryByText('ここに補足を書く')).toBeNull()
  })

  it('最初の子がトリガー、残りが中身になる', () => {
    render(openPopover())
    expect(screen.getByRole('button', { name: '詳細' })).toBeDefined()
    expect(screen.getByText('ここに補足を書く')).toBeDefined()
  })
})

describe('Popover: インフローの注記面（FR-05）', () => {
  it('面はトリガーの直後、フローの中に出る（body 直下へ浮かない）', () => {
    const { container } = render(openPopover())
    const trigger = container.querySelector('button')
    const root = surfaceOf(container)

    expect(root).not.toBeNull()
    expect(trigger?.compareDocumentPosition(root as Node)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING as number,
    )
  })

  it('上流のインライン座標を打ち消してフローに戻す', () => {
    const { container } = render(openPopover())
    const root = surfaceOf(container)?.className
    expect(root).toContain('static!')
    expect(root).toContain('z-auto!')
  })

  it('placement / offset を渡しても浮かない（受け取るが効かない）', () => {
    const { container } = render(openPopover({ placement: 'right', offset: 24 }))
    expect(surfaceOf(container)?.className).toContain('static!')
  })

  it('背後を inert にしない（押し下げられた後続を読めなくなるため）', () => {
    const { container } = render(
      <div>
        {openPopover()}
        <p data-testid="after">後続</p>
      </div>,
    )
    expect(container.querySelector('[data-testid="after"]')?.closest('[inert]')).toBeNull()
  })
})

describe('Popover: 操作', () => {
  it('トリガーを押すと開く', async () => {
    render(
      <Popover>
        <Button>詳細</Button>
        <PopoverContent>ここに補足を書く</PopoverContent>
      </Popover>,
    )
    await userEvent.click(screen.getByRole('button'))
    expect(screen.getByText('ここに補足を書く')).toBeDefined()
  })

  it('Escape で閉じ、フォーカスがトリガーへ戻る', async () => {
    render(
      <Popover>
        <Button>詳細</Button>
        <PopoverContent>ここに補足を書く</PopoverContent>
      </Popover>,
    )
    const trigger = screen.getByRole('button')

    await userEvent.click(trigger)
    await userEvent.keyboard('{Escape}')

    await waitFor(() => {
      expect(screen.queryByText('ここに補足を書く')).toBeNull()
      expect(document.activeElement).toBe(trigger)
    })
  })
})

describe('Popover: Flatlay のデザイン規律', () => {
  it('矢印を描かない（指す先が無いので矢印は嘘になる）', () => {
    expect(popoverStyles().arrow()).toContain('hidden')
  })

  it('地を一段落として注記面であることを示す（一覧の展開部とは別の役割）', () => {
    expect(popoverStyles().root()).toContain('bg-[var(--novi-color-subtle)]')
  })

  it('面の存在は罫線が引き受ける（影を持たない）', () => {
    const root = popoverStyles().root()
    expect(root).toContain('border-[var(--novi-color-border-strong)]')
    expect(root).not.toMatch(/(?<![\w-])shadow-/)
  })

  it('z-index も transform も持たない（FR-02 / FR-11）', () => {
    const classes = Object.values(popoverStyles())
      .map((slot) => slot())
      .join(' ')
    expect(classes).not.toMatch(/(?<![\w-])z-(?:\d+|\[[^\]]*\])/)
    expect(classes).not.toMatch(/(?<![\w-])(?:scale|rotate|translate)-/)
  })

  it('既定の角は 2px（両テーマの lg ではない）', () => {
    expect(popoverStyles().root()).toContain('rounded-[var(--novi-radius-sm)]')
  })

  it.each(NOVI_RADII)('radius=%s が固有のクラスを適用する', (radius) => {
    const produced = NOVI_RADII.map((r) => popoverStyles({ radius: r }).root())
    expect(new Set(produced).size).toBe(NOVI_RADII.length)
    expect(popoverStyles({ radius }).root()).toContain(`rounded-[var(--novi-radius-${radius})]`)
  })
})

describe('Popover: 拡張', () => {
  it('tv({ extend }) で拡張できる', () => {
    const my = tv({ extend: popoverStyles, slots: { content: 'px-6' } })
    expect(my().content()).toContain('px-6')
  })

  it('classNames が該当 slot に反映される', () => {
    const { container } = render(openPopover({ classNames: { root: 'pop-root' } }))
    expect(surfaceOf(container)?.className).toContain('pop-root')
  })
})
