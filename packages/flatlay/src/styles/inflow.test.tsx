import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Button,
  Label,
  ListBox,
  ListBoxItem,
  Menu,
  MenuItem,
  MenuTrigger,
  Select,
  SelectValue,
} from 'react-aria-components'
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import { InflowPopover } from './inflow'

/**
 * インフロー展開の検査（FR-05 / FR-09）。
 *
 * jsdom はレイアウトを持たないので「後続が何 px 押し下がったか」は測れない。
 * 代わりに**押し下げが起こりうる形になっているか**を見る。すなわち
 * 展開部が body 直下ではなくトリガ直後のフロー内にあり、閉じれば消えること。
 * 実寸の押し下げは視覚回帰と e2e（T-33 以降）が担当する。
 */

/** jsdom は Element.scrollIntoView を実装しない。呼ばれたことだけ見たいので差し替える。 */
type ScrollIntoView = (arg?: boolean | ScrollIntoViewOptions) => void
let scrollIntoView: Mock<ScrollIntoView>

beforeEach(() => {
  scrollIntoView = vi.fn<ScrollIntoView>()
  Element.prototype.scrollIntoView = scrollIntoView
})

function MenuFixture() {
  return (
    <div>
      <MenuTrigger>
        <Button>操作</Button>
        <InflowPopover className="border">
          <Menu aria-label="操作">
            <MenuItem id="copy">複製</MenuItem>
            <MenuItem id="rename">名前を変更</MenuItem>
          </Menu>
        </InflowPopover>
      </MenuTrigger>
      <p data-testid="below">後続</p>
    </div>
  )
}

function SelectFixture() {
  return (
    <Select>
      <Label>サイズ</Label>
      <Button>
        <SelectValue />
      </Button>
      <InflowPopover>
        <ListBox>
          <ListBoxItem id="s">S</ListBoxItem>
          <ListBoxItem id="m">M</ListBoxItem>
        </ListBox>
      </InflowPopover>
    </Select>
  )
}

const openMenu = async () => {
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: '操作' }))
  return user
}

describe('InflowPopover', () => {
  it('展開部がトリガ直後のフロー内コンテナに入る（body 直下に浮かない）', async () => {
    const { container } = render(<MenuFixture />)
    await openMenu()

    const slot = container.querySelector('[data-novi-inflow]')
    expect(slot).not.toBeNull()
    expect(slot?.contains(screen.getByRole('menu'))).toBe(true)
  })

  it('展開部が後続より前にある（押し下げが成立する DOM 順）', async () => {
    const { container } = render(<MenuFixture />)
    await openMenu()

    const slot = container.querySelector('[data-novi-inflow]') as HTMLElement
    const below = screen.getByTestId('below')
    // DOCUMENT_POSITION_FOLLOWING = 4。後続が展開部より後ろにいる＝押し下げられる側
    expect(slot.compareDocumentPosition(below) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('閉じると展開部が DOM から消える（場所を返す）', async () => {
    render(<MenuFixture />)
    const user = await openMenu()
    expect(screen.getByRole('menu')).toBeTruthy()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('背後を inert にしない（押し下げた後続を読めなくなっては意味がない）', async () => {
    render(<MenuFixture />)
    await openMenu()

    const below = screen.getByTestId('below')
    expect(below.closest('[aria-hidden="true"]')).toBeNull()
    expect(below.closest('[inert]')).toBeNull()
  })

  it('上流のインラインな位置指定を打ち消すリセットが乗る', async () => {
    render(<MenuFixture />)
    await openMenu()

    const popover = screen.getByRole('menu').closest('.static\\!') as HTMLElement
    expect(popover).not.toBeNull()
    for (const cls of ['static!', 'max-h-none!', 'w-auto!', 'transform-none!']) {
      expect(popover.classList.contains(cls)).toBe(true)
    }
  })

  it('渡した className がリセットに足される（置き換えない）', async () => {
    render(<MenuFixture />)
    await openMenu()

    const popover = screen.getByRole('menu').parentElement as HTMLElement
    expect(popover.classList.contains('border')).toBe(true)
    expect(popover.classList.contains('static!')).toBe(true)
  })

  it('className を渡さなくてもリセットだけで成立する', async () => {
    render(<SelectFixture />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /サイズ/ }))

    const popover = screen.getByRole('listbox').parentElement as HTMLElement
    expect(popover.className).toBe('static! max-h-none! w-auto! transform-none!')
  })

  it('開いたときに最小限だけスクロールする（block: nearest）', async () => {
    render(<MenuFixture />)
    await openMenu()

    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' })
  })

  it('Select のコレクションが生きている（矢印と Enter で選べる）', async () => {
    render(<SelectFixture />)
    const user = userEvent.setup()
    const trigger = screen.getByRole('button', { name: /サイズ/ })

    await user.click(trigger)
    // 開いた直後の焦点は ListBox 自身。1回目で先頭、2回目で次の項目へ移る
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}')

    expect(trigger.textContent).toContain('M')
    await waitFor(() => expect(document.activeElement).toBe(trigger))
  })
})
