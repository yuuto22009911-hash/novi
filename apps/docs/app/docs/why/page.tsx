import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import index from '../../../.generated/component-index.json'

export const metadata: Metadata = {
  title: 'なぜ Novi か',
  description:
    '見た目のライブラリはもう足りている。Novi が持ち込むのは、DOM 構造まで変わるモデル、主張を守る検査、名前と由来を持つ色、日本語で使う前提の4つ。',
}

/** 根拠の数値は手書きせず IR から引く。ページの主張が実装とずれないように */
const themes = Object.values(index.themes)
const CONTRACTS = index.components.length
const COLORS_PER_THEME = themes[0]?.colorSet.length ?? 0
const SCHEMES = 2
const CONTRAST_CONDITIONS = 3

function H2({ children }: { children: string }) {
  return <h2 className="text-2xl font-medium tracking-[-0.015em]">{children}</h2>
}

function P({ children }: { children: ReactNode }) {
  return <p className="max-w-[40em] text-base leading-[1.9] text-site-muted">{children}</p>
}

function Strong({ children }: { children: ReactNode }) {
  return <strong className="font-medium text-site-fg">{children}</strong>
}

export default function WhyPage() {
  return (
    <article className="flex max-w-3xl flex-col gap-[clamp(2.5rem,6vw,4rem)]">
      <header className="flex flex-col gap-3">
        <h1 className="text-balance text-[clamp(2rem,5vw,3rem)] font-medium leading-[1.15] tracking-[-0.02em]">
          なぜ Novi か
        </h1>
        <P>
          React Aria Components と Tailwind
          で組んだ、きれいなコンポーネント群はもう世の中に足りています。2026 年には shadcn/ui が 8
          つのスタイルを出し、React Aria を土台に選べるようにもなりました。
          <Strong>色と角丸で差を作るのは、もう誰にでもできます。</Strong>
          Novi が持ち込むのは別の4つです。
        </P>
      </header>

      <section className="flex flex-col gap-4">
        <H2>1. 見た目ではなく、DOM の組み立て方が変わる</H2>
        <P>
          Novi の core は {CONTRACTS} 個のコンポーネントについて、部位の
          <Strong>名前（slot）だけを決め、JSX を決めません</Strong>。テーマは必須の slot
          さえ描けば、順序も入れ子も要素の種類も自由です。その結果、同じ{' '}
          <code className="font-mono text-[0.875em]">{'<Modal>'}</code>{' '}
          がテーマごとに別の構造になります。
        </P>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-site-border text-left text-site-muted">
                <th className="py-2 pr-4 font-normal">テーマ</th>
                <th className="py-2 pr-4 font-normal">Modal の構造</th>
                <th className="py-2 pr-4 font-normal">閉じるの位置</th>
                <th className="py-2 pr-4 font-normal">
                  <code className="font-mono text-[0.875em]">size</code> の解釈
                </th>
                <th className="py-2 font-normal">コントロール高さ</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Raster', '中央に浮かぶ。地を暗転', '右上の ✕', 'パネルの幅', 'raster'],
                ['Tactile', '下からせり上がるシート', 'フッターに全幅', 'シートの高さ', 'tactile'],
                [
                  'Flatlay',
                  '紙ごと差し替わる（全画面）',
                  '左上の「← 戻る」',
                  '本文の最大行長',
                  'flatlay',
                ],
              ].map(([label, structure, close, size, key]) => {
                const heights =
                  index.themes[key as keyof typeof index.themes].designRules.numeric.controlHeights
                return (
                  <tr key={label} className="border-b border-site-border align-top">
                    <td className="py-2 pr-4 font-medium">{label}</td>
                    <td className="py-2 pr-4">{structure}</td>
                    <td className="py-2 pr-4">{close}</td>
                    <td className="py-2 pr-4">{size}</td>
                    <td className="py-2 font-mono text-xs">
                      {heights.sm} / {heights.md} / {heights.lg}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <P>
          3本目のテーマを書き終えた時点で、テーマ同士のコードの一致率は 21
          コンポーネント中の最下位2つ（Popover と Toast）で 5 割前後まで割れました。
          <Strong>「浮かせるか」という美学の判断が、そのまま構造の差になる</Strong>
          ためです。だから共通の実装を引き上げる「ファクトリ」は作らないと決めました（ADR-09）。その様子は
          <Link href="/" className="underline underline-offset-4">
            トップの Modal 三連
          </Link>
          で見られます。
        </P>
      </section>

      <section className="flex flex-col gap-4">
        <H2>2. 主張は文章ではなく検査が守る</H2>
        <P>
          「AI に書かせても崩れない」は、崩れたら CI
          が落ちるように作ってあるから言えます。テストが通ることより、
          <Strong>壊したら必ず落ちること</Strong>を確かめてきました。
        </P>
        <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {[
            [
              'slot 契約',
              `全テーマの全コンポーネントが core の必須 slot を描いていることを、data-slot 属性で検査します。`,
            ],
            [
              '書いてはいけないクラス',
              'テーマごとに禁止クラスの一覧を持ち、影の無いテーマに影を書けば lint が落ちます。禁止一覧そのものが「壊したら落ちるか」の変異テストを持ちます。',
            ],
            [
              `色 ${COLORS_PER_THEME} × ${SCHEMES} × ${CONTRAST_CONDITIONS} = ${COLORS_PER_THEME * SCHEMES * CONTRAST_CONDITIONS} 判定`,
              'カラーウェイをテーマごとに 8 色で止めるのは、全色 × ライト / ダーク × 3 条件のコントラストを数え切って検査できるからです。',
            ],
            [
              '視覚回帰は判定と同じ環境で',
              '基準画像は CI と同じ Linux で撮ります。手元の macOS で撮った基準は、色を差し替えても差分ゼロと判定していました。',
            ],
            [
              'RSC 安全',
              'core の配布物が React を一切 import しないことを、ビルド後の成果物に対して検査します。Provider が無いのは設計であり、検査でもあります。',
            ],
            [
              '日本語入力',
              '変換確定の Enter を送信と取り違えないことを、isComposing の観測点ごと検査します。観測点を間違えた検査は壊しても通るので、そこを固定しています。',
            ],
            [
              '見本のずれ',
              'トップの Modal 三連は静的な写しです。実物の Modal を開いて slot の並びを取り、写しと突き合わせる e2e が毎回走ります。',
            ],
            [
              'AI の生成精度',
              'llms.txt だけを読ませたエージェントに全コンポーネントを書かせ、型エラーと禁止クラスがゼロであることを確かめます。落ちたら生成物ではなく文書を直します。',
            ],
          ].map(([t, d]) => (
            <div key={t} className="flex flex-col gap-1 border-t border-site-border pt-3">
              <dt className="font-medium">{t}</dt>
              <dd className="text-sm leading-[1.7] text-site-muted">{d}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="flex flex-col gap-4">
        <H2>3. 色に名前と由来がある</H2>
        <P>
          色は「選ぶもの」ではなく「仕立てるもの」として設計しています。
          <Strong>
            トーン（明度と彩度のレシピ）はモデルが所有し、色（色相と名前）はカラーウェイが持つ
          </Strong>
          。 Raster は印刷インク、Tactile は織物の染料、Flatlay は文具。どのセットも{' '}
          {COLORS_PER_THEME}{' '}
          色の定番だけで、シーズナルドロップはしません。選んだ色には相方が組で付き、差し色を考えなくて済みます。
        </P>
        <P>
          作っているのはアパレルを営む人間で、これはトーンイントーンとルックブックの道具立てをそのまま
          UI に持ち込んだものです。
          <Link href="/docs/lookbook/" className="underline underline-offset-4">
            Lookbook
          </Link>
          では染料の見本と、同じ一着を全色に着せた試着室を見られます。
        </P>
      </section>

      <section className="flex flex-col gap-4">
        <H2>4. 日本語で使う前提で作っている</H2>
        <P>
          IME
          の変換確定でフォームが送信される事故を、利用側が何もしなくても防ぎます。和文の見出しの改行、行長、数字の字形も、テーマが所有する値として持っています。英語圏のライブラリを日本語で使ったときに最初に当たる壁を、最初から無くしてあります。
        </P>
      </section>

      <section className="flex flex-col gap-4">
        <H2>あえてしないこと</H2>
        <ul className="flex max-w-[40em] list-disc flex-col gap-2 pl-5 text-base leading-[1.8] text-site-muted">
          <li>
            <Strong>Provider を要求しない。</Strong> AI が設置を忘れて壊れる経路を最初から作らない
          </li>
          <li>
            <Strong>アニメーションライブラリを入れない。</Strong> CSS
            だけで動かし、利用者のバンドルに乗せない
          </li>
          <li>
            <Strong>Web フォントを配らない。</Strong> システムフォントで成立する書体設計にする
          </li>
          <li>
            <Strong>テーマの共通実装を引き上げない。</Strong>{' '}
            一致率が上がっても「まだ差を作る必要が無かった」の意味しか持たない
          </li>
          <li>
            <Strong>9 色目を足さない。</Strong> 検査で数え切れる範囲が、保証できる範囲
          </li>
          <li>
            <Strong>独自の props 名を作らない。</Strong> React Aria の慣習に従い、AI
            の事前知識で書けるようにする
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <H2>向いていない場合</H2>
        <P>
          業務画面の一覧と入力に要る Table、ComboBox、DatePicker はまだありません。これらは React
          Aria
          が挙動を持っているので次に足す予定ですが、今日それが要るなら別のライブラリが早いです。ドキュメントは日本語だけで、バージョンは
          0.x です。API は変わります。
        </P>
      </section>

      <section className="flex flex-col gap-4">
        <H2>はじめる</H2>
        <div className="flex flex-wrap gap-4 text-sm">
          <Link
            href="/docs/getting-started/"
            className="text-site-accent underline-offset-4 hover:underline"
          >
            インストールと最小構成
          </Link>
          <Link href="/" className="text-site-accent underline-offset-4 hover:underline">
            3つのモデルを見る
          </Link>
          <Link
            href="/docs/lookbook/"
            className="text-site-accent underline-offset-4 hover:underline"
          >
            Lookbook
          </Link>
        </div>
      </section>
    </article>
  )
}
