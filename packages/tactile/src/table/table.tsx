'use client'

import type { TableProps, TableSortDescriptor } from '@novi-ui/core'
import { createContext, type ReactNode, useContext } from 'react'
import {
  Cell,
  Column,
  Table as RACTable,
  TableBody as RACTableBody,
  TableHeader as RACTableHeader,
  Row,
} from 'react-aria-components'
import { alignEndClass, tableStyles } from './table.styles'

type Styles = ReturnType<typeof tableStyles>
type SlotClassNames = NonNullable<TableProps['classNames']>

/**
 * 表の中の部品が size と classNames を受け取るための経路。
 * 利用者向けの Provider ではなく、Table の内側だけで閉じる。
 */
const TableContext = createContext<{ s: Styles; classNames?: SlotClassNames }>({
  s: tableStyles(),
})

function SortIcon({ direction }: { direction: 'ascending' | 'descending' | undefined }) {
  const d =
    direction === 'ascending' ? 'M8 4l4 5H4z' : direction === 'descending' ? 'M8 12L4 7h8z' : ''
  return (
    <svg viewBox="0 0 16 16" width="1em" height="1em" fill="currentColor" aria-hidden="true">
      {d === '' ? (
        <>
          <path d="M8 3l3 3.5H5z" />
          <path d="M8 13l-3-3.5h6z" />
        </>
      ) : (
        <path d={d} />
      )}
    </svg>
  )
}

export interface TableHeaderProps {
  children?: ReactNode
  className?: string
}

/**
 * 見出し行。`TableColumn` を並べる。
 *
 * @example
 * <TableHeader>
 *   <TableColumn id="name" isRowHeader>商品名</TableColumn>
 * </TableHeader>
 */
export function TableHeader({ children, className }: TableHeaderProps) {
  const { s, classNames } = useContext(TableContext)
  return (
    <RACTableHeader
      data-slot="header"
      className={s.header({ class: [className, classNames?.header] })}
    >
      {children}
    </RACTableHeader>
  )
}

export interface TableColumnProps {
  /** 列の id。`sortDescriptor.column` に入る */
  id: string
  /** この列で並べ替えられる。見出しが押せるようになり `aria-sort` が付く */
  allowsSorting?: boolean
  /** 行の名前になる列。少なくとも 1 列に付ける */
  isRowHeader?: boolean
  /** 金額や数量は `end`（右寄せ） */
  align?: 'start' | 'end'
  children?: ReactNode
  className?: string
}

/**
 * 見出しのセル。
 *
 * @example
 * <TableColumn id="amount" allowsSorting align="end">金額</TableColumn>
 */
export function TableColumn({
  id,
  allowsSorting,
  isRowHeader,
  align = 'start',
  children,
  className,
}: TableColumnProps) {
  const { s, classNames } = useContext(TableContext)
  return (
    <Column
      id={id}
      allowsSorting={allowsSorting}
      isRowHeader={isRowHeader}
      data-slot="column"
      className={`group ${s.column({ class: [align === 'end' ? alignEndClass : '', className, classNames?.column] })}`}
    >
      {({ sortDirection }) => (
        <>
          {children}
          {allowsSorting && (
            <span data-slot="sortIcon" className={s.sortIcon({ class: classNames?.sortIcon })}>
              <SortIcon direction={sortDirection} />
            </span>
          )}
        </>
      )}
    </Column>
  )
}

export interface TableBodyProps {
  children?: ReactNode
  /** 行が 0 件のときに本体へ出す内容 */
  renderEmptyState?: () => ReactNode
  className?: string
}

/**
 * 本体。`TableRow` を並べる。行が無いときは `renderEmptyState` の内容が出る。
 *
 * @example
 * <TableBody renderEmptyState={() => '該当する注文はありません'}>
 *   {rows}
 * </TableBody>
 */
