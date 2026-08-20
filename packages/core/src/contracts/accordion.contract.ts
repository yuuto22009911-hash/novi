import type { ReactNode } from 'react'
import type { NoviBaseProps } from '../props'
import type { ClassNames } from '../slots'
import type { NoviSize, NoviVariant } from '../tokens'

/**
 * Accordion を構成する部位。
 *
 * `heading` は見出し要素（`<h3>` など）、`trigger` はその中の押せるボタン。
 * 支援技術のために、この2つは分けて扱う必要がある。
 */
export const accordionSlots = ['root', 'item', 'heading', 'trigger', 'indicator', 'panel'] as const

export const accordionRequiredSlots = ['root', 'item', 'heading', 'trigger', 'panel'] as const

export type AccordionSlot = (typeof accordionSlots)[number]
export type AccordionRequiredSlot = (typeof accordionRequiredSlots)[number]

/**
 * 折りたたみできる項目の集合。
 *
 * @keywords アコーディオン 折りたたみ 開閉 よくある質問 accordion disclosure
 *
 * @a11y 見出しは heading の中の button として提示され、Enter / Space で開閉する。
 * 展開状態は `aria-expanded`、パネルとの対応は `aria-controls` で伝わる
 *
 * @example
 * <Accordion expandedKeys={open} onExpandedChange={setOpen}>
 *   <AccordionItem id="shipping" title="配送について">…</AccordionItem>
 * </Accordion>
 */
export interface AccordionProps extends NoviBaseProps {
  variant?: NoviVariant
  size?: NoviSize
  /** 同時に複数を開けるようにする */
  allowsMultipleExpanded?: boolean
  expandedKeys?: string[]
  defaultExpandedKeys?: string[]
  onExpandedChange?: (keys: string[]) => void
  isDisabled?: boolean
  disabledKeys?: string[]
  children?: ReactNode
  classNames?: ClassNames<typeof accordionSlots>
}
