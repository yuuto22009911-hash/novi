import type {
  accordionRequiredSlots,
  accordionSlots,
  NoviSize,
  NoviVariant,
  SlotMap,
  VariantMap,
} from '@novi-ui/core'
import { tv } from 'tailwind-variants'
import { focusRing } from '../styles/focus-ring'
import { mono } from '../styles/mono'

/**
 * Accordion は Flatlay の**主役**。
 *
 * 他のすべては「浮くものをフローに直した」形だが、Accordion だけは
 * もともとインフロー展開で、直す必要が無かった。z 軸を持たないモデルが
 * 無理なく成立する唯一の既存パターンで、他の展開系はここに寄せてある。
 *
 * 開閉の印は `▸` / `▾` の差し替え。シェブロンの回転（Tactile）は使わない。
 * 回転は「同じものが向きを変えた」という 3 次元の言葉で、字を替えるのは
 * 「状態が別の記号になった」という帳票の言葉になる（FR-11 / ADR-F7）。
 *
 * 印が**行頭**にあるのは、Select の選択済み `▸` と同じ列の作り方。
 * 右端（両テーマ）に置くと見出しの長さで位置が変わり、縦に読めなくなる。
 */
const slots = {
  root: 'flex flex-col border-t border-[var(--novi-color-border-strong)]',
  item: 'border-b border-[var(--novi-color-border-strong)]',
  // 見出し要素とその中のボタンを分ける。支援技術のために必要
  heading: 'm-0',
  trigger: [
    'flex items-center gap-2 w-full text-left',
    'cursor-pointer outline-none',
    'text-[var(--novi-color-fg)]',
    'hover:bg-[var(--novi-color-subtle)]',
    // 押した瞬間だけ反転する。開いているという状態は記号が持つ（ADR-F3）
    'data-[pressed]:bg-[var(--novi-color-fg)] data-[pressed]:text-[var(--novi-color-bg)]',
    'transition-[background-color,color]',
    'duration-[var(--novi-duration-fast)] ease-[var(--novi-ease-standard)]',
    'data-[disabled]:opacity-40 data-[disabled]:cursor-default',
    focusRing,
  ].join(' '),
  // 幅を 1 文字ぶんに固定する。`▸` と `▾` で見出しの開始位置がずれない
  indicator: `w-[1ch] shrink-0 leading-none text-[var(--novi-color-muted)] ${mono}`,
  panel: 'text-[var(--novi-color-fg)] leading-[var(--novi-leading-body)]',
} satisfies SlotMap<typeof accordionSlots, (typeof accordionRequiredSlots)[number]>

/**
 * 罫線の引き方だけが変わる。地で段差を作れないので、
 * `solid` と `soft` は「地を一段落とした行」として同じ見え方になる。
 */
const variant: VariantMap<NoviVariant, { root: string; item: string }> = {
  solid: { root: 'border-t-0', item: 'bg-[var(--novi-color-subtle)] border-b' },
  outline: { root: 'border-t', item: 'border-b' },
  soft: { root: 'border-t-0', item: 'bg-[var(--novi-color-subtle)] border-b' },
  ghost: { root: 'border-t-0', item: 'border-b border-[var(--novi-color-border)]' },
  plain: { root: 'border-t-0', item: 'border-b-0' },
}

/** 行の高さは Select / Menu と同じ帳票の刻み。パネルは見出しの字下げに揃える。 */
const size: VariantMap<NoviSize, { trigger: string; panel: string }> = {
  sm: { trigger: 'px-2 py-1.5 text-[length:var(--novi-text-sm)]', panel: 'pl-6 pr-2 pb-1.5' },
  md: { trigger: 'px-3 py-2 text-[length:var(--novi-text-base)]', panel: 'pl-8 pr-3 pb-2' },
  lg: { trigger: 'px-4 py-3 text-[length:var(--novi-text-base)]', panel: 'pl-10 pr-4 pb-3' },
}

/**
 * Accordion のスタイル定義。
 *
 * @example
 * const myAccordion = tv({ extend: accordionStyles, slots: { panel: 'pt-2' } })
 */
export const accordionStyles = tv({
  slots,
  // `variant` は最後に宣言する。先に書くと size のクラスに負ける（申し送り6）
  variants: { size, variant },
  defaultVariants: { variant: 'outline', size: 'md' },
})

export type AccordionStyleProps = Parameters<typeof accordionStyles>[0]
