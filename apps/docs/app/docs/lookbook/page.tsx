import type { Metadata } from 'next'
import { type ColorEntry, getTheme } from '../../../components/token-tables'

export const metadata: Metadata = { title: 'Lookbook' }

/**
 * 色ごとの見開き。左が light、右が dark。
 *
 * 面は `data-novi-theme` と `data-novi-color` を自分で宣言する。
 * サイトのテーマ切替に追従させないのは意図で、見本帳は
 * いつ開いても全色が両モデル分そのまま並んでいてほしい。
 * `data-testid="preview"` を付けないのも意図（視覚回帰の対象はデモだけ）。
 */
function ColorCard({
  theme,
  color,
  pairName,
  isDefault,
}: {
  theme: string
  color: ColorEntry
  pairName: string
  isDefault: boolean
}) {
  const faces = [
    { scheme: undefined, label: 'LIGHT' },
    { scheme: 'dark', label: 'DARK' },
  ] as const

  return (
    <div className="flex flex-col border border-site-border">
      <div className="grid grid-cols-2">
        {faces.map((face) => (
          <div
            key={face.label}
            data-novi-theme={theme}
            data-novi-color={color.id}
            {...(face.scheme === undefined ? {} : { 'data-novi-scheme': face.scheme })}
            className="flex flex-col gap-3 bg-[var(--novi-color-bg)] p-4"
          >
            <span className="font-mono text-[10px] tracking-[0.14em] text-[var(--novi-color-muted)]">
              {face.label}
            </span>
            <span className="h-14 rounded-[var(--novi-radius-sm)] bg-[var(--novi-color-primary)]" />
            <span className="self-start rounded-[var(--novi-radius-sm)] bg-[var(--novi-color-secondary)] px-2 py-0.5 text-xs text-[var(--novi-color-secondary-fg)]">
              相方 {pairName}
            </span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1 border-t border-site-border p-4">
        <div className="flex items-baseline gap-2">
          <span className="font-medium">{color.name}</span>
          {isDefault && (
            <span className="font-mono text-[10px] tracking-[0.14em] text-site-accent">
              DEFAULT
            </span>
          )}
        </div>
        <p className="text-sm leading-[1.6] text-site-muted">{color.description}</p>
        <p className="font-mono text-xs text-site-muted">
          hue {color.hue} · {color.light.primary}
        </p>
      </div>
    </div>
  )
}

function ThemeSection({ theme, setName, lede }: { theme: string; setName: string; lede: string }) {
  const entry = getTheme(theme)
  const nameOf = new Map(entry.colorSet.map((c) => [c.id, c.name]))
  const tone = entry.tone

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h2 className="flex flex-wrap items-baseline gap-x-3 text-xl font-medium tracking-tight">
          {entry.label} — {setName}
          <span className="font-mono text-xs font-normal tracking-normal text-site-muted">
            トーン L{tone.light.l} / C{tone.light.c.toFixed(3)} · dark L{tone.dark.l} / C
            {tone.dark.c.toFixed(3)}
          </span>
        </h2>
        <p className="max-w-[40rem] text-base leading-[1.6] text-site-muted">{lede}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {entry.colorSet.map((color) => (
          <ColorCard
            key={color.id}
            theme={theme}
            color={color}
            pairName={nameOf.get(color.pair) ?? color.pair}
            isDefault={color.id === entry.defaultColor}
          />
        ))}
      </div>
    </section>
  )
}

/**
 * 染料の見本帳。カラーセットの全色を、両モデル × light / dark で見開きにする。
 *
 * 載っている値は手書きではなく、生成 CSS と同じ color-set.ts から
 * IR 経由で来る（FR-11）。名前も由来も相方も、実装とズレようがない。
 */
export default function LookbookPage() {
  return (
    <article className="flex flex-col gap-[clamp(2rem,5vw,3rem)]">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-medium tracking-tight">Lookbook</h1>
        <p className="max-w-[40rem] text-base leading-[1.9] text-site-muted">
          服の色決めと同じ道具立て — トーンイントーン、カラーウェイ、ルックブック — で UI
          の色を設計しています。作っているのはアパレルを営む人間で、これはその見本帳です。
          トーン（明度と彩度のレシピ）はモデルが所有し、色は名前と由来を持ちます。 使うときは{' '}
          <code className="font-mono text-[0.875em]">data-novi-color</code>{' '}
          に色の名前を渡すだけです。
        </p>
      </header>

      <ThemeSection
        theme="raster"
        setName="Print Inks"
        lede="印刷インク。全色が顔料・インクの実名を持ちます。紙（中立色）は染まらず、インクだけが替わります。紫・青緑・ピンクは意図的に入れていません。入れない色が、このモデルの性格を作ります。"
      />

      <ThemeSection
        theme="tactile"
        setName="Textile Dyes"
        lede="織物の染料。生地（中立色）まで選んだ色の色相にわずかに染まります。上の Print Inks と色相の重複はありません。同じ系統の色でも、モデルを替えると発色が変わります。"
      />

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
              d: '差し色は考えなくていい。選んだ色の相方が secondary として付いてきます。2色刷り（Raster）とバイカラー（Tactile）、いつでも同じセット内の色です。',
            },
            {
              t: '染料と生地',
              d: 'トーンはモデルの持ち物です。Raster は染まらない紙、Tactile は染まる生地。切り替えても、色相の顔ぶれだけが替わります。',
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
