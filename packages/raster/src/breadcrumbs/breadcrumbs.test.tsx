import { NOVI_CONTRACTS, NOVI_SIZES } from '@novi-ui/core'
import { testSlotContract } from '@novi-ui/core/testing'
import { render, screen } from '@testing-library/react'
import { tv } from 'tailwind-variants'
import { describe, expect, it } from 'vitest'
import { Breadcrumb, Breadcrumbs } from './breadcrumbs'
import { breadcrumbsStyles } from './breadcrumbs.styles'

function Subject() {
  return (
    <Breadcrumbs>
      <Breadcrumb href="/">ホーム</Breadcrumb>
      <Breadcrumb href="/docs">ドキュメント</Breadcrumb>
      <Breadcrumb>Button</Breadcrumb>
    </Breadcrumbs>
  )
}

testSlotContract({
  name: 'Breadcrumbs',
  contract: NOVI_CONTRACTS.Breadcrumbs,
  render: () => <Subject />,
})

describe('Breadcrumbs: 構造', () => {
  it('nav として現在地の階層を伝える', () => {
    render(<Subject />)
    expect(screen.getByRole('navigation', { name: 'パンくずリスト' })).toBeDefined()
  })

  it('href のある項目はリンクになる', () => {
    render(<Subject />)
    expect(screen.getByRole('link', { name: 'ホーム' })).toBeDefined()
    expect(screen.getByRole('link', { name: 'ドキュメント' })).toBeDefined()
  })

  it('href のない項目はリンクにしない（現在地）', () => {
    render(<Subject />)
    expect(screen.queryByRole('link', { name: 'Button' })).toBeNull()
    expect(screen.getByText('Button')).toBeDefined()
  })

  it('現在地に aria-current が付く', () => {
    const { container } = render(<Subject />)
    const current = container.querySelector('[aria-current]')
    expect(current?.textContent).toContain('Button')
  })
})

describe('Breadcrumbs: 区切り文字', () => {
  it('装飾なので支援技術には読ませない', () => {
    const { container } = render(<Subject />)
    const separators = container.querySelectorAll('[data-slot="separator"]')
    expect(separators.length).toBeGreaterThan(0)
    for (const s of separators) {
      expect(s.getAttribute('aria-hidden')).toBe('true')
    }
  })

  it('先頭の項目では CSS で隠す（DOM からは消さない）', () => {
    // 各項目が自分の前に区切りを持つ構造。先頭だけ非表示にする
    expect(breadcrumbsStyles().list()).toContain('[&>li:first-child>[data-slot=separator]]:hidden')
  })

  it('区切り文字を差し替えられる', () => {
    const { container } = render(
      <Breadcrumbs separator=">">
        <Breadcrumb href="/">ホーム</Breadcrumb>
        <Breadcrumb>今</Breadcrumb>
      </Breadcrumbs>,
    )
    const texts = [...container.querySelectorAll('[data-slot="separator"]')].map(
      (s) => s.textContent,
    )
    expect(texts).toContain('>')
  })
})

describe('Breadcrumbs: size / 拡張', () => {
  it('全 size が異なるクラスを生む', () => {
    const classes = NOVI_SIZES.map((size) => breadcrumbsStyles({ size }).list())
    expect(new Set(classes).size).toBe(NOVI_SIZES.length)
  })

  it('tv({ extend }) で拡張できる', () => {
    const my = tv({ extend: breadcrumbsStyles, slots: { separator: 'mx-2' } })
    expect(my().separator()).toContain('mx-2')
  })
})
