import type {
  modalRequiredSlots,
  modalSlots,
  NoviRadius,
  NoviSize,
  SlotMap,
  VariantMap,
} from '@novi-ui/core'
import { tv } from 'tailwind-variants'
import { focusRing } from '../styles/focus-ring'

/**
 * Tactile の Modal は **下端から出るボトムシート**（architecture.md §5 テーマB）。
 *
 * Raster との構造差:
 * - 中央配置 → 画面下端に張り付く（`items-end`）
 * - ヘッダー行に ✕ → **フッターのフルワイドボタン**（親指の届く位置に出口を置く）
 * - 上下すべて角丸 → **上端だけ角丸**（下から出てきた紙という形）
 * - 影は下向き → **上向き**（下端から来る面には上から光が当たる）
 */
const slots = {
  backdrop: [
    // items-end が「下から出る」の全て。Raster は place-items-center
    'fixed inset-0 z-50 flex items-end justify-center',
    'bg-[var(--novi-color-overlay)]',
    'data-[entering]:motion-safe:animate-[novi-fade-in_200ms_ease-out]',
  ].join(' '),
  panel: [
    'text-[var(--novi-color-fg)]',
    'w-full outline-none',
    'bg-[var(--novi-color-surface)]',
    'shadow-[var(--novi-shadow-lg)]',
    'overflow-auto',
    // 下端の余白はホームインジケータぶんを足す。env() の第2引数で
    // safe-area の無い環境（デスクトップ）では 0 に落ちる（AC-10-3 / FR-13）
    'pb-[env(safe-area-inset-bottom,0px)]',
    // 横向きではノッチが左右に来る。面は画面幅いっぱいのまま、中身だけを内側へ寄せる
    'pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]',
    // 下から せり上がる。260ms は移動距離に見合う時間（120ms では瞬間移動に見える）
    'data-[entering]:motion-safe:animate-[novi-slide-up_260ms_var(--novi-ease-emphasized)]',
  ].join(' '),
  // header は描画しない（任意 slot の省略）。title だけが body の上に載る
  title: [
    // 下だけ gap トークンなのは、この余白が「見出しと本文の距離」そのものだから。
    // 面の余白（surface-y）で開けると、見出しが本文から切り離されて別の区画に見える
    'px-[var(--novi-pad-surface-x)] pt-[var(--novi-pad-surface-y)] pb-[var(--novi-gap-inline)]',
    'text-[length:var(--novi-text-lg)] font-bold',
    'font-[family-name:var(--novi-font-heading)]',
    'tracking-[var(--novi-tracking-tight)] leading-[var(--novi-leading-heading)]',
    'text-[var(--novi-color-fg)]',
  ].join(' '),
  closeButton: [
    // フルワイド。指がどこに落ちても当たる
    'w-full h-14 grid place-items-center',
    'text-[length:var(--novi-text-base)] font-bold',
    'text-[var(--novi-color-fg)]',
    'bg-[var(--novi-color-subtle)]',
    'rounded-[var(--novi-radius-md)]',
    'transition-[background-color,scale] duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
    'data-[pressed]:scale-[0.97] motion-reduce:data-[pressed]:scale-100',
    focusRing,
  ].join(' '),
  body: [
    'px-[var(--novi-pad-surface-x)] pb-[var(--novi-pad-surface-y)] pt-1',
    'text-[var(--novi-color-fg)] leading-[var(--novi-leading-body)]',
  ].join(' '),
  // 縦積み。横並びだと1つあたりの幅が指に対して狭くなる。
  // ボタン列は1つの塊なので gap は inline。stack まで開けると別々の操作に見える
  footer: [
    'flex flex-col gap-[var(--novi-gap-inline)]',
    'px-[var(--novi-pad-surface-x)] pb-[var(--novi-pad-surface-y)]',
  ].join(' '),
} satisfies SlotMap<typeof modalSlots, (typeof modalRequiredSlots)[number]>

/**
 * 全幅シートに幅の段階は存在しないため、`size` は**最大高**として解釈する（ADR-T3）。
 * 語彙は共通、解釈はテーマの自由（ADR-06）。
 */
const size: VariantMap<NoviSize | 'full', { panel: string }> = {
  sm: { panel: 'max-h-[40dvh]' },
  md: { panel: 'max-h-[60dvh]' },
  lg: { panel: 'max-h-[80dvh]' },
  full: { panel: 'max-h-[100dvh] h-[100dvh]' },
}

/** 下端は画面に接しているので、角丸は上端だけに効く。 */
const radius: VariantMap<NoviRadius, { panel: string }> = {
  none: { panel: 'rounded-t-[var(--novi-radius-none)]' },
  sm: { panel: 'rounded-t-[var(--novi-radius-sm)]' },
  md: { panel: 'rounded-t-[var(--novi-radius-md)]' },
  lg: { panel: 'rounded-t-[var(--novi-radius-lg)]' },
  full: { panel: 'rounded-t-[var(--novi-radius-full)]' },
}

/**
 * Modal のスタイル定義。
 *
 * @example
 * import { modalStyles } from '@novi-ui/tactile'
 * import { tv } from 'tailwind-variants'
 *
 * const myModal = tv({ extend: modalStyles, slots: { panel: 'max-h-[50dvh]' } })
 */
export const modalStyles = tv({
  slots,
  variants: { size, radius },
  defaultVariants: { size: 'md', radius: 'lg' },
})

export type ModalStyleProps = Parameters<typeof modalStyles>[0]

/**
 * シート上端の掴み手。**装飾であり slot ではない**（architecture.md §5 の運用）。
 *
 * ドラッグ開閉は MVP の対象外（NG6）なので、掴めそうに見せすぎない。
 * 細く低コントラストにして「シートの上端」を示す線に留める。
 */
export const grabberClass = [
  'mx-auto mt-2 mb-1 h-1 w-9 shrink-0',
  'rounded-[var(--novi-radius-full)]',
  'bg-[var(--novi-color-border)]',
].join(' ')
