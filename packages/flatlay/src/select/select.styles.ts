import type {
  NoviRadius,
  NoviSize,
  NoviVariant,
  SlotMap,
  selectRequiredSlots,
  selectSlots,
  VariantMap,
} from '@novi-ui/core'
import { tv } from 'tailwind-variants'
import { disabledState, focusRing } from '../styles/focus-ring'
import { mono } from '../styles/mono'

/**
 * Flatlay の Select は **インフロー押し下げ**（design.md 着手条件2）。
 *
 * Raster はトリガーの隣に浮き、Tactile は画面下端のシートで出る。Flatlay には
 * 浮かせる先が無いので、**展開部はフローの中に生えて後続を押し下げる**。
 * 配置そのものは `styles/inflow.tsx` が担い、ここは面の見た目だけを決める。
 *
 * 影が使えない以上、展開面が「面である」ことを示せるのは罫線だけ。
 * 全 slot が幅のある線を持ち、行の切れ目も線で示す。
 */
const slots = {
  root: [
    'flex flex-col gap-1.5',
    // 展開部の置き場所（`data-novi-inflow`）は閉じている間も残る。flex の gap は
    // 空の子にも掛かるので、畳まないと閉じたまま余白が 1 つ増える
    '[&>[data-novi-inflow]:empty]:hidden',
  ].join(' '),
  label: 'text-[length:var(--novi-text-sm)] font-medium text-[var(--novi-color-fg)]',
  trigger: [
    'flex items-center justify-between gap-2 w-full text-left',
    'text-[var(--novi-color-fg)]',
    // 罫線の幅は全 variant が持つ。色は variant が決める（Button と同じ型）
    'border',
    'rounded-[var(--novi-radius-sm)]',
    // 押下は反転。開閉という状態は矢印が持ち、押した瞬間だけを面が返す（ADR-F3）
    'data-[pressed]:bg-[var(--novi-color-fg)] data-[pressed]:text-[var(--novi-color-bg)]',
    'group-data-[invalid]:border-[var(--novi-color-danger)]',
    'transition-[background-color,border-color,color]',
    'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
    focusRing,
    disabledState,
  ].join(' '),
  value: 'truncate data-[placeholder]:text-[var(--novi-color-muted)]',
  // 開閉の向きは記号で示す。回すのは z 軸の語彙なので、字を差し替える（FR-11）
  icon: `shrink-0 leading-none text-[var(--novi-color-muted)] ${mono}`,
  popover: [
    // ここが構造差そのもの。浮かないので、面の存在は罫線が引き受ける
    'border border-[var(--novi-color-border-strong)]',
    'bg-[var(--novi-color-bg)] text-[var(--novi-color-fg)]',
    'rounded-[var(--novi-radius-sm)]',
    'overflow-hidden',
  ].join(' '),
  // 行の切れ目も線。押し下げた面の中で、どこまでが 1 行かを示せるのはこれだけ
  listbox: 'outline-none flex flex-col divide-y divide-[var(--novi-color-border)]',
  option: [
    'flex items-center gap-2 px-2 cursor-pointer outline-none',
    'text-[var(--novi-color-fg)]',
    'data-[focused]:bg-[var(--novi-color-subtle)]',
    'data-[selected]:font-medium',
    'transition-[background-color,color]',
    'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
    disabledState,
  ].join(' '),
  description: 'text-[length:var(--novi-text-sm)] text-[var(--novi-color-muted)]',
  errorMessage: 'text-[length:var(--novi-text-sm)] text-[var(--novi-color-danger)]',
} satisfies SlotMap<typeof selectSlots, (typeof selectRequiredSlots)[number]>

/**
 * `size` はトリガーの寸法と行の密度。**どちらも帳票の行**（Tactile は指の下限 48px）。
 *
 * 展開しても 1 行が 28px 前後に収まるので、押し下げ量が読める範囲に留まる。
 * 行を大きくすると、開いた瞬間にページが視界の外まで伸びる。
 */
const size: VariantMap<NoviSize, { trigger: string; option: string }> = {
  sm: {
    trigger: 'h-7 px-2.5 text-[length:var(--novi-text-sm)]',
    option: 'h-6 text-[length:var(--novi-text-sm)]',
  },
  md: {
    trigger: 'h-8 px-3 text-[length:var(--novi-text-base)]',
    option: 'h-7 text-[length:var(--novi-text-base)]',
  },
  lg: {
    trigger: 'h-10 px-4 text-[length:var(--novi-text-base)]',
    option: 'h-8 text-[length:var(--novi-text-base)]',
  },
}

const radius: VariantMap<NoviRadius, { trigger: string }> = {
  none: { trigger: 'rounded-[var(--novi-radius-none)]' },
  sm: { trigger: 'rounded-[var(--novi-radius-sm)]' },
  md: { trigger: 'rounded-[var(--novi-radius-md)]' },
  lg: { trigger: 'rounded-[var(--novi-radius-lg)]' },
  full: { trigger: 'rounded-[var(--novi-radius-full)]' },
}

/**
 * トリガーの面の持ち方。Select は `color` を受け取らないので、
 * Button のようなローカル変数は要らず、中立トークンだけで書ける。
 */
const variant: VariantMap<NoviVariant, { trigger: string }> = {
  solid: { trigger: 'bg-[var(--novi-color-surface)] border-[var(--novi-color-border-strong)]' },
  outline: { trigger: 'bg-transparent border-[var(--novi-color-border-strong)]' },
  soft: { trigger: 'bg-[var(--novi-color-subtle)] border-[var(--novi-color-border)]' },
  ghost: {
    trigger: 'bg-transparent border-transparent hover:bg-[var(--novi-color-subtle)]',
  },
  plain: {
    trigger: 'bg-transparent border-transparent px-0 underline underline-offset-4',
  },
}

/**
 * Select のスタイル定義。
 *
 * 展開部の位置は `InflowPopover` が `!` 付きのリセットで固定するので、
 * ここで `position` 系を書いても効かない（書く必要も無い）。
 *
 * @example
 * import { selectStyles } from '@novi-ui/flatlay'
 * import { tv } from 'tailwind-variants'
 *
 * const mySelect = tv({ extend: selectStyles, slots: { option: 'px-4' } })
 */
export const selectStyles = tv({
  slots,
  // `variant` は最後に宣言する。先に書くと size のクラスに負ける（申し送り6）
  variants: { size, radius, variant },
  defaultVariants: { size: 'md', radius: 'sm', variant: 'solid' },
})

export type SelectStyleProps = Parameters<typeof selectStyles>[0]

/**
 * 選択済みの印が立つ場所。**幅を常に確保する**ので、選ぶ前後で行がずれない。
 *
 * チェックマーク（両テーマ）ではなく帳票のインデックス記号にしているのは、
 * 記号そのものが等幅の列として読めるから。`1ch` は mono の 1 文字ぶん。
 */
export const optionMarkerClass = `w-[1ch] shrink-0 text-[var(--novi-color-primary)] ${mono}`
