import { NOVI_COLORS, NOVI_CONTRACTS, NOVI_SIZES } from '@novi-ui/core'
import { checkSlotContract, testSlotContract } from '@novi-ui/core/testing'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { tv } from 'tailwind-variants'
import { describe, expect, it, vi } from 'vitest'
import { Switch } from './switch'
import { switchStyles } from './switch.styles'

testSlotContract({
  name: 'Switch',
  contract: NOVI_CONTRACTS.Switch,
  render: () => (
    <Switch defaultSelected description="重要な通知のみ届きます">
      メール通知を受け取る
    </Switch>
  ),
})

describe('Switch: 描画と操作', () => {
  it('デフォルト props でレンダリングできる', () => {
    render(<Switch>通知</Switch>)
    expect(screen.getByRole('switch', { name: '通知' })).toBeDefined()
  })

  it('クリックで onChange が呼ばれる', async () => {
    const onChange = vi.fn()
    render(<Switch onChange={onChange}>通知</Switch>)

    await userEvent.click(screen.getByRole('switch'))

    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('Space キーでも切り替わる（AC-04-1）', async () => {
    const onChange = vi.fn()
    render(<Switch onChange={onChange}>通知</Switch>)

    await userEvent.tab()
    await userEvent.keyboard(' ')

    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('isDisabled のとき切り替わらない', async () => {
    const onChange = vi.fn()
    render(
      <Switch isDisabled onChange={onChange}>
        通知
      </Switch>,
    )

    await userEvent.click(screen.getByRole('switch'))

    expect(onChange).not.toHaveBeenCalled()
  })

  it('ラベルなしでも必須 slot は満たす', () => {
    const { container } = render(<Switch aria-label="通知" />)
    expect(checkSlotContract(container, NOVI_CONTRACTS.Switch).missing).toEqual([])
  })
})

describe('Switch: Raster は矩形（ADR-R3）', () => {
  it('トラックが角丸を持たない', () => {
    expect(switchStyles().track()).toContain('rounded-[var(--novi-radius-none)]')
    expect(switchStyles().track()).not.toContain('rounded-full')
  })

  it('サムも角丸を持たない', () => {
    expect(switchStyles().thumb()).toContain('rounded-[var(--novi-radius-none)]')
  })

  it('移動は translate で行う（scale や rotate を使わない）', () => {
    const thumb = NOVI_SIZES.map((size) => switchStyles({ size }).thumb()).join(' ')
    expect(thumb).toContain('translate-x')
    expect(thumb).not.toMatch(/\b(scale|rotate)-/)
  })
})

describe('Switch: variant / size / color', () => {
  it('全 color が異なるクラスを生む', () => {
    const classes = NOVI_COLORS.map((color) => switchStyles({ color }).root())
    expect(new Set(classes).size).toBe(NOVI_COLORS.length)
  })

  it('全 size が異なるクラスを生む', () => {
    const classes = NOVI_SIZES.map((size) => switchStyles({ size }).track())
    expect(new Set(classes).size).toBe(NOVI_SIZES.length)
  })
})

describe('Switch: 拡張', () => {
  it('tv({ extend }) は variant と競合しないクラスを足せる', () => {
    const my = tv({ extend: switchStyles, slots: { track: 'shadow-none border-dashed' } })
    expect(my().track()).toContain('border-dashed')
  })

  it('variant と競合するクラスは classNames で上書きする', () => {
    // extend の slots は base に入るため、後から適用される variant（size の w-9）に負ける。
    // これは tailwind-variants の仕様。variant に勝ちたい場合は呼び出し時に渡す。
    const viaExtend = tv({ extend: switchStyles, slots: { track: 'w-14' } })
    expect(viaExtend({ size: 'md' }).track()).not.toContain('w-14')

    expect(switchStyles({ size: 'md' }).track({ class: 'w-14' })).toContain('w-14')
  })
})
