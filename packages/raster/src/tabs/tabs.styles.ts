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
 * Raster の Tabs は**アクティブを下線1本と文字色だけで示す**（ADR-R4）。
 *
 * 背景の塗り分けはミニマルの原則（面を増やさない）に反するので使わない。
 * 下線は非テキストコントラスト 3:1 を満たす色を使う。
 */
const slots = {
  root: 'flex flex-col gap-4',
  list: 'flex gap-1 border-b border-[var(--novi-color-border)]',
  tab: [
    'relative cursor-pointer outline-none whitespace-nowrap',
    'text-[var(--novi-color-muted)]',
    'border-b border-transparent -mb-px',
    'transition-[color,border-color]',
    'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
    'hover:text-[var(--novi-color-fg)]',
    // 背景は変えない。文字色と下線だけで示す
    'data-[selected]:text-[var(--novi-color-fg)]',
    'data-[selected]:border-[var(--novi-color-fg)]',
    'data-[disabled]:opacity-40 data-[disabled]:cursor-default',
    focusRing,
  ].join(' '),
  indicator: 'hidden',
  panel: 'outline-none text-[var(--novi-color-fg)]',
} satisfies SlotMap<typeof tabsSlots, (typeof tabsRequiredSlots)[number]>

const variant: VariantMap<NoviVariant, { list: string; tab: string }> = {
  solid: { list: 'bg-[var(--novi-color-subtle)] p-1 border-transparent', tab: 'border-b-0' },
  outline: { list: 'border-b border-[var(--novi-color-border)]', tab: '' },
  soft: { list: 'bg-[var(--novi-color-subtle)] border-transparent', tab: '' },
  ghost: { list: 'border-transparent', tab: '' },
  plain: { list: 'border-transparent gap-4', tab: 'border-b-0' },
}

const size: VariantMap<NoviSize, { tab: string }> = {
  sm: { tab: 'px-2.5 py-1.5 text-[length:var(--novi-text-sm)]' },
  md: { tab: 'px-3 py-2 text-[length:var(--novi-text-base)]' },
  lg: { tab: 'px-4 py-2.5 text-[length:var(--novi-text-base)]' },
}

/**
 * Tabs のスタイル定義。
 *
 * @example
 * const myTabs = tv({ extend: tabsStyles, slots: { list: 'gap-6' } })
 */
export const tabsStyles = tv({
  slots,
  variants: { size, variant },
  defaultVariants: { variant: 'outline', size: 'md' },
})

export type TabsStyleProps = Parameters<typeof tabsStyles>[0]
