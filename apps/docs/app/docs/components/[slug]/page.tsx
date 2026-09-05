import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getComponent, PropsTable, SlotTable } from '../../../../components/api-tables'
import { ComponentDemo } from '../../../../components/component-demo'
import { DEMO_EXTRAS } from '../../../../demos/extras'
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

  const { a11y, keyboard } = getComponent(demo.component)
  const extras = DEMO_EXTRAS[demo.component]

  return (
    <div className="flex gap-12">
      {/* 幅 168px + gap 48px = 216px。旧値（176 + 40）と合計が同じなので
          本文の実寸が動かず、視覚回帰の基準画像が無効にならない */}
      <nav aria-label="コンポーネント" className="hidden w-42 shrink-0 lg:block">
        <ul className="flex flex-col gap-2 text-sm">
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

      <article className="flex min-w-0 flex-1 flex-col gap-[clamp(2rem,5vw,3rem)]">
        {/* サイドバーが出ない幅では、これが唯一のコンポーネント間導線になる。
            JS 不要の details で畳んでおく（開閉状態はページ遷移ごとにリセットされてよい） */}
        <details className="border border-site-border lg:hidden">
          {/* 開閉の目印は details 標準の三角に任せる。隠すと開けることが伝わらない。
              display を変えると三角（::marker）が消えるため、余白だけで 48px を作る */}
          <summary className="cursor-pointer px-4 py-3.5 text-sm font-medium">
            コンポーネント一覧
          </summary>
          <nav aria-label="コンポーネント" className="border-t border-site-border px-4 py-2">
            <ul className="flex flex-wrap gap-x-6 text-sm">
              {DEMO_META.map((d) => {
                const s = d.title.toLowerCase()
                return (
                  <li key={s}>
                    <Link
                      href={`/docs/components/${s}/`}
                      aria-current={s === slug ? 'page' : undefined}
                      className={[
                        'flex h-12 items-center',
                        s === slug
                          ? 'font-medium text-site-fg'
                          : 'text-site-muted hover:text-site-fg',
                      ].join(' ')}
                    >
                      {d.title}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </details>

        <header className="mb-[clamp(0.5rem,2vw,1.5rem)] flex flex-col gap-2">
          <h1 className="text-3xl font-medium tracking-tight">{demo.title}</h1>
          <p className="max-w-[40rem] text-base leading-[1.6] text-site-muted">{demo.note}</p>
        </header>

        <ComponentDemo slug={slug} />

        {extras !== undefined && (
          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-medium tracking-tight">使い分け</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-2 border-t border-site-border pt-3">
                <h3 className="font-medium">こうする</h3>
                <ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-[1.7] text-site-muted">
                  {extras.dos.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-2 border-t border-site-border pt-3">
                <h3 className="font-medium">こうしない</h3>
                <ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-[1.7] text-site-muted">
                  {extras.donts.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* 折り返し以下の表はスクロールされるまで描画を省く（T-38）。
            contain-intrinsic-size が概算の高さを確保し、スクロールバーの飛びを防ぐ */}
        <section className="flex flex-col gap-4 [contain-intrinsic-size:auto_600px] [content-visibility:auto]">
          <h2 className="text-xl font-medium tracking-tight">Props</h2>
          <PropsTable name={demo.component} />
        </section>

        <section className="flex flex-col gap-4 [contain-intrinsic-size:auto_200px] [content-visibility:auto]">
          <h2 className="text-xl font-medium tracking-tight">Slot</h2>
          <p className="max-w-[40rem] text-base leading-[1.9] text-site-muted">
            構成部位に <code className="font-mono text-[0.875em]">data-slot</code> が出力されます。
            CSS の上書きやテストはこれを狙ってください。
          </p>
          <SlotTable name={demo.component} />
        </section>

        <section className="flex flex-col gap-4 [contain-intrinsic-size:auto_200px] [content-visibility:auto]">
          <h2 className="text-xl font-medium tracking-tight">アクセシビリティ</h2>
          {keyboard.length > 0 && (
            <table className="w-full max-w-[40rem] border-collapse text-sm">
              <caption className="sr-only">キーボード操作</caption>
              <thead>
                <tr className="border-b border-site-border text-left text-site-muted">
                  <th className="w-[14rem] py-2 pr-4 font-normal">キー</th>
                  <th className="py-2 font-normal">動作</th>
                </tr>
              </thead>
              <tbody>
                {keyboard.map((k) => (
                  <tr key={k.keys} className="border-b border-site-border align-top">
                    <td className="py-2 pr-4 font-mono text-[0.875em] text-site-fg">{k.keys}</td>
                    <td className="py-2 text-site-muted">{k.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <ul className="flex list-disc flex-col gap-2 pl-6 max-w-[40rem] text-base leading-[1.6] text-site-muted">
            {/* 契約の @a11y をそのまま出す。ページごとに書き直すとテーマや実装とズレる */}
            {a11y !== null && <li>{a11y}</li>}
            <li>キーボードだけで操作できます。フォーカスリングはコントラスト比 3:1 以上です。</li>
            <li>本文のコントラスト比は light / dark とも 4.5:1 以上を検査で保証しています。</li>
            <li>
              <code className="font-mono text-[0.875em]">prefers-reduced-motion</code>{' '}
              が有効なときはアニメーションを行いません。
            </li>
          </ul>
        </section>
      </article>
    </div>
  )
}
