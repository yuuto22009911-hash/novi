import { NOVI_COLORS, NOVI_CONTRACTS, NOVI_SIZES } from '@novi-ui/core'
import { checkSlotContract, testSlotContract } from '@novi-ui/core/testing'
import { render, screen } from '@testing-library/react'
import { tv } from 'tailwind-variants'
import { describe, expect, it } from 'vitest'
import { Progress } from './progress'
import { progressStyles } from './progress.styles'

testSlotContract({
  name: 'Progress',
  contract: NOVI_CONTRACTS.Progress,
  render: () => <Progress label="アップロード中" value={62} showValueLabel />,
})

describe('Progress: 描画', () => {
  it('進捗が支援技術に伝わる', () => {
    render(<Progress label="アップロード中" value={62} />)
    const bar = screen.getByRole('progressbar')
    expect(bar.getAttribute('aria-valuenow')).toBe('62')
  })

  it('value を省略すると不確定表示になる', () => {
    render(<Progress label="処理中" />)
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBeNull()
  })

  it('showValueLabel なしでは数値ラベルを出さない', () => {
    const { container } = render(<Progress label="アップロード中" value={62} />)
    expect(container.querySelector('[data-slot="valueLabel"]')).toBeNull()
  })

  it('不確定表示では数値ラベルを出さない（示す値がないため）', () => {
    const { container } = render(<Progress label="処理中" showValueLabel />)
    expect(container.querySelector('[data-slot="valueLabel"]')).toBeNull()
  })

  it('ラベルなしでも必須 slot は満たす', () => {
    const { container } = render(<Progress value={10} aria-label="進捗" />)
    expect(checkSlotContract(container, NOVI_CONTRACTS.Progress).missing).toEqual([])
  })
})

describe('Progress: Raster のデザイン規律', () => {
  it('トラックは細い線（面を作らない）', () => {
    expect(progressStyles({ size: 'md' }).track()).toContain('h-1')
  })

  it('数値ラベルは等幅数字で桁を揃える', () => {
    expect(progressStyles().valueLabel()).toContain('tabular-nums')
  })

  it('不確定表示は translate のみで表現する（scale / rotate を使わない）', () => {
    const indicator = progressStyles({ isIndeterminate: true }).indicator()
    expect(indicator).not.toMatch(/\b(scale|rotate)-/)
  })

  it('モーション低減時はアニメーションしない', () => {
    expect(progressStyles({ isIndeterminate: true }).indicator()).toContain('motion-safe:')
  })
})

describe('Progress: size / color', () => {
  it('全 size が異なるクラスを生む', () => {
    const classes = NOVI_SIZES.map((size) => progressStyles({ size }).track())
    expect(new Set(classes).size).toBe(NOVI_SIZES.length)
  })

  it('全 color が異なるクラスを生む', () => {
    const classes = NOVI_COLORS.map((color) => progressStyles({ color }).root())
    expect(new Set(classes).size).toBe(NOVI_COLORS.length)
  })
})

describe('Progress: 拡張', () => {
  it('tv({ extend }) で拡張できる', () => {
    const my = tv({ extend: progressStyles, slots: { track: 'border' } })
    expect(my().track()).toContain('border')
  })
})
