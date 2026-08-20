import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { SiteHeader } from '../components/site-header'
import { DEFAULT_THEME, SCHEME_ATTR, STORAGE_KEY, THEME_ATTR } from '../lib/theme-registry'
import { NoviThemeProvider } from '../lib/use-novi-theme'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'Novi UI', template: '%s — Novi UI' },
  description: '1つの core に、複数の美学。AI に書かせても崩れない React UI ライブラリ。',
}

/**
 * ハイドレーション前に属性を確定させる。
 *
 * React の状態でテーマを持つと、ハイドレーション完了まで既定値が表示されてちらつく。
 * 属性さえ先に付いていれば CSS だけで見た目が決まる（ADR-D3）。
 * Provider を持たない設計（ADR-04）の恩恵がここで効いている。
 */
const initScript = `
try {
  var d = document.documentElement;
  d.setAttribute('${THEME_ATTR}', localStorage.getItem('${STORAGE_KEY.theme}') || '${DEFAULT_THEME}');
  var s = localStorage.getItem('${STORAGE_KEY.scheme}');
  if (s) d.setAttribute('${SCHEME_ATTR}', s);
} catch (e) {}
`.trim()

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: ちらつき防止に同期実行が必要 */}
        <script dangerouslySetInnerHTML={{ __html: initScript }} />
      </head>
      <body>
        <NoviThemeProvider>
          <SiteHeader />
          <main className="site-container py-10">{children}</main>
        </NoviThemeProvider>
      </body>
    </html>
  )
}
