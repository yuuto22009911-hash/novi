'use client'

import type { PaginationProps } from '@novi-ui/core'
import { paginationRange } from '@novi-ui/core/client'
import { useState } from 'react'
import { Button } from 'react-aria-components'
import { paginationStyles } from './pagination.styles'

/**
 * 一覧のページを移動する。**罫線で区切った 1 本の帯**に数字を並べ、現在地は反転させる
 * （Raster は数字だけを並べ、Tactile は面を塗る）。前後は `‹` `›` の活字。
 *
 * @example
 * <Pagination total={10} page={page} onChange={setPage} />
 */
export function Pagination({
  size,
  radius,
  total,
  page,
  defaultPage = 1,
  onChange,
  siblingCount,
  boundaryCount,
  isDisabled,
  'aria-label': ariaLabel = 'ページ送り',
  className,
  classNames,
  id,
}: PaginationProps) {
  const s = paginationStyles({ size, radius })
  const [internal, setInternal] = useState(defaultPage)
  const clamp = (n: number) => Math.min(Math.max(n, 1), Math.max(total, 1))
  const current = clamp(page ?? internal)

  const go = (n: number) => {
    const next = clamp(n)
    if (next === current) return
    if (page === undefined) setInternal(next)
    onChange?.(next)
  }

  // 省略記号は最大 2 つ出る。配列の添字ではなく「どの数字の直後か」で区別する
  const slots = paginationRange(current, total, { siblingCount, boundaryCount })
  const entries = slots.map((slot, i) => ({
    slot,
    key: slot === 'ellipsis' ? `ellipsis-after-${slots[i - 1]}` : `page-${slot}`,
  }))

  return (
    <nav
      id={id}
      aria-label={ariaLabel}
      data-slot="root"
      className={s.root({ class: [className, classNames?.root] })}
    >
      <ul data-slot="list" className={s.list({ class: classNames?.list })}>
        <li className="flex">
          <Button
            data-slot="prev"
            aria-label="前のページ"
            isDisabled={isDisabled || current <= 1}
            onPress={() => go(current - 1)}
            className={s.prev({ class: classNames?.prev })}
          >
            <span aria-hidden="true">‹</span>
          </Button>
        </li>

        {entries.map(({ slot, key }) =>
          slot === 'ellipsis' ? (
            <li
              key={key}
              data-slot="ellipsis"
              aria-hidden="true"
              className={s.ellipsis({ class: classNames?.ellipsis })}
            >
              …
            </li>
          ) : (
            <li key={key} className="flex">
              <Button
                data-slot="item"
                aria-label={`${slot}ページ`}
                aria-current={slot === current ? 'page' : undefined}
                isDisabled={isDisabled}
                onPress={() => go(slot)}
                className={s.item({ class: classNames?.item })}
              >
                {slot}
              </Button>
            </li>
          ),
        )}

        <li className="flex">
          <Button
            data-slot="next"
            aria-label="次のページ"
            isDisabled={isDisabled || current >= total}
            onPress={() => go(current + 1)}
            className={s.next({ class: classNames?.next })}
          >
            <span aria-hidden="true">›</span>
          </Button>
        </li>
      </ul>
    </nav>
  )
}
