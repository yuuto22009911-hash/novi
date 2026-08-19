import { NOVI_CONTRACTS } from '@novi-ui/core'
import { testSlotContract } from '@novi-ui/core/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { tv } from 'tailwind-variants'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '../button'
import { Modal, ModalBody, ModalFooter, ModalTitle } from './modal'
import { modalStyles } from './modal.styles'

testSlotContract({
  name: 'Modal',
  contract: NOVI_CONTRACTS.Modal,
  render: () => (
    <Modal defaultOpen>
      <ModalTitle>削除しますか</ModalTitle>
      <ModalBody>この操作は取り消せません。</ModalBody>
      <ModalFooter>
        <Button>キャンセル</Button>
      </ModalFooter>
    </Modal>
  ),
})

describe('Modal: 描画', () => {
  it('閉じているときは何も描画しない', () => {
    render(
      <Modal>
        <ModalBody>本文</ModalBody>
      </Modal>,
    )
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('開くとダイアログとして扱われる', () => {
    render(
      <Modal defaultOpen>
        <ModalTitle>確認</ModalTitle>
        <ModalBody>本文</ModalBody>
      </Modal>,
    )
    expect(screen.getByRole('dialog')).toBeDefined()
  })

  it('見出しがダイアログの名前になる', () => {
    render(
      <Modal defaultOpen>
        <ModalTitle>削除しますか</ModalTitle>
        <ModalBody>本文</ModalBody>
      </Modal>,
    )
    expect(screen.getByRole('dialog', { name: '削除しますか' })).toBeDefined()
  })
})

describe('Modal: 操作（AC-04-2 / AC-04-3）', () => {
  it('Escape で閉じる', async () => {
    const onOpenChange = vi.fn()
    render(
      <Modal defaultOpen onOpenChange={onOpenChange}>
        <ModalBody>本文</ModalBody>
      </Modal>,
    )

    await userEvent.keyboard('{Escape}')

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('isKeyboardDismissDisabled のとき Escape で閉じない', async () => {
    render(
      <Modal defaultOpen isKeyboardDismissDisabled>
        <ModalBody>本文</ModalBody>
      </Modal>,
    )

    await userEvent.keyboard('{Escape}')

    expect(screen.getByRole('dialog')).toBeDefined()
  })

  it('閉じるボタンで閉じる', async () => {
    render(
      <Modal defaultOpen>
        <ModalTitle>確認</ModalTitle>
        <ModalBody>本文</ModalBody>
      </Modal>,
    )

    await userEvent.click(screen.getByRole('button', { name: '閉じる' }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })

  it('フォーカスがダイアログ内に閉じ込められる（AC-04-2）', async () => {
    render(
      <Modal defaultOpen>
        <ModalTitle>確認</ModalTitle>
        <ModalBody>
          <Button>中のボタン</Button>
        </ModalBody>
      </Modal>,
    )
    const dialog = screen.getByRole('dialog')

    // 何度 Tab しても外へ出ない
    for (let i = 0; i < 6; i++) {
      await userEvent.tab()
      expect(dialog.contains(document.activeElement)).toBe(true)
    }
  })
})

describe('Modal: Raster のデザイン規律', () => {
  it('影を使わない（背景の暗転と 1px 境界線で階層を作る）', () => {
    expect(modalStyles().panel()).toContain('shadow-none')
    expect(modalStyles().panel()).not.toMatch(/shadow-(?!none)/)
    expect(modalStyles().backdrop()).toContain('var(--novi-color-overlay)')
  })

  it('閉じるボタンはヘッダー内に置く（architecture.md §5 テーマA）', () => {
    const { baseElement } = render(
      <Modal defaultOpen>
        <ModalTitle>確認</ModalTitle>
        <ModalBody>本文</ModalBody>
      </Modal>,
    )
    const header = baseElement.querySelector('[data-slot="header"]')
    expect(header?.querySelector('[data-slot="closeButton"]')).not.toBeNull()
  })

  it('size が異なるクラスを生む', () => {
    const classes = (['sm', 'md', 'lg', 'full'] as const).map((size) =>
      modalStyles({ size }).panel(),
    )
    expect(new Set(classes).size).toBe(4)
  })
})

describe('Modal: 拡張', () => {
  it('tv({ extend }) で拡張できる', () => {
    const my = tv({ extend: modalStyles, slots: { panel: 'border-dashed' } })
    expect(my().panel()).toContain('border-dashed')
  })
})
