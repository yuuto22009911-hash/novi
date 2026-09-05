import { NOVI_CONTRACTS, NOVI_SIZES, NOVI_VARIANTS } from '@novi-ui/core'
import { checkSlotContract, formatSlotContractFailure } from '@novi-ui/core/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ComboBox, ComboBoxItem } from './combo-box'
import { comboBoxStyles } from './combo-box.styles'

function Subject(props: Partial<Parameters<typeof ComboBox>[0]> = {}) {
  return (
    <ComboBox label="都道府県" {...props}>
      <ComboBoxItem id="tokyo">東京都</ComboBoxItem>
      <ComboBoxItem id="osaka">大阪府</ComboBoxItem>
      <ComboBoxItem id="kyoto" isDisabled>
        京都府
      </ComboBoxItem>
    </ComboBox>
  )
}

const combobox = () => screen.getByRole('combobox', { name: '都道府県' })

// popover / listbox / option は開いた状態でしか出ない。ComboBox は開閉を props で
// 固定できない（入力とキー操作から導く）ので、開いてから baseElement を検査する
describe('ComboBox: slot 契約', () => {
  const renderOpen = async () => {
    const { baseElement } = render(
      <ComboBox
        label="都道府県"
        description="お住まいの地域"
        errorMessage="選んでください"
        isInvalid
      >
        <ComboBoxItem id="tokyo">東京都</ComboBoxItem>
      </ComboBox>,
    )
    await userEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('listbox')).toBeDefined()
    return checkSlotContract(baseElement, NOVI_CONTRACTS.ComboBox)
  }

  it('必須 slot をすべて data-slot で出力する', async () => {
    const result = await renderOpen()
    expect(result.missing, formatSlotContractFailure('ComboBox', result)).toEqual([])
  })

  it('語彙にない data-slot を出力しない', async () => {
    const result = await renderOpen()
    expect(result.unknown, formatSlotContractFailure('ComboBox', result)).toEqual([])
  })
})

describe('ComboBox: 描画', () => {
  it('デフォルト props でレンダリングできる', () => {
    render(<Subject />)
    expect(combobox()).toBeDefined()
  })

  it('閉じているとき選択肢は描画されない', () => {
    render(<Subject />)
    expect(screen.queryByRole('option')).toBeNull()
  })

  it('選択済みの値が入力欄に出る', () => {
    render(<Subject defaultSelectedKey="osaka" />)
    expect((combobox() as HTMLInputElement).value).toBe('大阪府')
  })

  it('isInvalid のときエラー文が表示される（色だけに頼らない）', () => {
    render(<Subject isInvalid errorMessage="選んでください" />)
    expect(screen.getByText('選んでください')).toBeDefined()
  })
})

