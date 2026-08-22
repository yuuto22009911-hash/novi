import type { Metadata } from 'next'
import { ImeProbe } from '../../components/ime-probe'

/**
 * IME の抑制を検査するための計測ページ（core T-18 / raster T-39）。
 *
 * コンポーネントのデモは `onKeyDown` を渡していないため、
 * 「変換中の Enter がハンドラに届いたか」を外から観測できない。
 * ここだけは意図的にハンドラを渡し、届いた回数を DOM に出す。
 *
 * 利用者向けの内容は無いので検索避けする。ナビからも辿れない。
 */
export const metadata: Metadata = {
  title: 'IME 計測',
  robots: { index: false, follow: false },
}

export default function ImeProbePage() {
  return (
    <article className="flex max-w-3xl flex-col gap-4">
      <h1 className="text-2xl font-medium tracking-tight">IME 計測</h1>
      <p className="text-sm leading-relaxed text-site-muted">
        変換確定の Enter がキーハンドラに届かないことを検査するためのページです。
        ドキュメントではありません。
      </p>
      <ImeProbe />
    </article>
  )
}
