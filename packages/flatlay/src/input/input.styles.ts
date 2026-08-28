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
import { mono, monoNumeric } from '../styles/mono'

/**
 * Flatlay の Input は**記入欄**。罫線で囲った枠に書き込む。
 *
 * 押下の反転（ADR-F3）はここには無い。入力欄は「押す」ものではなく、
 * カーソルが入って書くものなので、反転させると書いた文字が読めなくなる。
 * 手応えを返すのは罫線の色だけで、フォーカスはリングが担う。
 *
 * ラベルが等幅なのは ADR-F7 の運用。**読ませる文（本文）と読み取らせる項目名**を
 * 書体で分けるのが帳票の作法で、Flatlay が影を持たない代わりの区別になっている。
 */
const slots = {
  root: 'flex flex-col gap-1.5',
  // 項目名は等幅。プレースホルダをラベル代わりにはしない
  label: `text-[length:var(--novi-text-sm)] text-[var(--novi-color-fg)] ${mono}`,
  /**
   * 記入欄の枠。RAC の `Group` は `data-focus-visible` / `data-invalid` を出すので、
   * Button と同じ `focusRing` がそのまま効く。
   *
   * 罫線の幅は全 variant が持ち、色だけを variant が決める（Flatlay の型）。
   * 色を base に書くと tailwind-merge が後勝ちで落とすので、ここには幅しか置かない。
   */
  inputWrapper: [
    'flex items-center gap-2 w-full',
    'text-[var(--novi-color-fg)]',
    'border',
    'rounded-[var(--novi-radius-sm)]',
    'data-[invalid]:border-[var(--novi-color-danger)]',
    'transition-[border-color,opacity]',
    'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
    focusRing,
    disabledState,
  ].join(' '),
  input: [
    'w-full min-w-0 bg-transparent outline-none',
    'text-[var(--novi-color-fg)]',
    'placeholder:text-[var(--novi-color-muted)]',
  ].join(' '),
  // 差し込まれるのは単位・通貨記号・件数といった「読み取らせる値」なので等幅（ADR-F7）
  startContent: `shrink-0 inline-flex text-[var(--novi-color-muted)] ${monoNumeric}`,
  endContent: `shrink-0 inline-flex text-[var(--novi-color-muted)] ${monoNumeric}`,
  description: `text-[length:var(--novi-text-sm)] text-[var(--novi-color-muted)] ${mono}`,
  // 色だけに頼らずテキストを必ず伴う（WCAG 1.4.1）
  errorMessage: `text-[length:var(--novi-text-sm)] text-[var(--novi-color-danger)] ${mono}`,
} satisfies SlotMap<typeof inputSlots, (typeof inputRequiredSlots)[number]>

/**
 * variant が決めるのは**枠の強さと地の色**。
 *
 * `ghost` が下線だけになるのは帳票の記入線そのもので、表を詰めて並べたときに
 * 面を増やさずに「ここに書く」を示せる。Flatlay で唯一これが自然に効く形。
 */
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

/** 高さは Button と同じ帳票の行。28 / 32 / 40px。 */
const size: VariantMap<NoviSize, { inputWrapper: string; input: string }> = {
  sm: { inputWrapper: 'h-7 px-2.5', input: 'text-[length:var(--novi-text-sm)]' },
  md: { inputWrapper: 'h-8 px-3', input: 'text-[length:var(--novi-text-base)]' },
  lg: { inputWrapper: 'h-10 px-4', input: 'text-[length:var(--novi-text-base)]' },
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
 * @example
 * import { inputStyles } from '@novi-ui/flatlay'
 * import { tv } from 'tailwind-variants'
 *
 * const myInput = tv({ extend: inputStyles, slots: { input: 'text-right' } })
 */
export const inputStyles = tv({
  slots,
  // `variant` は最後に宣言する。先に書くと size のクラスに負ける（申し送り6）
  variants: { size, radius, variant },
  defaultVariants: { size: 'md', radius: 'sm', variant: 'outline' },
})

export type InputStyleProps = Parameters<typeof inputStyles>[0]
