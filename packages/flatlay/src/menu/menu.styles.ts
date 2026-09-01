import type { menuRequiredSlots, menuSlots, SlotMap } from '@novi-ui/core'
import { tv } from 'tailwind-variants'
import { disabledState } from '../styles/focus-ring'
import { mono, monoNumeric } from '../styles/mono'

/**
 * Flatlay の Menu は **インフロー押し下げ**（FR-05）。
 *
 * 両テーマはトリガーの隣（Raster）か画面下端（Tactile）に浮かせるが、Flatlay には
 * 浮かせる先が無い。**一覧はトリガーの直後に生えて後続を押し下げる**。
 * 配置は `styles/inflow.tsx` が担い、ここは面の見た目だけを決める。
 *
 * `placement` / `offset` は受け取るが効かない。浮かないものに寄せる先は無い。
 */
const slots = {
  trigger: 'outline-none',
  popover: [
    // 影が無い以上、面の存在を示せるのは罫線だけ
    'min-w-40 outline-none',
    'border border-[var(--novi-color-border-strong)]',
    'bg-[var(--novi-color-bg)] text-[var(--novi-color-fg)]',
    'rounded-[var(--novi-radius-sm)]',
    'overflow-hidden',
  ].join(' '),
  // 行の切れ目も線。Select の一覧と同じ帳票の目
  list: 'outline-none flex flex-col divide-y divide-[var(--novi-color-border)]',
  item: [
    // 一覧の行は面ではなく行。左右は面の余白（20px）ではなくコントロールの刻みで取る
    'flex items-center justify-between gap-[var(--novi-gap-inline)]',
    'min-h-7 px-[var(--novi-pad-control-x-sm)] py-1 cursor-pointer outline-none',
    'text-[var(--novi-color-fg)]',
    'data-[focused]:bg-[var(--novi-color-subtle)]',
    // 押下は反転スタンプ（ADR-F3）。選ばれた瞬間だけ面が返る
    'data-[pressed]:bg-[var(--novi-color-fg)] data-[pressed]:text-[var(--novi-color-bg)]',
    'transition-[background-color,color]',
    'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
    disabledState,
  ].join(' '),
  itemLabel: 'truncate',
  itemDescription: `text-[length:var(--novi-text-xs)] text-[var(--novi-color-muted)] ${mono}`,
  /**
   * ショートカットは**主役**（FR-10）。
   *
   * 両テーマは muted の小さな注記として右端に添えるが、帳票の世界では
   * 「キーで引ける」ことが操作そのものの見出しになる。本文と同じ濃さ・
   * 同じ大きさで、等幅の列として縦に揃える。
   */
  itemShortcut: `shrink-0 text-[length:var(--novi-text-sm)] text-[var(--novi-color-fg)] ${monoNumeric}`,
  // 行の線より濃い。ここが「まとまりの切れ目」であることを線の濃さで示す
  separator: 'h-px bg-[var(--novi-color-border-strong)]',
  section: 'flex flex-col',
  // 表の見出し行。地を一段落として、浮かせずに階層を作る
  sectionLabel: [
    'px-[var(--novi-pad-control-x-sm)] py-1',
    'bg-[var(--novi-color-subtle)]',
    'text-[length:var(--novi-text-xs)] text-[var(--novi-color-muted)]',
    mono,
  ].join(' '),
} satisfies SlotMap<typeof menuSlots, (typeof menuRequiredSlots)[number]>

/**
 * Menu のスタイル定義。
 *
 * 展開部の位置は `InflowPopover` が `!` 付きのリセットで固定するので、
 * ここで `position` 系を書いても効かない（書く必要も無い）。
 *
 * @example
 * const myMenu = tv({ extend: menuStyles, slots: { popover: 'min-w-56' } })
 */
export const menuStyles = tv({ slots })

export type MenuStyleProps = Parameters<typeof menuStyles>[0]
