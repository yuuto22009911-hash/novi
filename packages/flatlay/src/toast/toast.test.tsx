import { NOVI_CONTRACTS, NOVI_RADII } from '@novi-ui/core'
import { checkSlotContract } from '@novi-ui/core/testing'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { tv } from 'tailwind-variants'
import { describe, expect, it } from 'vitest'
import { createToastQueue, NoviToastRegion } from './toast'
import { toastStyles } from './toast.styles'

const showToast = async (content: Parameters<ReturnType<typeof createToastQueue>['add']>[0]) => {
  const queue = createToastQueue()
  const rendered = render(
    <div>
      <NoviToastRegion queue={queue} />
      <p data-testid="after">後続</p>
    </div>,
  )

  act(() => {
    queue.add(content)
  })
  await waitFor(() => {
    expect(screen.getByText(String(content.title))).toBeDefined()
  })

  return rendered
}

describe('Toast: 表示', () => {
  it('キューに追加すると表示される', async () => {
    await showToast({ title: '保存しました' })
    expect(screen.getByText('保存しました')).toBeDefined()
  })

  it('slot 契約を満たす', async () => {
    const { baseElement } = await showToast({
      title: '保存しました',
      description: '変更が反映されています',
      color: 'success',
    })

    const result = checkSlotContract(baseElement, NOVI_CONTRACTS.Toast)
    expect(result.missing, `欠落: ${result.missing.join(', ')}`).toEqual([])
    expect(result.unknown).toEqual([])
  })

  it('閉じるボタンで消える', async () => {
    await showToast({ title: '保存しました' })

    await userEvent.click(screen.getByRole('button', { name: '閉じる' }))

    await waitFor(() => {
      expect(screen.queryByText('保存しました')).toBeNull()
    })
  })
})

describe('Toast: フロー挿入の帯（ADR-F4）', () => {
  it('置いた場所に出て、後続を押し下げる（body 直下へ浮かない）', async () => {
    const { container } = await showToast({ title: '保存しました' })
    const region = container.querySelector('[data-slot="region"]')
    const after = container.querySelector('[data-testid="after"]')

    expect(region).not.toBeNull()
    expect(region?.compareDocumentPosition(after as Node)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING as number,
    )
  })

  it('viewport に固定しない（fixed も sticky も持たない）', () => {
    const region = toastStyles().region()
    expect(region).not.toMatch(/(?<![\w-])(?:fixed|sticky|absolute)(?![\w-])/)
    expect(region).not.toMatch(/(?<![\w-])(?:top|right|bottom|left)-/)
  })

  it('z-index を持たない（FR-02）', () => {
    const classes = Object.values(toastStyles())
      .map((slot) => slot())
      .join(' ')
    expect(classes).not.toMatch(/(?<![\w-])z-(?:\d+|\[[^\]]*\])/)
  })
})

describe('Toast: Flatlay のデザイン規律', () => {
  it('面の存在は罫線が引き受ける（影を持たない）', () => {
    const root = toastStyles().root()
    expect(root).toContain('border-[var(--novi-color-border-strong)]')
    expect(root).not.toMatch(/(?<![\w-])shadow-/)
  })

  it('色は左端の罫だけが受け持つ（地を塗り分けない）', () => {
    expect(toastStyles({ color: 'danger' }).root()).toContain('[--c:var(--novi-color-danger)]')
    expect(toastStyles({ color: 'danger' }).root()).toContain('border-l-[var(--c)]')
    expect(toastStyles({ color: 'danger' }).root()).toContain('bg-[var(--novi-color-subtle)]')
  })

  it('出入りのアニメーションを持たない（展開は即時・FR-11）', () => {
    const classes = Object.values(toastStyles())
      .map((slot) => slot())
      .join(' ')
    expect(classes).not.toMatch(/(?<![\w-])animate-/)
    expect(classes).not.toMatch(/(?<![\w-])(?:scale|rotate|translate)-/)
  })

  it('見出しも注記も等幅（読み取らせる記録・ADR-F7）', () => {
    expect(toastStyles().title()).toContain('font-(family-name:--novi-font-mono)')
    expect(toastStyles().description()).toContain('font-(family-name:--novi-font-mono)')
  })

  it('既定は角なし（紙の幅いっぱいに走る帯）', () => {
    expect(toastStyles().root()).toContain('rounded-[var(--novi-radius-none)]')
  })

  it.each(NOVI_RADII)('radius=%s が固有のクラスを適用する', (radius) => {
    const produced = NOVI_RADII.map((r) => toastStyles({ radius: r }).root())
    expect(new Set(produced).size).toBe(NOVI_RADII.length)
    expect(toastStyles({ radius }).root()).toContain(`rounded-[var(--novi-radius-${radius})]`)
  })
})

describe('Toast: 拡張', () => {
  it('tv({ extend }) で拡張できる', () => {
    const my = tv({ extend: toastStyles, slots: { region: 'gap-3' } })
    expect(my().region()).toContain('gap-3')
  })
})
