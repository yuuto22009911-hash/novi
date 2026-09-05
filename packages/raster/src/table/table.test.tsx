import { NOVI_CONTRACTS, NOVI_SIZES } from '@novi-ui/core'
import { checkSlotContract, testSlotContract } from '@novi-ui/core/testing'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from './table'
import { tableStyles } from './table.styles'

const ORDERS = [
  { id: '1042', customer: '山田', amount: 12800 },
  { id: '1043', customer: '佐藤', amount: 4200 },
  { id: '1044', customer: '鈴木', amount: 31000 },
]

function Subject(props: Partial<Parameters<typeof Table>[0]> & { rows?: typeof ORDERS } = {}) {
  const { rows = ORDERS, ...rest } = props
  return (
    <Table aria-label="注文一覧" {...rest}>
      <TableHeader>
        <TableColumn id="id" isRowHeader>
          注文番号
        </TableColumn>
        <TableColumn id="customer">顧客</TableColumn>
        <TableColumn id="amount" allowsSorting align="end">
          金額
        </TableColumn>
      </TableHeader>
      <TableBody renderEmptyState={() => '該当する注文はありません'}>
        {rows.map((o) => (
          <TableRow key={o.id} id={o.id}>
            <TableCell>#{o.id}</TableCell>
            <TableCell>{o.customer}</TableCell>
            <TableCell align="end">¥{o.amount.toLocaleString('ja-JP')}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

// 2. slot 契約（sortIcon は並べ替えできる列にだけ出る）
testSlotContract({
  name: 'Table',
  contract: NOVI_CONTRACTS.Table,
  render: () => <Subject />,
})

describe('Table: 描画', () => {
  it('grid として名前を持つ（FR-04-1）', () => {
    render(<Subject />)
    expect(screen.getByRole('grid', { name: '注文一覧' })).toBeDefined()
  })

  it('見出しと行が出る', () => {
    render(<Subject />)
    expect(screen.getAllByRole('columnheader')).toHaveLength(3)
    // 見出し行 + データ 3 行
    expect(screen.getAllByRole('row')).toHaveLength(4)
  })

  it('行は isRowHeader の列の値で名前を持つ', () => {
    render(<Subject />)
    expect(screen.getByRole('row', { name: /#1042/ })).toBeDefined()
  })

  it('並べ替えできる列にだけ sortIcon が出る', () => {
    const { container } = render(<Subject />)
    expect(container.querySelectorAll('[data-slot="sortIcon"]')).toHaveLength(1)
  })

  it('行が 0 件なら empty が出る（FR-04-4 / AC-04-2）', () => {
    const { container } = render(<Subject rows={[]} />)
    expect(screen.getByText('該当する注文はありません')).toBeDefined()
    const result = checkSlotContract(container, NOVI_CONTRACTS.Table)
    expect(result.found).toContain('empty')
  })
})

describe('Table: 並べ替え（FR-04-2 / AC-04-1）', () => {
  it('見出しを押すと onSortChange が昇順で呼ばれる', async () => {
    const onSortChange = vi.fn()
    render(<Subject onSortChange={onSortChange} />)

    await userEvent.click(screen.getByRole('columnheader', { name: /金額/ }))

    expect(onSortChange).toHaveBeenCalledWith({ column: 'amount', direction: 'ascending' })
  })

  it('同じ列をもう一度押すと降順になる', async () => {
    const onSortChange = vi.fn()
    render(
      <Subject
        sortDescriptor={{ column: 'amount', direction: 'ascending' }}
        onSortChange={onSortChange}
      />,
    )

    await userEvent.click(screen.getByRole('columnheader', { name: /金額/ }))

    expect(onSortChange).toHaveBeenCalledWith({ column: 'amount', direction: 'descending' })
  })

  it('並べ替え中の列は aria-sort を持つ', () => {
    render(<Subject sortDescriptor={{ column: 'amount', direction: 'descending' }} />)
    expect(screen.getByRole('columnheader', { name: /金額/ }).getAttribute('aria-sort')).toBe(
      'descending',
    )
  })

  it('並べ替えできない列を押しても何も起きない', async () => {
    const onSortChange = vi.fn()
    render(<Subject onSortChange={onSortChange} />)

    await userEvent.click(screen.getByRole('columnheader', { name: '顧客' }))

    expect(onSortChange).not.toHaveBeenCalled()
  })
})

describe('Table: 選択と行の操作（FR-04-3）', () => {
  it('selectionMode="single" で行を押すと選ばれる', async () => {
    const onSelectionChange = vi.fn()
    render(<Subject selectionMode="single" onSelectionChange={onSelectionChange} />)

    await userEvent.click(screen.getByRole('row', { name: /#1043/ }))

    expect(onSelectionChange).toHaveBeenCalledWith(new Set(['1043']))
    expect(screen.getByRole('row', { name: /#1043/ }).getAttribute('aria-selected')).toBe('true')
  })

  it('selectionMode が無ければ行は選べない', () => {
    render(<Subject />)
    expect(screen.getByRole('row', { name: /#1043/ }).hasAttribute('aria-selected')).toBe(false)
  })

  it('onRowAction は行の id を文字列で受け取る', async () => {
    const onRowAction = vi.fn()
    render(<Subject onRowAction={onRowAction} />)

    await userEvent.dblClick(screen.getByRole('row', { name: /#1044/ }))

    expect(onRowAction).toHaveBeenCalledWith('1044')
  })

  it('矢印キーで行を移動できる', async () => {
    render(<Subject selectionMode="single" />)

    await userEvent.click(screen.getByRole('row', { name: /#1042/ }))
    await userEvent.keyboard('{ArrowDown}')

    expect(document.activeElement).toBe(screen.getByRole('row', { name: /#1043/ }))
  })
})

describe('Table: size', () => {
  it.each([
    ['sm', 'h-8'],
    ['md', 'h-10'],
    ['lg', 'h-12'],
  ] as const)('size=%s の行の高さが %s（Button と揃っている）', (size, expected) => {
    expect(tableStyles({ size }).cell()).toContain(expected)
  })

  it('size 語彙をすべて実装している', () => {
    const classes = NOVI_SIZES.map((size) => tableStyles({ size }).cell())
    expect(new Set(classes).size).toBe(NOVI_SIZES.length)
  })
})

describe('Table: classNames / 揃え', () => {
  it('slot 単位でクラスを差し込める', () => {
    const { container } = render(<Subject classNames={{ row: 'my-row', column: 'my-col' }} />)
    expect(container.querySelector('[data-slot="row"]')?.className).toContain('my-row')
    expect(container.querySelector('[data-slot="column"]')?.className).toContain('my-col')
  })

  it('align="end" の見出しとセルは右寄せになる', () => {
    render(<Subject />)
    expect(screen.getByRole('columnheader', { name: /金額/ }).className).toContain('text-right')
    expect(screen.getAllByRole('rowheader')).toHaveLength(3)
  })
})
