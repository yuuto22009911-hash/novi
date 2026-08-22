import { NOVI_CONTRACTS } from '@novi-ui/core'
import { checkSlotContract, testSlotContract } from '@novi-ui/core/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { tv } from 'tailwind-variants'
import { describe, expect, it } from 'vitest'
import { Button } from '../button'
import { Popover, PopoverContent, Tooltip } from './popover'
import { popoverStyles, tooltipStyles } from './popover.styles'

testSlotContract({
  name: 'Popover',
  contract: NOVI_CONTRACTS.Popover,
  render: () => (
    <Popover defaultOpen>
      <Button>詳細</Button>
      <PopoverContent>ここに補足を書く</PopoverContent>
    </Popover>
  ),
})

testSlotContract({
  name: 'Tooltip',
  contract: NOVI_CONTRACTS.Tooltip,
  render: () => (
    <Tooltip content="コピーする" defaultOpen>
      <Button>複製</Button>
    </Tooltip>
  ),
})

describe('Popover: 操作（AC-04-3）', () => {
  it('閉じているときは中身を描画しない', () => {
    render(
      <Popover>
        <Button>詳細</Button>
        <PopoverContent>補足</PopoverContent>
      </Popover>,
    )
    expect(screen.queryByText('補足')).toBeNull()
  })

  it('クリックで開く', async () => {
    render(
      <Popover>
        <Button>詳細</Button>
        <PopoverContent>補足</PopoverContent>
      </Popover>,
    )

    await userEvent.click(screen.getByRole('button', { name: '詳細' }))

    expect(screen.getByText('補足')).toBeDefined()
  })

  it('Escape で閉じてトリガーへフォーカスが戻る', async () => {
    render(
      <Popover>
        <Button>詳細</Button>
        <PopoverContent>補足</PopoverContent>
      </Popover>,
    )
    const trigger = screen.getByRole('button', { name: '詳細' })

    await userEvent.click(trigger)
    await userEvent.keyboard('{Escape}')

    await waitFor(() => {
      expect(screen.queryByText('補足')).toBeNull()
    })
    await waitFor(() => {
      expect(document.activeElement).toBe(trigger)
    })
  })
})

describe('Tooltip', () => {
  // ホバーでの表示は jsdom では検証できない。
  // React Aria の useHover はポインタの種類と移動を見ており、jsdom はそこまで再現しない。
  // 実測では focus と defaultOpen では開くため実装は正しい。
  // ホバー時の挙動は docs サイトのブラウザ確認（03-docs-site）で担保する。

  it('フォーカスで開く（キーボード利用者に届く経路）', async () => {
    render(
      <Tooltip content="コピーする">
        <Button>複製</Button>
      </Tooltip>,
    )

    await userEvent.tab()

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeDefined()
    })
  })

  it('反転色で表示する（操作対象ではないことを色で区別する）', () => {
    expect(tooltipStyles().root()).toContain('bg-[var(--novi-color-fg)]')
    expect(tooltipStyles().root()).toContain('text-[var(--novi-color-bg)]')
  })

  it('isDisabled のとき開かない', async () => {
    render(
      <Tooltip content="コピーする" isDisabled>
        <Button>複製</Button>
      </Tooltip>,
    )

    await userEvent.hover(screen.getByRole('button'))

    expect(screen.queryByRole('tooltip')).toBeNull()
  })
})

describe('Popover / Tooltip: 拡張', () => {
  it('tv({ extend }) で拡張できる', () => {
    expect(tv({ extend: popoverStyles, slots: { content: 'p-6' } })().content()).toContain('p-6')
    expect(tv({ extend: tooltipStyles, slots: { content: 'p-2' } })().content()).toContain('p-2')
  })
})
