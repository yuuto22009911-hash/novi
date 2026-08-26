'use client'

import type { PopoverProps } from '@novi-ui/core'
import type { ReactNode } from 'react'
import { Dialog, DialogTrigger } from 'react-aria-components'
import { InflowPopover } from '../styles/inflow'
import { popoverStyles } from './popover.styles'

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
 * トリガーに紐づく注記の面。**面はトリガーの直後、フローの中に生える**
 * （両テーマはトリガーの隣に浮かぶ）。
 *
 * 開くと後続が押し下げられるので、何かが隠れることが無い。
 * Escape で閉じてトリガーへフォーカスが戻る。
 *
 * `placement` / `offset` は受け取るが**効かない**。浮かないものに寄せる先は無い。
 * `arrow` slot も描かない。指す先が無いので、矢印は嘘になる。
 *
 * @example
 * <Popover>
 *   <Button>詳細</Button>
 *   <PopoverContent>ここに補足を書く</PopoverContent>
 * </Popover>
 */
export function Popover({
  radius,
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

      {/* 注記面はトリガーの直後。ここに面が生えることで、後続が押し下がる */}
      <InflowPopover dataSlot="root" className={s.root({ class: [className, classNames?.root] })}>
        {/* RAC の Popover は id を受け取らないため Dialog に付ける */}
        <Dialog id={id} className="outline-none">
          {content}
        </Dialog>
      </InflowPopover>
    </DialogTrigger>
  )
}
