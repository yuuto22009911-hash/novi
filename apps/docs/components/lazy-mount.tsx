'use client'

import { type ReactNode, useEffect, useRef, useState } from 'react'

/**
 * 近づくまで中身を組み立てない。
 *
 * ホームはデモを3つ持ち、すべてを初回に hydration するとメインスレッドが詰まり、
 * ファーストビューの文章（LCP 要素）の描画まで待たされる。スクロールしないと
 * 見えない節は、見える直前まで遅らせてよい。
 *
 * `placeholderClassName` には**実測した**高さを入れる。目分量だと、到達したときに
 * 下の節が飛び跳ねる。
 */
export function LazyMount({
  children,
  className,
  placeholderClassName,
}: {
  children: ReactNode
  className?: string
  placeholderClassName: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (el === null) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setIsVisible(true)
      },
      // 見えてから組み立てると間に合わないので、少し手前で始める
      { rootMargin: '300px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={isVisible ? className : placeholderClassName}>
      {isVisible ? children : null}
    </div>
  )
}
