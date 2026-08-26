import { NOVI_COLORS, NOVI_CONTRACTS, NOVI_SIZES } from '@novi-ui/core'
import { testSlotContract } from '@novi-ui/core/testing'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { tv } from 'tailwind-variants'
import { describe, expect, it, vi } from 'vitest'
import { Switch } from './switch'
import { switchStyles } from './switch.styles'

testSlotContract({
  name: 'Switch',
  contract: NOVI_CONTRACTS.Switch,
  render: () => (
    <Switch defaultSelected description="いつでも切り替えられます">
      メール通知を受け取る
    </Switch>
  ),
})

describe('Switch: 描画と操作', () => {
  it('デフォルト props でレンダリングできる', () => {
    render(<Switch>メール通知</Switch>)
    expect(screen.getByRole('switch', { name: 'メール通知' })).toBeDefined()
  })

  it('クリックで切り替わる', async () => {
    const onChange = vi.fn()
    render(<Switch onChange={onChange}>メール通知</Switch>)

    await userEvent.click(screen.getByRole('switch'))

    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('Space で切り替えられる', async () => {
    const onChange = vi.fn()
    render(<Switch onChange={onChange}>メール通知</Switch>)

    await userEvent.tab()
    await userEvent.keyboard(' ')

    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('isDisabled では切り替わらない', async () => {
    const onChange = vi.fn()
    render(
      <Switch isDisabled onChange={onChange}>
        メール通知
      </Switch>,
    )

    await userEvent.click(screen.getByRole('switch'))

    expect(onChange).not.toHaveBeenCalled()
  })

  it('children を省略すると label / description を描画しない', () => {
    const { container } = render(<Switch aria-label="通知" description="出ない" />)
    expect(container.querySelector('[data-slot="label"]')).toBeNull()
    expect(container.querySelector('[data-slot="description"]')).toBeNull()
  })
})

describe('Switch: つまみは滑らない（FR-11）', () => {
  it('位置は左右の寄せで決まり、translate を使わない', () => {
    const track = switchStyles().track()
    expect(track).toContain('justify-start')
    expect(track).toContain('group-data-[selected]:justify-end')
    expect(track).not.toMatch(/(?<![\w-])translate-/)
    expect(switchStyles().thumb()).not.toMatch(/(?<![\w-])translate-/)
  })

  it('つまみの移動に transition を持たせない（色だけが変わる）', () => {
    // transition-transform を書いても transform が無いので何も起きない。
    // 「動かない」ことを明示するために色以外は宣言しない
    expect(switchStyles().thumb()).toContain('transition-[background-color]')
    expect(switchStyles().track()).toContain('transition-[background-color,border-color]')
  })

  it('トラックもつまみも角が立つ（両テーマのピル型と違う）', () => {
    expect(switchStyles().track()).toContain('rounded-[var(--novi-radius-sm)]')
    expect(switchStyles().thumb()).toContain('rounded-[var(--novi-radius-none)]')
    expect(switchStyles().track()).not.toContain('rounded-[var(--novi-radius-full)]')
  })
})

describe('Switch: Flatlay のデザイン規律', () => {
  it('md のトラックは 28×14px（Button の 28px を横に倒した寸法）', () => {
    expect(switchStyles({ size: 'md' }).track()).toContain('h-3.5')
    expect(switchStyles({ size: 'md' }).track()).toContain('w-7')
  })

  it('sm / lg も帳票の行に収まる高さを持つ', () => {
    expect(switchStyles({ size: 'sm' }).track()).toContain('h-3')
    expect(switchStyles({ size: 'sm' }).track()).toContain('w-6')
    expect(switchStyles({ size: 'lg' }).track()).toContain('h-4.5')
    expect(switchStyles({ size: 'lg' }).track()).toContain('w-9')
  })

  it('押下で地とつまみが反転する（ADR-F3）', () => {
    expect(switchStyles().track()).toContain('group-data-[pressed]:bg-[var(--c-fg)]')
    expect(switchStyles().thumb()).toContain('group-data-[pressed]:bg-[var(--c)]')
  })

  it('影も z-index も transform も持たない（FR-02 / FR-11）', () => {
    for (const color of NOVI_COLORS) {
      const classes = Object.values(switchStyles({ color }))
        .map((slot) => slot())
        .join(' ')
      expect(classes, color).not.toMatch(/(?<![\w-])shadow-/)
      expect(classes, color).not.toMatch(/(?<![\w-])z-(?:\d+|\[[^\]]*\])/)
      expect(classes, color).not.toMatch(/(?<![\w-])(?:scale|rotate|translate)-/)
    }
  })

  it('ラベルは本文のまま（読ませる文なので等幅にしない）', () => {
    expect(switchStyles().label()).not.toContain('font-(family-name:--novi-font-mono)')
  })
})

describe('Switch: color / size（AC-04-1）', () => {
  it.each(NOVI_COLORS)('color=%s が固有のクラスを適用する', (color) => {
    const produced = NOVI_COLORS.map((c) => switchStyles({ color: c }).root())
    expect(new Set(produced).size).toBe(NOVI_COLORS.length)
    expect(switchStyles({ color }).root()).toBeTruthy()
  })

  it.each(NOVI_SIZES)('size=%s が固有のクラスを適用する', (size) => {
    const produced = NOVI_SIZES.map((s) => switchStyles({ size: s }).track())
    expect(new Set(produced).size).toBe(NOVI_SIZES.length)
    expect(switchStyles({ size }).track()).toBeTruthy()
  })
})

describe('Switch: classNames（FR-04）', () => {
  it('classNames が該当 slot に反映される', () => {
    const { container } = render(
      <Switch
        description="注記"
        classNames={{
          root: 'test-root',
          track: 'test-track',
          thumb: 'test-thumb',
          label: 'test-label',
          description: 'test-description',
        }}
      >
        メール通知
      </Switch>,
    )
    for (const [slot, cls] of [
      ['root', 'test-root'],
      ['track', 'test-track'],
      ['thumb', 'test-thumb'],
      ['label', 'test-label'],
      ['description', 'test-description'],
    ] as const) {
      expect(container.querySelector(`[data-slot="${slot}"]`)?.className, slot).toContain(cls)
    }
  })

  it('tv({ extend }) で拡張できる', () => {
    const custom = tv({ extend: switchStyles, slots: { label: 'font-medium' } })
    expect(custom({}).label()).toContain('font-medium')
  })
})
