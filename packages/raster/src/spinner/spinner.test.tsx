import { NOVI_COLORS, NOVI_CONTRACTS, NOVI_SIZES } from '@novi-ui/core'
import { testSlotContract } from '@novi-ui/core/testing'
import { render, screen } from '@testing-library/react'
import { tv } from 'tailwind-variants'
import { describe, expect, it } from 'vitest'
import { Spinner } from './spinner'
import { spinnerStyles } from './spinner.styles'

testSlotContract({
  name: 'Spinner',
  contract: NOVI_CONTRACTS.Spinner,
  render: () => <Spinner label="読み込み中" />,
})

describe('Spinner: 描画', () => {
  it('状態として支援技術に伝わる', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toBeDefined()
  })

  it('label なしでも読み上げ用の文言を持つ', () => {
    render(<Spinner />)
    expect(screen.getByText('読み込み中')).toBeDefined()
  })

  it('label を渡すと画面にも表示される', () => {
    const { container } = render(<Spinner label="保存しています" />)
    expect(container.querySelector('[data-slot="label"]')?.textContent).toBe('保存しています')
  })
})

describe('Spinner: rotate の例外（ADR-R2）', () => {
  it('回転を使う（Raster 唯一の例外）', () => {
    expect(spinnerStyles().circle()).toContain('animate-spin')
  })

  it('モーション低減時は回転しない', () => {
    expect(spinnerStyles().circle()).toContain('motion-safe:animate-spin')
  })
})

describe('Spinner: size / color', () => {
  it('全 size が異なるクラスを生む', () => {
    const classes = NOVI_SIZES.map((size) => spinnerStyles({ size }).circle())
    expect(new Set(classes).size).toBe(NOVI_SIZES.length)
  })

  it('全 color が異なるクラスを生む', () => {
    const classes = NOVI_COLORS.map((color) => spinnerStyles({ color }).root())
    expect(new Set(classes).size).toBe(NOVI_COLORS.length)
  })
})

describe('Spinner: 拡張', () => {
  it('tv({ extend }) で拡張できる', () => {
    const my = tv({ extend: spinnerStyles, slots: { label: 'font-medium' } })
    expect(my().label()).toContain('font-medium')
  })
})
