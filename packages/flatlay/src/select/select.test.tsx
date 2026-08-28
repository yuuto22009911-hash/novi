import { NOVI_CONTRACTS, NOVI_SIZES, NOVI_VARIANTS } from '@novi-ui/core'
import { testSlotContract } from '@novi-ui/core/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { tv } from 'tailwind-variants'
import { describe, expect, it, vi } from 'vitest'
import { Select, SelectItem } from './select'
import { selectStyles } from './select.styles'

/** 全 slot が出る状態。展開部はフローの中なので `container` から辿れる。 */
const openSelect = (props: Partial<Parameters<typeof Select>[0]> = {}) => (
  <Select label="都道府県" description="住所の都道府県" defaultOpen {...props}>
    <SelectItem id="tokyo">東京都</SelectItem>
    <SelectItem id="osaka">大阪府</SelectItem>
  </Select>
)

testSlotContract({
  name: 'Select',
  contract: NOVI_CONTRACTS.Select,
  render: () => openSelect({ isInvalid: true, errorMessage: '選んでください' }),
})

describe('Select: 描画', () => {
  it('デフォルト props でレンダリングできる', () => {
    render(
      <Select label="都道府県">
        <SelectItem id="tokyo">東京都</SelectItem>
      </Select>,
    )
    expect(screen.getByRole('button', { name: /都道府県/ })).toBeDefined()
  })

  it('閉じているときは一覧を描画しない', () => {
    const { container } = render(
      <Select label="都道府県">
        <SelectItem id="tokyo">東京都</SelectItem>
      </Select>,
    )
    expect(container.querySelector('[data-slot="popover"]')).toBeNull()
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('選択済みの値がトリガーに出る', () => {
    render(
      <Select label="都道府県" defaultSelectedKey="osaka">
        <SelectItem id="tokyo">東京都</SelectItem>
        <SelectItem id="osaka">大阪府</SelectItem>
      </Select>,
    )
    expect(screen.getByRole('button').textContent).toContain('大阪府')
  })
})

describe('Select: variant / size（AC-02-1 / AC-01-2）', () => {
  it.each(NOVI_VARIANTS)('variant=%s が固有のクラスを適用する', (variant) => {
    const produced = NOVI_VARIANTS.map((v) => selectStyles({ variant: v }).trigger())
    expect(new Set(produced).size).toBe(NOVI_VARIANTS.length)
    expect(selectStyles({ variant }).trigger()).toBeTruthy()
  })

  it.each(NOVI_SIZES)('size=%s が固有の高さを与える', (size) => {
    const produced = NOVI_SIZES.map((s) => selectStyles({ size: s }).trigger())
    expect(new Set(produced).size).toBe(NOVI_SIZES.length)
    expect(selectStyles({ size }).trigger()).toBeTruthy()
  })

  it('トリガーの高さは帳票の行（28 / 32 / 40px）', () => {
    expect(selectStyles({ size: 'sm' }).trigger()).toContain('h-7')
    expect(selectStyles({ size: 'md' }).trigger()).toContain('h-8')
    expect(selectStyles({ size: 'lg' }).trigger()).toContain('h-10')
  })

  it('一覧の行も帳票の行（既定 28px）。指の下限 44px には合わせない', () => {
    // 行を大きくすると、開いた瞬間にページが視界の外まで伸びて押し下げが読めなくなる
    expect(selectStyles({ size: 'sm' }).option()).toContain('h-6')
    expect(selectStyles({ size: 'md' }).option()).toContain('h-7')
    expect(selectStyles({ size: 'lg' }).option()).toContain('h-8')
  })
})

describe('Select: classNames（FR-04）', () => {
  it('classNames が該当 slot に反映される', () => {
    const { container } = render(
      openSelect({
        classNames: {
          root: 'test-root',
          label: 'test-label',
          trigger: 'test-trigger',
          popover: 'test-popover',
          listbox: 'test-listbox',
          description: 'test-description',
        },
      }),
    )
    for (const [slot, cls] of [
      ['root', 'test-root'],
      ['label', 'test-label'],
      ['trigger', 'test-trigger'],
      ['popover', 'test-popover'],
      ['listbox', 'test-listbox'],
      ['description', 'test-description'],
    ] as const) {
      expect(container.querySelector(`[data-slot="${slot}"]`)?.className, slot).toContain(cls)
    }
  })

  it('tv({ extend: selectStyles }) で拡張できる', () => {
    const custom = tv({ extend: selectStyles, slots: { option: 'uppercase' } })
    expect(custom({}).option()).toContain('uppercase')
  })
})

describe('Select: インフロー押し下げ（AC-01-1 / AC-02-2 / ADR-F5）', () => {
  it('展開部はトリガーと同じフローの中に出る（body 直下へ浮かない）', () => {
    const { container } = render(openSelect())
    const popover = container.querySelector('[data-slot="popover"]')
    const root = container.querySelector('[data-slot="root"]')

    expect(popover).not.toBeNull()
    expect(root?.contains(popover as Node)).toBe(true)
  })

  it('展開部はトリガーの後ろ、説明文の前に挿し込まれる（後続を押し下げる）', () => {
    const { container } = render(openSelect())
    const trigger = container.querySelector('[data-slot="trigger"]')
    const popover = container.querySelector('[data-slot="popover"]')
    const description = container.querySelector('[data-slot="description"]')

    expect(trigger?.compareDocumentPosition(popover as Node)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING as number,
    )
    expect(popover?.compareDocumentPosition(description as Node)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING as number,
    )
  })

  it('上流のインライン座標を打ち消してフローに戻す', () => {
    const { container } = render(openSelect())
    // `useOverlayPosition` が style 属性へ直接書き込むので、`!` でしか勝てない
    expect(container.querySelector('[data-slot="popover"]')?.className).toContain('static!')
  })

  it('背後を inert にしない（押し下げられた後続を読めなくなるため）', () => {
    const { container } = render(openSelect())
    // モーダルにすると description まで触れなくなり、インフローにした意味が消える
    expect(container.querySelector('[data-slot="description"]')?.closest('[inert]')).toBeNull()
  })

  it('閉じている間は置き場所を畳む（gap ぶんの余白を残さない）', () => {
    // 空の子でも flex の gap は掛かる。畳まないと閉じたまま余白が1つ増える
    expect(selectStyles({}).root()).toContain('[&>[data-novi-inflow]:empty]:hidden')
  })
})

describe('Select: 操作とキーボード（AC-05-1）', () => {
  it('トリガーを押すと開く', async () => {
    render(
      <Select label="都道府県">
        <SelectItem id="tokyo">東京都</SelectItem>
      </Select>,
    )
    await userEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('listbox')).toBeDefined()
  })

  it('矢印と Enter だけで選べる', async () => {
    const onSelectionChange = vi.fn()
    render(
      <Select label="都道府県" onSelectionChange={onSelectionChange}>
        <SelectItem id="tokyo">東京都</SelectItem>
        <SelectItem id="osaka">大阪府</SelectItem>
      </Select>,
    )

    await userEvent.tab()
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard('{ArrowDown}{Enter}')

    expect(onSelectionChange).toHaveBeenCalledWith('osaka')
  })

  it('Escape で閉じ、フォーカスがトリガーへ戻る', async () => {
    render(
      <Select label="都道府県">
        <SelectItem id="tokyo">東京都</SelectItem>
      </Select>,
    )
    const trigger = screen.getByRole('button')

    await userEvent.click(trigger)
    await userEvent.keyboard('{Escape}')

    // 閉じる描画とフォーカス復帰は別のタイミングで起きる。
    // 一覧が消えた時点で見ると、まだ body にフォーカスが残っている
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).toBeNull()
      expect(document.activeElement).toBe(trigger)
    })
  })

  it('isDisabled では開かない', async () => {
    render(
      <Select label="都道府県" isDisabled>
        <SelectItem id="tokyo">東京都</SelectItem>
      </Select>,
    )
    await userEvent.click(screen.getByRole('button'))
    expect(screen.queryByRole('listbox')).toBeNull()
  })
})

