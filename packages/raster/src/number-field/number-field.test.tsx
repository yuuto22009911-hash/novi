import { NOVI_CONTRACTS, NOVI_SIZES, NOVI_VARIANTS } from '@novi-ui/core'
import { checkSlotContract, testSlotContract } from '@novi-ui/core/testing'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { NumberField } from './number-field'
import { numberFieldStyles } from './number-field.styles'

// 2. slot 契約
testSlotContract({
  name: 'NumberField',
  contract: NOVI_CONTRACTS.NumberField,
  render: () => (
    <NumberField
      label="数量"
      description="1以上"
      errorMessage="1以上を入力してください"
      isInvalid
      defaultValue={1}
    />
  ),
})

describe('NumberField: 描画', () => {
  it('デフォルト props でレンダリングできる', () => {
    render(<NumberField label="数量" />)
    expect(screen.getByRole('textbox', { name: '数量' })).toBeDefined()
  })

  it('必須 slot と増減ボタンが出る', () => {
    const { container } = render(<NumberField label="数量" />)
    const result = checkSlotContract(container, NOVI_CONTRACTS.NumberField)
    expect(result.missing).toEqual([])
    expect(result.found).toContain('decrement')
    expect(result.found).toContain('increment')
  })

  it('増減ボタンは名前を持つ（FR-01-4）', () => {
    render(<NumberField label="数量" />)
    for (const button of screen.getAllByRole('button')) {
      expect(button.getAttribute('aria-label') ?? button.textContent).not.toBe('')
    }
    expect(screen.getAllByRole('button')).toHaveLength(2)
  })

  it('isInvalid のときエラー文が表示される（色だけに頼らない）', () => {
    render(<NumberField label="数量" isInvalid errorMessage="必須です" />)
    expect(screen.getByText('必須です')).toBeDefined()
  })

  it('formatOptions で通貨として表示できる（FR-01-3）', () => {
    render(
      <NumberField
        label="単価"
        defaultValue={1200}
        formatOptions={{ style: 'currency', currency: 'JPY' }}
      />,
    )
    const input = screen.getByRole('textbox', { name: '単価' }) as HTMLInputElement
    expect(input.value).toMatch(/1,200/)
    expect(input.value).toMatch(/[￥¥]|JPY/)
  })
})

describe('NumberField: variant / size', () => {
  it('全 variant が互いに異なるクラスを生む', () => {
    const classes = NOVI_VARIANTS.map((variant) => numberFieldStyles({ variant }).inputWrapper())
    expect(new Set(classes).size).toBe(NOVI_VARIANTS.length)
  })

  it.each([
    ['sm', 'h-8'],
    ['md', 'h-10'],
    ['lg', 'h-12'],
  ] as const)('size=%s の高さが %s（Input と揃っている）', (size, expected) => {
    expect(numberFieldStyles({ size }).inputWrapper()).toContain(expected)
  })

  it('size 語彙をすべて実装している', () => {
    const classes = NOVI_SIZES.map((size) => numberFieldStyles({ size }).input())
    expect(new Set(classes).size).toBe(NOVI_SIZES.length)
  })
})

describe('NumberField: classNames', () => {
  it('slot 単位でクラスを差し込める', () => {
    const { container } = render(
      <NumberField label="数量" classNames={{ root: 'my-root', increment: 'my-inc' }} />,
    )
    expect(container.querySelector('[data-slot="root"]')?.className).toContain('my-root')
    expect(container.querySelector('[data-slot="increment"]')?.className).toContain('my-inc')
  })
})

describe('NumberField: 操作（FR-01-1 / FR-01-2 / FR-01-5）', () => {
  it('ArrowUp で step ぶん増える', async () => {
    const onChange = vi.fn()
    // RAC は値を step の倍数に揃える。1 から step 2 で上げると 3 ではなく 2 になるので、
    // 揃った値から始めて刻みだけを見る
    render(<NumberField label="数量" defaultValue={2} step={2} onChange={onChange} />)
    const input = screen.getByRole('textbox', { name: '数量' })

    await userEvent.click(input)
    await userEvent.keyboard('{ArrowUp}')

    expect(onChange).toHaveBeenLastCalledWith(4)
  })

  it('minValue で止まる（AC-01-1）', async () => {
    const onChange = vi.fn()
    render(<NumberField label="数量" defaultValue={1} minValue={0} onChange={onChange} />)
    const input = screen.getByRole('textbox', { name: '数量' })

    await userEvent.click(input)
    await userEvent.keyboard('{ArrowDown}{ArrowDown}')

    expect(onChange).toHaveBeenLastCalledWith(0)
    expect((input as HTMLInputElement).value).toBe('0')
  })

  it('増減ボタンで値が変わる', async () => {
    const onChange = vi.fn()
    render(<NumberField label="数量" defaultValue={1} onChange={onChange} />)
    const { container } = { container: document.body }

    await userEvent.click(container.querySelector('[data-slot="increment"]') as Element)
    expect(onChange).toHaveBeenLastCalledWith(2)

    await userEvent.click(container.querySelector('[data-slot="decrement"]') as Element)
    expect(onChange).toHaveBeenLastCalledWith(1)
  })

  it('空にすると null を返す。NaN は出さない（AC-01-2 / ADR-B2）', async () => {
    const onChange = vi.fn()
    render(<NumberField label="数量" defaultValue={1} onChange={onChange} />)
    const input = screen.getByRole('textbox', { name: '数量' })

    await userEvent.clear(input)
    await userEvent.tab()

    expect(onChange).toHaveBeenLastCalledWith(null)
    expect(onChange.mock.calls.some(([v]) => Number.isNaN(v))).toBe(false)
  })

  it('isDisabled のとき増減ボタンも無効', () => {
    render(<NumberField label="数量" isDisabled />)
    for (const button of screen.getAllByRole('button')) {
      expect(
        button.hasAttribute('disabled') || button.getAttribute('aria-disabled') === 'true',
      ).toBe(true)
    }
  })
})

describe('NumberField: IME（FR-00-3）', () => {
  it('変換中の Enter は onKeyDown に届かない', () => {
    const onKeyDown = vi.fn()
    render(<NumberField label="数量" onKeyDown={onKeyDown} />)
    const input = screen.getByRole('textbox', { name: '数量' })

    fireEvent.compositionStart(input)
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true })

    expect(onKeyDown).not.toHaveBeenCalled()
  })

  it('IME を使わない Enter は届く', () => {
    const onKeyDown = vi.fn()
    render(<NumberField label="数量" onKeyDown={onKeyDown} />)

    fireEvent.keyDown(screen.getByRole('textbox', { name: '数量' }), { key: 'Enter' })

    expect(onKeyDown).toHaveBeenCalledTimes(1)
  })
})
