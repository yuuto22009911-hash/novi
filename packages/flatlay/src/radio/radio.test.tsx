import { NOVI_COLORS, NOVI_CONTRACTS, NOVI_SIZES } from '@novi-ui/core'
import { testSlotContract } from '@novi-ui/core/testing'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { tv } from 'tailwind-variants'
import { describe, expect, it, vi } from 'vitest'
import { checkboxStyles } from '../checkbox'
import { Radio, RadioGroup } from './radio'
import { radioGroupStyles, radioStyles } from './radio.styles'

testSlotContract({
  name: 'Radio',
  contract: NOVI_CONTRACTS.Radio,
  render: () => (
    <RadioGroup label="配送方法" defaultValue="express">
      <Radio value="express" description="翌日に届きます">
        速達
      </Radio>
    </RadioGroup>
  ),
})

testSlotContract({
  name: 'RadioGroup',
  contract: NOVI_CONTRACTS.RadioGroup,
  render: () => (
    <RadioGroup
      label="配送方法"
      description="1つ選んでください"
      isInvalid
      errorMessage="選んでください"
    >
      <Radio value="standard">通常</Radio>
    </RadioGroup>
  ),
})

describe('Radio: 描画と操作', () => {
  it('デフォルト props でレンダリングできる', () => {
    render(
      <RadioGroup label="配送方法">
        <Radio value="standard">通常</Radio>
      </RadioGroup>,
    )
    expect(screen.getByRole('radio', { name: '通常' })).toBeDefined()
  })

  it('クリックで1つだけ選ばれる', async () => {
    const onChange = vi.fn()
    render(
      <RadioGroup label="配送方法" onChange={onChange}>
        <Radio value="standard">通常</Radio>
        <Radio value="express">速達</Radio>
      </RadioGroup>,
    )

    await userEvent.click(screen.getByRole('radio', { name: '通常' }))
    await userEvent.click(screen.getByRole('radio', { name: '速達' }))

    // 後から選んだ方だけが残る（複数選べる Checkbox との決定的な違い）
    expect(onChange).toHaveBeenLastCalledWith('express')
    expect((screen.getByRole('radio', { name: '通常' }) as HTMLInputElement).checked).toBe(false)
    expect((screen.getByRole('radio', { name: '速達' }) as HTMLInputElement).checked).toBe(true)
  })

  it('矢印キーで項目を移動できる', async () => {
    const onChange = vi.fn()
    render(
      <RadioGroup label="配送方法" defaultValue="standard" onChange={onChange}>
        <Radio value="standard">通常</Radio>
        <Radio value="express">速達</Radio>
      </RadioGroup>,
    )

    await userEvent.tab()
    await userEvent.keyboard('{ArrowDown}')

    expect(onChange).toHaveBeenCalledWith('express')
  })

  it('isDisabled では選べない', async () => {
    const onChange = vi.fn()
    render(
      <RadioGroup label="配送方法" onChange={onChange}>
        <Radio value="standard" isDisabled>
          通常
        </Radio>
      </RadioGroup>,
    )

    await userEvent.click(screen.getByRole('radio', { name: '通常' }))

    expect(onChange).not.toHaveBeenCalled()
  })

  it('children を省略すると label / description を描画しない', () => {
    const { container } = render(
      <RadioGroup label="配送方法">
        <Radio value="standard" aria-label="通常" description="出ない" />
      </RadioGroup>,
    )
    const list = container.querySelector('[data-slot="list"]')
    expect(list?.querySelector('[data-slot="label"]')).toBeNull()
    expect(list?.querySelector('[data-slot="description"]')).toBeNull()
  })
})

describe('Radio: 円は radius-full の例外', () => {
  it('枠も印も円で描く', () => {
    expect(radioStyles().control()).toContain('rounded-[var(--novi-radius-full)]')
    expect(radioStyles().indicator()).toContain('rounded-[var(--novi-radius-full)]')
  })

  it('Checkbox の 2px 角と形が違う（「1つだけ」を形で示す）', () => {
    expect(checkboxStyles().control()).toContain('rounded-[var(--novi-radius-sm)]')
    expect(radioStyles().control()).not.toContain('rounded-[var(--novi-radius-sm)]')
  })

  it('印は塗りの点で、Checkbox のような文字ではない', () => {
    const { container } = render(
      <RadioGroup label="配送方法" defaultValue="standard">
        <Radio value="standard">通常</Radio>
      </RadioGroup>,
    )
    const indicator = container.querySelector('[data-slot="indicator"]')
    expect(indicator?.textContent).toBe('')
    expect(radioStyles().indicator()).toContain('bg-[var(--c)]')
    expect(radioStyles().indicator()).not.toContain('font-(family-name:--novi-font-mono)')
  })

  it('印は SVG ではない（罫線のテーマに図形を持ち込まない）', () => {
    const { container } = render(
      <RadioGroup label="配送方法" defaultValue="standard">
        <Radio value="standard">通常</Radio>
      </RadioGroup>,
    )
    expect(container.querySelector('svg')).toBeNull()
  })

  it('選んでいないときは印を描かない', () => {
    const { container } = render(
      <RadioGroup label="配送方法">
        <Radio value="standard">通常</Radio>
      </RadioGroup>,
    )
    expect(container.querySelector('[data-slot="indicator"]')).toBeNull()
  })

  it('印は支援技術に読ませない（状態は radio の role が持つ）', () => {
    const { container } = render(
      <RadioGroup label="配送方法" defaultValue="standard">
        <Radio value="standard">通常</Radio>
      </RadioGroup>,
    )
    expect(container.querySelector('[data-slot="indicator"]')?.getAttribute('aria-hidden')).toBe(
      'true',
    )
  })
})

