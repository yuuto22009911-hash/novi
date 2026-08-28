import { NOVI_CONTRACTS, NOVI_VARIANTS } from '@novi-ui/core'
import { checkSlotContract, testSlotContract } from '@novi-ui/core/testing'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { tv } from 'tailwind-variants'
import { describe, expect, it, vi } from 'vitest'
import { Card, CardBody, CardFooter, CardHeader, CardImage } from './card'
import { cardStyles } from './card.styles'

testSlotContract({
  name: 'Card',
  contract: NOVI_CONTRACTS.Card,
  render: () => (
    <Card>
      <CardImage src="/thumb.jpg" alt="" />
      <CardHeader>売上</CardHeader>
      <CardBody>¥1,240,000</CardBody>
      <CardFooter>前月比 +12%</CardFooter>
    </Card>
  ),
})

describe('Card: 描画', () => {
  it('body だけでも必須 slot を満たす', () => {
    const { container } = render(
      <Card>
        <CardBody>本文</CardBody>
      </Card>,
    )
    const result = checkSlotContract(container, NOVI_CONTRACTS.Card)
    expect(result.missing).toEqual([])
    expect(result.found).toEqual(['body', 'root'])
  })

  it('onPress がないときは div として描画する', () => {
    const { container } = render(
      <Card>
        <CardBody>本文</CardBody>
      </Card>,
    )
    expect(container.querySelector('[data-slot="root"]')?.tagName).toBe('DIV')
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('onPress を渡すとボタンになりキーボードで操作できる', async () => {
    const onPress = vi.fn()
    render(
      <Card onPress={onPress}>
        <CardBody>本文</CardBody>
      </Card>,
    )

    await userEvent.tab()
    await userEvent.keyboard('{Enter}')

    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('押せるカードでも isDisabled なら反応しない', async () => {
    const onPress = vi.fn()
    render(
      <Card onPress={onPress} isDisabled>
        <CardBody>本文</CardBody>
      </Card>,
    )

    await userEvent.click(screen.getByRole('button'))

    expect(onPress).not.toHaveBeenCalled()
  })
})

describe('Card: Flatlay のデザイン規律', () => {
  it('影も z-index も transform も持たない（FR-02 / FR-11）', () => {
    for (const variant of NOVI_VARIANTS) {
      const classes = Object.values(cardStyles({ variant, isPressable: true }))
        .map((slot) => slot())
        .join(' ')
      expect(classes, variant).not.toMatch(/(?<![\w-])shadow-/)
      expect(classes, variant).not.toMatch(/(?<![\w-])z-(?:\d+|\[[^\]]*\])/)
      expect(classes, variant).not.toMatch(/(?<![\w-])(?:scale|rotate|translate)-/)
    }
  })

  it('header と footer は罫線で仕切る（地の色を変えない）', () => {
    expect(cardStyles().header()).toContain('border-b')
    expect(cardStyles().footer()).toContain('border-t')
    expect(cardStyles().header()).not.toMatch(/(?<![\w-])bg-/)
    expect(cardStyles().footer()).not.toMatch(/(?<![\w-])bg-/)
  })

  it('地で面を持ち上げない（surface は bg と同値なので使えない）', () => {
    for (const variant of NOVI_VARIANTS) {
      expect(cardStyles({ variant }).root(), variant).not.toContain('--novi-color-surface')
    }
  })

  it('角は書類の 2px（Raster の 12px と違う）', () => {
    expect(cardStyles().root()).toContain('rounded-[var(--novi-radius-sm)]')
  })

  it('全 variant が罫線の幅を持つ（色だけが variant で変わる）', () => {
    for (const variant of NOVI_VARIANTS) {
      expect(cardStyles({ variant }).root(), variant).toMatch(/(?<![\w-])border(?![\w-])/)
    }
  })

  it('全 variant が異なるクラスを生む', () => {
    const classes = NOVI_VARIANTS.map((variant) => cardStyles({ variant }).root())
    // ghost と plain は Card では同じ意味になるため、重複を1つだけ許す
    expect(new Set(classes).size).toBeGreaterThanOrEqual(NOVI_VARIANTS.length - 1)
  })

  it('押せるカードは押下で全面が反転する（ADR-F3）', () => {
    const pressable = cardStyles({ isPressable: true }).root()
    expect(pressable).toContain('data-[pressed]:bg-[var(--novi-color-fg)]')
    expect(pressable).toContain('data-[pressed]:text-[var(--novi-color-bg)]')
    // 押せないカードは押下の語彙を持たない
    expect(cardStyles({ isPressable: false }).root()).not.toContain('data-[pressed]')
  })
})

describe('Card: 拡張', () => {
  it('tv({ extend }) で拡張できる', () => {
    const my = tv({ extend: cardStyles, slots: { body: 'p-6' } })
    expect(my().body()).toContain('p-6')
  })

  it('classNames が root に反映される', () => {
    const { container } = render(
      <Card classNames={{ root: 'my-card' }}>
        <CardBody>本文</CardBody>
      </Card>,
    )
    expect(container.querySelector('[data-slot="root"]')?.className).toContain('my-card')
  })
})
