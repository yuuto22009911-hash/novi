import { NOVI_CONTRACTS, NOVI_SIZES } from '@novi-ui/core'
import { checkSlotContract, testSlotContract } from '@novi-ui/core/testing'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Pagination } from './pagination'
import { paginationStyles } from './pagination.styles'

// 2. slot 契約。省略記号は中ほどのページでしか出ないので page=5 で検査する
testSlotContract({
  name: 'Pagination',
  contract: NOVI_CONTRACTS.Pagination,
  render: () => <Pagination total={10} defaultPage={5} />,
})

const pageButtons = () =>
  screen
    .getAllByRole('button')
    .filter((b) => b.getAttribute('data-slot') === 'item')
    .map((b) => b.textContent)

describe('Pagination: 描画', () => {
  it('nav に名前が付く（FR-03-4）', () => {
    render(<Pagination total={3} />)
    expect(screen.getByRole('navigation', { name: 'ページ送り' })).toBeDefined()
  })

  it('aria-label を差し替えられる', () => {
    render(<Pagination total={3} aria-label="注文一覧のページ" />)
    expect(screen.getByRole('navigation', { name: '注文一覧のページ' })).toBeDefined()
  })

  it('中ほどのページでは 1 … 4 5 6 … 10 の並びになる（AC-03-2）', () => {
    const { container } = render(<Pagination total={10} defaultPage={5} />)
    expect(pageButtons()).toEqual(['1', '4', '5', '6', '10'])
    expect(container.querySelectorAll('[data-slot="ellipsis"]')).toHaveLength(2)
  })

  it('省略記号は読み上げの対象にしない', () => {
    const { container } = render(<Pagination total={10} defaultPage={5} />)
    for (const el of container.querySelectorAll('[data-slot="ellipsis"]')) {
      expect(el.getAttribute('aria-hidden')).toBe('true')
    }
  })

  it('全部収まるなら省略記号を出さない', () => {
    const { container } = render(<Pagination total={5} />)
    expect(pageButtons()).toEqual(['1', '2', '3', '4', '5'])
    const result = checkSlotContract(container, NOVI_CONTRACTS.Pagination)
    expect(result.missing).toEqual([])
    expect(result.found).not.toContain('ellipsis')
  })

  it('現在ページだけが aria-current="page" を持つ（FR-03-1）', () => {
    render(<Pagination total={10} defaultPage={5} />)
    const current = screen
      .getAllByRole('button')
      .filter((b) => b.getAttribute('aria-current') === 'page')
    expect(current.map((b) => b.textContent)).toEqual(['5'])
  })

  it('ページ番号のボタンは数字を含む名前を持つ', () => {
    render(<Pagination total={3} />)
    expect(screen.getByRole('button', { name: '2ページ' })).toBeDefined()
  })
})

describe('Pagination: 操作（FR-03-2 / AC-03-1）', () => {
  it('先頭では「前へ」が無効で、「次へ」で 2 に進む', async () => {
    const onChange = vi.fn()
    render(<Pagination total={10} onChange={onChange} />)

    const prev = screen.getByRole('button', { name: '前のページ' })
    expect(prev.hasAttribute('disabled') || prev.getAttribute('aria-disabled') === 'true').toBe(
      true,
    )

    await userEvent.click(screen.getByRole('button', { name: '次のページ' }))
    expect(onChange).toHaveBeenCalledWith(2)
  })

  it('末尾では「次へ」が無効', () => {
    render(<Pagination total={10} defaultPage={10} />)
    const next = screen.getByRole('button', { name: '次のページ' })
    expect(next.hasAttribute('disabled') || next.getAttribute('aria-disabled') === 'true').toBe(
      true,
    )
  })

  it('番号を押すとそのページになる（非制御）', async () => {
    const onChange = vi.fn()
    render(<Pagination total={10} onChange={onChange} />)

    await userEvent.click(screen.getByRole('button', { name: '3ページ' }))

    expect(onChange).toHaveBeenCalledWith(3)
    expect(screen.getByRole('button', { name: '3ページ' }).getAttribute('aria-current')).toBe(
      'page',
    )
  })

  it('page を渡した制御モードでは、内部で勝手に進まない', async () => {
    const onChange = vi.fn()
    render(<Pagination total={10} page={1} onChange={onChange} />)

    await userEvent.click(screen.getByRole('button', { name: '次のページ' }))

    expect(onChange).toHaveBeenCalledWith(2)
    expect(screen.getByRole('button', { name: '1ページ' }).getAttribute('aria-current')).toBe(
      'page',
    )
  })

  it('現在ページを押しても onChange は呼ばれない', async () => {
    const onChange = vi.fn()
    render(<Pagination total={10} defaultPage={4} onChange={onChange} />)

    await userEvent.click(screen.getByRole('button', { name: '4ページ' }))

    expect(onChange).not.toHaveBeenCalled()
  })

  it('isDisabled のとき全ボタンが無効', () => {
    render(<Pagination total={10} defaultPage={5} isDisabled />)
    for (const button of screen.getAllByRole('button')) {
      expect(
        button.hasAttribute('disabled') || button.getAttribute('aria-disabled') === 'true',
      ).toBe(true)
    }
  })

  it('Tab で辿れ、Enter で押せる', async () => {
    const onChange = vi.fn()
    render(<Pagination total={3} onChange={onChange} />)

    // 前へ（無効）は飛ばされ、最初の番号は現在地。2 番目の番号まで進む
    await userEvent.tab()
    await userEvent.tab()
    await userEvent.keyboard('{Enter}')

    expect(onChange).toHaveBeenCalledWith(2)
  })
})

describe('Pagination: size', () => {
  it.each([
    ['sm', 'h-7'],
    ['md', 'h-8'],
    ['lg', 'h-10'],
  ] as const)('size=%s の高さが %s（Button と揃っている）', (size, expected) => {
    expect(paginationStyles({ size }).item()).toContain(expected)
  })

  it('size 語彙をすべて実装している', () => {
    const classes = NOVI_SIZES.map((size) => paginationStyles({ size }).item())
    expect(new Set(classes).size).toBe(NOVI_SIZES.length)
  })
})

describe('Pagination: classNames', () => {
  it('slot 単位でクラスを差し込める', () => {
    const { container } = render(
      <Pagination total={10} defaultPage={5} classNames={{ list: 'my-list', item: 'my-item' }} />,
    )
    expect(container.querySelector('[data-slot="list"]')?.className).toContain('my-list')
    expect(container.querySelector('[data-slot="item"]')?.className).toContain('my-item')
  })
})
