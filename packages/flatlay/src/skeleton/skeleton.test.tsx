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
  it('支援技術には読ませない（状態は Spinner か live region が伝える）', () => {
    const { container } = render(<Skeleton />)
    expect(container.querySelector('[data-slot="root"]')?.getAttribute('aria-hidden')).toBe('true')
  })

  it('大きさは className で決める', () => {
    const { container } = render(<Skeleton className="h-4 w-40" />)
    const root = container.querySelector('[data-slot="root"]')
    expect(root?.className).toContain('h-4')
    expect(root?.className).toContain('w-40')
  })
})

describe('Skeleton: 動きは濃さだけ（FR-11）', () => {
  it('opacity のパルスを使う', () => {
    expect(skeletonStyles().root()).toContain('animate-pulse')
  })

  it('シマー（translate するグラデーション）を使わない', () => {
    const root = skeletonStyles().root()
    expect(root).not.toMatch(/(?<![\w-])(?:scale|rotate|translate)-/)
    expect(root).not.toContain('gradient')
  })

  it('prefers-reduced-motion では止まる', () => {
    expect(skeletonStyles().root()).toContain('motion-safe:animate-pulse')
  })
})

describe('Skeleton: Flatlay のデザイン規律', () => {
  it('既定は角なし（記入前の空欄は角を持たない）', () => {
    expect(skeletonStyles().root()).toContain('rounded-[var(--novi-radius-none)]')
  })

  it('影を持たない', () => {
    expect(skeletonStyles().root()).not.toMatch(/(?<![\w-])shadow-/)
  })

  it.each(NOVI_RADII)('radius=%s が固有のクラスを適用する', (radius) => {
    const produced = NOVI_RADII.map((r) => skeletonStyles({ radius: r }).root())
    expect(new Set(produced).size).toBe(NOVI_RADII.length)
    expect(skeletonStyles({ radius }).root()).toContain(`rounded-[var(--novi-radius-${radius})]`)
  })
})

describe('Skeleton: 拡張', () => {
  it('tv({ extend }) で拡張できる', () => {
    const my = tv({ extend: skeletonStyles, slots: { root: 'opacity-50' } })
    expect(my().root()).toContain('opacity-50')
  })

  it('classNames が該当 slot に反映される', () => {
    const { container } = render(<Skeleton classNames={{ root: 'sk-root' }} />)
    expect(container.querySelector('[data-slot="root"]')?.className).toContain('sk-root')
  })
})
