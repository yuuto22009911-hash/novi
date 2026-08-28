import { NOVI_CONTRACTS, NOVI_SIZES } from '@novi-ui/core'
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

  it('ModalTitle を置かなくてもヘッダと出口が出る', () => {
    render(
      <Modal defaultOpen>
        <ModalBody>本文</ModalBody>
      </Modal>,
    )
    expect(document.body.querySelectorAll('[data-slot="header"]')).toHaveLength(1)
    expect(document.body.querySelectorAll('[data-slot="closeButton"]')).toHaveLength(1)
  })

  it('ModalTitle を置くとヘッダが二重にならない', () => {
    render(
      <Modal defaultOpen>
        <ModalTitle>確認</ModalTitle>
        <ModalBody>本文</ModalBody>
      </Modal>,
    )
    expect(document.body.querySelectorAll('[data-slot="header"]')).toHaveLength(1)
    expect(document.body.querySelectorAll('[data-slot="closeButton"]')).toHaveLength(1)
  })
})

describe('Modal: 操作', () => {
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

  it('「戻る」で閉じる', async () => {
    render(
      <Modal defaultOpen>
        <ModalTitle>確認</ModalTitle>
        <ModalBody>本文</ModalBody>
      </Modal>,
    )

    // 矢印は aria-hidden なので、読み上げられる名前は「戻る」だけ
    await userEvent.click(screen.getByRole('button', { name: '戻る' }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })

  it('フォーカスがダイアログ内に閉じ込められる', async () => {
    render(
      <Modal defaultOpen>
        <ModalTitle>確認</ModalTitle>
        <ModalBody>
          <Button>中のボタン</Button>
        </ModalBody>
      </Modal>,
    )
    const dialog = screen.getByRole('dialog')

    for (let i = 0; i < 6; i++) {
      await userEvent.tab()
      expect(dialog.contains(document.activeElement)).toBe(true)
    }
  })
})

describe('Modal: 全画面テイクオーバー（AC-02-1 / FR-06 / ADR-F2）', () => {
  const allSlots = () =>
    Object.values(modalStyles({}))
      .map((slot) => slot())
      .join(' ')

  it('backdrop が viewport 全面を占める', () => {
    expect(modalStyles({}).backdrop()).toContain('fixed inset-0')
  })

  it('panel が全面を埋める（中央の箱でも下端のシートでもない）', () => {
    const panel = modalStyles({}).panel()
    expect(panel).toContain('w-full')
    expect(panel).toContain('h-full')
    expect(panel).not.toMatch(/(?<![\w-])max-w-/)
  })

  it('z-index を持たない（最前は DOM 順が決める）', () => {
    // 1つでも足すと「重なりの順序を持つ UI」に変わる。例外なしの唯一の規律
    expect(allSlots()).not.toMatch(/(?<![\w-])z-(?:\d+|\[[^\]]*\])/)
  })

  it('地が暗転しない（overlay は紙色のトークン）', () => {
    // 暗転は「背後に何かがある」ことの表現なので、それ自体が z 軸の語彙になる
    expect(modalStyles({}).backdrop()).toContain('bg-[var(--novi-color-overlay)]')
    expect(allSlots()).not.toMatch(/bg-(?:black|\[rgba?\()/)
  })

  it('出現をアニメーションしない（ADR-F1）', () => {
    expect(allSlots()).not.toMatch(/(?<![\w-])animate-/)
  })

  it('影を持たない', () => {
    expect(allSlots()).not.toMatch(/(?<![\w-])shadow-/)
  })
})

describe('Modal: 構造差（名前が同じで位置が違う）', () => {
  it('closeButton はヘッダ行の中にあり、その先頭に立つ', () => {
    render(
      <Modal defaultOpen>
        <ModalTitle>確認</ModalTitle>
        <ModalBody>本文</ModalBody>
      </Modal>,
    )
    const header = document.body.querySelector('[data-slot="header"]')
    const close = document.body.querySelector('[data-slot="closeButton"]')
    const title = document.body.querySelector('[data-slot="title"]')

    expect(header?.contains(close ?? null)).toBe(true)
    // 「← 戻る」は書類の左上。title より前に来る
    expect(close?.compareDocumentPosition(title as Node)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING as number,
    )
  })

  it('footer は本文の後ろに来て、上辺の罫線で切られる', () => {
    render(
      <Modal defaultOpen>
        <ModalBody>本文</ModalBody>
        <ModalFooter>
          <Button>削除</Button>
        </ModalFooter>
      </Modal>,
    )
    const body = document.body.querySelector('[data-slot="body"]')
    const footer = document.body.querySelector('[data-slot="footer"]')

    expect(body?.compareDocumentPosition(footer as Node)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING as number,
    )
    expect(footer?.className).toContain('border-t')
  })
})

describe('Modal: size は本文の行長（ADR-06 の3例目）', () => {
  it.each(NOVI_SIZES)('size=%s が固有の行長を与える', (size) => {
    const produced = NOVI_SIZES.map((s) => modalStyles({ size: s }).body())
    expect(new Set(produced).size).toBe(NOVI_SIZES.length)
    expect(modalStyles({ size }).body()).toBeTruthy()
  })

  it('幅でも高さでもなく行長に効く（panel は size で変わらない）', () => {
    const panels = [...NOVI_SIZES, 'full' as const].map((s) => modalStyles({ size: s }).panel())
    expect(new Set(panels).size).toBe(1)
  })

  it('full は行長の制限を外す', () => {
    expect(modalStyles({ size: 'full' }).body()).toContain('max-w-none')
  })

  it('footer は本文と同じ行長に収まる', () => {
    for (const size of NOVI_SIZES) {
      const s = modalStyles({ size })
      const width = /max-w-\S+/.exec(s.body())?.[0]
      expect(s.footer(), size).toContain(width)
    }
  })
})

describe('Modal: 拡張', () => {
  it('tv({ extend }) で拡張できる', () => {
    const my = tv({ extend: modalStyles, slots: { panel: 'border-dashed' } })
    expect(my().panel()).toContain('border-dashed')
  })
})