describe('Radio: Flatlay のデザイン規律', () => {
  it('枠は Checkbox と同じ 14 / 16 / 20px（並べたときに列が揃う）', () => {
    expect(radioStyles({ size: 'sm' }).control()).toContain('size-3.5')
    expect(radioStyles({ size: 'md' }).control()).toContain('size-4')
    expect(radioStyles({ size: 'lg' }).control()).toContain('size-5')
    const sizeToken = (classes: string) => classes.match(/(?<![\w-])size-[\d.]+/)?.[0]
    for (const size of NOVI_SIZES) {
      expect(sizeToken(radioStyles({ size }).control()), size).toBe(
        sizeToken(checkboxStyles({ size }).control()),
      )
    }
  })

  it('選んでも枠は塗り潰さない（Checkbox の選択と見え方を分ける）', () => {
    expect(radioStyles().control()).toContain('group-data-[selected]:border-[var(--c)]')
    expect(radioStyles().control()).not.toContain('group-data-[selected]:bg-[var(--c)]')
  })

  it('影も z-index も transform も持たない（FR-02 / FR-11）', () => {
    for (const color of NOVI_COLORS) {
      const classes = Object.values(radioStyles({ color }))
        .map((slot) => slot())
        .join(' ')
      expect(classes, color).not.toMatch(/(?<![\w-])shadow-/)
      expect(classes, color).not.toMatch(/(?<![\w-])z-(?:\d+|\[[^\]]*\])/)
      expect(classes, color).not.toMatch(/(?<![\w-])(?:scale|rotate|translate)-/)
    }
  })

  it('項目名は等幅、選択肢の文言は本文のまま', () => {
    expect(radioGroupStyles().label()).toContain('font-(family-name:--novi-font-mono)')
    expect(radioStyles().label()).not.toContain('font-(family-name:--novi-font-mono)')
  })
})

describe('Radio: color / size（AC-04-1）', () => {
  it.each(NOVI_COLORS)('color=%s が固有のクラスを適用する', (color) => {
    const produced = NOVI_COLORS.map((c) => radioStyles({ color: c }).root())
    expect(new Set(produced).size).toBe(NOVI_COLORS.length)
    expect(radioStyles({ color }).root()).toBeTruthy()
  })

  it.each(NOVI_SIZES)('size=%s が固有のクラスを適用する', (size) => {
    const produced = NOVI_SIZES.map((s) => radioStyles({ size: s }).control())
    expect(new Set(produced).size).toBe(NOVI_SIZES.length)
    expect(radioStyles({ size }).control()).toBeTruthy()
  })
})

describe('RadioGroup: 描画と操作', () => {
  it('orientation=horizontal で並びが変わる', () => {
    expect(radioGroupStyles({ orientation: 'horizontal' }).list()).toContain('flex-row')
    expect(radioGroupStyles({ orientation: 'vertical' }).list()).toContain('flex-col')
  })

  it('isInvalid でエラー文が出る（色だけに頼らない）', () => {
    render(
      <RadioGroup label="配送方法" isInvalid errorMessage="1つ選んでください">
        <Radio value="standard">通常</Radio>
      </RadioGroup>,
    )
    expect(screen.getByText('1つ選んでください')).toBeDefined()
  })
})

describe('Radio: classNames（FR-04）', () => {
  it('classNames が該当 slot に反映される', () => {
    const { container } = render(
      <RadioGroup label="配送方法" defaultValue="standard">
        <Radio
          value="standard"
          description="注記"
          classNames={{
            root: 'test-root',
            control: 'test-control',
            indicator: 'test-indicator',
            label: 'test-label',
            description: 'test-description',
          }}
        >
          通常
        </Radio>
      </RadioGroup>,
    )
    // Group 側も同名の slot を持つので、選択肢1件ぶんに絞って見る
    const item = container.querySelector('[data-slot="list"] > [data-slot="root"]')
    expect(item?.className).toContain('test-root')
    for (const [slot, cls] of [
      ['control', 'test-control'],
      ['indicator', 'test-indicator'],
      ['label', 'test-label'],
      ['description', 'test-description'],
    ] as const) {
      expect(item?.querySelector(`[data-slot="${slot}"]`)?.className, slot).toContain(cls)
    }
  })

  it('RadioGroup の classNames が該当 slot に反映される', () => {
    const { container } = render(
      <RadioGroup
        label="配送方法"
        description="注記"
        classNames={{ root: 'g-root', label: 'g-label', list: 'g-list', description: 'g-desc' }}
      >
        <Radio value="standard">通常</Radio>
      </RadioGroup>,
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
    const custom = tv({ extend: radioStyles, slots: { label: 'font-medium' } })
    expect(custom({}).label()).toContain('font-medium')
  })
})
