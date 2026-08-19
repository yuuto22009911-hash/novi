'use client'

import type { PopoverProps, TooltipProps } from '@novi-ui/core'
import type { ReactNode } from 'react'
import {
  Dialog,
  DialogTrigger,
  Popover as RACPopover,
  Tooltip as RACTooltip,
  TooltipTrigger,
} from 'react-aria-components'
import { popoverStyles, tooltipStyles } from './popover.styles'

/**
 * Popover の中身。
 *
 * @example
 * <PopoverContent>ここに補足を書く</PopoverContent>
 */
export function PopoverContent({
  children,
  className,
}: {
  children?: ReactNode
  className?: string
}) {
  return (
    <div data-slot="content" className={popoverStyles().content({ class: className })}>
      {children}
    </div>
  )
}

/**
 * トリガーに紐づいて浮かぶ小さな面。Escape で閉じてトリガーへフォーカスが戻る。
 *
 * Raster では矢印（arrow slot）を描画しない。任意 slot を省略できることの実例。
 *
 * @example
 * <Popover placement="bottom">
 *   <Button>詳細</Button>
 *   <PopoverContent>ここに補足を書く</PopoverContent>
 * </Popover>
 */
export function Popover({
  radius,
  placement = 'bottom',
  offset = 6,
  isOpen,
  defaultOpen,
  onOpenChange,
  children,
  className,
  classNames,
  id,
}: PopoverProps) {
  const s = popoverStyles({ radius })
  const items = Array.isArray(children) ? children : [children]
  const [trigger, ...content] = items

  return (
    <DialogTrigger isOpen={isOpen} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {trigger}
      <RACPopover
        placement={placement}
        offset={offset}
        data-slot="root"
        className={s.root({ class: [className, classNames?.root] })}
      >
        <Dialog className="outline-none">{content}</Dialog>
      </RACPopover>
    </DialogTrigger>
  )
}

/**
 * 要素の補足説明。ホバーとフォーカスの両方で開く。
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
        <span data-slot="content" className={s.content({ class: classNames?.content })}>
          {content}
        </span>
      </RACTooltip>
    </TooltipTrigger>
  )
}
