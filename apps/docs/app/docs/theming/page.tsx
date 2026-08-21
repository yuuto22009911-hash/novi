import type { Metadata } from 'next'
import Link from 'next/link'
import { Code } from '../../../components/code-block'
import { ColorSwatches, getTheme, TokenTable } from '../../../components/token-tables'
import { readSample } from '../../../lib/read-sample'

export const metadata: Metadata = { title: 'テーマの調整' }

const BRAND = `/* app/globals.css */
@import '@novi-ui/core/base.css';
@import '@novi-ui/raster/raster.css';

:root {
  --novi-color-primary: oklch(58% 0.18 265);
  --novi-color-primary-fg: oklch(99% 0 0);
}

[data-novi-scheme='dark'] {
  --novi-color-primary: oklch(72% 0.15 265);
}`

const INSTALL_TV = 'pnpm add tailwind-variants'

export default function ThemingPage() {
  const raster = getTheme('raster')

  return (
    <article className="flex max-w-3xl flex-col gap-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-medium tracking-tight">テーマの調整</h1>
        <p className="text-sm leading-relaxed text-site-muted">
          変える手段は3つあります。上から順に試してください。下にいくほど強く、壊れやすくなります。
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium tracking-tight">1. CSS 変数を上書きする</h2>
        <p className="text-sm leading-relaxed text-site-muted">
          ブランド色を変えるならこれだけで済みます。
          <code className="font-mono text-xs"> --novi-color-primary</code>{' '}
          を使う全コンポーネントに一度に効きます。
        </p>
        <Code label="CSS 変数の上書き">{BRAND}</Code>
        <p className="text-sm leading-relaxed text-site-muted">
          色は <code className="font-mono text-xs">oklch()</code>{' '}
          で書いてください。明度を数値で扱えるため、
          ライトとダークで同じコントラスト比を保ったまま色相だけ差し替えられます。
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium tracking-tight">2. slot にクラスを足す</h2>
        <p className="text-sm leading-relaxed text-site-muted">
          1箇所だけ形を変えたいときは <code className="font-mono text-xs">classNames</code>{' '}
          を使います。 variant が付けたクラスを打ち消したいときも、拡張ではなくこちらが正解です。
        </p>
        <Code label="classNames による上書き">{readSample('classnames-override')}</Code>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium tracking-tight">3. styles を拡張する</h2>
        <p className="text-sm leading-relaxed text-site-muted">
          同じ見た目を何度も使うなら、派生した styles を1つ作ります。
          <code className="font-mono text-xs">tailwind-variants</code> が必要です。
        </p>
        <Code label="tailwind-variants のインストール">{INSTALL_TV}</Code>
        <Code label="styles の拡張">{readSample('extend-styles')}</Code>
        <p className="text-sm leading-relaxed text-site-muted">
          <strong className="font-medium text-site-fg">
            slot ベースの定義では <code className="font-mono text-xs">base</code> が効きません。
          </strong>{' '}
          <code className="font-mono text-xs">tv({'{ extend, base }'})</code>{' '}
          と書いても無視されるため、
          <code className="font-mono text-xs">slots</code> を使ってください。 また{' '}
          <code className="font-mono text-xs">extend</code> で足したクラスは base
          に加算されるだけなので、 variant のクラスには勝てません。勝たせたいときは 2 の{' '}
          <code className="font-mono text-xs">classNames</code> を使います。
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium tracking-tight">上書きできる変数</h2>
        <p className="text-sm leading-relaxed text-site-muted">
          {raster.label}（<code className="font-mono text-xs">{raster.pkg}</code>
          ）が定義する値です。 この表は CSS
          を出力しているのと同じ定義から作られているため、実装とズレません。
        </p>

        {raster.cssVariables.map((group) => (
          <section key={group.id} className="flex flex-col gap-2 pt-4">
            <h3 className="text-base font-medium tracking-tight">{group.label}</h3>
            <p className="text-sm leading-relaxed text-site-muted">{group.description}</p>
            {group.id === 'color' && <ColorSwatches theme="raster" />}
            <TokenTable theme="raster" group={group.id} />
          </section>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium tracking-tight">テーマには解釈の自由があります</h2>
        <p className="text-sm leading-relaxed text-site-muted">
          語彙は core が固定しますが、値の解釈はテーマが決めます。 たとえば {raster.label} の{' '}
          <code className="font-mono text-xs">radius</code> は sm=6px / md=8px / lg=12px
          の控えめな3段で、 これより丸くする語彙はありません。影も浮いている層にしか付きません。
          その範囲を超えた見た目が必要なときは、トークンの上書きではなくテーマを替えます。 詳しくは{' '}
          <Link href="/docs/themes/raster/" className="underline">
            {raster.label} のデザイン言語
          </Link>
          を読んでください。
        </p>
      </section>
    </article>
  )
}
