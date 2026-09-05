import type { Metadata } from 'next'
import Link from 'next/link'
import { Code } from '../../../components/code-block'

export const metadata: Metadata = { title: 'はじめに' }

const INSTALL = 'pnpm add @novi-ui/core @novi-ui/raster react-aria-components'

const SETUP = `/* app/globals.css */
@import "tailwindcss";
@import "@novi-ui/core/base.css";
@import "@novi-ui/raster/raster.css";

/* テーマが出力するクラスを Tailwind に拾わせる。パスはこの CSS からの相対 */
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

const ATTRIBUTES = `<html data-novi-theme="raster" data-novi-scheme="dark" data-novi-color="brick">`

const TOGGLE = `// ダークにする
document.documentElement.dataset.noviScheme = 'dark'
// ライトに戻す
document.documentElement.dataset.noviScheme = 'light'
// 属性を消せば OS の設定に追従する
delete document.documentElement.dataset.noviScheme`

const AGENTS = `# Claude Code / Cursor / Codex / Copilot に規約と部品一覧を渡す
npx skills add yuuto22009911-hash/novi --skill novi-ui

# shadcn CLI で導入する（npm インストールと globals.css への @import / @source 注入。ソースはコピーしない）
npx shadcn@latest add https://novi-42r.pages.dev/r/raster.json

