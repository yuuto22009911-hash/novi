'use client'

import type { BreadcrumbsProps } from '@novi-ui/core'
import { createContext, type ReactNode, useContext } from 'react'
import {
  Link,
  Breadcrumb as RACBreadcrumb,
  Breadcrumbs as RACBreadcrumbs,
} from 'react-aria-components'
import { breadcrumbsStyles } from './breadcrumbs.styles'

/**
 * 区切り文字を子へ渡す。
 *
 * 各項目が自分の前に区切りを描画し、先頭だけ CSS で隠す。
 * 親側で children を加工して区切りを差し込むと、
 * RAC が期待する `<ol> > <li>` の構造が壊れる。
 */
const SeparatorContext = createContext<ReactNode>('/')

export interface BreadcrumbProps {
  /** 省略すると現在地として扱い、リンクにしない */
  href?: string
  children?: ReactNode
  className?: string
}

/**
 * 階層の1段。`href` を省略した項目が現在地になる。
 *
 * @example
 * <Breadcrumb href="/docs">ドキュメント</Breadcrumb>
 */
export function Breadcrumb({ href, children, className }: BreadcrumbProps) {
  const s = breadcrumbsStyles()
  const separator = useContext(SeparatorContext)

  return (
    <RACBreadcrumb data-slot="item" className={s.item({ class: className })}>
      <span data-slot="separator" className={s.separator()} aria-hidden="true">
        {separator}
      </span>

      {href === undefined ? (
        // 現在地はリンクにしない。RAC は Link にしか aria-current を付けないので、
        // ここでは自分で付ける必要がある
        <span data-slot="current" aria-current="page" className={s.current()}>
          {children}
        </span>
      ) : (
        <Link href={href} data-slot="link" className={s.link()}>
          {children}
        </Link>
      )}
    </RACBreadcrumb>
  )
}

/**
 * 階層の中で現在どこにいるかを示す。
 *
 * 区切り文字は装飾なので支援技術には読ませない。
 * `href` を省いた項目が現在地になり、リンクにならない。
 *
 * @example
 * <Breadcrumbs>
 *   <Breadcrumb href="/">ホーム</Breadcrumb>
 *   <Breadcrumb href="/docs">ドキュメント</Breadcrumb>
 *   <Breadcrumb>Button</Breadcrumb>
 * </Breadcrumbs>
 */
export function Breadcrumbs({
  size,
  separator = '/',
  isDisabled,
  children,
  className,
  classNames,
  id,
}: BreadcrumbsProps) {
  const s = breadcrumbsStyles({ size })

  return (
    <SeparatorContext.Provider value={separator}>
      {/* nav でラップして現在地の階層であることを伝える */}
      <nav
        id={id}
        aria-label="パンくずリスト"
        data-slot="root"
        className={s.root({ class: [className, classNames?.root] })}
      >
        <RACBreadcrumbs
          isDisabled={isDisabled}
          data-slot="list"
          className={s.list({ class: classNames?.list })}
        >
          {children}
        </RACBreadcrumbs>
      </nav>
    </SeparatorContext.Provider>
  )
}
