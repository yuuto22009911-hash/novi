import { NOVI_CONTRACTS, NOVI_VARIANTS } from '@novi-ui/core'
import { checkSlotContract, testSlotContract } from '@novi-ui/core/testing'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { tv } from 'tailwind-variants'
import { describe, expect, it, vi } from 'vitest'
import { TextArea } from './textarea'
import { textareaStyles } from './textarea.styles'

testSlotContract({
  name: 'TextArea',
  contract: NOVI_CONTRACTS.Textarea,
  render: () => (
    <TextArea label="備考" description="500文字まで" errorMessage="長すぎます" isInvalid />
  ),
})

describe('TextArea: 描画', () => {
  it('デフォルト props でレンダリングできる', () => {
    render(<TextArea label="備考" />)
    expect(screen.getByRole('textbox', { name: '備考' })).toBeDefined()
  })

  it('任意 slot は指定しなければ描画しない', () => {
    const { container } = render(<TextArea />)
    const result = checkSlotContract(container, NOVI_CONTRACTS.Textarea)
    expect(result.missing).toEqual([])
    expect(result.found).toEqual(['inputWrapper', 'root', 'textarea'])
  })

  it('rows を指定できる', () => {
    render(<TextArea label="備考" rows={6} />)
    expect(screen.getByRole('textbox').getAttribute('rows')).toBe('6')
  })

  it('横方向のリサイズを許可しない（レイアウトが崩れるため）', () => {
    expect(textareaStyles().textarea()).toContain('resize-y')
    expect(textareaStyles().textarea()).not.toContain('resize-x')
  })
})

describe('TextArea: variant', () => {
  it('全 variant が異なるクラスを生む', () => {
    const classes = NOVI_VARIANTS.map((variant) => textareaStyles({ variant }).inputWrapper())
    expect(new Set(classes).size).toBe(NOVI_VARIANTS.length)
  })
})

describe('TextArea: IME（AC-07-1）', () => {
  it('変換中の Enter は onKeyDown に届かない', () => {
    const onKeyDown = vi.fn()
    render(<TextArea label="備考" onKeyDown={onKeyDown} />)
    const textarea = screen.getByRole('textbox')

    fireEvent.compositionStart(textarea)
    fireEvent.keyDown(textarea, { key: 'Enter', isComposing: true })

    expect(onKeyDown).not.toHaveBeenCalled()
  })

  it('IME を使わない Enter は届く', () => {
    const onKeyDown = vi.fn()
    render(<TextArea label="備考" onKeyDown={onKeyDown} />)

    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' })

    expect(onKeyDown).toHaveBeenCalledTimes(1)
  })
})

describe('TextArea: 入力', () => {
  it('入力すると onChange が値を返す', async () => {
    const onChange = vi.fn()
    render(<TextArea label="備考" onChange={onChange} />)

    await userEvent.type(screen.getByRole('textbox'), 'あ')

    expect(onChange).toHaveBeenCalledWith('あ')
  })
})

describe('TextArea: classNames / 拡張', () => {
  it('slot 単位でクラスを差し込める', () => {
    const { container } = render(<TextArea classNames={{ textarea: 'my-textarea' }} />)
    expect(container.querySelector('[data-slot="textarea"]')?.className).toContain('my-textarea')
  })

  it('tv({ extend }) で拡張できる', () => {
    const my = tv({ extend: textareaStyles, slots: { textarea: 'font-mono' } })
    expect(my().textarea()).toContain('font-mono')
  })
})
