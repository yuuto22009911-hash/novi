'use client'

import type { SkeletonProps } from '@novi-ui/core'
import { skeletonStyles } from './skeleton.styles'

/**
 * 読み込み中の場所取り。
 *
 * 支援技術には読ませない。読み込み状態は Spinner か live region で伝えること。
 * 大きさは `className` で指定する。
 *
 * @example
 * <Skeleton className="h-4 w-40" />
 */
export function Skeleton({ radius, className, classNames, id }: SkeletonProps) {
  const s = skeletonStyles({ radius })

  return (
    <span
      id={id}
      aria-hidden="true"
      data-slot="root"
      className={s.root({ class: [className, classNames?.root] })}
    />
  )
}
