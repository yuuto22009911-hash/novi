'use client'

import { useState } from 'react'
import { themeRegistry } from '../lib/theme-registry'
import { useThemeState } from '../lib/use-novi-theme'

/**
 * コード例。**切り替えで変わるのは import 文のパッケージ名だけ**（FR-04 / AC-02-2）。
 *
 * これ自体がドキュメントの主張になっている。
 * 「テーマを替えても書くコードは同じ」を、言葉ではなく表示で示す。
 */
export function CodeExample({ code, imports }: { code: string; imports: string[] }) {
  const { theme } = useThemeState()
  const [copied, setCopied] = useState(false)
  const pkg = themeRegistry[theme].pkg

  const full = `import { ${imports.join(', ')} } from '${pkg}'\n\n${code.trim()}\n`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(full)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // クリップボードが使えない環境では黙って何もしない
    }
  }

  return (
    <div className="relative">
      {/*
        横スクロールする領域はキーボードでも読めなければならない（WCAG 2.1.1）。
        role="region" を手で付けるより、意味を持つ要素で包む方が正しい。
        section + aria-label なら暗黙のロールが region になる。
      */}
      <section
        aria-label="コード例"
        // biome-ignore lint/a11y/noNoninteractiveTabindex: スクロール領域は WCAG 2.1.1 によりキーボードで読めるようにする必要がある
        tabIndex={0}
        className="overflow-x-auto border border-site-border bg-site-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-site-accent"
      >
        <pre className="p-4 text-xs leading-relaxed">
          <code data-testid="code-example">{full}</code>
        </pre>
      </section>
      <button
        type="button"
        onClick={copy}
        className="absolute top-2 right-2 border border-site-border bg-site-bg px-2 py-1 text-xs"
      >
        {copied ? 'コピーしました' : 'コピー'}
      </button>
    </div>
  )
}
