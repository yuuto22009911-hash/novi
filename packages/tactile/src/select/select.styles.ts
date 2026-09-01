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

/**
 * Tactile の Select は **画面下端から出るシート型ピッカー**（Raster はアンカー型ポップオーバー）。
 *
 * 一覧は誤タップが最も起きる場所なので、行を大きく取り、選択済みをチェックで示す。
 *
 * **`!` 付きのユーティリティは意図的**。RAC の `Popover` はトリガー基準の位置を
 * インラインスタイルで書き込むため、通常のクラスでも `style` prop でも勝てない。
 * スタイルシートの `!important` だけがインラインに勝つ（ADR-T2 / T-13 の実測）。
 */
const slots = {
  root: 'flex flex-col gap-1.5',
  label: 'text-[length:var(--novi-text-sm)] font-medium text-[var(--novi-color-fg)]',
  trigger: [
    'text-[var(--novi-color-fg)]',
    'flex items-center justify-between gap-[var(--novi-gap-inline)] w-full',
    'text-left',
    'bg-[var(--novi-color-surface)]',
    'shadow-[var(--novi-shadow-sm)]',
    'rounded-[var(--novi-radius-md)]',
    'transition-[opacity,scale] duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
    'data-[pressed]:scale-[0.99] motion-reduce:data-[pressed]:scale-100',
    'group-data-[invalid]:ring-1 group-data-[invalid]:ring-[var(--novi-color-danger)]',
    focusRing,
    disabledState,
  ].join(' '),
  value: [
    'truncate text-[var(--novi-color-fg)]',
    'data-[placeholder]:text-[var(--novi-color-muted)]',
  ].join(' '),
  icon: 'shrink-0 text-[var(--novi-color-muted)]',
  popover: [
    // ここが Raster との構造差そのもの。トリガーの隣ではなく画面下端に張り付く
    '!fixed !top-auto !inset-x-0 !bottom-0 !max-w-none !w-full',
    '!max-h-[70dvh]',
    'bg-[var(--novi-color-surface)]',
    'text-[var(--novi-color-fg)]',
    // 下端は画面に接するので上端だけ角丸。下から出てきた紙の形
    'rounded-t-[var(--novi-radius-lg)]',
    'shadow-[var(--novi-shadow-lg)]',
    'overflow-auto',
    'pb-[env(safe-area-inset-bottom,0px)]',
    // 横向きのノッチは左右に来る。面は全幅のまま、中身だけを内側へ寄せる（FR-13）
    'pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]',
    'data-[entering]:motion-safe:animate-[novi-slide-up_260ms_var(--novi-ease-emphasized)]',
  ].join(' '),
  // Menu と同じ溝。行の背景が丸く抜けて見えるための位置合わせで、余白の設計ではない
  listbox: 'outline-none p-1.5 flex flex-col',
  option: [
    'flex items-center justify-between gap-[var(--novi-gap-inline)]',
    'px-[var(--novi-pad-control-x-md)] cursor-pointer outline-none',
    'text-[var(--novi-color-fg)]',
    'rounded-[var(--novi-radius-md)]',
    'transition-[background-color] duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
    'data-[focused]:bg-[var(--novi-color-subtle)]',
    'data-[selected]:font-bold',
    disabledState,
  ].join(' '),
  description: 'text-[length:var(--novi-text-sm)] text-[var(--novi-color-muted)]',
  errorMessage: 'text-[length:var(--novi-text-sm)] text-[var(--novi-color-danger)]',
} satisfies SlotMap<typeof selectSlots, (typeof selectRequiredSlots)[number]>

/**
 * `size` はトリガーの寸法と**行の密度**（ADR-T3）。
 * 行はどの段でも 48px を下回らない — 一覧は誤タップが最も起きる場所。
 */
const size: VariantMap<NoviSize, { trigger: string; option: string }> = {
  sm: {
    trigger: 'h-10 px-[var(--novi-pad-control-x-sm)] text-[length:var(--novi-text-sm)]',
    option: 'h-12 text-[length:var(--novi-text-sm)]',
  },
  md: {
    trigger: 'h-12 px-[var(--novi-pad-control-x-md)] text-[length:var(--novi-text-base)]',
    option: 'h-14 text-[length:var(--novi-text-base)]',
  },
  lg: {
    trigger: 'h-14 px-[var(--novi-pad-control-x-lg)] text-[length:var(--novi-text-base)]',
    option: 'h-16 text-[length:var(--novi-text-base)]',
  },
}

const radius: VariantMap<NoviRadius, { trigger: string }> = {
  none: { trigger: 'rounded-[var(--novi-radius-none)]' },
  sm: { trigger: 'rounded-[var(--novi-radius-sm)]' },
  md: { trigger: 'rounded-[var(--novi-radius-md)]' },
  lg: { trigger: 'rounded-[var(--novi-radius-lg)]' },
  full: { trigger: 'rounded-[var(--novi-radius-full)]' },
}

const variant: VariantMap<NoviVariant, { trigger: string }> = {
  solid: { trigger: 'bg-[var(--novi-color-surface)]' },
  outline: {
    trigger:
      'bg-transparent shadow-[var(--novi-shadow-none)] ring-1 ring-[var(--novi-color-border-strong)]',
  },
  soft: { trigger: 'bg-[var(--novi-color-subtle)] shadow-[var(--novi-shadow-none)]' },
  ghost: { trigger: 'bg-transparent shadow-[var(--novi-shadow-none)]' },
  plain: {
    trigger: 'bg-transparent shadow-[var(--novi-shadow-none)] px-0 underline underline-offset-4',
  },
}

/**
 * Select のスタイル定義。
 *
 * `popover` の `!` 付きクラスを `classNames` で上書きすることはできない
 * （`!important` 同士では後勝ちにならない）。配置を変えたい場合は `tv({ extend })` を使う。
 *
 * @example
 * import { selectStyles } from '@novi-ui/tactile'
 * import { tv } from 'tailwind-variants'
 *
 * const mySelect = tv({ extend: selectStyles, slots: { option: 'font-mono' } })
 */
export const selectStyles = tv({
  slots,
  variants: { size, radius, variant },
  defaultVariants: { size: 'md', radius: 'md', variant: 'solid' },
})

export type SelectStyleProps = Parameters<typeof selectStyles>[0]
