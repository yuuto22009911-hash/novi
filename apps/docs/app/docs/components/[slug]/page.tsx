import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PropsTable, SlotTable } from '../../../../components/api-tables'
import { ComponentDemo } from '../../../../components/component-demo'
import { DEMO_META, DEMO_SLUGS, findDemoMeta } from '../../../../demos/meta'

export function generateStaticParams() {
  return DEMO_SLUGS.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const demo = findDemoMeta(slug)
  return { title: demo?.title ?? 'コンポーネント' }
}

/**
 * コンポーネントページ。全ページ同じ7ブロック構成。
 *
 * 1. 名前 / 2. ライブデモ / 3. コード例 / 4. props 表 / 5. slot 表
 * 6. アクセシビリティ注記 / 7. 使い分けの注意（唯一の手書き部分）
 */
export default async function ComponentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const demo = findDemoMeta(slug)
  if (demo === undefined) notFound()

  return (
    <div className="flex gap-10">
      <nav aria-label="コンポーネント" className="hidden w-44 shrink-0 lg:block">
        <ul className="flex flex-col gap-1 text-sm">
          {DEMO_META.map((d) => {
            const s = d.title.toLowerCase()
            return (
              <li key={s}>
                <Link
                  href={`/docs/components/${s}/`}
                  aria-current={s === slug ? 'page' : undefined}
                  className={
                    s === slug ? 'font-medium text-site-fg' : 'text-site-muted hover:text-site-fg'
                  }
                >
                  {d.title}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <article className="flex min-w-0 flex-1 flex-col gap-10">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-medium tracking-tight">{demo.title}</h1>
          <p className="text-sm leading-relaxed text-site-muted">{demo.note}</p>
        </header>

        <ComponentDemo slug={slug} />

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-medium tracking-tight">Props</h2>
          <PropsTable name={demo.component} />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-medium tracking-tight">Slot</h2>
          <p className="text-sm text-site-muted">
            構成部位に <code className="font-mono text-xs">data-slot</code> が出力されます。 CSS
            の上書きやテストはこれを狙ってください。
          </p>
          <SlotTable name={demo.component} />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-medium tracking-tight">アクセシビリティ</h2>
          <ul className="flex list-disc flex-col gap-1 pl-5 text-sm leading-relaxed text-site-muted">
            <li>キーボードだけで操作できます。フォーカスリングはコントラスト比 3:1 以上です。</li>
            <li>本文のコントラスト比は light / dark とも 4.5:1 以上を検査で保証しています。</li>
            <li>
              <code className="font-mono text-xs">prefers-reduced-motion</code>{' '}
              が有効なときはアニメーションを行いません。
            </li>
          </ul>
        </section>
      </article>
    </div>
  )
}
