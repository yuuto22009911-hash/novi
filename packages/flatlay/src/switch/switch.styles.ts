import type {
  NoviColor,
  NoviSize,
  SlotMap,
  switchRequiredSlots,
  switchSlots,
  VariantMap,
} from '@novi-ui/core'
import { tv } from 'tailwind-variants'
import { disabledState, focusRing } from '../styles/focus-ring'

/**
 * Flatlay の Switch は**矩形のトラックに矩形のつまみ**。両テーマがピル型なのに対して
 * ここだけ角が立つ。Radio の円が例外だったのと逆に、Switch には円を許す理由が無い。
 *
 * つまみは `translate` で滑らない（FR-11 で transform 全面禁止）。左右の寄せを
 * 入れ替えるだけで、位置は**即座に**切り替わる。滑走はレールの上をモノが動く表現＝
 * 奥行きの語彙で、押し下げに transition を付けないのと同じ理由でここでも使わない。
 *
 * 形が見慣れないぶん ON/OFF が読み取りにくいので、**ラベルの併記を強く推奨**する。
 */
const slots = {
  root: [
    'inline-flex items-center gap-[var(--novi-gap-inline)]',
    'cursor-pointer',
    disabledState,
  ].join(' '),
  track: [
    'shrink-0 inline-flex items-center',
    // つまみは寄せで動かす。OFF は左端、ON は右端に即座に立つ
    'justify-start group-data-[selected]:justify-end',
    'rounded-[var(--novi-radius-sm)]',
    'border border-[var(--novi-color-border-strong)]',
    'bg-[var(--novi-color-bg)]',
    'group-data-[selected]:bg-[var(--c)] group-data-[selected]:border-[var(--c)]',
    // 押下は反転（ADR-F3）。地とつまみが入れ替わる
    'group-data-[pressed]:bg-[var(--c-fg)] group-data-[pressed]:border-[var(--c)]',
    'transition-[background-color,border-color]',
    'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
    focusRing,
  ].join(' '),
  // つまみも矩形。ON では地色で抜き、OFF では罫線と同じ色の塊にする
  thumb: [
    'rounded-[var(--novi-radius-none)]',
    'bg-[var(--novi-color-border-strong)]',
    'group-data-[selected]:bg-[var(--novi-color-bg)]',
    'group-data-[pressed]:bg-[var(--c)]',
    'transition-[background-color]',
    'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
  ].join(' '),
  label: 'text-[var(--novi-color-fg)] leading-[var(--novi-leading-body)]',
  description: 'text-[length:var(--novi-text-sm)] text-[var(--novi-color-muted)]',
} satisfies SlotMap<typeof switchSlots, (typeof switchRequiredSlots)[number]>

const color: VariantMap<NoviColor, { root: string }> = {
  default: { root: '[--c:var(--novi-color-fg)] [--c-fg:var(--novi-color-bg)]' },
  primary: { root: '[--c:var(--novi-color-primary)] [--c-fg:var(--novi-color-primary-fg)]' },
  secondary: { root: '[--c:var(--novi-color-secondary)] [--c-fg:var(--novi-color-secondary-fg)]' },
  success: { root: '[--c:var(--novi-color-success)] [--c-fg:var(--novi-color-success-fg)]' },
  warning: { root: '[--c:var(--novi-color-warning)] [--c-fg:var(--novi-color-warning-fg)]' },
  danger: { root: '[--c:var(--novi-color-danger)] [--c-fg:var(--novi-color-danger-fg)]' },
}

/**
 * md が 28×14px。Button の高さ 28px を**横に倒した**寸法で、
 * 帳票の1行の中に置いても行が膨らまない。sm 24×12 / lg 36×18。
 */
const size: VariantMap<NoviSize, { track: string; thumb: string; label: string }> = {
  sm: { track: 'h-3 w-6 p-px', thumb: 'size-2', label: 'text-[length:var(--novi-text-sm)]' },
  md: { track: 'h-3.5 w-7 p-px', thumb: 'size-2.5', label: 'text-[length:var(--novi-text-base)]' },
  lg: { track: 'h-4.5 w-9 p-px', thumb: 'size-3.5', label: 'text-[length:var(--novi-text-base)]' },
}

/**
 * Switch のスタイル定義。
 *
 * @example
 * const mySwitch = tv({ extend: switchStyles, slots: { track: 'w-12' } })
 */
export const switchStyles = tv({
  slots,
  variants: { color, size },
  defaultVariants: { color: 'default', size: 'md' },
})

export type SwitchStyleProps = Parameters<typeof switchStyles>[0]
