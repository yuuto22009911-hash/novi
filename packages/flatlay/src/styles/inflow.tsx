'use client'

import { inflowPortalProps } from '@novi-ui/core/client'
import {
  type ReactNode,
  type RefObject,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { OverlayTriggerStateContext, Popover } from 'react-aria-components'

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
 * - `z-auto!`        上流は `z-index: 100000` を書く。層を持たないので剥がす
 * - `max-h-none!`    上流は viewport 収まりで高さを刻むが、フローなら刻む理由がない
 * - `w-auto!`        トリガ幅の計算値を捨て、中身とレイアウトに任せる
 * - `transform-none!` 出現時の変形も打ち消す。動きで飾らない（FR-11）
 */
const INFLOW_POPOVER_RESET = 'static! z-auto! max-h-none! w-auto! transform-none!'

/**
 * 開いた瞬間に画面外へはみ出していれば最小限だけスクロールし、
 * **そのスクロールで自分が閉じないようにする。**
 *
 * インフロー展開は下方向に伸びるので、ページ末尾のトリガでは中身が折り返しの外に出る。
 * `block: 'nearest'` なのは意図で、`'center'` や `'start'` はトリガまで動かしてしまい、
 * 「押し下げた」という因果が見えなくなる。**見えるところまでしか動かさない。**
 *
 * 見張りを先に張るのは、上流（`useCloseOnScroll`）が非モーダル Popover を
 * スクロールで閉じるから。アンカー型なら正しい判断だが、インフロー展開は
 * 文書と一緒に動くのでずれようがない。自前のスクロールで即座に閉じてしまうし、
 * 長い一覧を読むために送っただけで畳まれるのはモデルの否定になる。
 *
 * 捕捉リスナは上流より先に登録される（子の effect が先に走る）ので、
 * 上流が `close` を呼ぶ時点では必ず旗が立っている。
 *
 * 押している最中は動かさず、離すまで待つ。Select は押し下げたまま項目へ滑らせて
 * 離す操作を受けるので、指の下でページが動くとそのまま誤選択になる。
 *
 * Popover は閉じている間アンマウントされるので、この効果は開閉ごとに1度だけ走る。
 */
function InflowScroll({
  target,
  scrolling,
  pressed,
}: {
  target: HTMLElement
  scrolling: RefObject<boolean>
  pressed: RefObject<boolean>
}): null {
  useEffect(() => {
    const raise = () => {
      scrolling.current = true
      // 上流のリスナは同じイベントの中で走る。タスクを跨いだ時点で降ろす
      setTimeout(() => {
        scrolling.current = false
      }, 0)
    }
    const scroll = () => target.scrollIntoView({ block: 'nearest' })

    window.addEventListener('scroll', raise, true)
    if (pressed.current) window.addEventListener('pointerup', scroll, { once: true, capture: true })
    else scroll()

    return () => {
      window.removeEventListener('scroll', raise, true)
      window.removeEventListener('pointerup', scroll, true)
    }
  }, [target, scrolling, pressed])
  return null
}

/**
 * ポインタが押されている間だけ立つ旗。
 *
 * 展開は pointerdown で始まるので、押されたことを知るには**開く前から**張っておく
 * 必要がある。`InflowPopover` 自体は閉じている間も生きているのでここに置ける。
 */
function usePressed(): RefObject<boolean> {
  const pressed = useRef(false)

  useEffect(() => {
    const down = () => {
      pressed.current = true
    }
    const up = () => {
      pressed.current = false
    }
    window.addEventListener('pointerdown', down, true)
    window.addEventListener('pointerup', up, true)
    window.addEventListener('pointercancel', up, true)
    return () => {
      window.removeEventListener('pointerdown', down, true)
      window.removeEventListener('pointerup', up, true)
      window.removeEventListener('pointercancel', up, true)
    }
  }, [])

  return pressed
}

/**
 * スクロール中に来た `close` だけを捨てる状態を作る。
 *
 * 上流には close-on-scroll を切る口が無い（`isNonModal` と抱き合わせ）。
 * Escape・外側クリック・選択による `close` はそのまま通す。
 */
function useScrollGuardedState(scrolling: RefObject<boolean>) {
  const state = useContext(OverlayTriggerStateContext)

  return useMemo(
    () =>
      state === null
        ? null
        : {
            ...state,
            close: () => {
              if (!scrolling.current) state.close()
            },
          },
    [state, scrolling],
  )
}

export interface InflowPopoverProps {
  children: ReactNode
  /** 展開部そのものに乗せるクラス。枠線や余白はテーマ側の styles が渡す。 */
  className?: string
  /**
   * 展開面に出す `data-slot`。押し下げ面は slot 契約上の `popover` そのものなので、
   * 名前は呼び出し側（各コンポーネント）が決める。
   */
  dataSlot?: string
}

/**
 * Select / Menu / Popover の展開部をフローに置くための包み。
 *
 * `isNonModal` は必須。モーダルにすると背後が inert になり、
 * 「押し下げられた後続」を読むことも触ることもできなくなって、
 * インフローにした意味が消える。
 */
export function InflowPopover({ children, className, dataSlot }: InflowPopoverProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null)
  const scrolling = useRef(false)
  const pressed = usePressed()
  const state = useScrollGuardedState(scrolling)

  return (
    <>
      {/* 展開部の置き場所。閉じている間は高さ 0 で、押し下げは起きない */}
      <div ref={setContainer} data-novi-inflow="" />
      {container !== null && (
        <OverlayTriggerStateContext.Provider value={state}>
          <Popover
            isNonModal
            {...inflowPortalProps(container)}
            data-slot={dataSlot}
            className={
              className === undefined
                ? INFLOW_POPOVER_RESET
                : `${INFLOW_POPOVER_RESET} ${className}`
            }
          >
            <InflowScroll target={container} scrolling={scrolling} pressed={pressed} />
            {children}
          </Popover>
        </OverlayTriggerStateContext.Provider>
      )}
    </>
  )
}
