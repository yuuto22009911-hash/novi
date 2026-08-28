import type {
  breadcrumbsRequiredSlots,
  breadcrumbsSlots,
  NoviSize,
  SlotMap,
  VariantMap,
} from '@novi-ui/core'
import { tv } from 'tailwind-variants'
import { focusRing } from '../styles/focus-ring'
import { mono } from '../styles/mono'

/**
 * Flatlay の Breadcrumbs は**書類の参照番号**。
 *
 * 区切りの `/` を等幅で出すのは、階層の列が「文」ではなく「番地」だから（ADR-F7）。
 * 等幅にすると段の深さが目で数えられ、折り返しても列がずれない。
 *
 * 現在地は色を変えず太さだけで示す。色で示すと「リンクの色違い」に見え、
 * 押せるのか押せないのかが読めなくなる。
 */
const slots = {
  // root は <nav>、list は RAC が描画する <ol>。nav > ol が意味的に正しい構造
  root: 'flex',
  list: [
    'flex flex-wrap items-center gap-1.5',
    // 先頭の項目だけ区切り文字を隠す。各項目が自分の前に区切りを持つ構造
    '[&>li:first-child>[data-slot=separator]]:hidden',
  ].join(' '),
  item: 'flex items-center gap-1.5',
  link: [
    'text-[var(--novi-color-muted)] underline underline-offset-4',
    'transition-colors duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
    'hover:text-[var(--novi-color-fg)]',
    focusRing,
  ].join(' '),
  // 装飾なので支援技術には読ませない
  separator: `text-[var(--novi-color-border-strong)] select-none ${mono}`,
  // 現在地はリンクにしない。色ではなく太さで示す
  current: 'text-[var(--novi-color-fg)] font-medium',
} satisfies SlotMap<typeof breadcrumbsSlots, (typeof breadcrumbsRequiredSlots)[number]>

const size: VariantMap<NoviSize, { list: string }> = {
  sm: { list: 'text-[length:var(--novi-text-xs)]' },
  md: { list: 'text-[length:var(--novi-text-sm)]' },
  lg: { list: 'text-[length:var(--novi-text-base)]' },
}

/**
 * Breadcrumbs のスタイル定義。
 *
 * @example
 * const myCrumbs = tv({ extend: breadcrumbsStyles, slots: { separator: 'mx-2' } })
 */
export const breadcrumbsStyles = tv({
  slots,
  variants: { size },
  defaultVariants: { size: 'md' },
})

export type BreadcrumbsStyleProps = Parameters<typeof breadcrumbsStyles>[0]
