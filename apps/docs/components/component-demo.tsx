'use client'

import dynamic from 'next/dynamic'

/**
 * デモの遅延読み込み（T-38）。
 *
 * デモ本体はライブラリ全体（raster + react-aria-components、約 350KB）を引き込む。
 * 静的エクスポートなので HTML は先に描画済みで、この分割によって
 * ページ外殻（ナビ・本文・テーマ切替）が先にハイドレートし、デモが後から追いつく。
 *
 * `loading` はデモとおおよそ同じ高さを占める。無いと読み込み完了時にレイアウトが動く（CLS）。
 */
const ComponentDemoBody = dynamic(() => import('./component-demo-body'), {
  loading: () => (
    <div
      aria-hidden="true"
      className="h-64 animate-pulse border border-site-border bg-site-subtle"
    />
  ),
})

export function ComponentDemo({ slug }: { slug: string }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="sr-only">デモ</h2>
      <ComponentDemoBody slug={slug} />
    </section>
  )
}
