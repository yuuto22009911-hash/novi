import type { ReactNode } from 'react'
import type { NoviBaseProps } from '../props'
import type { ClassNames } from '../slots'
import type { NoviSize } from '../tokens'

/**
 * Table を構成する部位。
 *
 * `root` は `table`、`header` は見出し行の集まり、`column` は各見出し、`body` は本体、
 * `row` は各行、`cell` は各セル。`sortIcon` は並べ替えできる見出しに出る印、
 * `empty` は行が 0 件のときに本体へ出る面。
 */
export const tableSlots = [
  'root',
  'header',
  'column',
  'sortIcon',
  'body',
  'row',
  'cell',
  'empty',
] as const

export const tableRequiredSlots = ['root', 'header', 'column', 'body', 'row', 'cell'] as const

export type TableSlot = (typeof tableSlots)[number]
export type TableRequiredSlot = (typeof tableRequiredSlots)[number]

/** 並べ替えの状態。`column` は見出しの `id`。 */
export interface TableSortDescriptor {
  column: string
  direction: 'ascending' | 'descending'
}

/**
 * 一覧を行と列で見せる。見出しを押して並べ替え、行を押して選ぶ。矢印キーで行と列を移動できる。
 *
 * `Table > TableHeader > TableColumn` と `TableBody > TableRow > TableCell` で組む。
 * 少なくとも 1 列を `isRowHeader` にすると、支援技術が行を名前で読める。
 * 狭い画面では**表そのものが横にスクロールする**。列を隠すかどうかはアプリの判断（ADR-B5）。
 *
 * @keywords テーブル 一覧表 データテーブル 表 並べ替え ソート 行選択 table datagrid
 *
 * @a11y 根要素は `role="grid"` で `aria-label` を持つ。並べ替えできる見出しは `aria-sort` を持ち、
 * Enter / Space で切り替わる。行は矢印キーで移動でき、`selectionMode` があれば Space で選べる。
 * 行が 0 件のときは `renderEmptyState` の内容が本体に出る
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
export interface TableProps extends NoviBaseProps {
  /** 表の名前。支援技術が「何の一覧か」を読むために必須 */
  'aria-label': string
  size?: NoviSize
  /** 並べ替えの状態。制御したい場合に使う */
  sortDescriptor?: TableSortDescriptor
  onSortChange?: (descriptor: TableSortDescriptor) => void
  /**
   * 行の選び方。`single` / `multiple` では行を押すと選ばれる（チェックボックスは出さない）。
   * 既定は `none`
   */
  selectionMode?: 'none' | 'single' | 'multiple'
  /** 選ばれている行の `id`。制御したい場合に使う。`'all'` は全行 */
  selectedKeys?: 'all' | Iterable<string>
  defaultSelectedKeys?: 'all' | Iterable<string>
  onSelectionChange?: (keys: 'all' | Set<string>) => void
  disabledKeys?: Iterable<string>
  /** 行を押したときの動作（選択とは別）。詳細へ移るなど */
  onRowAction?: (key: string) => void
  children?: ReactNode
  classNames?: ClassNames<typeof tableSlots>
}
