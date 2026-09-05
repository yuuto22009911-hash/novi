'use client'

import { DEMO_RENDERERS } from '../demos'
import { EXAMPLE_RENDERERS } from '../demos/examples'
import { DEMO_EXTRAS } from '../demos/extras'
import { findDemoMeta } from '../demos/meta'
import { CodeExample } from './code-example'
import { Preview } from './preview'

/**
 * ライブデモとコード例の組。主デモの下に「例」を続ける。
 *
 * テーマを切り替えると Preview の中身は変わるが、
 * コード例は import 文の1行以外まったく変わらない。
 */
export default function ComponentDemoBody({ slug }: { slug: string }) {
  const meta = findDemoMeta(slug)
  const render = DEMO_RENDERERS[slug]
  if (meta === undefined || render === undefined) return null

  const examples = DEMO_EXTRAS[meta.component]?.examples ?? []
  const renderers = EXAMPLE_RENDERERS[slug] ?? {}

  return (
    <>
      <Preview>{render()}</Preview>
      <CodeExample code={meta.code} imports={meta.imports} />

      {examples.length > 0 && (
        <section className="mt-[var(--novi-gap-section)] flex flex-col gap-8">
          <h2 className="text-xl font-medium tracking-tight">例</h2>
          {examples.map((example) => {
            const renderExample = renderers[example.id]
            if (renderExample === undefined) return null
            return (
              <div key={example.id} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <h3 className="font-medium">{example.title}</h3>
                  {example.note !== undefined && (
                    <p className="max-w-[40rem] text-sm leading-[1.7] text-site-muted">
                      {example.note}
                    </p>
                  )}
                </div>
                <Preview testId="example">{renderExample()}</Preview>
                <CodeExample code={example.code} imports={example.imports ?? meta.imports} />
              </div>
            )
          })}
        </section>
      )}
    </>
  )
}
