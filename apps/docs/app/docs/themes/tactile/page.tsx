import type { Metadata } from 'next'
import Link from 'next/link'
import { Preview } from '../../../../components/preview'
import {
  getTheme,
  NumericRules,
  ProhibitedRules,
  TokenTable,
} from '../../../../components/token-tables'

export const metadata: Metadata = { title: 'Tactile のデザイン言語' }

export default function TactilePage() {
  const tactile = getTheme('tactile')

  return (
    <article className="flex max-w-3xl flex-col gap-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-medium tracking-tight">{tactile.label}</h1>
        <p className="text-sm leading-relaxed text-site-muted">
          {tactile.description}。指で触る前提で寸法を決め、面を持ち上げて階層を作ります。
          下から出るシート、大きなタップ領域、押した手応え。 画面あたりの情報量は Raster
          より意図的に少なくしてあります。
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium tracking-tight">Raster とどう違うか</h2>
        <p className="text-sm leading-relaxed text-site-muted">
          <strong className="font-medium text-site-fg">公開 API は完全に同一</strong>です。 import
          元を差し替えるだけで、見た目だけでなく DOM の組み立て方ごと切り替わります。
          違うのは寸法と面の作り方、そして次の構造です。
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-md border-collapse text-sm">
            <thead>
              <tr className="border-site-border border-b text-left">
                <th className="py-2 pr-4 font-medium">部位</th>
                <th className="py-2 pr-4 font-medium text-site-muted">Raster</th>
                <th className="py-2 font-medium">Tactile</th>
              </tr>
            </thead>
            <tbody className="text-site-muted">
              {[
                [
                  'Modal',
                  '中央のダイアログ・閉じるは右上の ✕',
                  '下から出るシート・閉じるはフッターのフルワイド',
                ],
                ['Select / Menu', 'トリガーの隣に出る', '画面下端のシート'],
                ['Tabs', '下線1本', 'セグメンテッドコントロール'],
                ['Toast', '右下', '上端（下端はシートとキーボードが占有する）'],
                ['高さ', '32 / 40 / 48px', '40 / 48 / 56px'],
                ['本文', '16px', '17px'],
              ].map(([part, raster, self]) => (
                <tr key={part} className="border-site-border/60 border-b last:border-0">
                  <td className="py-2 pr-4 font-medium text-site-fg">{part}</td>
                  <td className="py-2 pr-4">{raster}</td>
                  <td className="py-2 text-site-fg">{self}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm leading-relaxed text-site-muted">
          <strong className="font-medium text-site-fg">
            デスクトップで情報密度が要るなら Raster を選んでください。
          </strong>{' '}
          寸法はテーマの美学に属するもので、どちらが正しいという話ではありません。
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium tracking-tight">すべて数値で決まっています</h2>
        <p className="text-sm leading-relaxed text-site-muted">
          「タッチファースト」を感覚で運用すると必ずブレます。目分量で近い値を書かず、
          この値を使ってください。
        </p>
        <NumericRules theme="tactile" />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium tracking-tight">指が届くことを実測しています</h2>
        <p className="text-sm leading-relaxed text-site-muted">
          対話要素の
          <strong className="font-medium text-site-fg">実効タップ領域は 44×44px 以上</strong>
          です（WCAG 2.2 AAA / Apple HIG）。Checkbox の箱のように小さく見せたい部品は、
          擬似要素で当たり判定だけを広げてあります —{' '}
          <strong className="font-medium text-site-fg">視覚寸法とタップ寸法は別物</strong>です。
        </p>
        <p className="text-sm leading-relaxed text-site-muted">
          クラスが付いているかではなく、実際のブラウザで計算済みスタイルを測って検査しています。
          擬似要素で広げた領域は要素の矩形に現れないため、それ以外の方法では確かめられません。
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium tracking-tight">入力の文字は 16px を下回りません</h2>
        <p className="text-sm leading-relaxed text-site-muted">
          iOS Safari は 16px 未満の入力欄にフォーカスすると
          <strong className="font-medium text-site-fg">ページごと拡大し、以後戻りません</strong>。
          <code className="font-mono text-xs">size=&quot;sm&quot;</code>{' '}
          でも入力の文字は小さくせず、視覚的な軽さは高さと余白で作ります。
        </p>
        <TokenTable theme="tactile" group="text" />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium tracking-tight">影は面にも使います</h2>
        <p className="text-sm leading-relaxed text-site-muted">
          階層は<strong className="font-medium text-site-fg">持ち上がり</strong>で作ります （Raster
          は線で切ります）。境界線は補助的にしか使いません。
          <code className="font-mono text-xs">lg</code> だけ影が上向きなのは、
          浮く面が画面の下端から来るためです。
        </p>
        <TokenTable theme="tactile" group="shadow" />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium tracking-tight">中立色まで選んだ色に染まります</h2>
        <p className="text-sm leading-relaxed text-site-muted">
          Tactile は<strong className="font-medium text-site-fg">染まる生地</strong>です。
          <code className="font-mono text-xs">data-novi-color</code> で染料を選ぶと、primary
          だけでなく背景・境界線・文字までその色相を帯びます。 Raster（染まらない紙・中立色の彩度は
          0）との最も分かりやすい違いがここに出ます。
        </p>
        <blockquote className="border-site-border border-l-2 pl-4 text-sm leading-relaxed text-site-muted">
          {tactile.designRules.colorRule}
        </blockquote>
        <Preview>
          <div className="flex w-full flex-col gap-2">
            {['bg', 'subtle', 'surface', 'border', 'muted', 'fg'].map((name) => (
              <div key={name} className="flex items-center gap-3">
                <span
                  style={{ background: `var(--novi-color-${name})` }}
                  className="h-6 w-24 rounded-[var(--novi-radius-sm)] shadow-[var(--novi-shadow-sm)]"
                />
                <code className="font-mono text-xs text-[var(--novi-color-muted)]">{name}</code>
              </div>
            ))}
          </div>
        </Preview>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium tracking-tight">
          <code className="font-mono text-base">size</code> は幅ではなく最大高です
        </h2>
        <p className="text-sm leading-relaxed text-site-muted">
          全幅のシートに幅の段階は存在しないので、Modal の{' '}
          <code className="font-mono text-xs">size</code> は
          <strong className="font-medium text-site-fg">シートの最大高</strong>として解釈します （sm
          40dvh / md 60dvh / lg 80dvh / full 100dvh）。 Select と Menu
          ではトリガーの寸法と行の密度になります。
        </p>
        <p className="text-sm leading-relaxed text-site-muted">
          語彙は core が共通で固定し、解釈はテーマの自由という設計です。
          同じコードがテーマを跨いでそのまま動くのはこのためで、不具合ではありません。
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium tracking-tight">書いてはいけないクラス</h2>
        <p className="text-sm leading-relaxed text-site-muted">
          テーマを触る場合の規律です。CI が機械的に検査しているため、違反するとビルドが落ちます。
          この一覧は検査スクリプトと同じ定義から作られています。
        </p>
        <ProhibitedRules theme="tactile" />
        {tactile.designRules.exceptions.length > 0 && (
          <>
            <h3 className="pt-2 text-base font-medium tracking-tight">例外</h3>
            <ul className="flex flex-col gap-2 text-sm leading-relaxed text-site-muted">
              {tactile.designRules.exceptions.map((exception) => (
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
        <h2 className="text-lg font-medium tracking-tight">押すと沈みます</h2>
        <p className="text-sm leading-relaxed text-site-muted">
          対話要素は押下中に 0.97 倍に縮み、<code className="font-mono text-xs">solid</code>{' '}
          では影が消えます。持ち上がっていた面が沈むという一連の動きで手応えを返します。
          <code className="font-mono text-xs">scale</code>{' '}
          を使うのはここだけで、装飾目的では使いません。
          <code className="font-mono text-xs">prefers-reduced-motion</code>{' '}
          が有効なときは沈み込みもシートのスライドも起きません。
        </p>
        <TokenTable theme="tactile" group="motion" />
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
