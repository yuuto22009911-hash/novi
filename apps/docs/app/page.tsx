import dynamic from 'next/dynamic'
import Link from 'next/link'

// デモはライブラリ全体を引き込むため遅延させる（T-38）。
// HTML は静的に描画済みなので、遅れて届くのはインタラクションだけ
const HeroPreview = dynamic(() =>
  import('../components/hero-preview').then((m) => ({ default: m.HeroPreview })),
)
const DashboardShowcase = dynamic(() =>
  import('../components/dashboard-showcase').then((m) => ({ default: m.DashboardShowcase })),
)

export default function HomePage() {
  return (
    <div className="flex flex-col gap-16">
      <section className="flex flex-col gap-6">
        <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
          1つの core に、複数の美学。
        </h1>
        <p className="max-w-2xl leading-relaxed text-site-muted">
          挙動とアクセシビリティは <code className="font-mono text-sm">@novi-ui/core</code>{' '}
          が一手に引き受け、テーマは構造とスタイルだけを持ちます。
          右上でテーマを切り替えてください。
          <strong className="font-medium text-site-fg">
            下のコードは1文字も変わらないまま、見た目だけが変わります。
          </strong>
        </p>

        <HeroPreview />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium tracking-tight">組み上げるとこうなります</h2>
        <p className="max-w-2xl text-sm leading-relaxed text-site-muted">
          Raster だけで作った管理画面です。面は平らなまま、余白と 1px
          の線と明度差で階層を作り、浮いている層だけが薄い影を持ちます。 情報密度の高い実務画面が
          Raster の得意分野です。右上でテーマを切り替えると、この画面ごと別の見た目になります。
        </p>
        <DashboardShowcase />
        <p className="max-w-2xl text-sm leading-relaxed text-site-muted">
          このページの外枠がテーマに染まらないのは、比較対象をはっきりさせるための設計です。
          実際のアプリは、上のように Novi だけで組めます。
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium tracking-tight">設計の要点</h2>
        <dl className="grid gap-6 sm:grid-cols-3">
          {[
            {
              t: 'Provider が要らない',
              d: 'テーマは CSS 変数だけで効きます。import してすぐ使えるので、AI が設置を忘れて壊れることがありません。',
            },
            {
              t: 'slot 契約',
              d: 'core は部位の名前だけを決め、JSX は決めません。テーマは構造を自由に組めるのに、公開 API は同一に保たれます。',
            },
            {
              t: '日本語入力に強い',
              d: '変換確定の Enter でフォーム送信が暴発する問題を、利用側が意識せずに防げます。',
            },
          ].map((item) => (
            <div key={item.t} className="flex flex-col gap-2 border-t border-site-border pt-4">
              <dt className="font-medium">{item.t}</dt>
              <dd className="text-sm leading-relaxed text-site-muted">{item.d}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium tracking-tight">はじめる</h2>
        <div className="flex flex-wrap gap-4 text-sm">
          <Link
            href="/docs/getting-started/"
            className="text-site-accent underline-offset-4 hover:underline"
          >
            インストールと最小構成
          </Link>
          <Link
            href="/docs/components/button/"
            className="text-site-accent underline-offset-4 hover:underline"
          >
            コンポーネント一覧
          </Link>
        </div>
      </section>
    </div>
  )
}
