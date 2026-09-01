import dynamic from 'next/dynamic'
import Link from 'next/link'
import { LazyMount } from '../components/lazy-mount'

// デモはライブラリ全体を引き込むため遅延させる（T-38）。
// ファーストビューの Hero だけが初回に組み上がり、下の2つは近づいてから
// マウントする（すべてを初回に hydration すると LCP 要素の描画が待たされる）
const HeroPreview = dynamic(() =>
  import('../components/hero-preview').then((m) => ({ default: m.HeroPreview })),
)
const DashboardShowcase = dynamic(() =>
  import('../components/dashboard-showcase').then((m) => ({ default: m.DashboardShowcase })),
)
const ThemeTriptych = dynamic(() =>
  import('../components/theme-triptych').then((m) => ({ default: m.ThemeTriptych })),
)

export default function HomePage() {
  return (
    <div className="flex flex-col gap-[clamp(4rem,8vw,6rem)]">
      <section className="flex flex-col gap-6">
        <h1 className="max-w-[14em] text-balance text-[clamp(2.5rem,6vw,4rem)] font-medium leading-[1.1] tracking-[-0.02em]">
          1つの core に、複数の美学。
        </h1>
        <p className="mb-8 max-w-[38em] text-lg leading-[1.9] text-site-muted">
          挙動とアクセシビリティは <code className="font-mono text-base">@novi-ui/core</code>{' '}
          が一手に引き受け、テーマは構造とスタイルだけを持ちます。
          右上でテーマを切り替えてください。
          <strong className="font-medium text-site-fg">
            下のコードは1文字も変わらないまま、見た目だけが変わります。
          </strong>
        </p>

        <HeroPreview />
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-medium tracking-[-0.015em]">3つのモデルを並べる</h2>
        <p className="max-w-[38em] text-sm leading-[1.9] text-site-muted">
          同じ JSX を3つのテーマで同時に描いたものです。違うのは角丸だけではありません。
          <strong className="font-medium text-site-fg">
            余白の量、要素間の距離の比、字送り、数字の字形
          </strong>
          ——どれもテーマが所有する値です。Raster は 4px グリッドの規律、Tactile は面積、Flatlay
          は罫線と等幅の見出しが、それぞれの支配軸です。
        </p>
        {/* 予約高さは実測値（375px で 932px / 1280px で 345px） */}
        <LazyMount placeholderClassName="min-h-[58rem] sm:min-h-[21.5rem]">
          <ThemeTriptych />
        </LazyMount>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-medium tracking-[-0.015em]">組み上げるとこうなります</h2>
        <p className="mb-2 max-w-[40em] text-sm leading-[1.9] text-site-muted">
          Raster だけで作った管理画面です。面は平らなまま、余白と 1px
          の線と明度差で階層を作り、浮いている層だけが薄い影を持ちます。 情報密度の高い実務画面が
          Raster の得意分野です。右上でテーマを切り替えると、この画面ごと別の見た目になります。
        </p>
        {/* 予約高さは実測値（375px で 2078px / 1280px で 965px） */}
        <LazyMount placeholderClassName="min-h-[130rem] sm:min-h-[60.5rem]">
          <DashboardShowcase />
        </LazyMount>
        <p className="mt-2 max-w-[40em] text-sm leading-[1.6] text-site-muted">
          このページの外枠がテーマに染まらないのは、比較対象をはっきりさせるための設計です。
          実際のアプリは、上のように Novi だけで組めます。
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-medium tracking-[-0.015em]">設計の要点</h2>
        <dl className="mt-2 grid gap-6 sm:grid-cols-3">
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
              <dd className="max-w-[40em] text-sm leading-[1.6] text-site-muted">{item.d}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-medium tracking-[-0.015em]">はじめる</h2>
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
