import type { NextConfig } from 'next'

const config: NextConfig = {
  // 完全な静的エクスポート。ホスト固有のランタイム機能に依存しないため
  // Cloudflare Pages にそのまま置ける（ADR-D4）
  output: 'export',
  images: { unoptimized: true },
  // 静的ホスティングで /docs/button のようなパスをそのまま解決させる
  trailingSlash: true,
  typedRoutes: false,
}

export default config
