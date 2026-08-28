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
  it('状態として読み上げさせる', () => {
    render(<Spinner label="読み込み中" />)
    expect(screen.getByRole('status').textContent).toBe('読み込み中')
  })

  it('label が無くても支援技術には伝わる', () => {
    render(<Spinner />)
    expect(screen.getByRole('status').textContent).toBe('読み込み中')
  })

  it('label が無ければ画面には出さない', () => {
    const { container } = render(<Spinner />)
    expect(container.querySelector('[data-slot="label"]')).toBeNull()
  })

  it('図形は支援技術に読ませない', () => {
    const { container } = render(<Spinner label="読み込み中" />)
    expect(container.querySelector('[data-slot="circle"]')?.getAttribute('aria-hidden')).toBe(
      'true',
    )
  })
})

describe('Spinner: transform の唯一の例外', () => {
  it('回転する（ここだけ FR-11 の外）', () => {
    expect(spinnerStyles().circle()).toContain('animate-spin')
  })

  it('prefers-reduced-motion では止まる', () => {
    expect(spinnerStyles().circle()).toContain('motion-safe:animate-spin')
  })

  it('例外は回転だけ。scale も translate も持ち込まない', () => {
    const classes = Object.values(spinnerStyles())
      .map((slot) => slot())
      .join(' ')
    expect(classes).not.toMatch(/(?<![\w-])(?:scale|translate|rotate)-/)
  })
})

describe('Spinner: Flatlay のデザイン規律', () => {
  it('ラベルは等幅（注記なので記号扱い・ADR-F7）', () => {
    expect(spinnerStyles().label()).toContain('font-(family-name:--novi-font-mono)')
  })

  it('影も z-index も持たない', () => {
    const classes = Object.values(spinnerStyles())
      .map((slot) => slot())
      .join(' ')
    expect(classes).not.toMatch(/(?<![\w-])shadow-/)
    expect(classes).not.toMatch(/(?<![\w-])z-(?:\d+|\[[^\]]*\])/)
  })

  it.each(NOVI_COLORS)('color=%s が固有のクラスを適用する', (color) => {
    const produced = NOVI_COLORS.map((c) => spinnerStyles({ color: c }).root())
    expect(new Set(produced).size).toBe(NOVI_COLORS.length)
    expect(spinnerStyles({ color }).root()).toBeTruthy()
  })

  it.each(NOVI_SIZES)('size=%s が固有のクラスを適用する', (size) => {
    const produced = NOVI_SIZES.map((s) => spinnerStyles({ size: s }).circle())
    expect(new Set(produced).size).toBe(NOVI_SIZES.length)
    expect(spinnerStyles({ size }).circle()).toBeTruthy()
  })
})

describe('Spinner: 拡張', () => {
  it('tv({ extend }) で拡張できる', () => {
    const my = tv({ extend: spinnerStyles, slots: { label: 'uppercase' } })
    expect(my().label()).toContain('uppercase')
  })

  it('classNames が該当 slot に反映される', () => {
    const { container } = render(
      <Spinner
        label="読み込み中"
        classNames={{ root: 's-root', circle: 's-circle', label: 's-label' }}
      />,
    )
    for (const [slot, cls] of [
      ['root', 's-root'],
      ['circle', 's-circle'],
      ['label', 's-label'],
    ] as const) {
      expect(
        container.querySelector(`[data-slot="${slot}"]`)?.getAttribute('class'),
        slot,
      ).toContain(cls)
    }
  })
})
