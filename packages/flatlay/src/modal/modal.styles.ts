import type { modalRequiredSlots, modalSlots, NoviSize, SlotMap, VariantMap } from '@novi-ui/core'
import { tv } from 'tailwind-variants'
import { disabledState, focusRing } from '../styles/focus-ring'
import { heading, mono } from '../styles/mono'

/**
 * Flatlay の Modal は **全画面テイクオーバー**（design.md 着手条件1）。
 *
 * 中央ダイアログ（Raster）・ボトムシート（Tactile）に続く第3の構造。
 * 浮かせる先が無いので「別の面を重ねる」ができない。代わりに**紙ごと差し替える**。
 *
 * `position` 規律の**例外1号**。viewport 全面を占めるには `fixed` が要る。
 * ただし z-index は使わない — ポータル先が body 末尾なので、DOM 順だけで最前になる。
 * ここで z-10 を1つ足した瞬間に「重なりの順序を持つ UI」に変わってしまう（ADR-F2 / FR-06）。
 *
 * 地が暗転しないのも同じ理由。暗転は「背後に何かがある」ことの表現で、
 * それ自体が z 軸の語彙になる。`--novi-color-overlay` は紙色に固定されている。
 */
const slots = {
  // 暗転しないので、backdrop は「覆う膜」ではなく差し替わった紙そのもの
  backdrop: 'fixed inset-0 flex bg-[var(--novi-color-overlay)]',
  panel: [
    'w-full h-full flex flex-col overflow-auto outline-none',
    'bg-[var(--novi-color-bg)] text-[var(--novi-color-fg)]',
  ].join(' '),
  // 書類のヘッダ行。下辺の罫線が「ここから別の文書」を示す唯一の手がかりになる
  header: [
    'shrink-0 flex items-center gap-[var(--novi-gap-inline)]',
    'px-[var(--novi-pad-surface-x)] h-10',
    'border-b border-[var(--novi-color-border-strong)]',
  ].join(' '),
  /**
   * 閉じるは**ヘッダ左端の「← 戻る」**。
   * 右上の ✕（Raster）・フッターのフルワイド（Tactile）に続く第3の位置。
   * ✕ が「閉じて消す」なら、テイクオーバーは前の紙に**戻る**ので矢印になる。
   */
  closeButton: [
    // 負のマージンは左右 padding と同値でなければならない。字が header の左端
    // （= surface-x の基準線）に載らないと、下の本文と列が揃わない
    'shrink-0 inline-flex items-center gap-1.5 h-7',
    'px-[var(--novi-pad-control-x-sm)] -ml-[var(--novi-pad-control-x-sm)]',
    'text-[length:var(--novi-text-sm)] text-[var(--novi-color-muted)]',
    'border border-transparent',
    'hover:text-[var(--novi-color-fg)] hover:bg-[var(--novi-color-subtle)]',
    'data-[pressed]:bg-[var(--novi-color-fg)] data-[pressed]:text-[var(--novi-color-bg)]',
    'transition-[background-color,border-color,color]',
    'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
    focusRing,
    disabledState,
  ].join(' '),
  title: `truncate text-[length:var(--novi-text-base)] font-medium ${heading}`,
  // 本文だけが行長の制限を受ける。`mx-auto` ではなく左寄せなのは、
  // 帳票の本文が紙の左端から始まるため（中央寄せは「作品」の版面設計の言葉）
  body: [
    'grow w-full',
    'px-[var(--novi-pad-surface-x)] py-[var(--novi-pad-surface-y)]',
    'leading-[var(--novi-leading-body)]',
  ].join(' '),
  // 操作行は上辺の罫線で本文と切る。左揃えは header の「← 戻る」と縦の線を合わせるため
  footer: [
    'shrink-0 flex items-center gap-[var(--novi-gap-inline)] w-full',
    'px-[var(--novi-pad-surface-x)] py-[var(--novi-pad-surface-y)]',
    'border-t border-[var(--novi-color-border)]',
  ].join(' '),
} satisfies SlotMap<typeof modalSlots, (typeof modalRequiredSlots)[number]>

/**
 * テイクオーバーでは面積が全画面に固定されるので、幅（Raster）も高さ（Tactile）も
 * 段階を作れない。残るのは**本文の最大行長**で、`size` はそれとして解釈する。
 *
 * 語彙は core が共通で固定し、解釈はテーマの自由（ADR-06）。3例目。
 * footer にも同じ制限を掛けるのは、操作が本文の列から外れると
 * 「どの文書に対する操作か」が読めなくなるため。
 */
const size: VariantMap<NoviSize | 'full', { body: string; footer: string }> = {
  sm: { body: 'max-w-[32rem]', footer: 'max-w-[32rem]' },
  md: { body: 'max-w-[44rem]', footer: 'max-w-[44rem]' },
  lg: { body: 'max-w-[56rem]', footer: 'max-w-[56rem]' },
  full: { body: 'max-w-none', footer: 'max-w-none' },
}

// `radius` は実装しない。全画面を占める面に角は無く、書いても描画に出ない。
// 死ぬコードを置くくらいなら、解釈を持たないことを明示する（README に記載）。

/**
 * Modal のスタイル定義。
 *
 * @example
 * import { modalStyles } from '@novi-ui/flatlay'
 * import { tv } from 'tailwind-variants'
 *
 * const myModal = tv({ extend: modalStyles, slots: { body: 'max-w-[80rem]' } })
 */
export const modalStyles = tv({
  slots,
  variants: { size },
  defaultVariants: { size: 'md' },
})

export type ModalStyleProps = Parameters<typeof modalStyles>[0]

/**
 * 「← 戻る」の矢印。**等幅で出す**（ADR-F7）。
 *
 * SVG ではなく文字なのは、記号そのものが帳票の語彙だから。
 * 等幅にすると、隣に別の記号ボタンが並んだときに幅が揃う。
 */
export const backArrowClass = `shrink-0 ${mono}`
