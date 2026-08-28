import type { Metadata } from 'next'
import { InflowProbe } from '../../components/inflow-probe'

/**
 * Flatlay のインフロー展開を実測するためのページ（flatlay T-14）。
 *
 * Flatlay は「開く = 場所を取る」を原理にしているので、押し下げが実際に起きるか
 * どうかがモデルの成否そのものになる。ところがそれはレイアウトの話なので、
 * jsdom では 1px も測れない。ここは e2e に**測れる形**を渡すためだけに在る。
 *
 * 利用者向けの内容は無いので検索避けする。ナビからも辿れない。
 */
export const metadata: Metadata = {
  title: 'Flatlay 計測',
  robots: { index: false, follow: false },
}

export default function FlatlayProbePage() {
  return (
    <article className="flex max-w-3xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-medium tracking-tight">Flatlay 計測</h1>
        <p className="text-sm leading-relaxed text-site-muted">
          選択肢を開いたときに後続が押し下がることを、実寸で確かめるためのページです。
          ドキュメントではありません。
        </p>
      </header>

      <InflowProbe />
    </article>
  )
}
