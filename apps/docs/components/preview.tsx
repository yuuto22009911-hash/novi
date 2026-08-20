'use client'

import type { ReactNode } from 'react'
import { SCHEME_ATTR, THEME_ATTR } from '../lib/theme-registry'
import { useThemeState } from '../lib/use-novi-theme'

/**
 * デモを囲む枠。**テーマのトークンはこの中だけに効く**（ADR-D1 / FR-07）。
 *
 * 各テーマは `<theme>.scoped.css` を出力しており、
 * `[data-novi-theme='<name>']` の配下でのみトークンが定義される。
 * これがないとサイト UI までテーマ色に染まる。
 */
export function Preview({ children, className }: { children: ReactNode; className?: string }) {
  const { theme, scheme } = useThemeState()

  return (
    <div
      data-testid="preview"
      {...{ [THEME_ATTR]: theme }}
      {...(scheme === null ? {} : { [SCHEME_ATTR]: scheme })}
      className={[
        'rounded-none border border-site-border bg-[var(--novi-color-bg)] p-6',
        'flex flex-wrap items-start gap-4',
        className ?? '',
      ].join(' ')}
    >
      {children}
    </div>
  )
}
