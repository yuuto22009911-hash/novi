'use client'

import Link from 'next/link'
import { THEME_NAMES, themeRegistry } from '../lib/theme-registry'
import { useThemeState } from '../lib/use-novi-theme'

/**
 * サイトの外枠。**テーマの影響を受けない**（ADR-D1）。
 *
 * ここまでテーマに追従させると、切り替えるたびに画面全体が変わり、
 * 何を比較しているのか分からなくなる。
 */
export function SiteHeader() {
  const { theme, scheme, setTheme, setScheme } = useThemeState()

  return (
    <header className="border-b border-site-border">
      <div className="site-container flex h-14 items-center justify-between gap-6">
        <Link href="/" className="font-medium tracking-tight">
          Novi UI
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/docs/getting-started/" className="text-site-muted hover:text-site-fg">
            はじめに
          </Link>
          <Link href="/docs/components/button/" className="text-site-muted hover:text-site-fg">
            コンポーネント
          </Link>
          <Link href="/docs/theming/" className="text-site-muted hover:text-site-fg">
            テーマの調整
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="theme-select">
            テーマ
          </label>
          <select
            id="theme-select"
            value={theme}
            onChange={(e) => setTheme(e.target.value as typeof theme)}
            className="h-8 rounded-none border border-site-border bg-site-bg px-2 text-sm"
          >
            {THEME_NAMES.map((name) => (
              <option key={name} value={name}>
                {themeRegistry[name].label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setScheme(scheme === 'dark' ? 'light' : 'dark')}
            aria-pressed={scheme === 'dark'}
            className="h-8 rounded-none border border-site-border px-2 text-sm"
          >
            {scheme === 'dark' ? 'ライト' : 'ダーク'}
          </button>
        </div>
      </div>
    </header>
  )
}
