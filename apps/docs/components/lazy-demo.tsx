'use client'

import { type ComponentType, useEffect, useRef, useState } from 'react'

/**
 * 近づくまで**コードごと**読み込まないデモ。
 *
 * `next/dynamic` をサーバーコンポーネント（page.tsx）から使うと、描画していなくても
 * そのチャンクが初回の `<script>` に並ぶ。ホームでは3テーマ分のライブラリと
 * react-aria（生で 700KB 超）が最初から読み込まれ、Lighthouse の LCP 推定に
 * まるごと積まれていた。`import()` をクライアント側の effect に置けば、
 * チャンクは見えるまで要求されない。
 *
 * `placeholderClassName` には**実測した**高さを入れる。目分量だと、到達したときに
 * 下の節が飛び跳ねる（CLS）。
 */
const LOADERS = {
  hero: () => import('./hero-preview').then((m) => m.HeroPreview),
  triptych: () => import('./theme-triptych').then((m) => m.ThemeTriptych),
  dashboard: () => import('./dashboard-showcase').then((m) => m.DashboardShowcase),
} satisfies Record<string, () => Promise<ComponentType>>

export type DemoName = keyof typeof LOADERS

export function LazyDemo({
  className,
  name,
  placeholderClassName,
}: {
  className?: string
  name: DemoName
  placeholderClassName: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [Demo, setDemo] = useState<ComponentType | null>(null)

  useEffect(() => {
    const el = ref.current
    if (el === null) return

    let alive = true
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        observer.disconnect()
        LOADERS[name]().then((component) => {
          if (alive) setDemo(() => component)
        })
      },
      // 見えてから読み始めると間に合わないので、少し手前で始める
      { rootMargin: '300px' },
    )
    observer.observe(el)
    return () => {
      alive = false
      observer.disconnect()
    }
  }, [name])

  return (
    <div ref={ref} className={Demo === null ? placeholderClassName : className}>
      {Demo === null ? null : <Demo />}
    </div>
  )
}