describe('Select: 選択の印は記号（ADR-F3 との住み分け）', () => {
  it('選択済みの行だけが ▸ を持つ', () => {
    render(
      <Select label="都道府県" defaultSelectedKey="osaka" defaultOpen>
        <SelectItem id="tokyo">東京都</SelectItem>
        <SelectItem id="osaka">大阪府</SelectItem>
      </Select>,
    )
    const marked = screen
      .getAllByRole('option')
      .filter((option) => option.textContent?.includes('▸'))

    expect(marked).toHaveLength(1)
    expect(marked[0]?.textContent).toContain('大阪府')
  })

  it('押下の反転は press の瞬間だけ（選択の表現と衝突させない）', () => {
    const trigger = selectStyles({}).trigger()
    expect(trigger).toContain('data-[pressed]:bg-')
    expect(trigger).toContain('data-[pressed]:text-')
    expect(selectStyles({}).option()).not.toContain('data-[pressed]:')
  })
})

describe('Select: Flatlay の基準（差分）', () => {
  const allSlots = () =>
    NOVI_VARIANTS.flatMap((variant) =>
      NOVI_SIZES.flatMap((size) =>
        Object.values(selectStyles({ variant, size })).map((slot) => slot()),
      ),
    ).join(' ')

  it('影も z-index も持たない', () => {
    expect(allSlots()).not.toMatch(/(?<![\w-])shadow-/)
    expect(allSlots()).not.toMatch(/(?<![\w-])z-(?:\d+|\[[^\]]*\])/)
  })

  it('展開をアニメーションしない（ADR-F1）', () => {
    // 押し下げに transition を付けると、後続が滑り続けて読めなくなる
    expect(allSlots()).not.toMatch(/(?<![\w-])animate-/)
    expect(allSlots()).not.toMatch(/transition-\[[^\]]*height/)
  })

  it('開閉の向きを回転で示さない（記号を差し替える）', () => {
    expect(allSlots()).not.toMatch(/(?<![\w-])(?:scale|translate|rotate)-/)
    expect(selectStyles({}).icon()).toContain('--novi-font-mono')
  })

  it('展開面と行の切れ目を罫線で示す（影が無い紙面で面を示せるのは線だけ）', () => {
    expect(selectStyles({}).popover()).toContain('border-[var(--novi-color-border-strong)]')
    expect(selectStyles({}).listbox()).toContain('divide-y')
  })

  it('全 variant が罫線の幅を持つ', () => {
    for (const variant of NOVI_VARIANTS) {
      expect(selectStyles({ variant }).trigger().split(' '), variant).toContain('border')
    }
  })

  it('色はすべてトークン経由（リテラルを書かない）', () => {
    expect(allSlots()).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgb\(|hsl\(|oklch\(/)
  })
})