# MCP サーバ（読み取り専用・オフライン）
claude mcp add novi-ui -- npx -y @novi-ui/mcp`

const THEMES = [
  {
    pkg: '@novi-ui/raster',
    href: '/docs/themes/raster/',
    label: 'Raster',
    note: 'ミニマル / スイス系',
  },
  {
    pkg: '@novi-ui/tactile',
    href: '/docs/themes/tactile/',
    label: 'Tactile',
    note: 'タッチファースト',
  },
  {
    pkg: '@novi-ui/flatlay',
    href: '/docs/themes/flatlay/',
    label: 'Flatlay',
    note: '帳票・文具 / z 軸なし',
  },
] as const

export default function GettingStartedPage() {
  return (
    <article className="flex max-w-3xl flex-col gap-[clamp(2rem,5vw,3rem)]">
      <header className="mb-[clamp(1rem,4vw,3rem)] flex flex-col gap-2">
        <h1 className="text-3xl font-medium tracking-tight">はじめに</h1>
        <p className="max-w-[40rem] text-base leading-[1.6] text-site-muted">
          Provider は要りません。Tailwind v4 のプロジェクトに CSS を数行足せば動きます。
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium tracking-tight">前提</h2>
        <ul className="flex max-w-[40rem] list-disc flex-col gap-2 pl-5 text-base leading-[1.9] text-site-muted">
          <li>React 19 と react-aria-components 1.20 以上</li>
          <li>
            <strong className="font-medium text-site-fg">Tailwind CSS v4 は必須です。</strong>{' '}
            テーマの CSS はトークン定義だけを持ち、コンポーネントのクラスは利用側の Tailwind
            が生成します。Tailwind 無しでは何も描画されません
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium tracking-tight">テーマを1つ選ぶ</h2>
        <p className="max-w-[40rem] text-base leading-[1.9] text-site-muted">
          3つのテーマは公開 API が完全に同一です。以下では Raster
          を使いますが、パッケージ名を読み替えるだけで他のテーマになります。
        </p>
        <ul className="flex max-w-[40rem] flex-col gap-2 text-base leading-[1.9]">
          {THEMES.map((t) => (
            <li key={t.pkg} className="flex flex-wrap items-baseline gap-x-3">
              <code className="font-mono text-[0.875em]">{t.pkg}</code>
              <Link href={t.href} className="underline underline-offset-4">
                {t.label}
              </Link>
              <span className="text-site-muted">{t.note}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium tracking-tight">インストール</h2>
        <Code>{INSTALL}</Code>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium tracking-tight">CSS の読み込み</h2>
        <Code>{SETUP}</Code>
        <p className="max-w-[40rem] text-base leading-[1.9] text-site-muted">
          <code className="font-mono text-[0.875em]">@source</code> のパスは CSS
          ファイルからの相対です。
          <code className="font-mono text-[0.875em]">src/app/globals.css</code> に置くなら{' '}
          <code className="font-mono text-[0.875em]">../../node_modules/...</code>{' '}
          になります。これを忘れるとコンポーネントは無スタイルで描画されます。
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium tracking-tight">使う</h2>
        <Code>{USAGE}</Code>
        <p className="max-w-[40rem] text-base leading-[1.9] text-site-muted">
          ラップするものはありません。React Server Components からも 型や slot 契約をそのまま import
          できます。
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium tracking-tight">テーマ・配色・ダーク</h2>
        <p className="max-w-[40rem] text-base leading-[1.9] text-site-muted">
          すべて <code className="font-mono text-[0.875em]">{'<html>'}</code>{' '}
          の属性で決まります。どれも省略できます。
        </p>
        <Code>{ATTRIBUTES}</Code>
        <dl className="flex max-w-[40rem] flex-col gap-6 text-base leading-[1.9]">
          <div>
            <dt className="font-medium">
              <code className="font-mono text-[0.875em]">data-novi-theme</code>
            </dt>
            <dd className="text-site-muted">
              テーマ名（<code className="font-mono text-[0.875em]">raster</code> /{' '}
              <code className="font-mono text-[0.875em]">tactile</code> /{' '}
              <code className="font-mono text-[0.875em]">flatlay</code>）。 上の手順のように{' '}
              <code className="font-mono text-[0.875em]">raster.css</code>{' '}
              を読むなら省略できます。複数テーマを1ページで併用するときは{' '}
              <code className="font-mono text-[0.875em]">raster.scoped.css</code>{' '}
              を読み、この属性の配下にだけ効かせます。
            </dd>
          </div>
          <div>
            <dt className="font-medium">
              <code className="font-mono text-[0.875em]">data-novi-scheme</code>
            </dt>
            <dd className="text-site-muted">
              <code className="font-mono text-[0.875em]">light</code> か{' '}
              <code className="font-mono text-[0.875em]">dark</code>。省略すると OS
              の設定に追従します。切り替えは属性を書き換えるだけです。
            </dd>
          </div>
          <div>
            <dt className="font-medium">
              <code className="font-mono text-[0.875em]">data-novi-color</code>
            </dt>
            <dd className="text-site-muted">
              配色（カラーウェイ）。各テーマが8色を持ち、
              <strong className="font-medium text-site-fg">色名はテーマごとに違います</strong>。
              一覧は{' '}
              <Link href="/docs/lookbook/" className="underline underline-offset-4">
                Lookbook
              </Link>{' '}
              に。知らない名前を渡しても壊れず、そのテーマの既定色になります。
            </dd>
          </div>
        </dl>
        <Code>{TOGGLE}</Code>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium tracking-tight">AI エージェントと使う</h2>
        <p className="max-w-[40rem] text-base leading-[1.9] text-site-muted">
          Skill・レジストリ・MCP
          の3つを用意しています。どれも同じ中間表現から生成しているので、実装とずれません。shadcn
          のレジストリは <code className="font-mono text-[0.875em]">@source</code>{' '}
          まで注入するので、導入の事故（無スタイル）が起きません。
        </p>
        <Code>{AGENTS}</Code>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium tracking-tight">知っておくと良いこと</h2>
        <dl className="flex max-w-[40rem] flex-col gap-6 text-base leading-[1.9]">
          <div>
            <dt className="font-medium">props 名は React Aria の慣習に従います</dt>
            <dd className="text-site-muted">
              <code className="font-mono text-[0.875em]">disabled</code> ではなく{' '}
              <code className="font-mono text-[0.875em]">isDisabled</code>、
              <code className="font-mono text-[0.875em]">onClick</code> ではなく{' '}
              <code className="font-mono text-[0.875em]">onPress</code> です。 基盤の props
              をそのまま流すことで、変換層に起因する a11y のバグを作り込まずに済みます。
            </dd>
          </div>
          <div>
            <dt className="font-medium">ブランド色は8色から選びます</dt>
            <dd className="text-site-muted">
              <code className="font-mono text-[0.875em]">data-novi-color</code>{' '}
              で選べる色は、全テーマ・ライト / ダークの全組み合わせでコントラストを検査済みです。
              どうしても外の色が要るときは{' '}
              <code className="font-mono text-[0.875em]">--novi-color-primary</code>{' '}
              を上書きできますが、検査の外に出ます。
            </dd>
          </div>
          <div>
            <dt className="font-medium">日本語入力で誤送信しません</dt>
            <dd className="text-site-muted">
              Input と TextArea の <code className="font-mono text-[0.875em]">onKeyDown</code> は
              IME 変換中のキーを受け取りません。変換確定の Enter
              でフォームが送信される事故を防げます。
            </dd>
          </div>
        </dl>
      </section>
    </article>
  )
}
