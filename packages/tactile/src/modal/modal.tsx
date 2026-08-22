'use client'

import type { ModalProps } from '@novi-ui/core'
import { Children, isValidElement, type ReactNode } from 'react'
import { Button, Dialog, Heading, ModalOverlay, Modal as RACModal } from 'react-aria-components'
import { grabberClass, modalStyles } from './modal.styles'

interface PartProps {
  children?: ReactNode
  className?: string
}

/**
 * Modal の見出し。
 *
 * Raster と違い**ヘッダー行を作らない** — 閉じるボタンはフッターにあるので、
 * 横方向に並べる相手がいない。見出しは本文の上に素直に載る。
 * それでも描画するのは、ダイアログにアクセシブルな名前が要るため。
 *
 * @example
 * <ModalTitle>削除しますか</ModalTitle>
 */
export function ModalTitle({ children, className }: PartProps) {
  return (
    <Heading slot="title" data-slot="title" className={modalStyles().title({ class: className })}>
      {children}
    </Heading>
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

/** 閉じるボタン。`slot="close"` は Dialog の文脈から閉じる手段を受け取る。 */
function CloseButton({ className }: { className?: string }) {
  return (
    <Button
      slot="close"
      data-slot="closeButton"
      className={modalStyles().closeButton({ class: className })}
    >
      閉じる
    </Button>
  )
}

/**
 * Modal の操作列。**縦積みでフルワイド**になり、末尾に閉じるボタンが入る。
 *
 * 横に並べると1つあたりの幅が指に対して狭くなるため、Tactile では積む。
 * 閉じるを最後に置くのは、親指が最も届く位置が下端だから。
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
      <CloseButton />
    </div>
  )
}

/** 子に `ModalFooter` が含まれるか。含まれない場合だけ既定のフッターを足す。 */
function hasFooter(children: ReactNode): boolean {
  return Children.toArray(children).some(
    (child) => isValidElement(child) && child.type === ModalFooter,
  )
}

/**
 * 画面下端から出るボトムシート。開いている間フォーカスは内側に閉じ込められ、
 * Escape で閉じる。
 *
 * Raster が中央のダイアログで閉じるを右上に置くのに対し、Tactile は
 * **下から出て、閉じるをフッターのフルワイドボタンにする**。親指の届く位置に
 * 出口を置くため。`size` は幅ではなく**最大高**の意味になる（ADR-T3）。
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
        {/* RAC の ModalOverlay / Modal は id を受け取らないため Dialog に付ける */}
        <Dialog id={id} className="outline-none flex flex-col">
          {/* 掴み手。slot 語彙に無いので data-slot を付けず aria-hidden にする。
              ドラッグ開閉は未実装（NG6）なので、掴めそうに見せすぎない細さに留める */}
          <div data-tactile-grabber aria-hidden="true" className={grabberClass} />

          {children}

          {/* 出口を必ず1つ持たせる。利用者が ModalFooter を置いた場合はそちらに入るので、
              ここで足すと footer slot が二重になる */}
          {!hasFooter(children) && (
            <div data-slot="footer" className={s.footer({ class: classNames?.footer })}>
              <CloseButton className={classNames?.closeButton} />
            </div>
          )}
        </Dialog>
      </RACModal>
    </ModalOverlay>
  )
}
