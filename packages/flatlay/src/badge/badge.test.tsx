import { NOVI_COLORS, NOVI_CONTRACTS, NOVI_SIZES, NOVI_VARIANTS } from '@novi-ui/core'
import { testSlotContract } from '@novi-ui/core/testing'
import { render, screen } from '@testing-library/react'
import { tv } from 'tailwind-variants'
import { describe, expect, it } from 'vitest'
import { Badge } from './badge'
import { badgeStyles } from './badge.styles'

testSlotContract({
  name: 'Badge',
  contract: NOVI_CONTRACTS.Badge,
  render: () => <Badge withDot>公開中</Badge>,
})

describe('Badge: 描画', () => {
  it('文言を出す（色だけで意味を伝えない）', () => {
    render(<Badge color="success">公開中</Badge>)
    expect(screen.getByText('公開中')).toBeDefined()
  })

  it('withDot のときだけ点を描く', () => {
    const { container, rerender } = render(<Badge>下書き</Badge>)
    expect(container.querySelector('[data-slot="dot"]')).toBeNull()

    rerender(<Badge withDot>下書き</Badge>)
    expect(container.querySelector('[data-slot="dot"]')).not.toBeNull()
  })

  it('点は支援技術に読ませない（意味は文言が持つ）', () => {
    const { container } = render(<Badge withDot>下書き</Badge>)
    expect(container.querySelector('[data-slot="dot"]')?.getAttribute('aria-hidden')).toBe('true')
  })
})

describe('Badge: Flatlay のデザイン規律', () => {
  it('ラベルは等幅（読ませる文ではなく読み取らせる記号・ADR-F7）', () => {
    expect(badgeStyles().label()).toContain('font-(family-name:--novi-font-mono)')
  })

  it('点も正方形（円は Radio と Avatar に予約してある）', () => {
    expect(badgeStyles().dot()).toContain('rounded-[var(--novi-radius-none)]')
    expect(badgeStyles().dot()).not.toContain('rounded-[var(--novi-radius-full)]')
  })

  it('角は 2px', () => {
    expect(badgeStyles().root()).toContain('rounded-[var(--novi-radius-sm)]')
  })

  it('高さは 16 / 20 / 24px（行の中に置いても行が膨らまない）', () => {
    expect(badgeStyles({ size: 'sm' }).root()).toContain('h-4')
    expect(badgeStyles({ size: 'md' }).root()).toContain('h-5')
    expect(badgeStyles({ size: 'lg' }).root()).toContain('h-6')
  })

  it('全 variant が罫線の幅を持つ', () => {
    for (const variant of NOVI_VARIANTS) {
      expect(badgeStyles({ variant }).root(), variant).toMatch(/(?<![\w-])border(?![\w-])/)
    }
  })

  it('影も z-index も transform も持たない（FR-02 / FR-11）', () => {
    for (const variant of NOVI_VARIANTS) {
      for (const color of NOVI_COLORS) {
        const classes = Object.values(badgeStyles({ variant, color }))
          .map((slot) => slot())
          .join(' ')
        expect(classes, `${variant}/${color}`).not.toMatch(/(?<![\w-])shadow-/)
        expect(classes, `${variant}/${color}`).not.toMatch(/(?<![\w-])z-(?:\d+|\[[^\]]*\])/)
        expect(classes, `${variant}/${color}`).not.toMatch(/(?<![\w-])(?:scale|rotate|translate)-/)
      }
    }
  })
})

describe('Badge: variant / color / size（AC-04-1）', () => {
  it.each(NOVI_VARIANTS)('variant=%s が固有のクラスを適用する', (variant) => {
    const produced = NOVI_VARIANTS.map((v) => badgeStyles({ variant: v }).root())
    expect(new Set(produced).size).toBe(NOVI_VARIANTS.length)
    expect(badgeStyles({ variant }).root()).toBeTruthy()
  })

  it.each(NOVI_COLORS)('color=%s が固有のクラスを適用する', (color) => {
    const produced = NOVI_COLORS.map((c) => badgeStyles({ color: c }).root())
    expect(new Set(produced).size).toBe(NOVI_COLORS.length)
    expect(badgeStyles({ color }).root()).toBeTruthy()
  })

  it.each(NOVI_SIZES)('size=%s が固有のクラスを適用する', (size) => {
    const produced = NOVI_SIZES.map((s) => badgeStyles({ size: s }).root())
    expect(new Set(produced).size).toBe(NOVI_SIZES.length)
    expect(badgeStyles({ size }).root()).toBeTruthy()
  })

  it('plain の px-0 が size の余白に勝つ（variant を最後に宣言している）', () => {
    expect(badgeStyles({ variant: 'plain', size: 'lg' }).root()).toContain('px-0')
  })
})

describe('Badge: 拡張', () => {
  it('tv({ extend }) で拡張できる', () => {
    const my = tv({ extend: badgeStyles, slots: { label: 'uppercase' } })
    expect(my().label()).toContain('uppercase')
  })

  it('classNames が該当 slot に反映される', () => {
    const { container } = render(
      <Badge withDot classNames={{ root: 'b-root', dot: 'b-dot', label: 'b-label' }}>
        公開中
      </Badge>,
    )
    for (const [slot, cls] of [
      ['root', 'b-root'],
      ['dot', 'b-dot'],
      ['label', 'b-label'],
    ] as const) {
      expect(container.querySelector(`[data-slot="${slot}"]`)?.className, slot).toContain(cls)
    }
  })
})
