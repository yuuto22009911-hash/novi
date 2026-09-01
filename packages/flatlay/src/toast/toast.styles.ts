import type {
  NoviColor,
  NoviRadius,
  SlotMap,
  toastRequiredSlots,
  toastSlots,
  VariantMap,
} from '@novi-ui/core'
import { tv } from 'tailwind-variants'
import { disabledState, focusRing } from '../styles/focus-ring'
import { mono } from '../styles/mono'

/**
 * Flatlay の Toast は**フローに挿し込まれる帯**（ADR-F4）。
 *
 * 右下（Raster）にも上端中央（Tactile）にも固定しない。固定は viewport に
 * 貼り付けること、つまり z 軸そのものだから。`sticky` も同じ理由で使わない
 * （スクロール中にコンテンツへ重なった時点で「重なりを持つ UI」になる）。
 *
 * 代わりに region はアプリの先頭に置くフローの帯で、スクロールすれば
 * 流れて見えなくなってよい。帳票の朱書きはページの先頭にあり、
 * 読み進めるあいだ追いかけてはこない。
 *
 * この割り切りの代償は「長いページで気づきにくい」こと。
 * 見落とすと困る確認は Toast ではなく Modal（テイクオーバー）を使う。
 */
const slots = {
  // 固定しない。置いた場所がそのまま表示位置になる（アプリ先頭を推奨）
  region: 'flex flex-col gap-1.5 w-full outline-none',
  root: [
    'w-full flex items-start gap-[var(--novi-gap-inline)]',
    'px-[var(--novi-pad-surface-x)] py-[var(--novi-pad-surface-y)] outline-none',
    'text-[var(--novi-color-fg)] bg-[var(--novi-color-subtle)]',
    // 左端の太い罫が朱書きの線。色はここだけが受け持つ
    'border border-[var(--novi-color-border-strong)]',
    'border-l-2 border-l-[var(--c)]',
  ].join(' '),
  icon: 'shrink-0 text-[var(--c)]',
  content: 'flex-1 min-w-0 flex flex-col gap-0.5',
  // 見出しも注記も等幅。通知は読ませる文ではなく読み取らせる記録（ADR-F7）
  title: `truncate font-medium ${mono}`,
  description: `text-[length:var(--novi-text-sm)] text-[var(--novi-color-muted)] ${mono}`,
  closeButton: [
    'shrink-0 grid place-items-center size-5',
    'text-[var(--novi-color-muted)]',
    'border border-transparent',
    'hover:text-[var(--novi-color-fg)]',
    'data-[pressed]:bg-[var(--novi-color-fg)] data-[pressed]:text-[var(--novi-color-bg)]',
    'transition-[background-color,color]',
    'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
    focusRing,
    disabledState,
  ].join(' '),
  action: 'shrink-0',
} satisfies SlotMap<typeof toastSlots, (typeof toastRequiredSlots)[number]>

const color: VariantMap<NoviColor, { root: string }> = {
  default: { root: '[--c:var(--novi-color-border-strong)]' },
  primary: { root: '[--c:var(--novi-color-primary)]' },
  secondary: { root: '[--c:var(--novi-color-secondary)]' },
  success: { root: '[--c:var(--novi-color-success)]' },
  warning: { root: '[--c:var(--novi-color-warning)]' },
  danger: { root: '[--c:var(--novi-color-danger)]' },
}

const radius: VariantMap<NoviRadius, { root: string }> = {
  none: { root: 'rounded-[var(--novi-radius-none)]' },
  sm: { root: 'rounded-[var(--novi-radius-sm)]' },
  md: { root: 'rounded-[var(--novi-radius-md)]' },
  lg: { root: 'rounded-[var(--novi-radius-lg)]' },
  full: { root: 'rounded-[var(--novi-radius-full)]' },
}

/**
 * Toast のスタイル定義。
 *
 * @example
 * const myToast = tv({ extend: toastStyles, slots: { region: 'gap-3' } })
 */
export const toastStyles = tv({
  slots,
  variants: { color, radius },
  // 紙の幅いっぱいに走る帯に角は要らない（両テーマの既定は lg）
  defaultVariants: { color: 'default', radius: 'none' },
})

export type ToastStyleProps = Parameters<typeof toastStyles>[0]

/** 閉じるの ✕。等幅で出す（ADR-F7・Modal の「← 戻る」と同じ扱い）。 */
export const closeGlyphClass = mono
