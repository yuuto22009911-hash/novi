import { NOVI_CONTRACTS } from '@novi-ui/core'
import { checkSlotContract, testSlotContract } from '@novi-ui/core/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { tv } from 'tailwind-variants'
import { describe, expect, it } from 'vitest'
import { Button } from '../button'
import { Tooltip } from './tooltip'
import { tooltipStyles } from './tooltip.styles'

testSlotContract({
  name: 'Tooltip',
  contract: NOVI_CONTRACTS.Tooltip,
  render: () => (
    <Tooltip content="コピーする" defaultOpen>
      <Button>複製</Button>
    </Tooltip>
  ),
})

describe('Tooltip: 操作', () => {
  // ホバーでの表示は jsdom では検証できない（React Aria の useHover が
  // ポインタの種類と移動を見ており、jsdom がそこまで再現しない）。
  // ブラウザでの確認は docs サイト側で担保する。

  it('フォーカスで開く（キーボード利用者に届く経路）', async () => {
    render(
      <Tooltip content="コピーする">
        <Button>複製</Button>
      </Tooltip>,
    )

    await userEvent.tab()

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeDefined()
    })
  })

  it('isDisabled のとき開かない', async () => {
    render(
      <Tooltip content="コピーする" isDisabled>
        <Button>複製</Button>
      </Tooltip>,
    )

    await userEvent.hover(screen.getByRole('button'))

    expect(screen.queryByRole('tooltip')).toBeNull()
  })
})

describe('Tooltip: 唯一の浮き（ADR-F6）', () => {
  it('上流のインライン座標を打ち消さない（Popover / Menu と違って浮く）', () => {
    const root = tooltipStyles().root()
    expect(root).not.toContain('static!')
    expect(root).not.toContain('z-auto!')
  })

  it('placement / offset がそのまま効く', () => {
    render(
      <Tooltip content="コピーする" placement="right" offset={16} defaultOpen>
        <Button>複製</Button>
      </Tooltip>,
    )
    expect(screen.getByRole('tooltip').getAttribute('data-placement')).toBe('right')
  })
})

describe('Tooltip: Flatlay のデザイン規律', () => {
  it('反転色の札にする（紙の上の面には見せない）', () => {
    const root = tooltipStyles().root()
    expect(root).toContain('bg-[var(--novi-color-fg)]')
    expect(root).toContain('text-[var(--novi-color-bg)]')
  })

  it('影を持たない（浮きは反転色と重なりが示す）', () => {
    expect(tooltipStyles().root()).not.toMatch(/(?<![\w-])shadow-/)
  })

  it('矢印を描かない（指す先は重なりの位置が示す）', () => {
    expect(tooltipStyles().arrow()).toContain('hidden')
  })

  it('arrow slot を描画しなくても契約違反にならない（任意 slot）', () => {
    const { baseElement } = render(
      <Tooltip content="コピーする" defaultOpen>
        <Button>複製</Button>
      </Tooltip>,
    )
    const result = checkSlotContract(baseElement, NOVI_CONTRACTS.Tooltip)

    expect(result.found).not.toContain('arrow')
    expect(result.missing).toEqual([])
  })

  it('注記の声は等幅（記号と数値を読ませる）', () => {
    expect(tooltipStyles().content()).toContain('font-(family-name:--novi-font-mono)')
  })

  it('transform を持たない（拡大しながら現れたりしない）', () => {
    const classes = Object.values(tooltipStyles())
      .map((slot) => slot())
      .join(' ')
    expect(classes).not.toMatch(/(?<![\w-])(?:scale|rotate|translate)-/)
  })

  it('既定の角は 2px', () => {
    expect(tooltipStyles().root()).toContain('rounded-[var(--novi-radius-sm)]')
  })
})

describe('Tooltip: 拡張', () => {
  it('tv({ extend }) で拡張できる', () => {
    expect(tv({ extend: tooltipStyles, slots: { content: 'px-4' } })().content()).toContain('px-4')
  })

  it('classNames が該当 slot に反映される', () => {
    render(
      <Tooltip content="コピーする" defaultOpen classNames={{ content: 'tip-content' }}>
        <Button>複製</Button>
      </Tooltip>,
    )
    expect(screen.getByText('コピーする').className).toContain('tip-content')
  })
})
