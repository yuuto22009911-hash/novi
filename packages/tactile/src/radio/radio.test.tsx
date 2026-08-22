import { NOVI_COLORS, NOVI_CONTRACTS, NOVI_SIZES } from '@novi-ui/core'
import { testSlotContract } from '@novi-ui/core/testing'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { tv } from 'tailwind-variants'
import { describe, expect, it, vi } from 'vitest'
import { Radio, RadioGroup } from './radio'
import { radioGroupStyles, radioStyles } from './radio.styles'

testSlotContract({
  name: 'Radio',
  contract: NOVI_CONTRACTS.Radio,
  render: () => (
    <RadioGroup defaultValue="express">
      <Radio value="express" description="翌日到着">
        速達
      </Radio>
    </RadioGroup>
  ),
})

testSlotContract({
  name: 'RadioGroup',
  contract: NOVI_CONTRACTS.RadioGroup,
  render: () => (
    <RadioGroup label="配送方法" description="変更できます" errorMessage="必須です" isInvalid>
      <Radio value="standard">通常</Radio>
    </RadioGroup>
  ),
})

describe('Radio: 描画と操作', () => {
  it('グループのラベルが読み上げに紐づく', () => {
    render(
      <RadioGroup label="配送方法">
        <Radio value="standard">通常</Radio>
      </RadioGroup>,
    )
    expect(screen.getByRole('radiogroup', { name: '配送方法' })).toBeDefined()
  })

  it('未選択のときインジケータを描画しない', () => {
    const { container } = render(
      <RadioGroup>
        <Radio value="a">A</Radio>
      </RadioGroup>,
    )
    expect(container.querySelector('[data-slot="indicator"]')).toBeNull()
  })

  it('選択するとインジケータが出る', () => {
    const { container } = render(
      <RadioGroup defaultValue="a">
        <Radio value="a">A</Radio>
      </RadioGroup>,
    )
    expect(container.querySelector('[data-slot="indicator"]')).not.toBeNull()
  })

  it('クリックで onChange が値を返す', async () => {
    const onChange = vi.fn()
    render(
      <RadioGroup label="配送方法" onChange={onChange}>
        <Radio value="standard">通常</Radio>
        <Radio value="express">速達</Radio>
      </RadioGroup>,
    )

    await userEvent.click(screen.getByRole('radio', { name: '速達' }))

    expect(onChange).toHaveBeenCalledWith('express')
  })

  it('矢印キーで項目間を移動できる（AC-04-4）', async () => {
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

  it('円で描く（Checkbox の四角と形で区別する）', () => {
    expect(radioStyles().control()).toContain('rounded-[var(--novi-radius-full)]')
  })
})

describe('Radio: variant / size / color', () => {
  it('全 color が異なるクラスを生む', () => {
    const classes = NOVI_COLORS.map((color) => radioStyles({ color }).root())
    expect(new Set(classes).size).toBe(NOVI_COLORS.length)
  })

  it('全 size が異なるクラスを生む', () => {
    const classes = NOVI_SIZES.map((size) => radioStyles({ size }).control())
    expect(new Set(classes).size).toBe(NOVI_SIZES.length)
  })

  it('横並びにできる', () => {
    expect(radioGroupStyles({ orientation: 'horizontal' }).list()).toContain('flex-row')
  })
})

describe('Radio: 拡張', () => {
  it('tv({ extend }) で拡張できる', () => {
    const my = tv({ extend: radioStyles, slots: { label: 'font-bold' } })
    expect(my().label()).toContain('font-bold')
  })
})
