import { NOVI_CONTRACTS, NOVI_SIZES, NOVI_VARIANTS } from '@novi-ui/core'
import { checkSlotContract, testSlotContract } from '@novi-ui/core/testing'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { tv } from 'tailwind-variants'
import { describe, expect, it, vi } from 'vitest'
import { Input } from './input'
import { inputStyles } from './input.styles'

// 2. slot 契約（AC-03-1 / AC-03-2）
testSlotContract({
  name: 'Input',
  contract: NOVI_CONTRACTS.Input,
  render: () => (
    <Input
      label="メールアドレス"
      description="ログインに使用します"
      errorMessage="形式が正しくありません"
      isInvalid
      startContent={<span>@</span>}
      endContent={<span>✓</span>}
    />
  ),
})

describe('Input: 描画', () => {
  it('デフォルト props でレンダリングできる', () => {
    render(<Input label="氏名" />)
    expect(screen.getByRole('textbox', { name: '氏名' })).toBeDefined()
  })

  it('ラベルが入力欄に紐づく（AC-04-1）', () => {
    render(<Input label="氏名" />)
    expect(screen.getByLabelText('氏名')).toBeDefined()
  })

  it('任意 slot は指定しなければ描画しない', () => {
    const { container } = render(<Input />)
    const result = checkSlotContract(container, NOVI_CONTRACTS.Input)
    expect(result.missing).toEqual([])
    expect(result.found).toEqual(['input', 'inputWrapper', 'root'])
  })

  it('description が表示される', () => {
    render(<Input label="氏名" description="姓と名の間は空けない" />)
    expect(screen.getByText('姓と名の間は空けない')).toBeDefined()
  })

  it('isInvalid のときエラー文が表示される（色だけに頼らない）', () => {
    render(<Input label="氏名" isInvalid errorMessage="必須です" />)
    expect(screen.getByText('必須です')).toBeDefined()
  })

  it('isInvalid でないときエラー文は表示されない', () => {
    render(<Input label="氏名" errorMessage="必須です" />)
    expect(screen.queryByText('必須です')).toBeNull()
  })
})

describe('Input: variant / size（AC-02-1 / AC-01-2）', () => {
  it('全 variant が互いに異なるクラスを生む', () => {
    const classes = NOVI_VARIANTS.map((variant) => inputStyles({ variant }).inputWrapper())
    expect(new Set(classes).size).toBe(NOVI_VARIANTS.length)
  })

  it.each([
    ['sm', 'h-10'],
    ['md', 'h-12'],
    ['lg', 'h-14'],
  ] as const)('size=%s の高さが %s（40/48/56px・Button と揃っている）', (size, expected) => {
    expect(inputStyles({ size }).inputWrapper()).toContain(expected)
  })

  it('size 語彙をすべて実装している', () => {
    const classes = NOVI_SIZES.map((size) => inputStyles({ size }).inputWrapper())
    expect(new Set(classes).size).toBe(NOVI_SIZES.length)
  })
})

describe('Input: classNames（AC-03-3）', () => {
  it('slot 単位でクラスを差し込める', () => {
    const { container } = render(
      <Input label="氏名" classNames={{ root: 'my-root', input: 'my-input' }} />,
    )
    expect(container.querySelector('[data-slot="root"]')?.className).toContain('my-root')
    expect(container.querySelector('[data-slot="input"]')?.className).toContain('my-input')
  })
})

describe('Input: 入力と操作', () => {
  it('入力すると onChange が値を返す', async () => {
    const onChange = vi.fn()
    render(<Input label="氏名" onChange={onChange} />)

    await userEvent.type(screen.getByRole('textbox'), 'あ')

    expect(onChange).toHaveBeenCalledWith('あ')
  })

  it('isDisabled のとき入力できない', async () => {
    const onChange = vi.fn()
    render(<Input label="氏名" isDisabled onChange={onChange} />)

    await userEvent.type(screen.getByRole('textbox'), 'x')

    expect(onChange).not.toHaveBeenCalled()
  })

  it('isReadOnly のとき値が変わらない', async () => {
    const onChange = vi.fn()
    render(<Input label="氏名" isReadOnly defaultValue="固定" onChange={onChange} />)

    await userEvent.type(screen.getByRole('textbox'), 'x')

    expect(onChange).not.toHaveBeenCalled()
  })
})

describe('Input: IME（AC-07-1 / AC-07-2）', () => {
  it('変換中の Enter は onKeyDown に届かない', () => {
    const onKeyDown = vi.fn()
    render(<Input label="氏名" onKeyDown={onKeyDown} />)
    const input = screen.getByRole('textbox')

    fireEvent.compositionStart(input)
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true })

    expect(onKeyDown).not.toHaveBeenCalled()
  })

  it('変換中の矢印キーも届かない（候補選択に使われるため）', () => {
    const onKeyDown = vi.fn()
    render(<Input label="氏名" onKeyDown={onKeyDown} />)
    const input = screen.getByRole('textbox')

    fireEvent.compositionStart(input)
    fireEvent.keyDown(input, { key: 'ArrowDown', isComposing: true })

    expect(onKeyDown).not.toHaveBeenCalled()
  })

  it('IME を使わない Enter は届く', () => {
    const onKeyDown = vi.fn()
    render(<Input label="氏名" onKeyDown={onKeyDown} />)

    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' })

    expect(onKeyDown).toHaveBeenCalledTimes(1)
  })

  it('keyCode 229 のフォールバックも効く', () => {
    const onKeyDown = vi.fn()
    render(<Input label="氏名" onKeyDown={onKeyDown} />)

    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter', keyCode: 229 })

    expect(onKeyDown).not.toHaveBeenCalled()
  })
})

describe('Input: 拡張（AC-06-1）', () => {
  it('tv({ extend }) で拡張できる', () => {
    const myInput = tv({ extend: inputStyles, slots: { input: 'font-mono' } })
    expect(myInput({ size: 'lg' }).input()).toContain('font-mono')
    expect(myInput({ size: 'lg' }).inputWrapper()).toContain('h-14')
  })

  it('inputStyles が named export されている', () => {
    expect(typeof inputStyles).toBe('function')
  })
})
