import type {
  NoviRadius,
  NoviSize,
  NoviVariant,
  SlotMap,
  textareaRequiredSlots,
  textareaSlots,
  VariantMap,
} from '@novi-ui/core'
import { tv } from 'tailwind-variants'
import { disabledState, focusRing } from '../styles/focus-ring'
import { mono } from '../styles/mono'

/**
 * Flatlay の TextArea は Input と同じ**記入欄**で、行数だけが違う。
 *
 * 縦だけリサイズを許すのは両テーマと同じ判断。横に伸びると罫線で作った
 * 列の揃いが崩れ、帳票として読めなくなる。
 */
const slots = {
  root: 'flex flex-col gap-1.5',
  label: `text-[length:var(--novi-text-sm)] text-[var(--novi-color-fg)] ${mono}`,
  // 罫線の幅だけを base に置き、色は variant が決める（Input と同じ型）
  inputWrapper: [
    'flex w-full',
    'text-[var(--novi-color-fg)]',
    'border',
    'rounded-[var(--novi-radius-sm)]',
    'data-[invalid]:border-[var(--novi-color-danger)]',
    'transition-[border-color,opacity]',
    'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
    focusRing,
    disabledState,
  ].join(' '),
  textarea: [
    'w-full min-w-0 bg-transparent outline-none',
    'text-[var(--novi-color-fg)]',
    'placeholder:text-[var(--novi-color-muted)]',
    'resize-y',
    'leading-[var(--novi-leading-body)]',
  ].join(' '),
  // 文字数カウンタもここに置く。専用 slot を増やさない
  description: `text-[length:var(--novi-text-sm)] text-[var(--novi-color-muted)] ${mono}`,
  errorMessage: `text-[length:var(--novi-text-sm)] text-[var(--novi-color-danger)] ${mono}`,
} satisfies SlotMap<typeof textareaSlots, (typeof textareaRequiredSlots)[number]>

const variant: VariantMap<NoviVariant, { inputWrapper: string }> = {
  solid: {
    inputWrapper: 'bg-[var(--novi-color-surface)] border-[var(--novi-color-border-strong)]',
  },
  outline: { inputWrapper: 'bg-transparent border-[var(--novi-color-border-strong)]' },
  soft: { inputWrapper: 'bg-[var(--novi-color-subtle)] border-[var(--novi-color-border)]' },
  ghost: {
    inputWrapper: 'bg-transparent border-transparent border-b-[var(--novi-color-border-strong)]',
  },
  plain: { inputWrapper: 'bg-transparent border-transparent px-0' },
}

/**
 * 1行入力と違い高さは `rows` が決めるので、左右の余白と文字サイズだけを段階で変える。
 *
 * 上下だけ段を持たず面の余白（14px）を使うのは、複数行の記入欄が**行の集まり＝面**
 * だから。密度を担うのは行送り（`leading-body` 1.7）で、上下 padding を段で動かすと
 * 枠と1行目の距離だけが変わり、行同士の間隔と食い違って罫線の目が崩れる。
 */
const size: VariantMap<NoviSize, { inputWrapper: string; textarea: string }> = {
  sm: {
    inputWrapper: 'px-[var(--novi-pad-control-x-sm)] py-[var(--novi-pad-surface-y)]',
    textarea: 'text-[length:var(--novi-text-sm)]',
  },
  md: {
    inputWrapper: 'px-[var(--novi-pad-control-x-md)] py-[var(--novi-pad-surface-y)]',
    textarea: 'text-[length:var(--novi-text-base)]',
  },
  lg: {
    inputWrapper: 'px-[var(--novi-pad-control-x-lg)] py-[var(--novi-pad-surface-y)]',
    textarea: 'text-[length:var(--novi-text-base)]',
  },
}

const radius: VariantMap<NoviRadius, { inputWrapper: string }> = {
  none: { inputWrapper: 'rounded-[var(--novi-radius-none)]' },
  sm: { inputWrapper: 'rounded-[var(--novi-radius-sm)]' },
  md: { inputWrapper: 'rounded-[var(--novi-radius-md)]' },
  lg: { inputWrapper: 'rounded-[var(--novi-radius-lg)]' },
  full: { inputWrapper: 'rounded-[var(--novi-radius-full)]' },
}

/**
 * TextArea のスタイル定義。
 *
 * @example
 * import { textareaStyles } from '@novi-ui/flatlay'
 * import { tv } from 'tailwind-variants'
 *
 * const myTextarea = tv({ extend: textareaStyles, slots: { textarea: 'resize-none' } })
 */
export const textareaStyles = tv({
  slots,
  // `variant` は最後に宣言する。先に書くと size のクラスに負ける（申し送り6）
  variants: { size, radius, variant },
  defaultVariants: { size: 'md', radius: 'sm', variant: 'outline' },
})

export type TextareaStyleProps = Parameters<typeof textareaStyles>[0]
