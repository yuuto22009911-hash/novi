import type { NoviBaseProps } from '../props'
import type { ClassNames } from '../slots'
import type { NoviRadius, NoviSize } from '../tokens'

/**
 * Pagination を構成する部位。
 *
 * `root` は `nav`、`list` はその中の並び、`item` はページ番号のボタン、
 * `prev` / `next` は前後へ送るボタン、`ellipsis` は詰めたことを示す省略記号。
 */
export const paginationSlots = ['root', 'list', 'item', 'prev', 'next', 'ellipsis'] as const

export const paginationRequiredSlots = ['root', 'list', 'item', 'prev', 'next'] as const

export type PaginationSlot = (typeof paginationSlots)[number]
export type PaginationRequiredSlot = (typeof paginationRequiredSlots)[number]

/**
 * 一覧のページを移動する。現在ページは `aria-current` で示し、先頭と末尾のあいだが空くときだけ省略記号で詰める。
 *
 * 並べる数列は core の `paginationRange`（`@novi-ui/core/client`）が決め、マスの総数は
 * ページによらず一定なので、進めても幅が揺れない。
 *
 * @keywords ページネーション ページ送り ページ番号 一覧の分割 前へ次へ pagination pager
 *
 * @a11y 根要素は `nav` で名前を持つ（既定「ページ送り」）。現在ページは `aria-current="page"`。
 * 前へ / 次へは端で無効になる。省略記号は読み上げの対象にしない。
 * 各ボタンは Tab で辿れ、Enter / Space で押せる
 *
 * @example
 * <Pagination total={10} page={page} onChange={setPage} />
 */
export interface PaginationProps extends NoviBaseProps {
  size?: NoviSize
  radius?: NoviRadius
  /** 総ページ数 */
  total: number
  /** 現在のページ（1 始まり）。制御したい場合に使う */
  page?: number
  defaultPage?: number
  onChange?: (page: number) => void
  /** 現在ページの両隣に出す数。既定は 1 */
  siblingCount?: number
  /** 先頭と末尾に必ず出す数。既定は 1 */
  boundaryCount?: number
  isDisabled?: boolean
  /** `nav` の名前。1 ページに複数置くときに区別する。既定は「ページ送り」 */
  'aria-label'?: string
  classNames?: ClassNames<typeof paginationSlots>
}
