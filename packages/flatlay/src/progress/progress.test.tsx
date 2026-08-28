import { NOVI_COLORS, NOVI_CONTRACTS, NOVI_SIZES } from '@novi-ui/core'
import { testSlotContract } from '@novi-ui/core/testing'
import { render, screen } from '@testing-library/react'
import { tv } from 'tailwind-variants'
import { describe, expect, it } from 'vitest'
import { Progress } from './progress'
import { progressStyles } from './progress.styles'

testSlotContract({
  name: 'Progress',
  contract: NOVI_CONTRACTS.Progress,
  render: () => <Progress label="アップロード中" value={62} showValueLabel />,
})

describe('Progress: 描画', () => {
  it('value を進捗として読み上げさせる', () => {
    render(<Progress label="アップロード中" value={62} />)
    const bar = screen.getByRole('progressbar', { name: 'アップロード中' })
    expect(bar.getAttribute('aria-valuenow')).toBe('62')
  })

  it('indicator の幅が value に一致する', () => {
    const { container } = render(<Progress value={62} />)
    const indicator = container.querySelector<HTMLElement>('[data-slot="indicator"]')
    expect(indicator?.style.width).toBe('62%')
  })

  it('minValue / maxValue を割合に反映する', () => {
    const { container } = render(<Progress value={5} minValue={0} maxValue={20} />)
    expect(container.querySelector<HTMLElement>('[data-slot="indicator"]')?.style.width).toBe('25%')
  })

  it('value を省略すると不確定になり、幅を持たない', () => {
    const { container } = render(<Progress label="処理中" />)
    const indicator = container.querySelector<HTMLElement>('[data-slot="indicator"]')
    expect(indicator?.style.width).toBe('')
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBeNull()
  })

  it('showValueLabel のときだけ数値を出す', () => {
    const { container, rerender } = render(<Progress value={62} />)
    expect(container.querySelector('[data-slot="valueLabel"]')).toBeNull()

    rerender(<Progress value={62} showValueLabel />)
    expect(container.querySelector('[data-slot="valueLabel"]')?.textContent).toBe('62%')
  })

  it('不確定のときは数値を出さない（示す値が無い）', () => {
    const { container } = render(<Progress showValueLabel />)
    expect(container.querySelector('[data-slot="valueLabel"]')).toBeNull()
  })
})

describe('Progress: 線であって面ではない', () => {
  it('track は角を持たない（罫線なので）', () => {
    expect(progressStyles().track()).toContain('rounded-[var(--novi-radius-none)]')
    expect(progressStyles().track()).not.toContain('rounded-[var(--novi-radius-full)]')
  })

  it('track の地は罫線の色（2px の subtle では線が消える）', () => {
    expect(progressStyles().track()).toContain('bg-[var(--novi-color-border)]')
    expect(progressStyles().track()).not.toContain('bg-[var(--novi-color-subtle)]')
  })

  it('太さは 1 / 2 / 4px（両テーマより1段細い）', () => {
    expect(progressStyles({ size: 'sm' }).track()).toContain('h-px')
    expect(progressStyles({ size: 'md' }).track()).toContain('h-0.5')
    expect(progressStyles({ size: 'lg' }).track()).toContain('h-1')
  })

  it('伸びるのは幅だけ（transform を transition しない）', () => {
    expect(progressStyles().indicator()).toContain('transition-[width]')
    expect(progressStyles().indicator()).not.toContain('transform')
  })
})

describe('Progress: 不確定は滑らず脈打つ（FR-11）', () => {
  it('translate も keyframes の往復も使わない', () => {
    const indicator = progressStyles({ isIndeterminate: true }).indicator()
    expect(indicator).not.toMatch(/(?<![\w-])(?:scale|rotate|translate)-/)
    expect(indicator).not.toMatch(/animate-\[/)
  })

  it('全幅のまま濃さだけを変える', () => {
    const indicator = progressStyles({ isIndeterminate: true }).indicator()
    expect(indicator).toContain('w-full')
    expect(indicator).toContain('animate-pulse')
  })

  it('prefers-reduced-motion では止まる', () => {
    expect(progressStyles({ isIndeterminate: true }).indicator()).toContain('motion-safe:')
  })

  it('確定表示は脈打たない', () => {
    expect(progressStyles({ isIndeterminate: false }).indicator()).not.toContain('animate-pulse')
  })
})

describe('Progress: Flatlay のデザイン規律', () => {
  it('数値は等幅で桁が揃う（ADR-F7）', () => {
    expect(progressStyles().valueLabel()).toContain('font-(family-name:--novi-font-mono)')
    expect(progressStyles().valueLabel()).toContain('tabular-nums')
  })

  it('ラベルも等幅（項目名なので記号扱い）', () => {
    expect(progressStyles().label()).toContain('font-(family-name:--novi-font-mono)')
  })

  it('影も z-index も持たない', () => {
    const classes = Object.values(progressStyles())
      .map((slot) => slot())
      .join(' ')
    expect(classes).not.toMatch(/(?<![\w-])shadow-/)
    expect(classes).not.toMatch(/(?<![\w-])z-(?:\d+|\[[^\]]*\])/)
  })

  it.each(NOVI_COLORS)('color=%s が固有のクラスを適用する', (color) => {
    const produced = NOVI_COLORS.map((c) => progressStyles({ color: c }).root())
    expect(new Set(produced).size).toBe(NOVI_COLORS.length)
    expect(progressStyles({ color }).root()).toBeTruthy()
  })

  it.each(NOVI_SIZES)('size=%s が固有のクラスを適用する', (size) => {
    const produced = NOVI_SIZES.map((s) => progressStyles({ size: s }).track())
    expect(new Set(produced).size).toBe(NOVI_SIZES.length)
    expect(progressStyles({ size }).track()).toBeTruthy()
  })
})

describe('Progress: 拡張', () => {
  it('tv({ extend }) で拡張できる', () => {
    const my = tv({ extend: progressStyles, slots: { track: 'opacity-50' } })
    expect(my().track()).toContain('opacity-50')
  })

  it('classNames が該当 slot に反映される', () => {
    const { container } = render(
      <Progress
        label="アップロード中"
        value={62}
        showValueLabel
        classNames={{
          root: 'p-root',
          label: 'p-label',
          track: 'p-track',
          indicator: 'p-indicator',
          valueLabel: 'p-value',
        }}
      />,
    )
    for (const [slot, cls] of [
      ['root', 'p-root'],
      ['label', 'p-label'],
      ['track', 'p-track'],
      ['indicator', 'p-indicator'],
      ['valueLabel', 'p-value'],
    ] as const) {
      expect(container.querySelector(`[data-slot="${slot}"]`)?.className, slot).toContain(cls)
    }
  })
})
