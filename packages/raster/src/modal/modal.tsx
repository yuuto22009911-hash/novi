'use client'

import type { ModalProps } from '@novi-ui/core'
import type { ReactNode } from 'react'
import { Button, Dialog, Heading, ModalOverlay, Modal as RACModal } from 'react-aria-components'
import { modalStyles } from './modal.styles'

interface PartProps {
  children?: ReactNode
  className?: string
}

/**
 * Modal の見出し。閉じるボタンと同じ行に並ぶ。
 *
 * @example
 * <ModalTitle>削除しますか</ModalTitle>
 */
export function ModalTitle({ children, className }: PartProps) {
  const s = modalStyles()
  return (
    <div data-slot="header" className={s.header()}>
      <Heading slot="title" data-slot="title" className={s.title({ class: className })}>
        {children}
      </Heading>
      <Button slot="close" data-slot="closeButton" className={s.closeButton()} aria-label="閉じる">
        <svg viewBox="0 0 16 16" width="1em" height="1em" fill="none" aria-hidden="true">
          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </Button>
    </div>
  )
}

/**
 * Modal の本体。
 *
 * @example
 * <ModalBody>この操作は取り消せません。</ModalBody>
 */
export function ModalBody({ children, className }: PartProps) {
  return (
    <div data-slot="body" className={modalStyles().body({ class: className })}>
      {children}
    </div>
  )
}

/**
 * Modal の操作列。右揃えで並ぶ。
 *
 * @example
 * <ModalFooter>
 *   <Button variant="outline">キャンセル</Button>
 *   <Button color="danger">削除</Button>
 * </ModalFooter>
 */
export function ModalFooter({ children, className }: PartProps) {
  return (
    <div data-slot="footer" className={modalStyles().footer({ class: className })}>
      {children}
    </div>
  )
}

/**
 * モーダルダイアログ。開いている間フォーカスは内側に閉じ込められ、Escape で閉じる。
 *
 * Raster では中央に置き、閉じるボタンをヘッダー右上に出す。
 * 影を使わないため、階層は背景の暗転と 1px の境界線で作る。
 *
 * @example
 * <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
 *   <ModalTitle>削除しますか</ModalTitle>
 *   <ModalBody>この操作は取り消せません。</ModalBody>
 * </Modal>
 */
export function Modal({
  size,
  radius,
  isOpen,
  defaultOpen,
  onOpenChange,
  isDismissable = true,
  isKeyboardDismissDisabled,
  children,
  className,
  classNames,
  id,
}: ModalProps) {
  const s = modalStyles({ size, radius })

  return (
    <ModalOverlay
      isOpen={isOpen}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      isDismissable={isDismissable}
      isKeyboardDismissDisabled={isKeyboardDismissDisabled}
      data-slot="backdrop"
      className={s.backdrop({ class: classNames?.backdrop })}
    >
      <RACModal data-slot="panel" className={s.panel({ class: [className, classNames?.panel] })}>
        <Dialog className="outline-none">{children}</Dialog>
      </RACModal>
    </ModalOverlay>
  )
}
