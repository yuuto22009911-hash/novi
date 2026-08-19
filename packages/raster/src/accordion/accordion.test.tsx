import { NOVI_CONTRACTS } from '@novi-ui/core'
import { testSlotContract } from '@novi-ui/core/testing'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { tv } from 'tailwind-variants'
import { describe, expect, it, vi } from 'vitest'
import { Accordion, AccordionItem } from './accordion'
import { accordionStyles } from './accordion.styles'

function Subject(props: { onExpandedChange?: (k: string[]) => void; multiple?: boolean } = {}) {
  return (
    <Accordion allowsMultipleExpanded={props.multiple} onExpandedChange={props.onExpandedChange}>
      <AccordionItem id="shipping" title="配送について">
        3営業日以内に発送します。
      </AccordionItem>
      <AccordionItem id="returns" title="返品について">
        到着後7日以内にご連絡ください。
      </AccordionItem>
    </Accordion>
  )
}

testSlotContract({
  name: 'Accordion',
  contract: NOVI_CONTRACTS.Accordion,
  render: () => (
    <Accordion defaultExpandedKeys={['shipping']}>
      <AccordionItem id="shipping" title="配送について">
        3営業日以内に発送します。
      </AccordionItem>
    </Accordion>
  ),
})

describe('Accordion: 操作', () => {
  it('見出しがボタンとして操作できる', () => {
    render(<Subject />)
    expect(screen.getByRole('button', { name: '配送について' })).toBeDefined()
  })

  it('クリックで開く', async () => {
    const onExpandedChange = vi.fn()
    render(<Subject onExpandedChange={onExpandedChange} />)

    await userEvent.click(screen.getByRole('button', { name: '配送について' }))

    expect(onExpandedChange).toHaveBeenCalledWith(['shipping'])
  })

  it('既定では1つだけ開く', async () => {
    const onExpandedChange = vi.fn()
    render(<Subject onExpandedChange={onExpandedChange} />)

    await userEvent.click(screen.getByRole('button', { name: '配送について' }))
    await userEvent.click(screen.getByRole('button', { name: '返品について' }))

    expect(onExpandedChange).toHaveBeenLastCalledWith(['returns'])
  })

  it('allowsMultipleExpanded なら複数開ける', async () => {
    const onExpandedChange = vi.fn()
    render(<Subject multiple onExpandedChange={onExpandedChange} />)

    await userEvent.click(screen.getByRole('button', { name: '配送について' }))
    await userEvent.click(screen.getByRole('button', { name: '返品について' }))

    const last = onExpandedChange.mock.lastCall?.[0] as string[]
    expect(last).toHaveLength(2)
  })

  it('見出しと操作ボタンを分けている（支援技術のため）', () => {
    const { container } = render(<Subject />)
    const heading = container.querySelector('[data-slot="heading"]')
    expect(heading?.querySelector('[data-slot="trigger"]')).not.toBeNull()
  })
})

describe('Accordion: Raster のデザイン規律', () => {
  it('インジケータを回転させない（+ と − の線で示す）', () => {
    const all = Object.values(accordionStyles())
      .map((fn) => fn())
      .join(' ')
    expect(all).not.toMatch(/\brotate-/)
  })
})

describe('Accordion: 拡張', () => {
  it('tv({ extend }) で拡張できる', () => {
    const my = tv({ extend: accordionStyles, slots: { panel: 'pt-2' } })
    expect(my().panel()).toContain('pt-2')
  })
})