describe('ComboBox: 絞り込みと選択（FR-02-1 / AC-02-1）', () => {
  it('文字を打つと一覧が絞られる', async () => {
    render(<Subject />)

    await userEvent.type(combobox(), '東')

    const options = screen.getAllByRole('option')
    expect(options.map((o) => o.textContent)).toEqual(['東京都'])
  })

  it('項目を押すと onSelectionChange が呼ばれ、入力欄がその名前になる', async () => {
    const onSelectionChange = vi.fn()
    render(<Subject onSelectionChange={onSelectionChange} />)

    await userEvent.type(combobox(), '大')
    await userEvent.click(screen.getByRole('option', { name: '大阪府' }))

    expect(onSelectionChange).toHaveBeenCalledWith('osaka')
    expect((combobox() as HTMLInputElement).value).toBe('大阪府')
  })

  it('開くボタンで一覧が開く', async () => {
    render(<Subject />)

    await userEvent.click(screen.getByRole('button'))

    expect(screen.getByRole('listbox')).toBeDefined()
    expect(screen.getAllByRole('option')).toHaveLength(3)
  })

  it('矢印キーで開いて移動し、Enter で決定できる', async () => {
    const onSelectionChange = vi.fn()
    render(<Subject onSelectionChange={onSelectionChange} />)

    await userEvent.click(combobox())
    await userEvent.keyboard('{ArrowDown}')
    expect(screen.getByRole('listbox')).toBeDefined()
    await userEvent.keyboard('{Enter}')

    expect(onSelectionChange).toHaveBeenCalledWith('tokyo')
  })

  it('Escape で閉じる', async () => {
    render(<Subject />)

    await userEvent.click(combobox())
    await userEvent.keyboard('{ArrowDown}')
    expect(screen.getByRole('listbox')).toBeDefined()

    await userEvent.keyboard('{Escape}')

    await waitFor(() => {
      expect(screen.queryByRole('listbox')).toBeNull()
    })
  })

  it('isDisabled の項目は選択できない', async () => {
    const onSelectionChange = vi.fn()
    render(<Subject onSelectionChange={onSelectionChange} />)

    await userEvent.click(screen.getByRole('button'))
    await userEvent.click(screen.getByRole('option', { name: '京都府' }))

    expect(onSelectionChange).not.toHaveBeenCalled()
  })

  it('allowsCustomValue のとき一覧に無い文字列が残る（FR-02-3）', async () => {
    const onInputChange = vi.fn()
    render(<Subject allowsCustomValue onInputChange={onInputChange} />)

    await userEvent.type(combobox(), '沖縄')
    await userEvent.tab()

    expect((combobox() as HTMLInputElement).value).toBe('沖縄')
  })

  it('allowsCustomValue でなければ、一覧に無い文字列は blur で消える', async () => {
    render(<Subject />)

    await userEvent.type(combobox(), '沖縄')
    await userEvent.tab()

    expect((combobox() as HTMLInputElement).value).toBe('')
  })

  it('isDisabled のとき入力も開閉もできない', async () => {
    render(<Subject isDisabled />)

    await userEvent.click(screen.getByRole('button'))

    expect(screen.queryByRole('listbox')).toBeNull()
    expect(combobox()).toHaveProperty('disabled', true)
  })
})

describe('ComboBox: IME（FR-02-2 / AC-02-2）', () => {
  it('変換中の Enter で決定しない', async () => {
    const onSelectionChange = vi.fn()
    render(<Subject onSelectionChange={onSelectionChange} />)
    const input = combobox()

    await userEvent.type(input, '東')
    expect(screen.getAllByRole('option')).toHaveLength(1)

    fireEvent.compositionStart(input)
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true })

    expect(onSelectionChange).not.toHaveBeenCalled()
    expect(screen.getByRole('listbox')).toBeDefined()
  })

  it('変換中の矢印キーで一覧のフォーカスが動かない', async () => {
    render(<Subject />)
    const input = combobox()

    await userEvent.type(input, '都')
    fireEvent.compositionStart(input)
    fireEvent.keyDown(input, { key: 'ArrowDown', isComposing: true })

    expect(input.getAttribute('aria-activedescendant')).toBeNull()
  })

  it('変換中のキーは onKeyDown にも届かない', () => {
    const onKeyDown = vi.fn()
    render(<Subject onKeyDown={onKeyDown} />)
    const input = combobox()

    fireEvent.compositionStart(input)
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true })

    expect(onKeyDown).not.toHaveBeenCalled()
  })
})

describe('ComboBox: variant / size', () => {
  it('全 variant が互いに異なるクラスを生む', () => {
    const classes = NOVI_VARIANTS.map((variant) => comboBoxStyles({ variant }).inputWrapper())
    expect(new Set(classes).size).toBe(NOVI_VARIANTS.length)
  })

  it.each([
    ['sm', 'h-10'],
    ['md', 'h-12'],
    ['lg', 'h-14'],
  ] as const)('size=%s の高さが %s（Input と揃っている）', (size, expected) => {
    expect(comboBoxStyles({ size }).inputWrapper()).toContain(expected)
  })

  it('size 語彙をすべて実装している', () => {
    const classes = NOVI_SIZES.map((size) => comboBoxStyles({ size }).input())
    expect(new Set(classes).size).toBe(NOVI_SIZES.length)
  })
})

describe('ComboBox: classNames', () => {
  it('slot 単位でクラスを差し込める', () => {
    const { container } = render(
      <Subject classNames={{ inputWrapper: 'my-wrapper', trigger: 'my-trigger' }} />,
    )
    expect(container.querySelector('[data-slot="inputWrapper"]')?.className).toContain('my-wrapper')
    expect(container.querySelector('[data-slot="trigger"]')?.className).toContain('my-trigger')
  })
})
