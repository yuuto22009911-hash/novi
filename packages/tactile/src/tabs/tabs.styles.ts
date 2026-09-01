import type {
  NoviSize,
  NoviVariant,
  SlotMap,
  tabsRequiredSlots,
  tabsSlots,
  VariantMap,
} from '@novi-ui/core'
import { tv } from 'tailwind-variants'
import { focusRing } from '../styles/focus-ring'

/**
 * Tactile の Tabs は**セグメンテッドコントロール**（Raster は下線1本）。
 *
 * 構造差の要点:
 * - `list` が**塗られたトラック**になる（Raster は下辺の罫線だけ）
 * - `indicator` が**実体を持つ塗り面**として選択中のタブに重なる（Raster は描画しない）
 * - タブは「線の上の文字」ではなく「トラックに沈んだ区画」になる
 *
 * 指で切り替える前提なので、どこが押せる範囲かが面で分かる必要がある。
 * 下線1本は視線には十分でも、指には「どこまでが自分の区画か」を伝えない。
 */
const slots = {
  // トラックとパネルは別の区画。ここを詰めると、どのタブの中身なのかが読めなくなる
  root: 'flex flex-col gap-[var(--novi-gap-stack)]',
  list: [
    'flex gap-1 w-fit',
    'bg-[var(--novi-color-subtle)]',
    'rounded-[var(--novi-radius-md)]',
    'p-1',
  ].join(' '),
  tab: [
    // indicator を内側に置くため、位置の基準を作る
    'relative isolate cursor-pointer outline-none whitespace-nowrap',
    'flex items-center justify-center',
    'text-[var(--novi-color-muted)]',
    'rounded-[var(--novi-radius-sm)]',
    'transition-[color,scale] duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
    'data-[pressed]:scale-[0.97] motion-reduce:data-[pressed]:scale-100',
    'hover:text-[var(--novi-color-fg)]',
    'data-[selected]:text-[var(--novi-color-fg)]',
    'data-[selected]:font-bold',
    'data-[disabled]:opacity-40 data-[disabled]:cursor-default',
    focusRing,
  ].join(' '),
  // 選択中のタブの内側に敷かれる面。トラックから1段持ち上がって見える
  indicator: [
    'absolute inset-0 -z-10',
    'bg-[var(--novi-color-surface)]',
    'rounded-[var(--novi-radius-sm)]',
    'shadow-[var(--novi-shadow-sm)]',
  ].join(' '),
  panel: 'outline-none text-[var(--novi-color-fg)] leading-[var(--novi-leading-body)]',
} satisfies SlotMap<typeof tabsSlots, (typeof tabsRequiredSlots)[number]>

const variant: VariantMap<NoviVariant, { list: string; indicator: string }> = {
  solid: { list: 'bg-[var(--novi-color-subtle)]', indicator: '' },
  outline: {
    list: 'bg-transparent ring-1 ring-[var(--novi-color-border)]',
    indicator: 'shadow-[var(--novi-shadow-none)] ring-1 ring-[var(--novi-color-border-strong)]',
  },
  soft: { list: 'bg-[var(--novi-color-subtle)]', indicator: 'shadow-[var(--novi-shadow-none)]' },
  ghost: {
    list: 'bg-transparent p-0 gap-[var(--novi-gap-inline)]',
    indicator: 'bg-[var(--novi-color-subtle)] shadow-[var(--novi-shadow-none)]',
  },
  plain: {
    // トラックが無いぶん、区画の境目は距離だけで示す
    list: 'bg-transparent p-0 gap-[var(--novi-gap-stack)]',
    indicator: 'bg-transparent shadow-[var(--novi-shadow-none)]',
  },
}

/** どの段でもタップ下限を割らない。トラックの内側なので上下の余白も確保する。 */
const size: VariantMap<NoviSize, { tab: string }> = {
  sm: { tab: 'h-10 px-[var(--novi-pad-control-x-sm)] text-[length:var(--novi-text-sm)]' },
  md: { tab: 'h-12 px-[var(--novi-pad-control-x-md)] text-[length:var(--novi-text-base)]' },
  lg: { tab: 'h-14 px-[var(--novi-pad-control-x-lg)] text-[length:var(--novi-text-base)]' },
}

/**
 * Tabs のスタイル定義。
 *
 * @example
 * import { tabsStyles } from '@novi-ui/tactile'
 * import { tv } from 'tailwind-variants'
 *
 * const myTabs = tv({ extend: tabsStyles, slots: { list: 'w-full' } })
 */
export const tabsStyles = tv({
  slots,
  variants: { size, variant },
  defaultVariants: { size: 'md', variant: 'solid' },
})

export type TabsStyleProps = Parameters<typeof tabsStyles>[0]
