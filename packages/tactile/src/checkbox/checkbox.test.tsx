import { NOVI_COLORS, NOVI_CONTRACTS, NOVI_SIZES } from '@novi-ui/core'
import { checkSlotContract, testSlotContract } from '@novi-ui/core/testing'
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
    <CheckboxGroup label="通知方法" description="複数選べます" errorMessage="必須です" isInvalid>
      <Checkbox value="email">メール</Checkbox>
    </CheckboxGroup>
  ),
})

describe('Checkbox: 描画と操作', () => {
  it('デフォルト props でレンダリングできる', () => {
    render(<Checkbox>同意する</Checkbox>)
    expect(screen.getByRole('checkbox', { name: '同意する' })).toBeDefined()
  })

  it('未選択のときインジケータを描画しない', () => {
    const { container } = render(<Checkbox>同意する</Checkbox>)
    expect(container.querySelector('[data-slot="indicator"]')).toBeNull()
  })

  it('選択するとインジケータが出る', () => {
    const { container } = render(<Checkbox defaultSelected>同意する</Checkbox>)
    expect(container.querySelector('[data-slot="indicator"]')).not.toBeNull()
  })

  it('中間状態でもインジケータが出る', () => {
    const { container } = render(<Checkbox isIndeterminate>同意する</Checkbox>)
    expect(container.querySelector('[data-slot="indicator"]')).not.toBeNull()
  })

  it('クリックで onChange が呼ばれる', async () => {
    const onChange = vi.fn()
    render(<Checkbox onChange={onChange}>同意する</Checkbox>)

    await userEvent.click(screen.getByRole('checkbox'))

    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('Space キーでも切り替わる（AC-04-1）', async () => {
    const onChange = vi.fn()
    render(<Checkbox onChange={onChange}>同意する</Checkbox>)

    await userEvent.tab()
    await userEvent.keyboard(' ')

    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('isDisabled のとき切り替わらない', async () => {
    const onChange = vi.fn()
    render(
      <Checkbox isDisabled onChange={onChange}>
        同意する
      </Checkbox>,
    )

    await userEvent.click(screen.getByRole('checkbox'))

    expect(onChange).not.toHaveBeenCalled()
  })

  it('小さな角丸に留める（Radio の完全な円と形で区別する・ADR-R8）', () => {
    expect(checkboxStyles().control()).toContain('rounded-[var(--novi-radius-sm)]')
    expect(checkboxStyles().control()).not.toContain('rounded-[var(--novi-radius-full)]')
  })
})

describe('Checkbox: variant / size / color', () => {
  it('全 color が異なるクラスを生む', () => {
    const classes = NOVI_COLORS.map((color) => checkboxStyles({ color }).root())
    expect(new Set(classes).size).toBe(NOVI_COLORS.length)
  })

  it('全 size が異なるクラスを生む', () => {
    const classes = NOVI_SIZES.map((size) => checkboxStyles({ size }).control())
    expect(new Set(classes).size).toBe(NOVI_SIZES.length)
  })
})

describe('CheckboxGroup', () => {
  it('グループのラベルが読み上げに紐づく', () => {
    render(
      <CheckboxGroup label="通知方法">
        <Checkbox value="email">メール</Checkbox>
      </CheckboxGroup>,
    )
    expect(screen.getByRole('group', { name: '通知方法' })).toBeDefined()
  })

  it('選択が配列で返る', async () => {
    const onChange = vi.fn()
    render(
      <CheckboxGroup label="通知方法" onChange={onChange}>
        <Checkbox value="email">メール</Checkbox>
        <Checkbox value="sms">SMS</Checkbox>
      </CheckboxGroup>,
    )

    await userEvent.click(screen.getByRole('checkbox', { name: 'メール' }))

    expect(onChange).toHaveBeenCalledWith(['email'])
  })

  it('横並びにできる', () => {
    expect(checkboxGroupStyles({ orientation: 'horizontal' }).list()).toContain('flex-row')
    expect(checkboxGroupStyles({ orientation: 'vertical' }).list()).toContain('flex-col')
  })

  it('任意 slot は指定しなければ描画しない', () => {
    const { container } = render(
      <CheckboxGroup>
        <Checkbox value="a">A</Checkbox>
      </CheckboxGroup>,
    )
    const result = checkSlotContract(container, NOVI_CONTRACTS.CheckboxGroup)
    expect(result.missing).toEqual([])
  })
})

describe('Checkbox: 拡張', () => {
  it('tv({ extend }) で拡張できる', () => {
    const my = tv({ extend: checkboxStyles, slots: { label: 'font-bold' } })
    expect(my().label()).toContain('font-bold')
  })
})
