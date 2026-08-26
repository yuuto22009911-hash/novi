'use client'

import { inflowPortalProps } from '@novi-ui/core/client'
import { type ReactNode, useEffect, useState } from 'react'
import { Popover } from 'react-aria-components'

/**
 * オーバーレイをドキュメントフローの中に展開する（FR-05 / FR-09）。
 *
 * Flatlay は z 軸を持たない。**開く = 場所を取る**。Select も Menu も Popover も、
 * 開いたら後続を押し下げる。浮いてこないので「どこかが隠れている」が起きない。
 *
 * 実装は **Popover を捨てず、置き場所だけ変える**。理由はスパイクで2案を潰したから:
 * - 開いた時だけ中身をマウントする → Select のコレクションが空になり、そもそも開かない
 * - 常時マウントして hidden で隠す → 閉じている間 option が描画されず、
 *   開いた瞬間のフォーカス初期化とトリガの keydown 分岐が Popover 前提で壊れる
 *
 * `INFLOW_PORTAL_PROP`（core が封じ込めた上流の不安定 prop）でトリガ直後の
 * フロー内コンテナへポータルし、`useOverlayPosition` が書き込むインラインの
 * `position: absolute / top / left` を `static!` で無効化する。
 * FocusScope・キーボード操作・コレクション・Escape・フォーカス復帰は
 * すべて RAC 本来の経路のまま生き、**描画位置だけがフローに落ちる**。
 */

/**
 * 上流が書き込むインラインスタイルを打ち消す。**`!` はここでの必需品。**
 *
 * `useOverlayPosition` は `style` 属性に直接書き込むため、クラスの詳細度では勝てない。
 * - `static!`        浮かせない。フローに戻す（これが原理そのもの）
 * - `max-h-none!`    上流は viewport 収まりで高さを刻むが、フローなら刻む理由がない
 * - `w-auto!`        トリガ幅の計算値を捨て、中身とレイアウトに任せる
 * - `transform-none!` 出現時の変形も打ち消す。動きで飾らない（FR-11）
 */
const INFLOW_POPOVER_RESET = 'static! max-h-none! w-auto! transform-none!'

/**
 * 開いた瞬間に、展開部が画面外へはみ出していれば最小限だけスクロールする。
 *
 * インフロー展開は下方向に伸びるので、ページ末尾のトリガでは中身が折り返しの外に出る。
 * `block: 'nearest'` なのは意図で、`'center'` や `'start'` はトリガまで動かしてしまい、
 * 「押し下げた」という因果が見えなくなる。**見えるところまでしか動かさない。**
 *
 * Popover は閉じている間アンマウントされるので、この効果は開閉ごとに1度だけ走る。
 */
function ScrollIntoView({ target }: { target: HTMLElement }): null {
  useEffect(() => {
    target.scrollIntoView({ block: 'nearest' })
  }, [target])
  return null
}

export interface InflowPopoverProps {
  children: ReactNode
  /** 展開部そのものに乗せるクラス。枠線や余白はテーマ側の styles が渡す。 */
  className?: string
}

/**
 * Select / Menu / Popover の展開部をフローに置くための包み。
 *
 * `isNonModal` は必須。モーダルにすると背後が inert になり、
 * 「押し下げられた後続」を読むことも触ることもできなくなって、
 * インフローにした意味が消える。
 */
export function InflowPopover({ children, className }: InflowPopoverProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null)

  return (
    <>
      {/* 展開部の置き場所。閉じている間は高さ 0 で、押し下げは起きない */}
      <div ref={setContainer} data-novi-inflow="" />
      {container !== null && (
        <Popover
          isNonModal
          {...inflowPortalProps(container)}
          className={
            className === undefined ? INFLOW_POPOVER_RESET : `${INFLOW_POPOVER_RESET} ${className}`
          }
        >
          <ScrollIntoView target={container} />
          {children}
        </Popover>
      )}
    </>
  )
}
