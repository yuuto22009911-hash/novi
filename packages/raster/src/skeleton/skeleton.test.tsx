import { NOVI_CONTRACTS, NOVI_RADII } from '@novi-ui/core'
import { testSlotContract } from '@novi-ui/core/testing'
import { render } from '@testing-library/react'
import { tv } from 'tailwind-variants'
import { describe, expect, it } from 'vitest'
import { Skeleton } from './skeleton'
import { skeletonStyles } from './skeleton.styles'

testSlotContract({
  name: 'Skeleton',
  contract: NOVI_CONTRACTS.Skeleton,
  render: () => <Skeleton className="h-4 w-40" />,
})

describe('Skeleton: 描画', () => {
  it('支援技術には読ませない（読み込み状態は Spinner か live region が伝える）', () => {
    const { container } = render(<Skeleton />)
    expect(container.querySelector('[data-slot="root"]')?.getAttribute('aria-hidden')).toBe('true')
  })

  it('大きさは className で指定する', () => {
    const { container } = render(<Skeleton className="h-4 w-40" />)
    const root = container.querySelector('[data-slot="root"]')?.className ?? ''
    expect(root).toContain('h-4')
    expect(root).toContain('w-40')
  })
})

describe('Skeleton: Raster のデザイン規律', () => {
  it('opacity のパルスのみ（シマーは使わない）', () => {
    expect(skeletonStyles().root()).toContain('animate-pulse')
    expect(skeletonStyles().root()).not.toContain('animate-shimmer')
  })

  it('モーション低減時はアニメーションしない', () => {
    expect(skeletonStyles().root()).toContain('motion-safe:animate-pulse')
  })

  it('radius 語彙をすべて実装している', () => {
    const classes = NOVI_RADII.map((radius) => skeletonStyles({ radius }).root())
    expect(new Set(classes).size).toBe(NOVI_RADII.length)
  })
})

describe('Skeleton: 拡張', () => {
  it('tv({ extend }) で拡張できる', () => {
    const my = tv({ extend: skeletonStyles, slots: { root: 'opacity-50' } })
    expect(my().root()).toContain('opacity-50')
  })
})
