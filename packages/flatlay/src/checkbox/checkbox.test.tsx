import { NOVI_COLORS, NOVI_CONTRACTS, NOVI_SIZES } from '@novi-ui/core'
import { testSlotContract } from '@novi-ui/core/testing'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { tv } from 'tailwind-variants'
import { describe, expect, it, vi } from 'vitest'
import { Checkbox, CheckboxGroup } from './checkbox'
import { checkboxGroupStyles, checkboxStyles } from './checkbox.styles'

testSlotContract({
  name: 'Checkbox',
  contract: NOVI_CONTRACTS.Checkbox,
  render: () => (
    <Checkbox defaultSelected description="いつでも解除できます">
      利用規約に同意する
    </Checkbox>
  ),
})

testSlotContract({
  name: 'CheckboxGroup',
  contract: NOVI_CONTRACTS.CheckboxGroup,
  render: () => (
    <CheckboxGroup
      label="通知方法"
      description="複数選べます"
      isInvalid
      errorMessage="選んでください"
    >
      <Checkbox value="email">メール</Checkbox>
    </CheckboxGroup>
  ),
})

describe('Checkbox: 描画と操作', () => {
  it('デフォルト props でレンダリングできる', () => {
    render(<Checkbox>同意する</Checkbox>)
    expect(screen.getByRole('checkbox', { name: '同意する' })).toBeDefined()
  })

  it('クリックで選択が切り替わる', async () => {
    const onChange = vi.fn()
    render(<Checkbox onChange={onChange}>同意する</Checkbox>)

    await userEvent.click(screen.getByRole('checkbox'))

    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('Space で選択できる', async () => {
    const onChange = vi.fn()
    render(<Checkbox onChange={onChange}>同意する</Checkbox>)

    await userEvent.tab()
    await userEvent.keyboard(' ')

    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('isDisabled では切り替わらない', async () => {
    const onChange = vi.fn()
    render(
      <Checkbox isDisabled onChange={onChange}>
        同意する
      </Checkbox>,
    )

    await userEvent.click(screen.getByRole('checkbox'))

    expect(onChange).not.toHaveBeenCalled()
  })

  it('children を省略すると label / description を描画しない', () => {
    const { container } = render(<Checkbox aria-label="同意" description="出ない" />)
    expect(container.querySelector('[data-slot="label"]')).toBeNull()
    expect(container.querySelector('[data-slot="description"]')).toBeNull()
  })
})

describe('Checkbox: 印は等幅の文字（ADR-F7）', () => {
  it('選ぶと ✓ が立つ', () => {
    const { container } = render(<Checkbox defaultSelected>同意する</Checkbox>)
    expect(container.querySelector('[data-slot="indicator"]')?.textContent).toBe('✓')
  })

  it('一部選択は横線で示す', () => {
    const { container } = render(<Checkbox isIndeterminate>同意する</Checkbox>)
    expect(container.querySelector('[data-slot="indicator"]')?.textContent).toBe('−')
  })

  it('選んでいないときは印を描かない', () => {
    const { container } = render(<Checkbox>同意する</Checkbox>)
    expect(container.querySelector('[data-slot="indicator"]')).toBeNull()
  })

  it('印は SVG ではない（罫線のテーマに図形を持ち込まない）', () => {
    const { container } = render(<Checkbox defaultSelected>同意する</Checkbox>)
    expect(container.querySelector('svg')).toBeNull()
    expect(checkboxStyles().indicator()).toContain('font-(family-name:--novi-font-mono)')
  })

  it('印は支援技術に読ませない（状態は checkbox の role が持つ）', () => {
    const { container } = render(<Checkbox defaultSelected>同意する</Checkbox>)
    expect(container.querySelector('[data-slot="indicator"]')?.getAttribute('aria-hidden')).toBe(
      'true',
    )
  })
})

describe('Checkbox: Flatlay のデザイン規律', () => {
  it('箱は 2px 角（円にしない）', () => {
    const control = checkboxStyles().control()
    expect(control).toContain('rounded-[var(--novi-radius-sm)]')
    expect(control).not.toContain('rounded-full')
  })

  it('箱は両テーマより一段小さい（14 / 16 / 20px）', () => {
    expect(checkboxStyles({ size: 'sm' }).control()).toContain('size-3.5')
    expect(checkboxStyles({ size: 'md' }).control()).toContain('size-4')
    expect(checkboxStyles({ size: 'lg' }).control()).toContain('size-5')
  })

  it('選ぶと箱が塗り潰され、印が地色で立つ', () => {
    expect(checkboxStyles().control()).toContain('group-data-[selected]:bg-[var(--c)]')
    expect(checkboxStyles().indicator()).toContain('text-[var(--c-fg)]')
  })

  it('影も z-index も transform も持たない（FR-02 / FR-11）', () => {
    for (const color of NOVI_COLORS) {
      const classes = Object.values(checkboxStyles({ color }))
        .map((slot) => slot())
        .join(' ')
      expect(classes, color).not.toMatch(/(?<![\w-])shadow-/)
      expect(classes, color).not.toMatch(/(?<![\w-])z-(?:\d+|\[[^\]]*\])/)
      expect(classes, color).not.toMatch(/(?<![\w-])(?:scale|rotate|translate)-/)
    }
  })

  it('項目名は等幅、選択肢の文言は本文のまま', () => {
    // 読み取らせる項目名と読ませる文を書体で分ける
    expect(checkboxGroupStyles().label()).toContain('font-(family-name:--novi-font-mono)')
    expect(checkboxStyles().label()).not.toContain('font-(family-name:--novi-font-mono)')
  })
})

describe('Checkbox: color / size（AC-04-1）', () => {
  it.each(NOVI_COLORS)('color=%s が固有のクラスを適用する', (color) => {
    const produced = NOVI_COLORS.map((c) => checkboxStyles({ color: c }).root())
    expect(new Set(produced).size).toBe(NOVI_COLORS.length)
    expect(checkboxStyles({ color }).root()).toBeTruthy()
  })

  it.each(NOVI_SIZES)('size=%s が固有のクラスを適用する', (size) => {
    const produced = NOVI_SIZES.map((s) => checkboxStyles({ size: s }).control())
    expect(new Set(produced).size).toBe(NOVI_SIZES.length)
    expect(checkboxStyles({ size }).control()).toBeTruthy()
  })
})

describe('CheckboxGroup: 描画と操作', () => {
  it('複数選べる', async () => {
    const onChange = vi.fn()
    render(
      <CheckboxGroup label="通知方法" onChange={onChange}>
        <Checkbox value="email">メール</Checkbox>
        <Checkbox value="sms">SMS</Checkbox>
      </CheckboxGroup>,
    )

    await userEvent.click(screen.getByRole('checkbox', { name: 'メール' }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'SMS' }))

    expect(onChange).toHaveBeenLastCalledWith(['email', 'sms'])
  })

  it('orientation=horizontal で並びが変わる', () => {
    expect(checkboxGroupStyles({ orientation: 'horizontal' }).list()).toContain('flex-row')
    expect(checkboxGroupStyles({ orientation: 'vertical' }).list()).toContain('flex-col')
  })

  it('isInvalid でエラー文が出る（色だけに頼らない）', () => {
    render(
      <CheckboxGroup label="通知方法" isInvalid errorMessage="1つ以上選んでください">
        <Checkbox value="email">メール</Checkbox>
      </CheckboxGroup>,
    )
    expect(screen.getByText('1つ以上選んでください')).toBeDefined()
  })
})

describe('Checkbox: classNames（FR-04）', () => {
  it('classNames が該当 slot に反映される', () => {
    const { container } = render(
      <Checkbox
        defaultSelected
        description="注記"
        classNames={{
          root: 'test-root',
          control: 'test-control',
          indicator: 'test-indicator',
          label: 'test-label',
          description: 'test-description',
        }}
      >
        同意する
      </Checkbox>,
    )
    for (const [slot, cls] of [
      ['root', 'test-root'],
      ['control', 'test-control'],
      ['indicator', 'test-indicator'],
      ['label', 'test-label'],
      ['description', 'test-description'],
    ] as const) {
      expect(container.querySelector(`[data-slot="${slot}"]`)?.className, slot).toContain(cls)
    }
  })

  it('CheckboxGroup の classNames が該当 slot に反映される', () => {
    const { container } = render(
      <CheckboxGroup
        label="通知方法"
        description="注記"
        classNames={{ root: 'g-root', label: 'g-label', list: 'g-list', description: 'g-desc' }}
      >
        <Checkbox value="email">メール</Checkbox>
      </CheckboxGroup>,
    )
    for (const [slot, cls] of [
      ['label', 'g-label'],
      ['list', 'g-list'],
      ['description', 'g-desc'],
    ] as const) {
      expect(container.querySelector(`[data-slot="${slot}"]`)?.className, slot).toContain(cls)
    }
  })

  it('tv({ extend }) で拡張できる', () => {
    const custom = tv({ extend: checkboxStyles, slots: { label: 'font-medium' } })
    expect(custom({}).label()).toContain('font-medium')
  })
})
