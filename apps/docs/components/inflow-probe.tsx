'use client'

import { Select, SelectItem } from '@novi-ui/flatlay'

/**
 * インフロー展開の押し下げを**実寸で**測るための計測面（flatlay T-14）。
 *
 * jsdom はレイアウトを持たないので、単体テストは「押し下げが起こりうる DOM の形か」
 * までしか見られない。何 px 下がったか・閉じて戻ったかはブラウザに聞くしかない。
 *
 * 2 面あるのは測る対象が違うから。
 * - `top`    折り返しの中で開く。後続の Y が増えて、閉じれば戻る
 * - `bottom` 画面の下端で開く。展開が視界の外に出るので、最小限だけ追従する
 */

const SIZES = ['S', 'M', 'L'] as const

function Fixture({ id }: { id: 'top' | 'bottom' }) {
  return (
    <div data-novi-theme="flatlay" data-testid={`probe-${id}`} className="w-64">
      <Select label="サイズ" defaultSelectedKey="M">
        {SIZES.map((size) => (
          <SelectItem key={size} id={size}>
            {size}
          </SelectItem>
        ))}
      </Select>
      {/* 押し下げられる側。この要素の Y の変化が押し下げ量そのもの */}
      <p data-testid={`below-${id}`} className="pt-2 text-sm text-site-muted">
        後続
      </p>
    </div>
  )
}

export function InflowProbe() {
  return (
    <div className="flex flex-col">
      <Fixture id="top" />
      {/* 下の面を折り返しの外へ送る。スクロール追従はここでしか測れない */}
      <div className="h-[120vh]" aria-hidden="true" />
      <Fixture id="bottom" />
      <div className="h-[120vh]" aria-hidden="true" />
    </div>
  )
}
