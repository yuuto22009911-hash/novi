'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { THEME_NAMES, themeRegistry } from '../lib/theme-registry'
import { useThemeState } from '../lib/use-novi-theme'

/**
 * ナビの項目。`match` の接頭辞に一致するページで現在地として光る。
 *
 * リンク先そのものより広く取る:「コンポーネント」は Button ページへ飛ぶが、
 * どのコンポーネントのページにいても現在地はコンポーネントの節にいる。
 * /docs/themes/*（デザイン言語）も「テーマの調整」の節として扱う。
 *
 * `apart` はライブラリの使い方（前3項目）から半歩離して置く印。
 * Lookbook は機能の説明ではなく、色の見本帳という性格の違う節なので、
 * 並びの間隔（16px）を1段広げて（32px）区分を余白で示す。
 */
const NAV_LINKS: readonly {
  href: string
  label: string
  match: readonly string[]
  apart?: boolean
}[] = [
  { href: '/docs/getting-started/', label: 'はじめに', match: ['/docs/getting-started'] },
  { href: '/docs/components/button/', label: 'コンポーネント', match: ['/docs/components'] },
  { href: '/docs/theming/', label: 'テーマの調整', match: ['/docs/theming', '/docs/themes'] },
  { href: '/docs/lookbook/', label: 'Lookbook', match: ['/docs/lookbook'], apart: true },
]

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
  const pathname = usePathname()

  /** 現在地か。末尾スラッシュの揺れを吸収するため接頭辞で見る。 */
  const isCurrent = (prefixes: readonly string[]) =>
    prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))

  return (
    <header className="border-b border-site-border">
      <div className="site-container flex flex-wrap items-center justify-between gap-x-6 gap-y-0 py-2 sm:h-16 sm:flex-nowrap sm:py-0">
        <Link href="/" className="flex h-12 items-center font-medium tracking-tight sm:h-auto">
          Novi UI
        </Link>

        {/* 4項目は 375px の1行に収まらない。ページ全体を横に広げず、
            ナビ自身をスクロール領域にする（切れて見える文字がスクロールの手がかりになる） */}
        <nav className="order-last flex w-full items-center gap-x-4 overflow-x-auto text-sm sm:order-none sm:w-auto sm:overflow-visible">
          {NAV_LINKS.map(({ href, label, match, apart }) => {
            const current = isCurrent(match)
            return (
              <Link
                key={href}
                href={href}
                aria-current={current ? 'page' : undefined}
                className={[
                  'flex h-12 items-center whitespace-nowrap sm:h-auto',
                  // gap-x-4（16px）に足して 32px。節の性格の違いを余白で示す
                  apart ? 'ml-4' : '',
                  // 現在地は fg（ダークでは白、ライトでは黒）。色弱でも追えるよう下線も足す
                  current
                    ? 'text-site-fg underline decoration-1 underline-offset-[6px]'
                    : 'text-site-muted hover:text-site-fg',
                ].join(' ')}
              >
                {label}
              </Link>
            )
          })}
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
