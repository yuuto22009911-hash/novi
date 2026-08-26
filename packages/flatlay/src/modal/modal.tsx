'use client'

import type { ModalProps } from '@novi-ui/core'
import { Children, isValidElement, type ReactNode } from 'react'
import { Button, Dialog, Heading, ModalOverlay, Modal as RACModal } from 'react-aria-components'
import { backArrowClass, modalStyles } from './modal.styles'

interface PartProps {
  children?: ReactNode
  className?: string
}

/** 「← 戻る」。テイクオーバーは閉じて消えるのではなく、前の紙に戻る。 */
function CloseButton({ className }: { className?: string }) {
  return (
    <Button
      slot="close"
      data-slot="closeButton"
      className={modalStyles().closeButton({ class: className })}
    >
      <span aria-hidden="true" className={backArrowClass}>
        ←
      </span>
      戻る
    </Button>
  )
}

/**
 * Modal の見出し。**ヘッダ行の中で「← 戻る」の右に並ぶ。**
 *
 * Raster は右上に ✕、Tactile はフッターに閉じるを置く。Flatlay が左端なのは、
 * 書類の「戻る」が常に左上にあるから。名前が同じで位置が違う3例目（design.md）。
 *
 * @example
 * <ModalTitle>削除しますか</ModalTitle>
 */
export function ModalTitle({ children, className }: PartProps) {
  const s = modalStyles()
  return (
    <div data-slot="header" className={s.header()}>
      <CloseButton />
      <Heading slot="title" data-slot="title" className={s.title({ class: className })}>
        {children}
      </Heading>
    </div>
  )
}

/**
 * Modal の本体。`size` が効くのはここで、**本文の最大行長**として解釈される。
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
 * Modal の操作列。上辺の罫線で本文と切り、**左揃え**で並ぶ。
 *
 * 右揃え（Raster）でも縦積み（Tactile）でもないのは、
 * ヘッダの「← 戻る」と縦の線を合わせるため。
 *
 * @example
 * <ModalFooter>
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

/** 子に `ModalTitle` が含まれるか。含まれない場合だけ既定のヘッダを足す。 */
function hasTitle(children: ReactNode): boolean {
  return Children.toArray(children).some(
    (child) => isValidElement(child) && child.type === ModalTitle,
  )
}

/**
 * 全画面テイクオーバー。開いている間フォーカスは内側に閉じ込められ、Escape で戻る。
 *
 * 浮かせる先が無いので、別の面を重ねる代わりに**紙ごと差し替える**。
 * 地は暗転せず紙色のままで、文書が切り替わったことは
 * ヘッダの「← 戻る」と下辺の罫線が示す（ADR-F2）。
 *
 * `size` は幅でも高さでもなく**本文の最大行長**です。
 *
 * @example
 * <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
 *   <ModalTitle>削除しますか</ModalTitle>
 *   <ModalBody>この操作は取り消せません。</ModalBody>
 * </Modal>
 */
export function Modal({
  size,
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
  const s = modalStyles({ size })

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
        {/* RAC の ModalOverlay / Modal は id を受け取らないため Dialog に付ける */}
        <Dialog id={id} className="outline-none flex flex-col grow">
          {/* 出口を必ず1つ持たせる。利用者が ModalTitle を置いた場合はそちらに入るので、
              ここで足すと header slot が二重になる */}
          {!hasTitle(children) && (
            <div data-slot="header" className={s.header({ class: classNames?.header })}>
              <CloseButton className={classNames?.closeButton} />
            </div>
          )}

          {children}
        </Dialog>
      </RACModal>
    </ModalOverlay>
  )
}
