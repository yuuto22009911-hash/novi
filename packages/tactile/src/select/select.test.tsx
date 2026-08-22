import { NOVI_CONTRACTS, NOVI_SIZES, NOVI_VARIANTS } from '@novi-ui/core'
import { testSlotContract } from '@novi-ui/core/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { tv } from 'tailwind-variants'
import { describe, expect, it, vi } from 'vitest'
import { Select, SelectItem } from './select'
import { selectStyles } from './select.styles'

function Subject(props: Partial<Parameters<typeof Select>[0]> = {}) {
  return (
    <Select label="都道府県" {...props}>
      <SelectItem id="tokyo">東京都</SelectItem>
      <SelectItem id="osaka">大阪府</SelectItem>
      <SelectItem id="kyoto" isDisabled>
        京都府
      </SelectItem>
    </Select>
  )
}

// popover / listbox / option は開いた状態でしか出ないため、defaultOpen で検査する
testSlotContract({
  name: 'Select',
  contract: NOVI_CONTRACTS.Select,
  render: () => (
    <Select label="都道府県" description="お住まいの地域" defaultOpen>
      <SelectItem id="tokyo">東京都</SelectItem>
    </Select>
  ),
})

describe('Select: 描画', () => {
  it('デフォルト props でレンダリングできる', () => {
    render(<Subject />)
    expect(screen.getByRole('button', { name: /都道府県/ })).toBeDefined()
  })

  it('未選択のときプレースホルダを表示する', () => {
    render(<Subject />)
    expect(screen.getByText('選択してください')).toBeDefined()
  })

  it('選択済みの値を表示する', () => {
    // RAC はフォーム送信用の隠し select も描画するため、
    // getByText では2件見つかってしまう。value slot を直接見る
    const { container } = render(<Subject defaultSelectedKey="osaka" />)
    expect(container.querySelector('[data-slot="value"]')?.textContent).toBe('大阪府')
  })

  it('閉じているとき選択肢は描画されない', () => {
    render(<Subject />)
    expect(screen.queryByRole('option')).toBeNull()
  })
})

describe('Select: 操作', () => {
  it('クリックで開き、選択すると onSelectionChange が呼ばれる', async () => {
    const onSelectionChange = vi.fn()
    render(<Subject onSelectionChange={onSelectionChange} />)

    await userEvent.click(screen.getByRole('button'))
    await userEvent.click(screen.getByRole('option', { name: '大阪府' }))

    expect(onSelectionChange).toHaveBeenCalledWith('osaka')
  })

  it('矢印キーで項目を移動できる（AC-04-4）', async () => {
    const onSelectionChange = vi.fn()
    render(<Subject onSelectionChange={onSelectionChange} />)

    await userEvent.tab()
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard('{ArrowDown}{Enter}')

    expect(onSelectionChange).toHaveBeenCalled()
  })

  it('Escape で閉じてトリガーへフォーカスが戻る（AC-04-3）', async () => {
    render(<Subject />)
    const trigger = screen.getByRole('button')

    await userEvent.click(trigger)
    expect(screen.getByRole('listbox')).toBeDefined()

    await userEvent.keyboard('{Escape}')

    expect(screen.queryByRole('listbox')).toBeNull()
    // フォーカス復帰は同期的に起きない（RAC は閉じるアニメーション後に戻す）。
    // 即座に assert すると body を見てしまうので待つ
    await waitFor(() => {
      expect(document.activeElement).toBe(trigger)
    })
  })

  it('isDisabled の項目は選択できない', async () => {
    const onSelectionChange = vi.fn()
    render(<Subject onSelectionChange={onSelectionChange} />)

    await userEvent.click(screen.getByRole('button'))
    await userEvent.click(screen.getByRole('option', { name: '京都府' }))

    expect(onSelectionChange).not.toHaveBeenCalled()
  })

  it('isDisabled のとき開かない', async () => {
    render(<Subject isDisabled />)

    await userEvent.click(screen.getByRole('button'))

    expect(screen.queryByRole('listbox')).toBeNull()
  })
})

describe('Select: variant / size', () => {
  it('全 variant が異なるクラスを生む', () => {
    const classes = NOVI_VARIANTS.map((variant) => selectStyles({ variant }).trigger())
    expect(new Set(classes).size).toBe(NOVI_VARIANTS.length)
  })

  it.each([
    ['sm', 'h-10'],
    ['md', 'h-12'],
    ['lg', 'h-14'],
  ] as const)(
    'size=%s の高さが %s（40/48/56px・Button / Input と揃っている）',
    (size, expected) => {
      expect(selectStyles({ size }).trigger()).toContain(expected)
    },
  )

  it('size 語彙をすべて実装している', () => {
    const classes = NOVI_SIZES.map((size) => selectStyles({ size }).trigger())
    expect(new Set(classes).size).toBe(NOVI_SIZES.length)
  })
})

describe('Select: classNames / 拡張', () => {
  it('slot 単位でクラスを差し込める', () => {
    const { container } = render(<Subject classNames={{ trigger: 'my-trigger' }} />)
    expect(container.querySelector('[data-slot="trigger"]')?.className).toContain('my-trigger')
  })

  it('tv({ extend }) で拡張できる', () => {
    const my = tv({ extend: selectStyles, slots: { popover: 'border-dashed' } })
    expect(my().popover()).toContain('border-dashed')
  })
})
