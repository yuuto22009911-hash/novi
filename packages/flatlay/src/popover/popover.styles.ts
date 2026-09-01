import type {
  NoviRadius,
  popoverRequiredSlots,
  popoverSlots,
  SlotMap,
  VariantMap,
} from '@novi-ui/core'
import { tv } from 'tailwind-variants'

/**
 * Flatlay の Popover は **インフローの注記面**（FR-05）。
 *
 * 両テーマはトリガーに紐づいて浮かぶが、Flatlay には浮かせる先が無い。
 * トリガーの直後に面が生えて後続を押し下げる。矢印（`arrow`）を描かないのは
 * Raster と同じ理由ではなく、**指す先が無いから**。浮いていないものは
 * 「あちらから来た」と示す必要がない。
 *
 * 地を一段落とすのは Menu / Select の展開部と役割を分けるため。
 * あちらは選ぶための一覧で、こちらは**読むための注記**。同じ紙の上で、
 * 書き足された欄であることを地の濃さが示す。
 */
const slots = {
  root: [
    'outline-none',
    'border border-[var(--novi-color-border-strong)]',
    'bg-[var(--novi-color-subtle)] text-[var(--novi-color-fg)]',
  ].join(' '),
  // 浮いていないので、どこから来た面かを指す必要が無い
  arrow: 'hidden',
  // 読むための注記なので、余白は面の刻みで取り、密度は行送りが担う
  content: [
    'px-[var(--novi-pad-surface-x)] py-[var(--novi-pad-surface-y)]',
    'leading-[var(--novi-leading-body)]',
  ].join(' '),
} satisfies SlotMap<typeof popoverSlots, (typeof popoverRequiredSlots)[number]>

const radius: VariantMap<NoviRadius, { root: string }> = {
  none: { root: 'rounded-[var(--novi-radius-none)]' },
  sm: { root: 'rounded-[var(--novi-radius-sm)]' },
  md: { root: 'rounded-[var(--novi-radius-md)]' },
  lg: { root: 'rounded-[var(--novi-radius-lg)]' },
  full: { root: 'rounded-[var(--novi-radius-full)]' },
}

/**
 * Popover のスタイル定義。
 *
 * 展開部の位置は `InflowPopover` が `!` 付きのリセットで固定するので、
 * ここで `position` 系を書いても効かない（書く必要も無い）。
 *
 * @example
 * const myPopover = tv({ extend: popoverStyles, slots: { content: 'px-4' } })
 */
export const popoverStyles = tv({
  slots,
  variants: { radius },
  defaultVariants: { radius: 'sm' },
})

export type PopoverStyleProps = Parameters<typeof popoverStyles>[0]
