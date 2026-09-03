'use client'

import type { ReactNode } from 'react'
import { SCHEME_ATTR, THEME_ATTR, type ThemeName } from '../lib/theme-registry'
import { useThemeState } from '../lib/use-novi-theme'

/**
 * Modal 見本の枠。**JS が要るのはここだけ**（スキーム属性を付けるため）。
 * 中身はサーバーで描いた HTML を children として受け取る。
 *
 * 見本は1枚の絵として読ませる。中の「ボタン」は押せない飾りなので、
 * role=img で子要素を支援技術から隠し、説明を1文で与える。
 *
 * `fixed inset-0` の backdrop を枠の中に閉じ込めるのは `contain: paint`。
 * これで枠が fixed の包含ブロックになり、viewport ではなく枠いっぱいに広がる。
 */
export function ModalStageFrame({
  children,
  label,
  theme,
}: {
  children: ReactNode
  label: string
  theme: ThemeName
}) {
  const { scheme } = useThemeState()

  return (
    <div
      data-testid="modal-stage"
      {...{ [THEME_ATTR]: theme }}
      {...(scheme === null ? {} : { [SCHEME_ATTR]: scheme })}
      role="img"
      aria-label={label}
      className="relative h-[18rem] overflow-hidden border border-site-border bg-[var(--novi-color-bg)] text-[var(--novi-color-fg)] [contain:paint] sm:h-[20rem]"
    >
      {children}
    </div>
  )
}
