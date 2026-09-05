'use client'

import type { PaginationProps } from '@novi-ui/core'
import { paginationRange } from '@novi-ui/core/client'
import { useState } from 'react'
import { Button } from 'react-aria-components'
import { paginationStyles } from './pagination.styles'

function ChevronIcon({ direction }: { direction: 'prev' | 'next' }) {
  const d = direction === 'prev' ? 'M10 4l-4 4 4 4' : 'M6 4l4 4-4 4'
  return (
    <svg viewBox="0 0 16 16" width="0.75em" height="0.75em" fill="none" aria-hidden="true">
      <path d={d} stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

/**
 * 一覧のページを移動する。数字だけを並べ、現在地は下辺の線で示す
 * （Tactile は面を塗り、Flatlay は罫線で区切った枠を反転させる）。
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
        <li>
          <Button
            data-slot="prev"
            aria-label="前のページ"
            isDisabled={isDisabled || current <= 1}
            onPress={() => go(current - 1)}
            className={s.prev({ class: classNames?.prev })}
          >
            <ChevronIcon direction="prev" />
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
            <li key={key}>
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

        <li>
          <Button
            data-slot="next"
            aria-label="次のページ"
            isDisabled={isDisabled || current >= total}
            onPress={() => go(current + 1)}
            className={s.next({ class: classNames?.next })}
          >
            <ChevronIcon direction="next" />
          </Button>
        </li>
      </ul>
    </nav>
  )
}
