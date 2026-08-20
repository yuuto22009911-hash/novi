'use client'

import Link from 'next/link'
import { THEME_NAMES, themeRegistry } from '../lib/theme-registry'
import { useThemeState } from '../lib/use-novi-theme'

/**
 * サイトの外枠。**テーマの影響を受けない**（ADR-D1）。
 *
 * ここまでテーマに追従させると、切り替えるたびに画面全体が変わり、
 * 何を比較しているのか分からなくなる。
 *
 * モバイルでは2段組（1段目: サイト名 + 操作、2段目: ナビ）。
 * 1行に押し込むとリンクが1文字ずつ縦に折れる。
 * タップターゲットは 48px を確保し、select の文字は 16px にする
 * （16px 未満だと iOS がフォーカス時に画面ごとズームする）。
 */
export function SiteHeader() {
  const { theme, scheme, setTheme, setScheme } = useThemeState()

  return (
    <header className="border-b border-site-border">
      <div className="site-container flex flex-wrap items-center justify-between gap-x-6 gap-y-0 py-2 sm:h-14 sm:flex-nowrap sm:py-0">
        <Link href="/" className="flex h-12 items-center font-medium tracking-tight sm:h-auto">
          Novi UI
        </Link>

        <nav className="order-last flex w-full items-center gap-x-5 text-sm sm:order-none sm:w-auto sm:gap-4">
          {(
            [
              ['/docs/getting-started/', 'はじめに'],
              ['/docs/components/button/', 'コンポーネント'],
              ['/docs/theming/', 'テーマの調整'],
            ] as const
          ).map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="flex h-12 items-center whitespace-nowrap text-site-muted hover:text-site-fg sm:h-auto"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="theme-select">
            テーマ
          </label>
          <select
            id="theme-select"
            value={theme}
            onChange={(e) => setTheme(e.target.value as typeof theme)}
            className="h-12 rounded-none border border-site-border bg-site-bg px-2 text-base sm:h-8 sm:text-sm"
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
            className="h-12 min-w-12 rounded-none border border-site-border px-3 text-base sm:h-8 sm:min-w-0 sm:px-2 sm:text-sm"
          >
            {scheme === 'dark' ? 'ライト' : 'ダーク'}
          </button>
        </div>
      </div>
    </header>
  )
}
