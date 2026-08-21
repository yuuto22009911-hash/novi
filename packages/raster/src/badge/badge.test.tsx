import { NOVI_COLORS, NOVI_CONTRACTS, NOVI_SIZES, NOVI_VARIANTS } from '@novi-ui/core'
import { checkSlotContract, testSlotContract } from '@novi-ui/core/testing'
import { render, screen } from '@testing-library/react'
import { tv } from 'tailwind-variants'
import { describe, expect, it } from 'vitest'
import { Badge } from './badge'
import { badgeStyles } from './badge.styles'

testSlotContract({
  name: 'Badge',
  contract: NOVI_CONTRACTS.Badge,
  render: () => (
    <Badge withDot color="success">
      公開中
    </Badge>
  ),
})

describe('Badge: 描画', () => {
  it('文言を表示する', () => {
    render(<Badge>公開中</Badge>)
    expect(screen.getByText('公開中')).toBeDefined()
  })

  it('withDot なしではドットを描画しない', () => {
    const { container } = render(<Badge>公開中</Badge>)
    expect(container.querySelector('[data-slot="dot"]')).toBeNull()
    expect(checkSlotContract(container, NOVI_CONTRACTS.Badge).missing).toEqual([])
  })

  it('ドットは支援技術に読ませない（意味は文言が担う）', () => {
    const { container } = render(<Badge withDot>公開中</Badge>)
    expect(container.querySelector('[data-slot="dot"]')?.getAttribute('aria-hidden')).toBe('true')
  })
})

describe('Badge: variant / size / color', () => {
  it('全 variant が異なるクラスを生む', () => {
    const classes = NOVI_VARIANTS.map((variant) => badgeStyles({ variant }).root())
    expect(new Set(classes).size).toBe(NOVI_VARIANTS.length)
  })

  it('全 color が異なるクラスを生む', () => {
    const classes = NOVI_COLORS.map((color) => badgeStyles({ color }).root())
    expect(new Set(classes).size).toBe(NOVI_COLORS.length)
  })

  it('全 size が異なるクラスを生む', () => {
    const classes = NOVI_SIZES.map((size) => badgeStyles({ size }).root())
    expect(new Set(classes).size).toBe(NOVI_SIZES.length)
  })
})

describe('Badge: Raster のデザイン規律', () => {
  it('ドットは円にする（ADR-R8）', () => {
    expect(badgeStyles().dot()).toContain('rounded-[var(--novi-radius-full)]')
  })
})

describe('Badge: 拡張', () => {
  it('tv({ extend }) で拡張できる', () => {
    const my = tv({ extend: badgeStyles, slots: { label: 'uppercase' } })
    expect(my().label()).toContain('uppercase')
  })
})
