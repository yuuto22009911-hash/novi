import type {
  inputRequiredSlots,
  inputSlots,
  NoviRadius,
  NoviSize,
  NoviVariant,
  SlotMap,
  VariantMap,
} from '@novi-ui/core'
import { tv } from 'tailwind-variants'
import { disabledState, focusRing } from '../styles/focus-ring'

/**
 * Tactile の Input は**指で触る前提の面**。境界線ではなく影で持ち上げ、
 * 入力の文字は 16px を下回らせない（iOS Safari が自動ズームしてレイアウトが飛ぶ）。
 */
// 型注釈ではなく satisfies（ADR-R5）。任意 slot が呼べなくなるのを防ぐ。
const slots = {
  root: 'flex flex-col gap-1.5',
  // ラベルは常に上・左揃え。プレースホルダをラベル代わりにしない
  label: 'text-[length:var(--novi-text-sm)] font-medium text-[var(--novi-color-fg)]',
  // RAC の Group を使う。Group は data-focus-visible / data-invalid を出すので、
  // Button と同じ focusRing 定義がそのまま使える（属性名を書き換える必要がない）。
  inputWrapper: [
    'text-[var(--novi-color-fg)]',
    'flex items-center gap-2 w-full',
    'bg-[var(--novi-color-surface)]',
    'shadow-[var(--novi-shadow-sm)]',
    'rounded-[var(--novi-radius-md)]',
    'transition-[opacity,box-shadow]',
    'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
    'data-[invalid]:ring-1 data-[invalid]:ring-[var(--novi-color-danger)]',
    focusRing,
    disabledState,
  ].join(' '),
  input: [
    'w-full min-w-0 bg-transparent outline-none',
    'text-[var(--novi-color-fg)]',
    'placeholder:text-[var(--novi-color-muted)]',
  ].join(' '),
  startContent: 'shrink-0 inline-flex text-[var(--novi-color-muted)]',
  endContent: 'shrink-0 inline-flex text-[var(--novi-color-muted)]',
  description: 'text-[length:var(--novi-text-sm)] text-[var(--novi-color-muted)]',
  // 色だけに頼らずテキストを必ず伴う（WCAG 1.4.1）
  errorMessage: 'text-[length:var(--novi-text-sm)] text-[var(--novi-color-danger)]',
} satisfies SlotMap<typeof inputSlots, (typeof inputRequiredSlots)[number]>

/**
 * core の語彙定義（solid=塗りつぶしで最も強い / soft=淡い背景で境界線なし）に従って
 * 5つを視覚的に区別する。同じクラスを生む variant があると
 * 「テーマを切り替えても API が同じ」という約束が形だけになる。
 */
const variant: VariantMap<NoviVariant, { inputWrapper: string }> = {
  // 持ち上がった面。最も強い
  solid: { inputWrapper: 'bg-[var(--novi-color-surface)] shadow-[var(--novi-shadow-sm)]' },
  // 輪郭のみ。影を持たない
  outline: {
    inputWrapper:
      'bg-transparent shadow-[var(--novi-shadow-none)] ring-1 ring-[var(--novi-color-border-strong)]',
  },
  // 沈んだ面。輪郭も影も持たない
  soft: { inputWrapper: 'bg-[var(--novi-color-subtle)] shadow-[var(--novi-shadow-none)]' },
  // 地に溶ける。表を詰めて並べるときに面を増やさない
  ghost: { inputWrapper: 'bg-transparent shadow-[var(--novi-shadow-none)]' },
  // 完全に無装飾。インライン編集などで使う
  plain: { inputWrapper: 'bg-transparent shadow-[var(--novi-shadow-none)] px-0' },
}

/**
 * 高さは Button と揃える。40 / 48 / 56px。
 *
 * **入力の文字は全段 base(17px)** にする。`sm` でも小さくしないのは、
 * iOS Safari が 16px 未満の入力欄でフォーカス時にページごと拡大するため。
 * 視覚的な軽さは高さと余白で作る（FR-08 / AC-01-3）。
 */
const size: VariantMap<NoviSize, { inputWrapper: string; input: string }> = {
  sm: { inputWrapper: 'h-10 px-3', input: 'text-[length:var(--novi-text-base)]' },
  md: { inputWrapper: 'h-12 px-4', input: 'text-[length:var(--novi-text-base)]' },
  lg: { inputWrapper: 'h-14 px-5', input: 'text-[length:var(--novi-text-base)]' },
}

const radius: VariantMap<NoviRadius, { inputWrapper: string }> = {
  none: { inputWrapper: 'rounded-[var(--novi-radius-none)]' },
  sm: { inputWrapper: 'rounded-[var(--novi-radius-sm)]' },
  md: { inputWrapper: 'rounded-[var(--novi-radius-md)]' },
  lg: { inputWrapper: 'rounded-[var(--novi-radius-lg)]' },
  full: { inputWrapper: 'rounded-[var(--novi-radius-full)]' },
}

/**
 * Input のスタイル定義。
 *
 * 拡張は `base` ではなく `slots` で行う（slot ベースの定義のため）。
 *
 * @example
 * import { inputStyles } from '@novi-ui/tactile'
 * import { tv } from 'tailwind-variants'
 *
 * const myInput = tv({
 *   extend: inputStyles,
 *   slots: { inputWrapper: 'font-mono' },
 * })
 */
export const inputStyles = tv({
  slots,
  variants: { variant, size, radius },
  defaultVariants: { variant: 'outline', size: 'md', radius: 'md' },
})

export type InputStyleProps = Parameters<typeof inputStyles>[0]
