'use client'

import type { BadgeProps } from '@novi-ui/core'
import { badgeStyles } from './badge.styles'

/**
 * 短いラベルで状態や分類を示す。Flatlay では**書類に押した区分印**として並ぶ。
 *
 * 色だけで意味を伝えないこと。`success` と `danger` は色相が違うが、
 * 色覚特性によっては区別できない。必ず文言を伴わせる（WCAG 1.4.1）。
 *
 * @example
 * <Badge color="success" variant="outline">公開中</Badge>
 */
export function Badge({
  variant,
  size,
  color,
  radius,
  withDot,
  children,
  className,
  classNames,
  id,
}: BadgeProps) {
  const s = badgeStyles({ variant, size, color, radius })

  return (
    <span id={id} data-slot="root" className={s.root({ class: [className, classNames?.root] })}>
      {withDot === true && (
        <span data-slot="dot" className={s.dot({ class: classNames?.dot })} aria-hidden="true" />
      )}
      <span data-slot="label" className={s.label({ class: classNames?.label })}>
        {children}
      </span>
    </span>
  )
}
