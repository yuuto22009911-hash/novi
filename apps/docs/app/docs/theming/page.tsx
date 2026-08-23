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
    <article className="flex max-w-3xl flex-col gap-[clamp(2rem,5vw,3rem)]">
      <header className="mb-[clamp(1rem,4vw,3rem)] flex flex-col gap-2">
        <h1 className="text-3xl font-medium tracking-tight">テーマの調整</h1>
        <p className="max-w-[40rem] text-base leading-[1.6] text-site-muted">
          変える手段は3つあります。上から順に試してください。下にいくほど強く、壊れやすくなります。
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium tracking-tight">1. CSS 変数を上書きする</h2>
        <p className="max-w-[40rem] text-base leading-[1.9] text-site-muted">
          ブランド色を変えるならこれだけで済みます。
          <code className="font-mono text-[0.875em]"> --novi-color-primary</code>{' '}
          を使う全コンポーネントに一度に効きます。
        </p>
        <Code label="CSS 変数の上書き">{BRAND}</Code>
        <p className="max-w-[40rem] text-base leading-[1.9] text-site-muted">
          色は <code className="font-mono text-[0.875em]">oklch()</code>{' '}
          で書いてください。明度を数値で扱えるため、
          ライトとダークで同じコントラスト比を保ったまま色相だけ差し替えられます。
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium tracking-tight">2. slot にクラスを足す</h2>
        <p className="max-w-[40rem] text-base leading-[1.9] text-site-muted">
          1箇所だけ形を変えたいときは <code className="font-mono text-[0.875em]">classNames</code>{' '}
          を使います。 variant が付けたクラスを打ち消したいときも、拡張ではなくこちらが正解です。
        </p>
        <Code label="classNames による上書き">{readSample('classnames-override')}</Code>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium tracking-tight">3. styles を拡張する</h2>
        <p className="max-w-[40rem] text-base leading-[1.9] text-site-muted">
          同じ見た目を何度も使うなら、派生した styles を1つ作ります。
          <code className="font-mono text-[0.875em]">tailwind-variants</code> が必要です。
        </p>
        <Code label="tailwind-variants のインストール">{INSTALL_TV}</Code>
        <Code label="styles の拡張">{readSample('extend-styles')}</Code>
        <p className="max-w-[40rem] text-base leading-[1.9] text-site-muted">
          <strong className="font-medium text-site-fg">
            slot ベースの定義では <code className="font-mono text-[0.875em]">base</code>{' '}
            が効きません。
          </strong>{' '}
          <code className="font-mono text-[0.875em]">tv({'{ extend, base }'})</code>{' '}
          と書いても無視されるため、
          <code className="font-mono text-[0.875em]">slots</code> を使ってください。 また{' '}
          <code className="font-mono text-[0.875em]">extend</code> で足したクラスは base
          に加算されるだけなので、 variant のクラスには勝てません。勝たせたいときは 2 の{' '}
          <code className="font-mono text-[0.875em]">classNames</code> を使います。
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium tracking-tight">上書きできる変数</h2>
        <p className="max-w-[40rem] text-base leading-[1.9] text-site-muted">
          {raster.label}（<code className="font-mono text-[0.875em]">{raster.pkg}</code>
          ）が定義する値です。 この表は CSS
          を出力しているのと同じ定義から作られているため、実装とズレません。
        </p>

        {raster.cssVariables.map((group) => (
          <section key={group.id} className="flex flex-col gap-4 pt-8">
            <h3 className="text-lg font-medium tracking-tight">{group.label}</h3>
            <p className="max-w-[40rem] text-base leading-[1.9] text-site-muted">
              {group.description}
            </p>
            {group.id === 'color' && <ColorSwatches theme="raster" />}
            <TokenTable theme="raster" group={group.id} />
          </section>
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium tracking-tight">テーマには解釈の自由があります</h2>
        <p className="max-w-[40rem] text-base leading-[1.9] text-site-muted">
          語彙は core が固定しますが、値の解釈はテーマが決めます。 たとえば {raster.label} の{' '}
          <code className="font-mono text-[0.875em]">radius</code> は sm=6px / md=8px / lg=12px
          の控えめな3段で、 これより丸くする語彙はありません。影も浮いている層にしか付きません。
          その範囲を超えた見た目が必要なときは、トークンの上書きではなくテーマを替えます。
        </p>
        <p className="max-w-[40rem] text-base leading-[1.9] text-site-muted">
          解釈の差は値だけに留まりません。Tactile では{' '}
          <code className="font-mono text-[0.875em]">size</code> が Modal の
          <strong className="font-medium text-site-fg">最大高</strong>を意味し、 Modal
          自体が下から出るシートになります。
          <strong className="font-medium text-site-fg">
            同じコードのまま DOM の組み立て方が変わります。
          </strong>
        </p>
        <ul className="flex max-w-[40rem] flex-col gap-4 text-base leading-[1.6] text-site-muted">
          <li>
            <Link href="/docs/themes/raster/" className="underline">
              Raster のデザイン言語
            </Link>{' '}
            — ミニマル / スイス系。線で切る
          </li>
          <li>
            <Link href="/docs/themes/tactile/" className="underline">
              Tactile のデザイン言語
            </Link>{' '}
            — タッチファースト。面を持ち上げる
          </li>
        </ul>
      </section>
    </article>
  )
}
