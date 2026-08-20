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
    <article className="flex max-w-3xl flex-col gap-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-medium tracking-tight">{raster.label}</h1>
        <p className="text-sm leading-relaxed text-site-muted">
          {raster.description}。角を立て、影を使わず、余白と 1px の線だけで階層を作ります。
          ごまかしが効かないぶん、余白と整列の精度がそのまま出ます。
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium tracking-tight">すべて数値で決まっています</h2>
        <p className="text-sm leading-relaxed text-site-muted">
          「ミニマル」を感覚で運用すると必ずブレます。目分量で近い値を書かず、この値を使ってください。
        </p>
        <NumericRules theme="raster" />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium tracking-tight">
          <code className="font-mono text-base">radius</code> は潰れます
        </h2>
        <p className="text-sm leading-relaxed text-site-muted">
          {raster.label} は <code className="font-mono text-xs">radius</code> の語彙を
          <strong className="font-medium text-site-fg">受け付けますが、見た目は変わりません</strong>
          。 <code className="font-mono text-xs">none</code> 以外はすべて 2px です（
          <code className="font-mono text-xs">full</code> だけは Avatar と Radio
          の円のために残しています）。
        </p>
        <TokenTable theme="raster" group="radius" />
        <p className="text-sm leading-relaxed text-site-muted">
          <strong className="font-medium text-site-fg">
            これは仕様であって不具合ではありません。
          </strong>{' '}
          語彙は core が固定し、解釈はテーマの自由にする、という設計の帰結です。
          そうしておくと、テーマを切り替えてもコードを1行も直さずに済みます。
          角丸を活かしたい場合は、{raster.label} ではなく別のテーマを選んでください。
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium tracking-tight">影は使いません</h2>
        <p className="text-sm leading-relaxed text-site-muted">
          浮かせる代わりに、境界線と背景色の差で階層を作ります。
          オーバーレイも影ではなく、背景の暗転と 1px の枠で「上にある」ことを示します。
        </p>
        <TokenTable theme="raster" group="shadow" />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium tracking-tight">色は明度だけで階層を作ります</h2>
        <p className="text-sm leading-relaxed text-site-muted">
          中立色は彩度を持ちません。面と文字の階層は明るさの差だけで作ります。
          彩度を持つのは意味のある色（primary / success / warning / danger）だけです。
        </p>
        {/* 規則そのものは検査スクリプトと共有している定義。引用として出す */}
        <blockquote className="border-l-2 border-site-border pl-4 text-sm leading-relaxed text-site-muted">
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

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium tracking-tight">書いてはいけないクラス</h2>
        <p className="text-sm leading-relaxed text-site-muted">
          テーマを触る場合の規律です。CI が機械的に検査しているため、違反するとビルドが落ちます。
          この一覧は検査スクリプトと同じ定義から作られています。
        </p>
        <ProhibitedRules theme="raster" />
        {raster.designRules.exceptions.length > 0 && (
          <>
            <h3 className="pt-2 text-base font-medium tracking-tight">例外</h3>
            <ul className="flex flex-col gap-2 text-sm leading-relaxed text-site-muted">
              {raster.designRules.exceptions.map((exception) => (
                <li key={exception.file}>
                  <code className="font-mono text-xs">{exception.file}</code> は{' '}
                  <code className="font-mono text-xs">{exception.rules.join(', ')}</code> のみ許可 —{' '}
                  {exception.reason}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium tracking-tight">動きで飾りません</h2>
        <p className="text-sm leading-relaxed text-site-muted">
          モーションは opacity と translate だけです。拡大・回転は使いません（Spinner
          の回転だけが例外です）。 速度は1つに固定してあり、
          <code className="font-mono text-xs">prefers-reduced-motion</code>{' '}
          が有効なときはアニメーションを行いません。
        </p>
        <TokenTable theme="raster" group="motion" />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium tracking-tight">値を変えたいとき</h2>
        <p className="text-sm leading-relaxed text-site-muted">
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
