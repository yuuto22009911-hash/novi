import type { Metadata } from 'next'
import Link from 'next/link'
import { Preview } from '../../../../components/preview'
import {
  getTheme,
  NumericRules,
  ProhibitedRules,
  TokenTable,
} from '../../../../components/token-tables'

export const metadata: Metadata = { title: 'Raster のデザイン言語' }

export default function RasterPage() {
  const raster = getTheme('raster')

  return (
    <article className="flex max-w-3xl flex-col gap-[clamp(2rem,5vw,3rem)]">
      <header className="mb-[clamp(1rem,4vw,3rem)] flex flex-col gap-2">
        <h1 className="text-3xl font-medium tracking-tight">{raster.label}</h1>
        <p className="max-w-[40rem] text-base leading-[1.6] text-site-muted">
          {raster.description}。面は平らに保ち、余白と 1px の線と明度差で階層を作ります。
          角丸は控えめな3段だけ、影は浮いている層だけ。
          ごまかしの道具を最小限に絞ってあるぶん、余白と整列の精度がそのまま出ます。
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium tracking-tight">すべて数値で決まっています</h2>
        <p className="max-w-[40rem] text-base leading-[1.9] text-site-muted">
          「ミニマル」を感覚で運用すると必ずブレます。目分量で近い値を書かず、この値を使ってください。
        </p>
        <NumericRules theme="raster" />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium tracking-tight">角丸は3段だけ</h2>
        <p className="max-w-[40rem] text-base leading-[1.9] text-site-muted">
          小さな部品は <code className="font-mono text-[0.875em]">sm</code>、ボタンや入力は{' '}
          <code className="font-mono text-[0.875em]">md</code>、メニューやダイアログなど浮く面は{' '}
          <code className="font-mono text-[0.875em]">lg</code> が既定です。
          これ以上丸くすると「丸い」が主張になり、ミニマルの範囲を出ます（ADR-R8）。
        </p>
        <TokenTable theme="raster" group="radius" />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium tracking-tight">影は浮いている層だけ</h2>
        <p className="max-w-[40rem] text-base leading-[1.9] text-site-muted">
          カードや入力といった<strong className="font-medium text-site-fg">面は平ら</strong>
          なままで、境界線と背景色の差で階層を作ります。 影を持つのはメニュー・ポップオーバー・
          ダイアログ・トーストといった
          <strong className="font-medium text-site-fg">浮いている層</strong>
          だけです。低い不透明度の柔らかい影が「浮いている」という事実だけを伝え、
          装飾としては働きません。
        </p>
        <TokenTable theme="raster" group="shadow" />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium tracking-tight">色は明度だけで階層を作ります</h2>
        <p className="max-w-[40rem] text-base leading-[1.9] text-site-muted">
          中立色は彩度を持ちません。面と文字の階層は明るさの差だけで作ります。
          彩度を持つのは意味のある色（primary / success / warning / danger）だけです。
        </p>
        {/* 規則そのものは検査スクリプトと共有している定義。引用として出す */}
        <blockquote className="border-l-2 border-site-border pl-6 max-w-[40rem] text-base leading-[1.6] text-site-muted">
          {raster.designRules.colorRule}
        </blockquote>
        <Preview>
          <div className="flex w-full flex-col gap-2">
            {['bg', 'subtle', 'border', 'muted', 'fg'].map((name) => (
              <div key={name} className="flex items-center gap-3">
                <span
                  style={{ background: `var(--novi-color-${name})` }}
                  className="h-6 w-24 border border-[var(--novi-color-border)]"
                />
                <code className="font-mono text-xs text-[var(--novi-color-muted)]">{name}</code>
              </div>
            ))}
          </div>
        </Preview>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium tracking-tight">書いてはいけないクラス</h2>
        <p className="max-w-[40rem] text-base leading-[1.9] text-site-muted">
          テーマを触る場合の規律です。CI が機械的に検査しているため、違反するとビルドが落ちます。
          この一覧は検査スクリプトと同じ定義から作られています。
        </p>
        <ProhibitedRules theme="raster" />
        {raster.designRules.exceptions.length > 0 && (
          <>
            <h3 className="pt-8 text-lg font-medium tracking-tight">例外</h3>
            <ul className="flex max-w-[40rem] flex-col gap-4 text-base leading-[1.6] text-site-muted">
              {raster.designRules.exceptions.map((exception) => (
                <li key={exception.file}>
                  <code className="font-mono text-[0.875em]">{exception.file}</code> は{' '}
                  <code className="font-mono text-[0.875em]">{exception.rules.join(', ')}</code>{' '}
                  のみ許可 — {exception.reason}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium tracking-tight">動きで飾りません</h2>
        <p className="max-w-[40rem] text-base leading-[1.9] text-site-muted">
          モーションは opacity と translate だけです。拡大・回転は使いません（Spinner
          の回転だけが例外です）。 速度は1つに固定してあり、
          <code className="font-mono text-[0.875em]">prefers-reduced-motion</code>{' '}
          が有効なときはアニメーションを行いません。
        </p>
        <TokenTable theme="raster" group="motion" />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium tracking-tight">値を変えたいとき</h2>
        <p className="max-w-[40rem] text-base leading-[1.9] text-site-muted">
          ここにある値はすべて CSS 変数です。上書きの方法は{' '}
          <Link href="/docs/theming/" className="underline">
            テーマの調整
          </Link>
          にあります。
        </p>
      </section>
    </article>
  )
}
