import type { SlotMap, tooltipRequiredSlots, tooltipSlots } from '@novi-ui/core'
import { tv } from 'tailwind-variants'
import { mono } from '../styles/mono'

/**
 * Tooltip は Flatlay で**唯一浮くもの**（ADR-F6・`position` の例外2号）。
 *
 * 他のすべては開くと場所を取るが、ポインタ追従の一時表示だけはフローに入れられない。
 * 入れた瞬間にレイアウトが動き、ポインタがトリガーから外れて即座に閉じる
 * （出た瞬間に消えるものは補足として成立しない）。
 * 配置は上流（`useOverlayPosition`）がインラインで書くので、ここでは打ち消さない。
 *
 * 浮くことを認めた代わりに、**紙の上の面には見せない**。地と文字を反転した
 * インクの札にして、書類の一部ではなく「一時的に当てた付箋」として読ませる。
 * 影は使わない。浮いていることは反転色と重なりの事実が示す。
 *
 * 例外は Modal（テイクオーバー）とここの2つで凍結してある（NG1）。
 * 3つ目を足すときは「z 軸を持たない」という主張そのものを見直すことになる。
 */
const slots = {
  root: [
    'outline-none max-w-xs',
    'bg-[var(--novi-color-fg)] text-[var(--novi-color-bg)]',
    'border border-transparent',
    'rounded-[var(--novi-radius-sm)]',
  ].join(' '),
  // 矢印は描かない。指す先は重なりの位置が示している
  arrow: 'hidden',
  content: `px-[var(--novi-pad-control-x-sm)] py-1 text-[length:var(--novi-text-xs)] leading-snug ${mono}`,
} satisfies SlotMap<typeof tooltipSlots, (typeof tooltipRequiredSlots)[number]>

/**
 * Tooltip のスタイル定義。
 *
 * @example
 * const myTooltip = tv({ extend: tooltipStyles, slots: { content: 'px-3' } })
 */
export const tooltipStyles = tv({ slots })

export type TooltipStyleProps = Parameters<typeof tooltipStyles>[0]
