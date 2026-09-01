import type {
  buttonRequiredSlots,
  buttonSlots,
  NoviColor,
  NoviRadius,
  NoviSize,
  NoviVariant,
  SlotMap,
  VariantMap,
} from '@novi-ui/core'
import { tv } from 'tailwind-variants'
import { disabledState, focusRing } from '../styles/focus-ring'

// 型注釈ではなく `satisfies` を使う。
// 型注釈だと「任意 slot は無いかもしれない」まで型が広がり、
// tv() の戻り値で `s.startContent` が undefined 扱いになって呼べなくなる。
// satisfies なら契約を検査しつつ、実際に定義した slot の情報が保たれる。
const slots = {
  root: [
    'inline-flex items-center justify-center gap-[var(--novi-gap-inline)]',
    'font-medium whitespace-nowrap select-none',
    'border border-transparent',
    'transition-[background-color,border-color,color,opacity]',
    'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
    focusRing,
    disabledState,
  ].join(' '),
  label: 'truncate',
  startContent: 'shrink-0 inline-flex',
  endContent: 'shrink-0 inline-flex',
  spinner: 'shrink-0 inline-flex',
} satisfies SlotMap<typeof buttonSlots, (typeof buttonRequiredSlots)[number]>

/**
 * 色は「役割ごとのローカル変数」に落としてから variant が参照する。
 * こうしないと variant 5 × color 6 = 30 通りの組み合わせを書くことになる。
 *
 * - `--c`      面の色（solid の背景）
 * - `--c-fg`   その面に乗る文字色
 * - `--c-text` 面を持たない variant での文字色
 * - `--c-line` 境界線の色
 */
const color: VariantMap<NoviColor, { root: string }> = {
  default: {
    root: [
      '[--c:var(--novi-color-default)]',
      '[--c-fg:var(--novi-color-default-fg)]',
      '[--c-text:var(--novi-color-fg)]',
      '[--c-line:var(--novi-color-border-strong)]',
    ].join(' '),
  },
  primary: {
    root: [
      '[--c:var(--novi-color-primary)]',
      '[--c-fg:var(--novi-color-primary-fg)]',
      '[--c-text:var(--novi-color-primary)]',
      '[--c-line:var(--novi-color-primary)]',
    ].join(' '),
  },
  secondary: {
    root: [
      '[--c:var(--novi-color-secondary)]',
      '[--c-fg:var(--novi-color-secondary-fg)]',
      '[--c-text:var(--novi-color-secondary)]',
      '[--c-line:var(--novi-color-secondary)]',
    ].join(' '),
  },
  success: {
    root: [
      '[--c:var(--novi-color-success)]',
      '[--c-fg:var(--novi-color-success-fg)]',
      '[--c-text:var(--novi-color-success)]',
      '[--c-line:var(--novi-color-success)]',
    ].join(' '),
  },
  warning: {
    root: [
      '[--c:var(--novi-color-warning)]',
      '[--c-fg:var(--novi-color-warning-fg)]',
      '[--c-text:var(--novi-color-warning)]',
      '[--c-line:var(--novi-color-warning)]',
    ].join(' '),
  },
  danger: {
    root: [
      '[--c:var(--novi-color-danger)]',
      '[--c-fg:var(--novi-color-danger-fg)]',
      '[--c-text:var(--novi-color-danger)]',
      '[--c-line:var(--novi-color-danger)]',
    ].join(' '),
  },
}

/** 語彙の実装漏れ・語彙外の追加はここでコンパイルエラーになる（AC-02-2）。 */
const variant: VariantMap<NoviVariant, { root: string }> = {
  solid: { root: 'bg-[var(--c)] text-[var(--c-fg)] hover:opacity-90' },
  outline: {
    root: 'border-[var(--c-line)] text-[var(--c-text)] hover:bg-[var(--novi-color-subtle)]',
  },
  soft: { root: 'bg-[var(--novi-color-subtle)] text-[var(--c-text)] hover:brightness-95' },
  ghost: { root: 'text-[var(--c-text)] hover:bg-[var(--novi-color-subtle)]' },
  plain: { root: 'text-[var(--c-text)] underline-offset-4 hover:underline' },
}

/** 高さは 8px グリッドに乗せる。32 / 40 / 48px（AC-01-2）。 */
const size: VariantMap<NoviSize, { root: string }> = {
  sm: { root: 'h-8 px-[var(--novi-pad-control-x-sm)] text-[length:var(--novi-text-sm)]' },
  md: { root: 'h-10 px-[var(--novi-pad-control-x-md)] text-[length:var(--novi-text-base)]' },
  lg: { root: 'h-12 px-[var(--novi-pad-control-x-lg)] text-[length:var(--novi-text-base)]' },
}

/** Raster では md / lg も 2px に潰れる（ADR-R1）。API は語彙どおり受け付ける。 */
const radius: VariantMap<NoviRadius, { root: string }> = {
  none: { root: 'rounded-[var(--novi-radius-none)]' },
  sm: { root: 'rounded-[var(--novi-radius-sm)]' },
  md: { root: 'rounded-[var(--novi-radius-md)]' },
  lg: { root: 'rounded-[var(--novi-radius-lg)]' },
  full: { root: 'rounded-[var(--novi-radius-full)]' },
}

/**
 * Button のスタイル定義。
 *
 * `tv({ extend: buttonStyles })` で拡張できるよう named export する。
 * npm 配布の「コードを所有できない」という不満への回答（FR-04）。
 *
 * slot ベースの定義なので、拡張は `base` ではなく `slots` で行う。
 * `base` は黙って無視される。
 *
 * @example
 * import { buttonStyles } from '@novi-ui/raster'
 * import { tv } from 'tailwind-variants'
 *
 * const myButton = tv({
 *   extend: buttonStyles,
 *   slots: { root: 'uppercase tracking-widest' },
 * })
 */
export const buttonStyles = tv({
  slots,
  variants: { color, variant, size, radius },
  defaultVariants: { color: 'default', variant: 'solid', size: 'md', radius: 'md' },
})

export type ButtonStyleProps = Parameters<typeof buttonStyles>[0]
