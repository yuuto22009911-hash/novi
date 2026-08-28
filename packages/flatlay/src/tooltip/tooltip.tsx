'use client'

import type { TooltipProps } from '@novi-ui/core'
import { Tooltip as RACTooltip, TooltipTrigger } from 'react-aria-components'
import { tooltipStyles } from './tooltip.styles'

/**
 * 要素の補足説明。ホバーとフォーカスの両方で開く。
 *
 * Flatlay で**唯一浮くもの**なので、`placement` / `offset` は他テーマ同様に効く
 * （Popover / Menu / Select では受け取るだけで効かない）。
 *
 * ツールチップだけに情報を置かないこと。触れないと読めないため、
 * 操作に必須の情報は本文かラベルに書く。
 *
 * @example
 * <Tooltip content="コピーする">
 *   <Button>複製</Button>
 * </Tooltip>
 */
export function Tooltip({
  content,
  placement = 'top',
  offset = 6,
  delay = 400,
  isOpen,
  defaultOpen,
  onOpenChange,
  isDisabled,
  children,
  className,
  classNames,
  id,
}: TooltipProps) {
  const s = tooltipStyles()

  return (
    <TooltipTrigger
      isOpen={isOpen}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      isDisabled={isDisabled}
      delay={delay}
    >
      {children}
      <RACTooltip
        placement={placement}
        offset={offset}
        data-slot="root"
        className={s.root({ class: [className, classNames?.root] })}
      >
        {/* RAC の Tooltip は id を受け取らないため中身に付ける */}
        <span id={id} data-slot="content" className={s.content({ class: classNames?.content })}>
          {content}
        </span>
      </RACTooltip>
    </TooltipTrigger>
  )
}
