import { parseDate } from '@internationalized/date'
import { NOVI_CONTRACTS, NOVI_SIZES, NOVI_VARIANTS } from '@novi-ui/core'
import { testSlotContract } from '@novi-ui/core/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DatePicker } from './date-picker'
import { datePickerStyles } from './date-picker.styles'

const SEPT = parseDate('2026-09-05')

function Subject(props: Partial<Parameters<typeof DatePicker>[0]> = {}) {
  return <DatePicker label="出荷日" defaultValue={SEPT} {...props} />
}

/**
 * カレンダーの 9 月 n 日のボタン。月も含めて引く。
 * 前後の月のはみ出し（8/30・10/3 など）も升目として描かれ、日だけでは複数当たる
 */
const day = (n: number) =>
  screen.getByRole('button', { name: new RegExp(`(September|9月)\\s?${n}(,|日)`) })

// popover / calendar 系は開いた状態でしか出ないため、defaultOpen で検査する
testSlotContract({
  name: 'DatePicker',
  contract: NOVI_CONTRACTS.DatePicker,
  render: () => (
    <DatePicker
      label="出荷日"
      description="営業日のみ"
      errorMessage="日付を選んでください"
      isInvalid
      defaultValue={SEPT}
      defaultOpen
    />
  ),
})

describe('DatePicker: 描画', () => {
  it('デフォルト props でレンダリングできる', () => {
    render(<Subject />)
    expect(screen.getByRole('group', { name: /出荷日/ })).toBeDefined()
  })

  it('年 / 月 / 日のマスが spinbutton で出る（FR-05-1）', () => {
    render(<Subject />)
    expect(screen.getAllByRole('spinbutton')).toHaveLength(3)
  })

  it('閉じているときカレンダーは描画されない', () => {
    render(<Subject />)
    expect(screen.queryByRole('grid')).toBeNull()
  })

  it('isInvalid のときエラー文が表示される（色だけに頼らない）', () => {
    render(<Subject isInvalid errorMessage="日付を選んでください" />)
    expect(screen.getByText('日付を選んでください')).toBeDefined()
  })
})

describe('DatePicker: マスの入力', () => {
  it('マスの矢印キー上下で値が変わる', async () => {
    const onChange = vi.fn()
    render(<Subject onChange={onChange} />)
    const segments = screen.getAllByRole('spinbutton')
    // 最後のマスは日（ja / en どちらの並びでも日が末尾ではない環境がある）。
    // 値の変化だけを見るため、年でも月でも日でもよい最初のマスを使う
    const first = segments[0] as HTMLElement

    await userEvent.click(first)
    await userEvent.keyboard('{ArrowUp}')

    expect(onChange).toHaveBeenCalledTimes(1)
    const next = onChange.mock.calls[0]?.[0]
    expect(next.compare(SEPT)).toBeGreaterThan(0)
  })
})

describe('DatePicker: カレンダー（FR-05-2 / AC-05-1 / AC-05-2）', () => {
  it('トリガーで開き、日を押すと onChange にその日が渡る', async () => {
    const onChange = vi.fn()
    render(<Subject onChange={onChange} />)

    await userEvent.click(screen.getByRole('button', { name: /カレンダー|Calendar/ }))
    expect(screen.getByRole('grid')).toBeDefined()

    await userEvent.click(day(15))

    const picked = onChange.mock.calls[0]?.[0]
    expect(picked.toString()).toBe('2026-09-15')
  })

  it('矢印キーで翌日へフォーカスが移る（AC-05-1）', async () => {
    render(<Subject />)

    await userEvent.click(screen.getByRole('button', { name: /カレンダー|Calendar/ }))
    // 開いた直後は選択中の日（5 日）にフォーカスがある
    await waitFor(() => {
      expect(document.activeElement?.getAttribute('aria-label')).toMatch(/\b5\b/)
    })

    await userEvent.keyboard('{ArrowRight}')

    expect(document.activeElement?.getAttribute('aria-label')).toMatch(/\b6\b/)
  })

  it('minValue より前の日は選べない（AC-05-2）', async () => {
    const onChange = vi.fn()
    render(<Subject minValue={parseDate('2026-09-10')} onChange={onChange} />)

    await userEvent.click(screen.getByRole('button', { name: /カレンダー|Calendar/ }))
    const cell = day(3)
    expect(cell.getAttribute('aria-disabled')).toBe('true')

    await userEvent.click(cell)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('isDateUnavailable の日は選べない', async () => {
    const onChange = vi.fn()
    render(<Subject isDateUnavailable={(d) => d.day === 20} onChange={onChange} />)

    await userEvent.click(screen.getByRole('button', { name: /カレンダー|Calendar/ }))
    expect(day(20).getAttribute('aria-disabled')).toBe('true')
  })

  it('Escape で閉じる', async () => {
    render(<Subject />)

    await userEvent.click(screen.getByRole('button', { name: /カレンダー|Calendar/ }))
    expect(screen.getByRole('grid')).toBeDefined()

    await userEvent.keyboard('{Escape}')

    await waitFor(() => {
      expect(screen.queryByRole('grid')).toBeNull()
    })
  })

  it('isDisabled のとき開かない', async () => {
    render(<Subject isDisabled />)

    await userEvent.click(screen.getByRole('button', { name: /カレンダー|Calendar/ }))

    expect(screen.queryByRole('grid')).toBeNull()
  })
})

describe('DatePicker: variant / size', () => {
  it('全 variant が互いに異なるクラスを生む', () => {
    const classes = NOVI_VARIANTS.map((variant) => datePickerStyles({ variant }).inputWrapper())
    expect(new Set(classes).size).toBe(NOVI_VARIANTS.length)
  })

  it.each([
    ['sm', 'h-7'],
    ['md', 'h-8'],
    ['lg', 'h-10'],
  ] as const)('size=%s の高さが %s（Input と揃っている）', (size, expected) => {
    expect(datePickerStyles({ size }).inputWrapper()).toContain(expected)
  })

  it('size 語彙をすべて実装している', () => {
    const classes = NOVI_SIZES.map((size) => datePickerStyles({ size }).dateInput())
    expect(new Set(classes).size).toBe(NOVI_SIZES.length)
  })
})

describe('DatePicker: classNames', () => {
  it('slot 単位でクラスを差し込める', () => {
    const { container } = render(
      <Subject classNames={{ inputWrapper: 'my-wrapper', segment: 'my-segment' }} />,
    )
    expect(container.querySelector('[data-slot="inputWrapper"]')?.className).toContain('my-wrapper')
    expect(container.querySelector('[data-slot="segment"]')?.className).toContain('my-segment')
  })
})
