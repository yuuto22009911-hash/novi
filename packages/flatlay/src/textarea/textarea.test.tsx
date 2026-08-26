import { NOVI_CONTRACTS, NOVI_SIZES, NOVI_VARIANTS } from '@novi-ui/core'
import { testSlotContract } from '@novi-ui/core/testing'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { tv } from 'tailwind-variants'
import { describe, expect, it, vi } from 'vitest'
import { TextArea } from './textarea'
import { textareaStyles } from './textarea.styles'

const fullTextArea = (props: Partial<Parameters<typeof TextArea>[0]> = {}) => (
  <TextArea label="備考" description="500 文字まで" maxLength={500} {...props} />
)

testSlotContract({
  name: 'Textarea',
  contract: NOVI_CONTRACTS.Textarea,
  render: () => fullTextArea({ isInvalid: true, errorMessage: '入力してください' }),
})

describe('TextArea: 描画', () => {
  it('デフォルト props でレンダリングできる', () => {
    render(<TextArea label="備考" />)
    expect(screen.getByRole('textbox', { name: '備考' })).toBeDefined()
  })

  it('rows が既定で 3 行', () => {
    render(<TextArea label="備考" />)
    expect(screen.getByRole('textbox').getAttribute('rows')).toBe('3')
  })

  it('入力した値が onChange に届く', async () => {
    const onChange = vi.fn()
    render(<TextArea label="備考" onChange={onChange} />)

    await userEvent.type(screen.getByRole('textbox'), 'あ')

    expect(onChange).toHaveBeenCalledWith('あ')
  })
})

describe('TextArea: variant / size（AC-04-1）', () => {
  it.each(NOVI_VARIANTS)('variant=%s が固有のクラスを適用する', (variant) => {
    const produced = NOVI_VARIANTS.map((v) => textareaStyles({ variant: v }).inputWrapper())
    expect(new Set(produced).size).toBe(NOVI_VARIANTS.length)
    expect(textareaStyles({ variant }).inputWrapper()).toBeTruthy()
  })

  it.each(NOVI_SIZES)('size=%s が固有のクラスを適用する', (size) => {
    const produced = NOVI_SIZES.map((s) => textareaStyles({ size: s }).inputWrapper())
    expect(new Set(produced).size).toBe(NOVI_SIZES.length)
    expect(textareaStyles({ size }).inputWrapper()).toBeTruthy()
  })

  it('高さは固定しない（行数は rows が決める）', () => {
    for (const size of NOVI_SIZES) {
      expect(textareaStyles({ size }).inputWrapper(), size).not.toMatch(/(?<![\w-])h-\d/)
    }
  })
})

describe('TextArea: Flatlay のデザイン規律', () => {
  it('縦だけリサイズできる（横に伸びると列の揃いが崩れる）', () => {
    expect(textareaStyles().textarea()).toContain('resize-y')
  })

  it('全 variant が罫線の幅を持つ（FR-11）', () => {
    for (const variant of NOVI_VARIANTS) {
      expect(textareaStyles({ variant }).inputWrapper(), variant).toMatch(
        /(?<![\w-])border(?![\w-])/,
      )
    }
  })

  it('項目名と注記が等幅で出る（ADR-F7）', () => {
    expect(textareaStyles().label()).toContain('font-(family-name:--novi-font-mono)')
    expect(textareaStyles().description()).toContain('font-(family-name:--novi-font-mono)')
  })

  it('影も z-index も持たない（FR-02）', () => {
    for (const variant of NOVI_VARIANTS) {
      const classes = Object.values(textareaStyles({ variant }))
        .map((slot) => slot())
        .join(' ')
      expect(classes, variant).not.toMatch(/(?<![\w-])shadow-/)
      expect(classes, variant).not.toMatch(/(?<![\w-])z-(?:\d+|\[[^\]]*\])/)
    }
  })
})

describe('TextArea: 状態と IME（AC-07-3）', () => {
  it('isInvalid でエラー文が出る', () => {
    render(<TextArea label="備考" isInvalid errorMessage="入力してください" />)
    expect(screen.getByText('入力してください')).toBeDefined()
  })

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

describe('TextArea: classNames（FR-04）', () => {
  it('classNames が該当 slot に反映される', () => {
    const { container } = render(
      fullTextArea({
        classNames: {
          root: 'test-root',
          label: 'test-label',
          inputWrapper: 'test-wrapper',
          textarea: 'test-textarea',
          description: 'test-description',
        },
      }),
    )
    for (const [slot, cls] of [
      ['root', 'test-root'],
      ['label', 'test-label'],
      ['inputWrapper', 'test-wrapper'],
      ['textarea', 'test-textarea'],
      ['description', 'test-description'],
    ] as const) {
      expect(container.querySelector(`[data-slot="${slot}"]`)?.className, slot).toContain(cls)
    }
  })

  it('tv({ extend: textareaStyles }) で拡張できる', () => {
    const custom = tv({ extend: textareaStyles, slots: { textarea: 'resize-none' } })
    expect(custom({}).textarea()).toContain('resize-none')
  })
})
