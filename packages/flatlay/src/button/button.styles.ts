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
import { monoNumeric } from '../styles/mono'

// 型注釈ではなく `satisfies` を使う。
// 型注釈だと「任意 slot は無いかもしれない」まで型が広がり、
// tv() の戻り値で `s.startContent` が undefined 扱いになって呼べなくなる（ADR-R5）。
const slots = {
  root: [
    'inline-flex items-center justify-center gap-[var(--novi-gap-inline)]',
    'font-medium whitespace-nowrap select-none',
    // 罫線の幅は全 variant が持つ。影が無い以上、輪郭を示せるのは線だけ。
    // 色は variant が決める（ghost / plain だけが transparent を選ぶ）
    'border',
    'rounded-[var(--novi-radius-sm)]',
    // 動かすのは色だけ。位置も大きさも変えない（FR-11）
    'transition-[background-color,border-color,color]',
    'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
    focusRing,
    disabledState,
  ].join(' '),
  label: 'truncate',
  // 差し込まれるのは記号・数値・ショートカットであることが多い。
  // 等幅と tabular-nums を既定にすると、ボタンが並んだときに幅が暴れない（ADR-F7）
  startContent: `shrink-0 inline-flex ${monoNumeric}`,
  endContent: `shrink-0 inline-flex ${monoNumeric}`,
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

/**
 * 高さは 28 / 32 / 40px（Raster は 32/40/48、Tactile は 40/48/56）。
 *
 * **帳票の行の高さ**にあたる。前提はポインタとキーボードで、指の当たり判定を
 * 広げる細工はしない（それは Tactile の領分で、そこが3本目の密度の identity）。
 */
const size: VariantMap<NoviSize, { root: string }> = {
  sm: { root: 'h-7 px-[var(--novi-pad-control-x-sm)] text-[length:var(--novi-text-sm)]' },
  md: { root: 'h-8 px-[var(--novi-pad-control-x-md)] text-[length:var(--novi-text-base)]' },
  lg: { root: 'h-10 px-[var(--novi-pad-control-x-lg)] text-[length:var(--novi-text-base)]' },
}

const radius: VariantMap<NoviRadius, { root: string }> = {
  none: { root: 'rounded-[var(--novi-radius-none)]' },
  sm: { root: 'rounded-[var(--novi-radius-sm)]' },
  md: { root: 'rounded-[var(--novi-radius-md)]' },
  lg: { root: 'rounded-[var(--novi-radius-lg)]' },
  full: { root: 'rounded-[var(--novi-radius-full)]' },
}

/**
 * 語彙の実装漏れ・語彙外の追加はここでコンパイルエラーになる（AC-04-2）。
 *
 * **押下は反転**（FR-11 / ADR-F3）。面と文字が入れ替わる、スタンプを押した跡の見え方。
 * 沈む・縮む・影が消えるといった表現はすべて z 軸の語彙なので使えない。
 * 反転は面積のある変化なので、動かさなくても押した瞬間が確実に伝わる。
 * 前後どちらの状態も 4.5:1 を満たすことは `flatlay-tokens.test.ts` が固定している。
 */
const variant: VariantMap<NoviVariant, { root: string }> = {
  solid: {
    root: [
      'bg-[var(--c)] text-[var(--c-fg)] border-[var(--c)]',
      'data-[pressed]:bg-[var(--c-fg)] data-[pressed]:text-[var(--c)]',
    ].join(' '),
  },
  outline: {
    root: [
      'border-[var(--c-line)] text-[var(--c-text)] hover:bg-[var(--novi-color-subtle)]',
      'data-[pressed]:bg-[var(--c)] data-[pressed]:text-[var(--c-fg)]',
    ].join(' '),
  },
  soft: {
    root: [
      'bg-[var(--novi-color-subtle)] border-[var(--novi-color-border)] text-[var(--c-text)]',
      'data-[pressed]:bg-[var(--c)] data-[pressed]:text-[var(--c-fg)]',
    ].join(' '),
  },
  ghost: {
    root: [
      'border-transparent text-[var(--c-text)] hover:bg-[var(--novi-color-subtle)]',
      'data-[pressed]:bg-[var(--c)] data-[pressed]:text-[var(--c-fg)]',
    ].join(' '),
  },
  plain: {
    root: [
      'border-transparent text-[var(--c-text)] underline-offset-4 hover:underline',
      'data-[pressed]:bg-[var(--c)] data-[pressed]:text-[var(--c-fg)]',
    ].join(' '),
  },
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
 * import { buttonStyles } from '@novi-ui/flatlay'
 * import { tv } from 'tailwind-variants'
 *
 * const myButton = tv({
 *   extend: buttonStyles,
 *   slots: { root: 'uppercase tracking-widest' },
 * })
 */
export const buttonStyles = tv({
  slots,
  // `variant` は最後に宣言する。先に書くと size のクラスに負ける（申し送り6）
  variants: { color, size, radius, variant },
  defaultVariants: { color: 'default', variant: 'solid', size: 'md', radius: 'sm' },
})

export type ButtonStyleProps = Parameters<typeof buttonStyles>[0]
