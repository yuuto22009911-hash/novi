import { NOVI_CONTRACTS, NOVI_SIZES, NOVI_VARIANTS } from '@novi-ui/core'
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

const indicatorOf = (container: HTMLElement) =>
  container.querySelector('[data-slot="indicator"]')?.textContent

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

describe('Accordion: Flatlay のデザイン規律', () => {
  it('開閉は記号の差し替えで示す（▸ / ▾）', async () => {
    const { container } = render(<Subject />)
    expect(indicatorOf(container)).toBe('▸')

    await userEvent.click(screen.getByRole('button', { name: '配送について' }))

    expect(indicatorOf(container)).toBe('▾')
  })

  it('印は行頭にあり、幅は 1 文字ぶんで固定する（見出しの開始位置がずれない）', () => {
    const { container } = render(<Subject />)
    const trigger = container.querySelector('[data-slot="trigger"]')

    expect(trigger?.firstElementChild?.getAttribute('data-slot')).toBe('indicator')
    expect(accordionStyles().indicator()).toContain('w-[1ch]')
  })

  it('印は等幅で読ませる（ADR-F7）', () => {
    expect(accordionStyles().indicator()).toContain('font-(family-name:--novi-font-mono)')
  })

  it('印を支援技術に読ませない（開閉は aria-expanded が伝える）', () => {
    const { container } = render(<Subject />)
    expect(container.querySelector('[data-slot="indicator"]')?.getAttribute('aria-hidden')).toBe(
      'true',
    )
  })

  it('回転も高さのアニメーションも持たない（FR-11）', () => {
    const all = Object.values(accordionStyles())
      .map((fn) => fn())
      .join(' ')
    expect(all).not.toMatch(/(?<![\w-])(?:scale|rotate|translate)-/)
    expect(all).not.toMatch(/transition-\[(?:max-)?height/)
  })

  it('段は罫線で仕切る（影も z-index も持たない）', () => {
    const all = Object.values(accordionStyles())
      .map((fn) => fn())
      .join(' ')
    expect(accordionStyles().item()).toContain('border-b')
    expect(all).not.toMatch(/(?<![\w-])shadow-/)
    expect(all).not.toMatch(/(?<![\w-])z-(?:\d+|\[[^\]]*\])/)
  })

  it('押すと反転する（開いている状態は記号が持つ・ADR-F3）', () => {
    expect(accordionStyles().trigger()).toContain('data-[pressed]:bg-[var(--novi-color-fg)]')
  })

  it.each(NOVI_VARIANTS)('variant=%s が固有のクラスを適用する', (variant) => {
    const produced = NOVI_VARIANTS.map((v) => accordionStyles({ variant: v }).item())
    expect(new Set(produced).size).toBeGreaterThan(1)
    expect(accordionStyles({ variant }).item()).toBeTruthy()
  })

  it.each(NOVI_SIZES)('size=%s が固有の行の高さを持つ', (size) => {
    const produced = NOVI_SIZES.map((s) => accordionStyles({ size: s }).trigger())
    expect(new Set(produced).size).toBe(NOVI_SIZES.length)
    expect(accordionStyles({ size }).trigger()).toBeTruthy()
  })
})

describe('Accordion: 拡張', () => {
  it('tv({ extend }) で拡張できる', () => {
    const my = tv({ extend: accordionStyles, slots: { panel: 'pt-2' } })
    expect(my().panel()).toContain('pt-2')
  })

  it('classNames が該当 slot に反映される', () => {
    const { container } = render(
      <Accordion classNames={{ root: 'acc-root' }}>
        <AccordionItem id="a" title="A">
          中身
        </AccordionItem>
      </Accordion>,
    )
    expect(container.querySelector('[data-slot="root"]')?.className).toContain('acc-root')
  })
})
