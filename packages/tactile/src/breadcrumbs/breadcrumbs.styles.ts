import type {
  breadcrumbsRequiredSlots,
  breadcrumbsSlots,
  NoviSize,
  SlotMap,
  VariantMap,
} from '@novi-ui/core'
import { tv } from 'tailwind-variants'
import { focusRing } from '../styles/focus-ring'

const slots = {
  // root は <nav>、list は RAC が描画する <ol>。nav > ol が意味的に正しい構造
  root: 'flex',
  list: [
    'flex flex-wrap items-center gap-1.5',
    // 先頭の項目だけ区切り文字を隠す。各項目が自分の前に区切りを持つ構造
    '[&>li:first-child>[data-slot=separator]]:hidden',
  ].join(' '),
  item: 'flex items-center gap-[var(--novi-gap-inline)]',
  // 薄く小さいリンクはタップ違反の典型。当たり判定を擬似要素で 44px に広げる
  link: [
    'relative inline-flex items-center min-h-11',
    'before:absolute before:inset-x-0 before:top-1/2 before:-translate-y-1/2',
    'before:h-11 before:content-[""]',
    'text-[var(--novi-color-muted)] underline-offset-4',
    'transition-colors duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
    'hover:text-[var(--novi-color-fg)] hover:underline',
    focusRing,
  ].join(' '),
  // 装飾なので支援技術には読ませない
  separator: 'text-[var(--novi-color-border-strong)] select-none',
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
