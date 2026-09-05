/** ページ送りの 1 マス。数字か、詰めたことを示す省略記号。 */
export type PaginationSlot = number | 'ellipsis'

export interface PaginationRangeOptions {
  /** 現在ページの両隣に出す数。既定は 1 */
  siblingCount?: number
  /** 先頭と末尾に必ず出す数。既定は 1 */
  boundaryCount?: number
}

const range = (start: number, end: number): number[] =>
  Array.from({ length: Math.max(end - start + 1, 0) }, (_, i) => start + i)

/**
 * ページ送りに並べる数列を作る。**見た目ではなく数列の計算なので core に置く**（ADR-B4）。
 *
 * 先頭 `boundaryCount` 個、末尾 `boundaryCount` 個、現在ページとその両隣 `siblingCount` 個を
 * 必ず出し、あいだが 2 ページ以上空くときだけ省略記号で詰める。1 ページしか空かないなら
 * 省略記号よりその数字を出す方が短い。
 *
 * マスの総数は `page` によらず一定（`boundaryCount * 2 + siblingCount * 2 + 3`）なので、
 * ページを進めても幅が揺れない。
 *
 * @example
 * paginationRange(5, 10)  // [1, 'ellipsis', 4, 5, 6, 'ellipsis', 10]
 * paginationRange(1, 10)  // [1, 2, 3, 4, 5, 'ellipsis', 10]
 * paginationRange(3, 5)   // [1, 2, 3, 4, 5]
 */
export function paginationRange(
  page: number,
  total: number,
  { siblingCount = 1, boundaryCount = 1 }: PaginationRangeOptions = {},
): PaginationSlot[] {
  if (!Number.isFinite(total) || total < 1) return []
  const current = Math.min(Math.max(Math.trunc(page), 1), total)

  const startPages = range(1, Math.min(boundaryCount, total))
  const endPages = range(Math.max(total - boundaryCount + 1, boundaryCount + 1), total)

  const siblingsStart = Math.max(
    Math.min(current - siblingCount, total - boundaryCount - siblingCount * 2 - 1),
    boundaryCount + 2,
  )
  const siblingsEnd = Math.min(
    Math.max(current + siblingCount, boundaryCount + siblingCount * 2 + 2),
    endPages.length > 0 ? (endPages[0] as number) - 2 : total - 1,
  )

  const items: (PaginationSlot | null)[] = [
    ...startPages,
    siblingsStart > boundaryCount + 2
      ? 'ellipsis'
      : boundaryCount + 1 < total - boundaryCount
        ? boundaryCount + 1
        : null,
    ...range(siblingsStart, siblingsEnd),
    siblingsEnd < total - boundaryCount - 1
      ? 'ellipsis'
      : total - boundaryCount > boundaryCount
        ? total - boundaryCount
        : null,
    ...endPages,
  ]

  return items.filter((item): item is PaginationSlot => item !== null)
}