export function TableBody({ children, renderEmptyState, className }: TableBodyProps) {
  const { s, classNames } = useContext(TableContext)
  return (
    <RACTableBody
      data-slot="body"
      className={s.body({ class: [className, classNames?.body] })}
      renderEmptyState={
        renderEmptyState === undefined
          ? undefined
          : () => (
              <div data-slot="empty" className={s.empty({ class: classNames?.empty })}>
                {renderEmptyState()}
              </div>
            )
      }
    >
      {children}
    </RACTableBody>
  )
}

export interface TableRowProps {
  /** 行の id。選択と `onRowAction` に渡る */
  id: string
  isDisabled?: boolean
  children?: ReactNode
  className?: string
}

/**
 * 行。`TableCell` を列の数だけ並べる。
 *
 * @example
 * <TableRow id="1042">
 *   <TableCell>#1042</TableCell>
 * </TableRow>
 */
export function TableRow({ id, isDisabled, children, className }: TableRowProps) {
  const { s, classNames } = useContext(TableContext)
  return (
    <Row
      id={id}
      isDisabled={isDisabled}
      data-slot="row"
      className={s.row({ class: [className, classNames?.row] })}
    >
      {children}
    </Row>
  )
}

export interface TableCellProps {
  /** 金額や数量は `end`（右寄せ）。見出しと揃える */
  align?: 'start' | 'end'
  children?: ReactNode
  className?: string
}

/**
 * セル。
 *
 * @example
 * <TableCell align="end">¥12,800</TableCell>
 */
export function TableCell({ align = 'start', children, className }: TableCellProps) {
  const { s, classNames } = useContext(TableContext)
  return (
    <Cell
      data-slot="cell"
      className={s.cell({
        class: [align === 'end' ? alignEndClass : '', className, classNames?.cell],
      })}
    >
      {children}
    </Cell>
  )
}

/**
 * 一覧を行と列で見せる。**行が指で押せる面**で、40px 以上の高さを持つ
 * （Raster は横罫だけ、Flatlay は縦横の罫線の帳票）。
 *
 * 行の選択は行そのものを押す（チェックボックスは出さない）。
 * 狭い画面では表そのものが横にスクロールする。`overflow-x-auto` の枠で包むこと。
 *
 * @example
 * <Table aria-label="注文一覧" sortDescriptor={sort} onSortChange={setSort}>
 *   <TableHeader>
 *     <TableColumn id="no" isRowHeader>注文番号</TableColumn>
 *     <TableColumn id="amount" allowsSorting align="end">金額</TableColumn>
 *   </TableHeader>
 *   <TableBody>
 *     <TableRow id="1042">
 *       <TableCell>#1042</TableCell>
 *       <TableCell align="end">¥12,800</TableCell>
 *     </TableRow>
 *   </TableBody>
 * </Table>
 */
export function Table({
  'aria-label': ariaLabel,
  size,
  sortDescriptor,
  onSortChange,
  selectionMode,
  selectedKeys,
  defaultSelectedKeys,
  onSelectionChange,
  disabledKeys,
  onRowAction,
  children,
  className,
  classNames,
}: TableProps) {
  const s = tableStyles({ size })

  return (
    <TableContext.Provider value={{ s, classNames }}>
      {/* RAC の Table は id を受け取らない（DOM に出す口が無い）。NoviBaseProps の id は表では効かない */}
      <RACTable
        aria-label={ariaLabel}
        sortDescriptor={sortDescriptor}
        onSortChange={(d) =>
          onSortChange?.({
            column: String(d.column),
            direction: d.direction,
          } as TableSortDescriptor)
        }
        selectionMode={selectionMode}
        // 行そのものを押して選ぶ。チェックボックスの列は出さない
        selectionBehavior="replace"
        selectedKeys={selectedKeys}
        defaultSelectedKeys={defaultSelectedKeys}
        onSelectionChange={(keys) =>
          onSelectionChange?.(keys === 'all' ? 'all' : new Set([...keys].map(String)))
        }
        disabledKeys={disabledKeys}
        onRowAction={onRowAction === undefined ? undefined : (key) => onRowAction(String(key))}
        data-slot="root"
        className={s.root({ class: [className, classNames?.root] })}
      >
        {children}
      </RACTable>
    </TableContext.Provider>
  )
}
