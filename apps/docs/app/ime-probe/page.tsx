import type { Metadata } from 'next'
import { ImeProbe } from '../../components/ime-probe'

/**
 * IME の抑制を検査するための計測ページ（core T-18 / raster T-39）。
 *
 * コンポーネントのデモは `onKeyDown` を渡していないため、
 * 「変換中の Enter がハンドラに届いたか」を外から観測できない。
 * ここだけは意図的にハンドラを渡し、届いた回数を DOM に出す。
 *
 * 手順をページに書いてあるのは、**実機確認が環境ごとに人手で必要**だから。
 * 最初にこれを試したとき、日本語入力が英字モードのままで
 * 「にほんご」に変換されず、検証そのものが成立しなかった。
 * 手順が無いと、次に iOS や Windows で確認する人が同じところで詰まる。
 *
 * 利用者向けの内容は無いので検索避けする。ナビからも辿れない。
 */
export const metadata: Metadata = {
  title: 'IME 計測',
  robots: { index: false, follow: false },
}

export default function ImeProbePage() {
  return (
    <article className="flex max-w-3xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-medium tracking-tight">IME 計測</h1>
        <p className="text-sm leading-relaxed text-site-muted">
          変換確定の Enter がキーハンドラに届かないことを、実機で確かめるためのページです。
          ドキュメントではありません。
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium tracking-tight">手順</h2>

        <div className="border border-site-border bg-site-subtle p-4">
          <p className="text-sm leading-relaxed">
            <strong className="font-medium">先に日本語入力を ON にしてください。</strong>{' '}
            英字モードのままだと変換が起きず、検証が成立しません。
          </p>
          <ul className="flex list-disc flex-col gap-1 pt-2 pl-5 text-sm leading-relaxed text-site-muted">
            <li>
              macOS: メニューバーが <code className="font-mono text-xs">A</code> なら英字、
              <code className="font-mono text-xs">あ</code> ならひらがな。
              <code className="font-mono text-xs">Control</code> +{' '}
              <code className="font-mono text-xs">Space</code> か{' '}
              <code className="font-mono text-xs">かな</code> キーで切り替わります
            </li>
            <li>iOS: キーボードの地球儀アイコンで「日本語かな」または「日本語ローマ字」にします</li>
            <li>Windows: 半角/全角キーで切り替え、IME が「あ」になっていることを確認します</li>
          </ul>
        </div>

        <ol className="flex list-decimal flex-col gap-2 pl-5 text-sm leading-relaxed">
          <li>
            下の入力欄に <code className="font-mono text-xs">nihongo</code> と打ち、
            <strong className="font-medium">「にほんご」</strong>
            と下線付きで表示された状態にする
          </li>
          <li>
            <strong className="font-medium">Enter で変換を確定する</strong> → カウンタが{' '}
            <strong className="font-medium">0 のまま</strong>なら成功
          </li>
          <li>
            もう一度 <strong className="font-medium">Enter</strong> → カウンタが{' '}
            <strong className="font-medium">1</strong> になれば成功
          </li>
        </ol>

        <p className="text-sm leading-relaxed text-site-muted">
          2 でカウンタが増えたら、変換確定の Enter が送信として暴発しています。 3
          で増えなければ、抑制しすぎて通常の Enter まで殺しています。どちらも不具合です。
        </p>
      </section>

      <ImeProbe />
    </article>
  )
}
