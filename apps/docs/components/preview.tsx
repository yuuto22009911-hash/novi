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
export function Preview({
  bare = false,
  children,
  className,
  color,
  testId = 'preview',
  theme,
}: {
  /**
   * `data-testid`。既定の `preview` は**ページに 1 つ**にする。
   * 視覚回帰と e2e が `[data-testid="preview"]` を主デモとして厳密に引くため、
   * 追加の例は `example` を渡して区別する。
   */
  testId?: string
  /**
   * 外枠と内側の余白を外す。
   *
   * 中身自体が面を持つ（Card など）ときに枠を重ねると
   * 「箱の中の箱」になり、テーマが設計した余白が読めなくなる。
   */
  bare?: boolean
  children: ReactNode
  className?: string
  /**
   * カラーセットの色 id（`ink` / `indigo` など）。
   *
   * **テーマ宣言と同じ要素に置く必要がある**（06 Phase A の申し送り）。
   * `data-novi-theme` が入れ子になっていると内側が既定色を宣言し直し、
   * 外側の色指定はそこで止まる。
   */
  color?: string
  /**
   * テーマを固定する。既定はヘッダーの選択に追従する。
   *
   * 特定のテーマの値を根拠として見せる場所（テーマ紹介ページの色見本）でだけ使う。
   * 追従させると、別のテーマを選んでいる読者には本文と食い違う色が出る。
   */
  theme?: string
}) {
  const { theme: selected, scheme } = useThemeState()

  return (
    <div
      data-testid={testId}
      {...{ [THEME_ATTR]: theme ?? selected }}
      {...(scheme === null ? {} : { [SCHEME_ATTR]: scheme })}
      {...(color === undefined ? {} : { 'data-novi-color': color })}
      className={[
        'bg-[var(--novi-color-bg)]',
        bare ? '' : 'rounded-none border border-site-border p-6',
        'flex flex-wrap items-start gap-4',
        className ?? '',
      ].join(' ')}
    >
      {children}
    </div>
  )
}
