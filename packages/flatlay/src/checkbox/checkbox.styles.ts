import type {
  checkboxGroupRequiredSlots,
  checkboxGroupSlots,
  checkboxRequiredSlots,
  checkboxSlots,
  NoviColor,
  NoviSize,
  SlotMap,
  VariantMap,
} from '@novi-ui/core'
import { tv } from 'tailwind-variants'
import { disabledState, focusRing } from '../styles/focus-ring'
import { mono } from '../styles/mono'

/**
 * Flatlay の Checkbox は**用紙の記入欄**。2px 角の箱に印を入れる。
 *
 * 印が SVG ではなく文字（`✓` / `−`）なのは ADR-F7 の運用。帳票の記号は
 * 書くものであって描くものではないので、等幅の字として出す。線幅を持つ図形を
 * 足すと、罫線だけで階層を作っているこのテーマの中で唯一の「絵」になってしまう。
 *
 * 選ぶと箱が塗り潰されて印が地色で立つ。押下の反転（ADR-F3）と同じ形だが、
 * こちらは**状態として残る**。押した瞬間との差は持続するかどうかだけで、
 * 語彙をひとつに保つほうが手応えが読める。
 */
const slots = {
  root: [
    'inline-flex items-start gap-[var(--novi-gap-inline)]',
    'cursor-pointer',
    disabledState,
  ].join(' '),
  // 円にしない。書類のチェック欄は必ず角のある箱で、丸は Radio の担当
  control: [
    'shrink-0 inline-grid place-items-center',
    'border border-[var(--novi-color-border-strong)]',
    'rounded-[var(--novi-radius-sm)]',
    'bg-[var(--novi-color-bg)]',
    'group-data-[selected]:bg-[var(--c)] group-data-[selected]:border-[var(--c)]',
    'group-data-[indeterminate]:bg-[var(--c)] group-data-[indeterminate]:border-[var(--c)]',
    'group-data-[invalid]:border-[var(--novi-color-danger)]',
    'transition-[background-color,border-color]',
    'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
    focusRing,
  ].join(' '),
  // 印は箱いっぱいに置かない。`leading-none` で字の行送りを殺して中央に据える
  indicator: `text-[var(--c-fg)] leading-none pointer-events-none ${mono}`,
  // 選択肢の文言は読ませる文なので等幅にしない（項目名は group 側の label）
  label: 'text-[var(--novi-color-fg)] leading-[var(--novi-leading-body)]',
  description: `text-[length:var(--novi-text-sm)] text-[var(--novi-color-muted)] ${mono}`,
} satisfies SlotMap<typeof checkboxSlots, (typeof checkboxRequiredSlots)[number]>

/** 塗り潰す色と、その上に立つ印の色。両テーマと同じローカル変数の型。 */
const color: VariantMap<NoviColor, { root: string }> = {
  default: { root: '[--c:var(--novi-color-fg)] [--c-fg:var(--novi-color-bg)]' },
  primary: { root: '[--c:var(--novi-color-primary)] [--c-fg:var(--novi-color-primary-fg)]' },
  secondary: { root: '[--c:var(--novi-color-secondary)] [--c-fg:var(--novi-color-secondary-fg)]' },
  success: { root: '[--c:var(--novi-color-success)] [--c-fg:var(--novi-color-success-fg)]' },
  warning: { root: '[--c:var(--novi-color-warning)] [--c-fg:var(--novi-color-warning-fg)]' },
  danger: { root: '[--c:var(--novi-color-danger)] [--c-fg:var(--novi-color-danger-fg)]' },
}

/**
 * 14 / 16 / 20px。両テーマ（16/20/24・20/24/28）より一段小さい。
 *
 * 帳票の行が 28 / 32 / 40px なので、箱が行の高さの半分ほどに収まる。
 * 指の下限には合わせない（Flatlay の前提はポインタとキーボード）。
 */
const size: VariantMap<NoviSize, { control: string; indicator: string; label: string }> = {
  sm: {
    control: 'size-3.5',
    indicator: 'text-[length:var(--novi-text-xs)]',
    label: 'text-[length:var(--novi-text-sm)]',
  },
  md: {
    control: 'size-4',
    indicator: 'text-[length:var(--novi-text-sm)]',
    label: 'text-[length:var(--novi-text-base)]',
  },
  lg: {
    control: 'size-5',
    indicator: 'text-[length:var(--novi-text-base)]',
    label: 'text-[length:var(--novi-text-base)]',
  },
}

/**
 * Checkbox のスタイル定義。
 *
 * @example
 * import { checkboxStyles } from '@novi-ui/flatlay'
 * import { tv } from 'tailwind-variants'
 *
 * const myCheckbox = tv({ extend: checkboxStyles, slots: { label: 'font-medium' } })
 */
export const checkboxStyles = tv({
  slots,
  variants: { color, size },
  defaultVariants: { color: 'default', size: 'md' },
})

const groupSlots = {
  root: 'flex flex-col gap-[var(--novi-gap-stack)]',
  // こちらは項目名なので等幅（Input の label と同じ扱い・ADR-F7）
  label: `text-[length:var(--novi-text-sm)] text-[var(--novi-color-fg)] ${mono}`,
  list: 'flex flex-col gap-[var(--novi-gap-stack)]',
  description: `text-[length:var(--novi-text-sm)] text-[var(--novi-color-muted)] ${mono}`,
  errorMessage: `text-[length:var(--novi-text-sm)] text-[var(--novi-color-danger)] ${mono}`,
} satisfies SlotMap<typeof checkboxGroupSlots, (typeof checkboxGroupRequiredSlots)[number]>

/**
 * CheckboxGroup のスタイル定義。
 *
 * @example
 * const myGroup = tv({ extend: checkboxGroupStyles, slots: { list: 'gap-4' } })
 */
export const checkboxGroupStyles = tv({
  slots: groupSlots,
  variants: {
    orientation: {
      vertical: { list: 'flex-col gap-[var(--novi-gap-stack)]' },
      horizontal: { list: 'flex-row gap-[var(--novi-gap-stack)] flex-wrap' },
    },
  },
  defaultVariants: { orientation: 'vertical' },
})

export type CheckboxStyleProps = Parameters<typeof checkboxStyles>[0]
export type CheckboxGroupStyleProps = Parameters<typeof checkboxGroupStyles>[0]
