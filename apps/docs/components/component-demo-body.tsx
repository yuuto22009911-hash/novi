'use client'

import { DEMO_RENDERERS } from '../demos'
import { findDemoMeta } from '../demos/meta'
import { CodeExample } from './code-example'
import { Preview } from './preview'

/**
 * ライブデモとコード例の組。
 *
 * テーマを切り替えると Preview の中身は変わるが、
 * コード例は import 文の1行以外まったく変わらない。
 */
export default function ComponentDemoBody({ slug }: { slug: string }) {
  const meta = findDemoMeta(slug)
  const render = DEMO_RENDERERS[slug]
  if (meta === undefined || render === undefined) return null

  return (
    <>
      <Preview>{render()}</Preview>
      <CodeExample code={meta.code} imports={meta.imports} />
    </>
  )
}
