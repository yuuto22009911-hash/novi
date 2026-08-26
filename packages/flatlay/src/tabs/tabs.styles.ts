import type {
  NoviSize,
  NoviVariant,
  SlotMap,
  tabsRequiredSlots,
  tabsSlots,
  VariantMap,
} from '@novi-ui/core'
import { tv } from 'tailwind-variants'
import { disabledState, focusRing } from '../styles/focus-ring'

/**
 * Flatlay の Tabs は**地続きタブ**（Raster は下線1本・Tactile はセグメンテッド）。
 *
 * 選ばれているタブとパネルが**1枚の紙**になる。タブは見出し列の下辺罫線に 1px 重なり、
 * その 1px を地色で塗って罫線に**切れ目**を作る。切れ目の向こう側がパネルなので、
 * 「いまどれを見ているか」を浮かせずに示せる。
 *
 * 構造差の要点:
 * - `root` に gap を置かない。離すと罫線が繋がらず、別の面になってしまう
 * - `indicator` は**描かない**。切れ目は罫線であって面ではないので、
 *   実体を持つ要素にすると「上に乗った何か」に見える（Tactile の塗り面がまさにそれ）
 * - `panel` が三辺の罫線を持ち、上辺だけは見出し列の罫線と共有する
 *
 * 影も z-index も使えないので、階層はこの一続きの罫線だけで表す。
 */
const slots = {
  // 見出しとパネルは地続き。間に余白を入れた時点で罫線が切れて別の面になる
  root: 'flex flex-col',
  list: 'flex',
  tab: [
    'flex items-center justify-center whitespace-nowrap cursor-pointer select-none',
    'text-[var(--novi-color-muted)] hover:text-[var(--novi-color-fg)]',
    // 罫線の幅は全 variant が持つ。色は variant が決める
    'border border-transparent',
    // 見出し列の下辺罫線に 1px 重ねる。選択中はこの 1px を地色で塗って切れ目にする
    '-mb-px',
    'data-[selected]:text-[var(--novi-color-fg)] data-[selected]:font-medium',
    // 押下は反転スタンプ（ADR-F3）。他のコンポーネントと同じ手応えにする
    'data-[pressed]:bg-[var(--novi-color-fg)] data-[pressed]:text-[var(--novi-color-bg)]',
    'transition-[background-color,border-color,color]',
    'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
    focusRing,
    disabledState,
  ].join(' '),
  // 切れ目は罫線に空ける穴なので、描く要素を持たない（Tactile との決定的な差）
  indicator: 'hidden',
  panel: 'outline-none text-[var(--novi-color-fg)]',
} satisfies SlotMap<typeof tabsSlots, (typeof tabsRequiredSlots)[number]>

/**
 * variant が決めるのは**罫線の強さと、切れ目の向こうに何色の紙があるか**。
 *
 * `ghost` / `plain` で囲みが消えるのは他のコンポーネントと同じ方針。
 * ただし `ghost` は切れ目だけ残す。囲みが無くても「そこだけ罫線が抜けている」は成立する。
 */
const variant: VariantMap<NoviVariant, { list: string; tab: string; panel: string }> = {
  solid: {
    list: 'border-b border-[var(--novi-color-border-strong)]',
    tab: [
      'data-[selected]:border-[var(--novi-color-border-strong)]',
      'data-[selected]:border-b-[var(--novi-color-bg)]',
      'data-[selected]:bg-[var(--novi-color-bg)]',
    ].join(' '),
    panel: 'border-x border-b border-[var(--novi-color-border-strong)]',
  },
  outline: {
    list: 'border-b border-[var(--novi-color-border)]',
    tab: [
      'data-[selected]:border-[var(--novi-color-border)]',
      'data-[selected]:border-b-[var(--novi-color-bg)]',
      'data-[selected]:bg-[var(--novi-color-bg)]',
    ].join(' '),
    panel: 'border-x border-b border-[var(--novi-color-border)]',
  },
  soft: {
    list: 'border-b border-[var(--novi-color-border)]',
    tab: [
      'data-[selected]:border-[var(--novi-color-border)]',
      'data-[selected]:border-b-[var(--novi-color-subtle)]',
      'data-[selected]:bg-[var(--novi-color-subtle)]',
    ].join(' '),
    panel: 'border-x border-b border-[var(--novi-color-border)] bg-[var(--novi-color-subtle)]',
  },
  ghost: {
    list: 'border-b border-[var(--novi-color-border)]',
    tab: 'hover:bg-[var(--novi-color-subtle)] data-[selected]:border-b-[var(--novi-color-bg)]',
    panel: 'p-0 pt-4',
  },
  plain: {
    list: 'border-b border-transparent',
    tab: '',
    panel: 'p-0 pt-4',
  },
}

/**
 * 見出しの高さは 28 / 32 / 40px（Button と同じ帳票の行）。
 *
 * パネルの余白も段で動かす。囲みの中の余白なので、行の高さと揃っていないと
 * 「紙が一続き」に見えない。
 */
const size: VariantMap<NoviSize, { tab: string; panel: string }> = {
  sm: { tab: 'h-7 px-3 text-[length:var(--novi-text-sm)]', panel: 'p-3' },
  md: { tab: 'h-8 px-4 text-[length:var(--novi-text-base)]', panel: 'p-4' },
  lg: { tab: 'h-10 px-5 text-[length:var(--novi-text-base)]', panel: 'p-5' },
}

/**
 * Tabs のスタイル定義。
 *
 * @example
 * import { tabsStyles } from '@novi-ui/flatlay'
 * import { tv } from 'tailwind-variants'
 *
 * const myTabs = tv({ extend: tabsStyles, slots: { list: 'w-full' } })
 */
export const tabsStyles = tv({
  slots,
  // `variant` は最後に宣言する。先に書くと size のクラスに負ける（申し送り6）
  variants: { size, variant },
  defaultVariants: { size: 'md', variant: 'solid' },
})

export type TabsStyleProps = Parameters<typeof tabsStyles>[0]
