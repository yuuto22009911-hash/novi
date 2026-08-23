import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { SiteHeader } from '../components/site-header'
import { DEFAULT_THEME, SCHEME_ATTR, STORAGE_KEY, THEME_ATTR } from '../lib/theme-registry'
import { NoviThemeProvider } from '../lib/use-novi-theme'
import './globals.css'

/**
 * Cloudflare Web Analytics の beacon トークン。
 *
 * HTML に埋め込まれ訪問者全員がソースで読める**公開値**なので、
 * 環境変数ではなくここに直接置く。秘匿しても意味がなく、
 * 環境変数にすると静的エクスポート時のビルド設定が増えるだけになる。
 */
const CF_ANALYTICS_TOKEN = '762917d92dd946a9a6e06c77d40e314f'

// ノッチのある端末で左右に白帯を作らない。safe-area は site-container の余白が吸収する
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

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
          <main className="site-container site-main">{children}</main>
        </NoviThemeProvider>

        {/*
          Cloudflare Web Analytics。Cookie を使わないため同意バナーが不要で、
          プライバシー方針とも整合する（ADR-D4）。
          token は HTML に埋め込む公開値であり秘匿情報ではない。

          next/script は使わない。静的エクスポートではハイドレーション後に
          クライアント側から注入される形になり、HTML に実タグが残らないため、
          JS が動かない環境で計測が落ちる。Cloudflare の案内どおり素のタグを置く。
          defer で読み込むので LCP には影響しない。
        */}
        <script
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon={`{"token": "${CF_ANALYTICS_TOKEN}"}`}
        />
      </body>
    </html>
  )
}
