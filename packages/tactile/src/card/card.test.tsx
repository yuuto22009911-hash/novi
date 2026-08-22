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

describe('Card: 拡張', () => {
  it('tv({ extend }) で拡張できる', () => {
    const my = tv({ extend: cardStyles, slots: { body: 'p-6' } })
    expect(my().body()).toContain('p-6')
  })
})
