import { describe, expect, it } from 'vitest'
import { paginationRange } from './range'

describe('paginationRange（ADR-B4 / AC-03-2）', () => {
  it('中ほどのページでは両端を残して省略する', () => {
    expect(paginationRange(5, 10)).toEqual([1, 'ellipsis', 4, 5, 6, 'ellipsis', 10])
  })

  it('先頭付近では左を省略せず、右だけ省略する', () => {
    expect(paginationRange(1, 10)).toEqual([1, 2, 3, 4, 5, 'ellipsis', 10])
    expect(paginationRange(2, 10)).toEqual([1, 2, 3, 4, 5, 'ellipsis', 10])
  })

  it('末尾付近では右を省略せず、左だけ省略する', () => {
    expect(paginationRange(10, 10)).toEqual([1, 'ellipsis', 6, 7, 8, 9, 10])
  })

  it('1 ページしか空かないときは省略記号より数字を出す', () => {
    // 1 と 3 のあいだの 2 を「…」にしても短くならない
    expect(paginationRange(4, 10)).toEqual([1, 2, 3, 4, 5, 'ellipsis', 10])
  })

  it('全部並べても収まるなら省略しない', () => {
    expect(paginationRange(3, 5)).toEqual([1, 2, 3, 4, 5])
    expect(paginationRange(1, 1)).toEqual([1])
  })

  it('マスの総数はページによらず一定（幅が揺れない）', () => {
    const lengths = [1, 2, 5, 9, 20].map((p) => paginationRange(p, 20).length)
    expect(new Set(lengths).size).toBe(1)
    expect(lengths[0]).toBe(7)
  })

  it('siblingCount / boundaryCount を広げられる', () => {
    expect(paginationRange(10, 20, { siblingCount: 2, boundaryCount: 2 })).toEqual([
      1,
      2,
      'ellipsis',
      8,
      9,
      10,
      11,
      12,
      'ellipsis',
      19,
      20,
    ])
  })

  it('範囲外のページは端に丸める', () => {
    expect(paginationRange(0, 10)).toEqual(paginationRange(1, 10))
    expect(paginationRange(99, 10)).toEqual(paginationRange(10, 10))
  })

  it('総ページ数が 0 以下なら何も出さない', () => {
    expect(paginationRange(1, 0)).toEqual([])
    expect(paginationRange(1, Number.NaN)).toEqual([])
  })
})
