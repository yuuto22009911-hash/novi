import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'はじめに' }

const INSTALL = 'pnpm add @novi-ui/core @novi-ui/raster react-aria-components'

const SETUP = `// app/globals.css
@import '@novi-ui/core/base.css';
@import '@novi-ui/raster/raster.css';

/* テーマが出力するクラスを Tailwind に拾わせる */
@source "../node_modules/@novi-ui/raster/dist";`

const USAGE = `import { Button, Input } from '@novi-ui/raster'

export function SignInForm() {
  return (
    <form>
      <Input label="メールアドレス" type="email" isRequired />
      <Button type="submit" color="primary">送信</Button>
    </form>
  )
}`

function Code({ children }: { children: string }) {
  // 横スクロールする領域はキーボードでも読めなければならない（WCAG 2.1.1）。
  // section + aria-label で暗黙のロールを region にする
  return (
    <section
      aria-label="コード"
      // biome-ignore lint/a11y/noNoninteractiveTabindex: スクロール領域は WCAG 2.1.1 によりキーボードで読めるようにする必要がある
      tabIndex={0}
      className="overflow-x-auto border border-site-border bg-site-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-site-accent"
    >
      <pre className="p-4 text-xs leading-relaxed">
        <code>{children}</code>
      </pre>
    </section>
  )
}

export default function GettingStartedPage() {
  return (
    <article className="flex max-w-3xl flex-col gap-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-medium tracking-tight">はじめに</h1>
        <p className="text-sm leading-relaxed text-site-muted">
          Provider は要りません。CSS を2行 import すれば動きます。
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium tracking-tight">インストール</h2>
        <Code>{INSTALL}</Code>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium tracking-tight">CSS の読み込み</h2>
        <Code>{SETUP}</Code>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium tracking-tight">使う</h2>
        <Code>{USAGE}</Code>
        <p className="text-sm leading-relaxed text-site-muted">
          ラップするものはありません。React Server Components からも 型や slot 契約をそのまま import
          できます。
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium tracking-tight">知っておくと良いこと</h2>
        <dl className="flex flex-col gap-4 text-sm leading-relaxed">
          <div>
            <dt className="font-medium">props 名は React Aria の慣習に従います</dt>
            <dd className="text-site-muted">
              <code className="font-mono text-xs">disabled</code> ではなく{' '}
              <code className="font-mono text-xs">isDisabled</code>、
              <code className="font-mono text-xs">onClick</code> ではなく{' '}
              <code className="font-mono text-xs">onPress</code> です。 基盤の props
              をそのまま流すことで、変換層に起因する a11y のバグを作り込まずに済みます。
            </dd>
          </div>
          <div>
            <dt className="font-medium">ブランド色は CSS 変数で変えられます</dt>
            <dd className="text-site-muted">
              <code className="font-mono text-xs">--novi-color-primary</code>{' '}
              を上書きすれば、primary を使う全コンポーネントに反映されます。
            </dd>
          </div>
          <div>
            <dt className="font-medium">日本語入力で誤送信しません</dt>
            <dd className="text-site-muted">
              Input と TextArea の <code className="font-mono text-xs">onKeyDown</code> は IME
              変換中のキーを受け取りません。変換確定の Enter でフォームが送信される事故を防げます。
            </dd>
          </div>
        </dl>
      </section>
    </article>
  )
}
