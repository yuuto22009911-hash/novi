import type { Metadata } from 'next'
import { LookbookGallery } from '../../../components/lookbook-gallery'

export const metadata: Metadata = { title: 'Lookbook' }

/**
 * 染料の見本帳。選択中のモデルのカラーセットを light / dark の見開きで並べる。
 *
 * 載っている値は手書きではなく、生成 CSS と同じ color-set.ts から
 * IR 経由で来る（FR-11）。名前も由来も相方も、実装とズレようがない。
 * どのセットを見せるかはヘッダーのモデル切替に追従する（LookbookGallery）。
 */
export default function LookbookPage() {
  return (
    <article className="flex flex-col gap-[clamp(2rem,5vw,3rem)]">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-medium tracking-tight">Lookbook</h1>
        <p className="max-w-[40rem] text-base leading-[1.9] text-site-muted">
          服の色決めと同じ道具立て — トーンイントーン、カラーウェイ、ルックブック — で UI
          の色を設計しています。作っているのはアパレルを営む人間で、これはその見本帳です。
          トーン（明度と彩度のレシピ）はモデルが所有し、色は名前と由来を持ちます。
          右上でモデルを切り替えると、見本帳もそのモデルの染料に掛け替わります。
          染料は服に仕立てて初めて発色が分かるので、試着室で同じ一着を全色に着せ替えられます。
          使うときは <code className="font-mono text-[0.875em]">data-novi-color</code>{' '}
          に色の名前を渡すだけです。
        </p>
      </header>

      <LookbookGallery />

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium tracking-tight">決めごと</h2>
        <dl className="grid gap-6 sm:grid-cols-3">
          {[
            {
              t: '定番だけ',
              d: 'シーズナルドロップはしません。8色で止めるから、全色 × 全モデル × light / dark の組み合わせをコントラスト検査で数え切れます。',
            },
            {
              t: '相方が組で付く',
              d: '差し色は考えなくていい。選んだ色の相方が secondary として付いてきます。2色刷り（Raster）、バイカラー（Tactile）、ダブルエントリー（Flatlay）、いつでも同じセット内の色です。',
            },
            {
              t: '染料と生地',
              d: 'トーンはモデルの持ち物です。Raster は染まらない紙、Tactile は染まる生地、Flatlay は罫線だけが染まる文具。切り替えても、色相の顔ぶれだけが替わります。',
            },
          ].map((item) => (
            <div key={item.t} className="flex flex-col gap-2 border-t border-site-border pt-4">
              <dt className="font-medium">{item.t}</dt>
              <dd className="max-w-[40em] text-sm leading-[1.6] text-site-muted">{item.d}</dd>
            </div>
          ))}
        </dl>
      </section>
    </article>
  )
}
