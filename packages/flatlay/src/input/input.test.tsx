import { NOVI_CONTRACTS, NOVI_SIZES, NOVI_VARIANTS } from '@novi-ui/core'
import { testSlotContract } from '@novi-ui/core/testing'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { tv } from 'tailwind-variants'
import { describe, expect, it, vi } from 'vitest'
import { Input } from './input'
import { inputStyles } from './input.styles'

/** 全 slot が出る状態。 */
const fullInput = (props: Partial<Parameters<typeof Input>[0]> = {}) => (
  <Input
    label="金額"
    description="税込で入力してください"
    startContent="¥"
    endContent="円"
    {...props}
  />
)

testSlotContract({
  name: 'Input',
  contract: NOVI_CONTRACTS.Input,
  render: () => fullInput({ isInvalid: true, errorMessage: '入力してください' }),
})

describe('Input: 描画', () => {
  it('デフォルト props でレンダリングできる', () => {
    render(<Input label="メールアドレス" />)
    expect(screen.getByRole('textbox', { name: 'メールアドレス' })).toBeDefined()
  })

  it('入力した値が onChange に届く', async () => {
    const onChange = vi.fn()
    render(<Input label="名前" onChange={onChange} />)

    await userEvent.type(screen.getByRole('textbox'), 'あ')

    expect(onChange).toHaveBeenCalledWith('あ')
  })

  it('startContent / endContent は指定したときだけ描画する', () => {
    const { container } = render(<Input label="金額" />)
    expect(container.querySelector('[data-slot="startContent"]')).toBeNull()
    expect(container.querySelector('[data-slot="endContent"]')).toBeNull()
  })
})

describe('Input: variant / size（AC-04-1）', () => {
  it.each(NOVI_VARIANTS)('variant=%s が固有のクラスを適用する', (variant) => {
    const produced = NOVI_VARIANTS.map((v) => inputStyles({ variant: v }).inputWrapper())
    expect(new Set(produced).size).toBe(NOVI_VARIANTS.length)
    expect(inputStyles({ variant }).inputWrapper()).toBeTruthy()
  })

  it.each(NOVI_SIZES)('size=%s が固有のクラスを適用する', (size) => {
    const produced = NOVI_SIZES.map((s) => inputStyles({ size: s }).inputWrapper())
    expect(new Set(produced).size).toBe(NOVI_SIZES.length)
    expect(inputStyles({ size }).inputWrapper()).toBeTruthy()
  })

  it('記入欄の高さは帳票の行（28 / 32 / 40px）', () => {
    expect(inputStyles({ size: 'sm' }).inputWrapper()).toContain('h-7')
    expect(inputStyles({ size: 'md' }).inputWrapper()).toContain('h-8')
    expect(inputStyles({ size: 'lg' }).inputWrapper()).toContain('h-10')
  })
})

describe('Input: Flatlay のデザイン規律', () => {
  it('全 variant が罫線の幅を持ち、色だけが変わる（FR-11）', () => {
    // 影の無い紙面で輪郭を示せるのは線だけ。幅を base に置いて色を variant が決める
    for (const variant of NOVI_VARIANTS) {
      expect(inputStyles({ variant }).inputWrapper(), variant).toMatch(/(?<![\w-])border(?![\w-])/)
    }
  })

  it('項目名と注記が等幅で出る（ADR-F7）', () => {
    // 読ませる文と読み取らせる項目名を書体で分ける。影を持たない代わりの区別
    expect(inputStyles().label()).toContain('font-(family-name:--novi-font-mono)')
    expect(inputStyles().description()).toContain('font-(family-name:--novi-font-mono)')
    expect(inputStyles().errorMessage()).toContain('font-(family-name:--novi-font-mono)')
  })

  it('差し込む値は等幅かつ桁が揃う', () => {
    for (const slot of ['startContent', 'endContent'] as const) {
      expect(inputStyles()[slot](), slot).toContain('tabular-nums')
    }
  })

  it('押下で反転しない（入力欄は押すものではない）', () => {
    // 反転すると書いた文字が読めなくなる。手応えを返すのは罫線とリングだけ
    expect(inputStyles().inputWrapper()).not.toContain('data-[pressed]:')
  })

  it('影も z-index も持たない（FR-02）', () => {
    for (const variant of NOVI_VARIANTS) {
      const classes = Object.values(inputStyles({ variant }))
        .map((slot) => slot())
        .join(' ')
      expect(classes, variant).not.toMatch(/(?<![\w-])shadow-/)
      expect(classes, variant).not.toMatch(/(?<![\w-])z-(?:\d+|\[[^\]]*\])/)
    }
  })

  it('ghost は下線だけの記入線になる', () => {
    const wrapper = inputStyles({ variant: 'ghost' }).inputWrapper()
    expect(wrapper).toContain('border-transparent')
    expect(wrapper).toContain('border-b-[var(--novi-color-border-strong)]')
  })
})

describe('Input: 状態（AC-07-3）', () => {
  it('isInvalid でエラー文が出る（色だけに頼らない）', () => {
    render(<Input label="メール" isInvalid errorMessage="形式が正しくありません" />)
    expect(screen.getByText('形式が正しくありません')).toBeDefined()
  })

  it('isDisabled で操作できない', () => {
    render(<Input label="メール" isDisabled />)
    expect(screen.getByRole('textbox').hasAttribute('disabled')).toBe(true)
  })

  it('IME 変換中の Enter は onKeyDown に届かない（AC-07-3）', () => {
    const onKeyDown = vi.fn()
    render(<Input label="名前" onKeyDown={onKeyDown} />)
    const input = screen.getByRole('textbox')

    fireEvent.compositionStart(input)
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true })

    expect(onKeyDown).not.toHaveBeenCalled()
  })

  it('IME を使わない Enter は届く', () => {
    const onKeyDown = vi.fn()
    render(<Input label="名前" onKeyDown={onKeyDown} />)

    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' })

    expect(onKeyDown).toHaveBeenCalledTimes(1)
  })
})

describe('Input: classNames（FR-04）', () => {
  it('classNames が該当 slot に反映される', () => {
    const { container } = render(
      fullInput({
        classNames: {
          root: 'test-root',
          label: 'test-label',
          inputWrapper: 'test-wrapper',
          input: 'test-input',
          startContent: 'test-start',
          endContent: 'test-end',
          description: 'test-description',
        },
      }),
    )
    for (const [slot, cls] of [
      ['root', 'test-root'],
      ['label', 'test-label'],
      ['inputWrapper', 'test-wrapper'],
      ['input', 'test-input'],
      ['startContent', 'test-start'],
      ['endContent', 'test-end'],
      ['description', 'test-description'],
    ] as const) {
      expect(container.querySelector(`[data-slot="${slot}"]`)?.className, slot).toContain(cls)
    }
  })

  it('tv({ extend: inputStyles }) で拡張できる', () => {
    const custom = tv({ extend: inputStyles, slots: { input: 'text-right' } })
    expect(custom({}).input()).toContain('text-right')
  })
})
