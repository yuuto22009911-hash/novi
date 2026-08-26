import type { Metadata } from 'next'
import Link from 'next/link'
import { Preview } from '../../../../components/preview'
import {
  getTheme,
  NumericRules,
  ProhibitedRules,
  TokenTable,
} from '../../../../components/token-tables'

export const metadata: Metadata = { title: 'Flatlay のデザイン言語' }

export default function FlatlayPage() {
  const flatlay = getTheme('flatlay')
  const nameOf = new Map(flatlay.colorSet.map((color) => [color.id, color.name]))

  return (
    <article className="flex max-w-3xl flex-col gap-[clamp(2rem,5vw,3rem)]">
      <header className="mb-[clamp(1rem,4vw,3rem)] flex flex-col gap-2">
        <h1 className="text-3xl font-medium tracking-tight">{flatlay.label}</h1>
        <p className="max-w-[40rem] text-base leading-[1.6] text-site-muted">
          {flatlay.description}。浮く層が無いので、開くものは場所を取ります。
          展開はその場を押し下げ、Modal は画面を占め、階層は罫線と地色と面積だけで作ります。
          机に広げた書類を真上から見た状態が、このテーマの名前の由来です。
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium tracking-tight">他の2つとどう違うか</h2>
        <p className="max-w-[40rem] text-base leading-[1.9] text-site-muted">
          <strong className="font-medium text-site-fg">公開 API は3テーマとも完全に同一</strong>
          です。import 元を差し替えるだけで、見た目だけでなく DOM
          の組み立て方ごと切り替わります。違うのは次の構造です。
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-md border-collapse text-sm">
            <thead>
              <tr className="border-site-border border-b text-left">
                <th className="py-2 pr-4 font-medium">部位</th>
                <th className="py-2 pr-4 font-medium text-site-muted">Raster</th>
                <th className="py-2 pr-4 font-medium text-site-muted">Tactile</th>
                <th className="py-2 font-medium">Flatlay</th>
              </tr>
            </thead>
            <tbody className="text-site-muted">
              {[
                ['階層の作り方', '線で切る', '面を持ち上げる', '罫線・地色・面積だけ'],
                ['影', '浮く層に使う', '面にも使う', '全段が透明（存在しない）'],
                ['Select / Menu / Popover', '隣に浮く', '下から出るシート', 'その場を押し下げる'],
                ['Modal', '中央のダイアログ', '下から出るシート', '全画面テイクオーバー'],
                ['Toast', '右下に浮く', '上端に浮く', 'フローに挿入される帯'],
                ['押下の表現', '色', '0.97 倍に沈む', '面と文字が入れ替わる'],
                ['高さ', '32 / 40 / 48px', '40 / 48 / 56px', '28 / 32 / 40px'],
                ['中立色', '染まらない紙', '染まる生地', '地は染まらず罫線だけが染まる'],
              ].map(([part, raster, tactile, self]) => (
                <tr key={part} className="border-site-border/60 border-b last:border-0">
                  <td className="py-2 pr-4 font-medium text-site-fg">{part}</td>
                  <td className="py-2 pr-4">{raster}</td>
                  <td className="py-2 pr-4">{tactile}</td>
                  <td className="py-2 text-site-fg">{self}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="max-w-[40rem] text-base leading-[1.9] text-site-muted">
          <strong className="font-medium text-site-fg">
            指で触る画面なら Tactile を選んでください。
          </strong>{' '}
          Flatlay はタッチの下限（44px）を意図的に満たしていません。帳票の密度と両立しないためです。
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium tracking-tight">すべて数値で決まっています</h2>
        <p className="max-w-[40rem] text-base leading-[1.9] text-site-muted">
          「z 軸を持たない」を感覚で運用すると必ず崩れます。目分量で近い値を書かず、
          この値を使ってください。
        </p>
        <NumericRules theme="flatlay" />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium tracking-tight">影は全段が透明です</h2>
        <p className="max-w-[40rem] text-base leading-[1.9] text-site-muted">
          <code className="font-mono text-[0.875em]">sm</code> から{' '}
          <code className="font-mono text-[0.875em]">lg</code> まで、値はすべて{' '}
          <code className="font-mono text-[0.875em]">0 0 #0000</code> です。
          トークンを消さずに透明で残しているのは、
          <strong className="font-medium text-site-fg">
            他テーマ向けに書いたコードがそのまま動く
          </strong>
          ようにするためと、フォーカスリングが{' '}
          <code className="font-mono text-[0.875em]">box-shadow</code>{' '}
          に合成されるためです（段を削ると合成先が消えます）。
        </p>
        <TokenTable theme="flatlay" group="shadow" />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium tracking-tight">角は書類の直角です</h2>
        <p className="max-w-[40rem] text-base leading-[1.9] text-site-muted">
          <code className="font-mono text-[0.875em]">sm</code> と{' '}
          <code className="font-mono text-[0.875em]">md</code> は同じ 2px です。
          ボタンと小さな部品に差を付けないのは、紙を裁った断面に段階が無いからです。 円になるのは{' '}
          <code className="font-mono text-[0.875em]">Radio</code> と{' '}
          <code className="font-mono text-[0.875em]">Avatar</code> の2つだけで、これは
          <strong className="font-medium text-site-fg">形の弁別</strong>
          が角丸の規律より優先する場所です（Radio が Checkbox と同じ形になると、
          複数選べるのか1つだけなのかが形から読めなくなります）。
        </p>
        <TokenTable theme="flatlay" group="radius" />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium tracking-tight">染まるのは罫線だけです</h2>
        <p className="max-w-[40rem] text-base leading-[1.9] text-site-muted">
          Raster は<strong className="font-medium text-site-fg">染まらない紙</strong>、Tactile は
          <strong className="font-medium text-site-fg">染まる生地</strong>でした。Flatlay
          は第3の方式で、 地も文字も無彩（chroma 0）のまま、
          <strong className="font-medium text-site-fg">罫線2本だけ</strong>
          が選んだ色の色相を帯びます （chroma
          0.02〜0.03）。唯一の階層表現である罫線に色を持たせないと、
          色を選んだ実感がどこにも出ないからです。
        </p>
        <blockquote className="border-site-border border-l-2 pl-6 max-w-[40rem] text-base leading-[1.6] text-site-muted">
          {flatlay.designRules.colorRule}
        </blockquote>
        <Preview theme="flatlay">
          <div className="flex w-full flex-col gap-2">
            {['bg', 'subtle', 'surface', 'muted', 'fg'].map((name) => (
              <div key={name} className="flex items-center gap-3">
                <span
                  style={{ background: `var(--novi-color-${name})` }}
                  className="h-6 w-24 border border-[var(--novi-color-border)]"
                />
                <code className="font-mono text-xs text-[var(--novi-color-muted)]">{name}</code>
              </div>
            ))}
            {['border', 'border-strong'].map((name) => (
              <div key={name} className="flex items-center gap-3">
                <span style={{ background: `var(--novi-color-${name})` }} className="h-6 w-24" />
                <code className="font-mono text-xs text-[var(--novi-color-muted)]">
                  {name}（染まる）
                </code>
              </div>
            ))}
          </div>
        </Preview>
        <p className="max-w-[40rem] text-base leading-[1.9] text-site-muted">
          <code className="font-mono text-[0.875em]">border-strong</code> は全 hue で地に対し 3:1
          以上を実測しています。色を替えても罫線が消えないことを、目視ではなく数値で担保しています。
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium tracking-tight">赤がありません</h2>
        <p className="max-w-[40rem] text-base leading-[1.9] text-site-muted">
          カラーセット <strong className="font-medium text-site-fg">Stationery</strong>{' '}
          の8色に赤は入っていません。校正の朱書きはエラーを示す道具なので、赤は{' '}
          <code className="font-mono text-[0.875em]">danger</code> に予約しています。
          <strong className="font-medium text-site-fg">
            primary が danger と紛れる事故を、規則ではなく世界観で防ぐ
          </strong>
          設計です。 <code className="font-mono text-[0.875em]">eraser</code>（hue 352）は
          ピンクの消しゴムであって朱ではありません。
        </p>
        <p className="max-w-[40rem] text-base leading-[1.9] text-site-muted">
          既定が <code className="font-mono text-[0.875em]">fieldbook</code>（測量野帳の緑）
          なのは、Raster の <code className="font-mono text-[0.875em]">ink</code>・Tactile の{' '}
          <code className="font-mono text-[0.875em]">indigo</code>{' '}
          に続く3代連続の藍を避けるためです。
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium tracking-tight">差し色が組で付いてきます</h2>
        <p className="max-w-[40rem] text-base leading-[1.9] text-site-muted">
          色を1つ選ぶと、<code className="font-mono text-[0.875em]">--novi-color-secondary</code>{' '}
          に相方が入ります。複式簿記になぞらえて
          <strong className="font-medium text-site-fg">ダブルエントリー</strong>と呼んでいます。
          片側だけを決めると差し色は「余った色」になりますが、組で決めれば
          <strong className="font-medium text-site-fg">対照そのものが設計の対象</strong>
          になります。8色のうち6色は相互に指し合う3組で、残り2色（
          <code className="font-mono text-[0.875em]">fieldbook</code> と{' '}
          <code className="font-mono text-[0.875em]">ribbon</code>）だけが片方向です。
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-md border-collapse text-sm">
            <thead>
              <tr className="border-site-border border-b text-left">
                <th className="py-2 pr-4 font-medium">色</th>
                <th className="py-2 pr-4 font-medium text-site-muted">hue</th>
                <th className="py-2 pr-4 font-medium text-site-muted">出自</th>
                <th className="py-2 font-medium">相方</th>
              </tr>
            </thead>
            <tbody className="text-site-muted">
              {flatlay.colorSet.map((color) => (
                <tr key={color.id} className="border-site-border/60 border-b last:border-0">
                  <td className="py-2 pr-4 font-medium text-site-fg">
                    {color.name}
                    {color.id === flatlay.defaultColor && (
                      <span className="pl-2 font-mono text-[10px] tracking-[0.14em] text-site-accent">
                        DEFAULT
                      </span>
                    )}
                  </td>
                  <td className="py-2 pr-4 font-mono text-xs">{color.hue}</td>
                  <td className="py-2 pr-4">{color.description}</td>
                  <td className="py-2 text-site-fg">{nameOf.get(color.pair) ?? color.pair}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="max-w-[40rem] text-base leading-[1.9] text-site-muted">
          トーンはテーマが持ちます。どの色を選んでも light は L{flatlay.tone.light.l}% / C
          {flatlay.tone.light.c.toFixed(3)}、dark は L{flatlay.tone.dark.l}% / C
          {flatlay.tone.dark.c.toFixed(3)} です。 実物は{' '}
          <Link href="/docs/lookbook/" className="underline">
            Lookbook
          </Link>
          で見開きにしてあります。
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium tracking-tight">書いてはいけないクラス</h2>
        <p className="max-w-[40rem] text-base leading-[1.9] text-site-muted">
          テーマを触る場合の規律です。CI が機械的に検査しているため、違反するとビルドが落ちます。
          この一覧は検査スクリプトと同じ定義から作られています。
          <code className="font-mono text-[0.875em]">z-index</code> の禁止に例外はありません。
          重なりの順序は DOM 順だけで表します。
        </p>
        <ProhibitedRules theme="flatlay" />
        {flatlay.designRules.exceptions.length > 0 && (
          <>
            <h3 className="pt-8 text-lg font-medium tracking-tight">例外</h3>
            <p className="max-w-[40rem] text-base leading-[1.6] text-site-muted">
              浮くものは <code className="font-mono text-[0.875em]">Modal</code>（全画面）と{' '}
              <code className="font-mono text-[0.875em]">Tooltip</code>
              （付箋）の2つで凍結しています。 Tooltip
              だけが例外なのは、フローに入れた瞬間にレイアウトが動いてポインタが
              トリガーから外れ、出た瞬間に閉じてしまうためです。
            </p>
            <ul className="flex max-w-[40rem] flex-col gap-4 text-base leading-[1.6] text-site-muted">
              {flatlay.designRules.exceptions.map((exception) => (
                <li key={exception.file}>
                  <code className="font-mono text-[0.875em]">{exception.file}</code> は{' '}
                  <code className="font-mono text-[0.875em]">{exception.rules.join(', ')}</code>{' '}
                  のみ許可 — {exception.reason}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium tracking-tight">動きは1本しかありません</h2>
        <p className="max-w-[40rem] text-base leading-[1.9] text-site-muted">
          速度は <strong className="font-medium text-site-fg">100ms の1本</strong>で、
          イージングも1本です。段階を持たないのは、速度差が「遠くから来た」「近くで動いた」
          という奥行きの言い方だからです。
          <strong className="font-medium text-site-fg">展開と格納はアニメーションしません。</strong>
          開いた瞬間に後続が下がり、閉じた瞬間に戻ります。高さを補間すると、
          その間だけ紙が伸び縮みする物体に見えます。
        </p>
        <p className="max-w-[40rem] text-base leading-[1.9] text-site-muted">
          押下は<strong className="font-medium text-site-fg">反転</strong>です。面の色と文字の色が
          入れ替わり、離すと戻ります。スタンプを押した跡の見え方で、要素が 1px
          も動かなくても押下が伝わります。 沈む（Tactile）にも色の変化だけ（Raster）にも
          寄せていない第3の形です。
        </p>
        <p className="max-w-[40rem] text-base leading-[1.9] text-site-muted">
          <code className="font-mono text-[0.875em]">transform</code> を使えるのは{' '}
          <code className="font-mono text-[0.875em]">Spinner</code>{' '}
          の回転だけです。代替（点滅・バーの往復）は処理中であることの視認性か情報量で必ず劣り、
          待たされている人にとっては世界観よりも「動いていると分かること」が先だと判断しました。
          <code className="font-mono text-[0.875em]">prefers-reduced-motion</code>{' '}
          が有効なときはその回転も止まります。
        </p>
        <TokenTable theme="flatlay" group="motion" />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium tracking-tight">印刷しても欠けません</h2>
        <p className="max-w-[40rem] text-base leading-[1.9] text-site-muted">
          z 軸を捨てたことの配当がここに出ます。浮く overlay
          は印刷すると紙の外に落ちるか、下の内容に重なって両方読めなくなります。Flatlay
          の展開はフローの一部なので、
          <strong className="font-medium text-site-fg">
            開いたまま印刷しても後続を押し下げた状態で紙に載ります
          </strong>
          。 これは副産物ではなく、印刷される画面（帳票・伝票・見積）を想定した設計上の狙いです。
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium tracking-tight">値を変えたいとき</h2>
        <p className="max-w-[40rem] text-base leading-[1.9] text-site-muted">
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
