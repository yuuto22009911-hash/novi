import { NOVI_COLORS, NOVI_CONTRACTS, NOVI_SIZES, NOVI_VARIANTS } from '@novi-ui/core'
import { checkSlotContract, testSlotContract } from '@novi-ui/core/testing'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { tv } from 'tailwind-variants'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './button'
import { buttonStyles } from './button.styles'

/**
 * 全コンポーネント共通の5点セット。
 * 1. デフォルト props でレンダリングできる
 * 2. slot 契約を満たす
 * 3. a11y 違反がない
 * 4. 全 variant / size / color がクラスを適用する
 * 5. classNames が該当 slot に反映される
 *
 * Flatlay 固有の追加は末尾の「押下は反転」と「z 軸の語彙を持たない」。
 * 基準パターンなので、以降のコンポーネントはこの並びをそのまま踏襲する。
 */

// 2. slot 契約（AC-03-1 / AC-03-2）
testSlotContract({
  name: 'Button',
  contract: NOVI_CONTRACTS.Button,
  render: () => (
    <Button startContent={<span>←</span>} endContent={<span>→</span>} isLoading>
      保存
    </Button>
  ),
})

describe('Button: 描画', () => {
  it('デフォルト props でレンダリングできる', () => {
    render(<Button>保存</Button>)
    expect(screen.getByRole('button', { name: '保存' })).toBeDefined()
  })

  it('type は既定で button（フォーム内で誤って送信しないため）', () => {
    render(<Button>保存</Button>)
    expect(screen.getByRole('button').getAttribute('type')).toBe('button')
  })

  it('任意 slot は指定しなければ描画しない', () => {
    const { container } = render(<Button>保存</Button>)
    const result = checkSlotContract(container, NOVI_CONTRACTS.Button)
    expect(result.found).toEqual(['label', 'root'])
    expect(result.missing).toEqual([])
  })

  it('startContent / endContent を渡すとその slot が出る', () => {
    const { container } = render(
      <Button startContent={<span>←</span>} endContent={<span>→</span>}>
        保存
      </Button>,
    )
    expect(container.querySelector('[data-slot="startContent"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="endContent"]')).not.toBeNull()
  })
})

describe('Button: variant / size / color（AC-02-1 / AC-01-2）', () => {
  it.each(NOVI_VARIANTS)('variant=%s が固有のクラスを適用する', (variant) => {
    const produced = NOVI_VARIANTS.map((v) => buttonStyles({ variant: v }).root())
    expect(new Set(produced).size).toBe(NOVI_VARIANTS.length)
    expect(buttonStyles({ variant }).root()).toBeTruthy()
  })

  it.each(NOVI_SIZES)('size=%s が固有の高さを与える', (size) => {
    const produced = NOVI_SIZES.map((s) => buttonStyles({ size: s }).root())
    expect(new Set(produced).size).toBe(NOVI_SIZES.length)
    expect(buttonStyles({ size }).root()).toBeTruthy()
  })

  it.each(NOVI_COLORS)('color=%s が固有のトークンを指す', (color) => {
    const produced = NOVI_COLORS.map((c) => buttonStyles({ color: c }).root())
    expect(new Set(produced).size).toBe(NOVI_COLORS.length)
    expect(buttonStyles({ color }).root()).toContain('[--c:')
  })

  it('高さは帳票の行（28 / 32 / 40px）', () => {
    expect(buttonStyles({ size: 'sm' }).root()).toContain('h-7')
    expect(buttonStyles({ size: 'md' }).root()).toContain('h-8')
    expect(buttonStyles({ size: 'lg' }).root()).toContain('h-10')
  })
})

describe('Button: classNames（FR-04）', () => {
  it('classNames が該当 slot に反映される', () => {
    const { container } = render(
      <Button
        startContent={<span>←</span>}
        classNames={{ root: 'test-root', label: 'test-label', startContent: 'test-start' }}
      >
        保存
      </Button>,
    )
    expect(container.querySelector('[data-slot="root"]')?.className).toContain('test-root')
    expect(container.querySelector('[data-slot="label"]')?.className).toContain('test-label')
    expect(container.querySelector('[data-slot="startContent"]')?.className).toContain('test-start')
  })

  it('className は root に足される', () => {
    render(<Button className="test-outer">保存</Button>)
    expect(screen.getByRole('button').className).toContain('test-outer')
  })

  it('tv({ extend: buttonStyles }) で拡張できる', () => {
    const custom = tv({ extend: buttonStyles, slots: { label: 'uppercase' } })
    expect(custom({}).label()).toContain('uppercase')
    expect(custom({}).label()).toContain('truncate')
  })
})

describe('Button: 挙動', () => {
  it('押すと onPress が呼ばれる', async () => {
    const onPress = vi.fn()
    render(<Button onPress={onPress}>保存</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onPress).toHaveBeenCalledOnce()
  })

  it('isLoading の間は押せない（見た目だけ変えて押せる状態にしない）', async () => {
    const onPress = vi.fn()
    render(
      <Button isLoading onPress={onPress}>
        保存
      </Button>,
    )
    await userEvent.click(screen.getByRole('button'))
    expect(onPress).not.toHaveBeenCalled()
    expect(screen.getByRole('button').getAttribute('data-loading')).toBe('true')
  })

  it('isDisabled では押せない', async () => {
    const onPress = vi.fn()
    render(
      <Button isDisabled onPress={onPress}>
        保存
      </Button>,
    )
    await userEvent.click(screen.getByRole('button'))
    expect(onPress).not.toHaveBeenCalled()
  })
})

describe('Button: 押下は反転（FR-11 / ADR-F3）', () => {
  /** 全 variant × 全 color の root クラスを1つに集める。 */
  const allRoots = () =>
    NOVI_VARIANTS.flatMap((variant) =>
      NOVI_COLORS.map((color) => buttonStyles({ variant, color }).root()),
    ).join(' ')

  it.each(NOVI_VARIANTS)('variant=%s は押下で面と文字が入れ替わる', (variant) => {
    const root = buttonStyles({ variant }).root()
    expect(root).toContain('data-[pressed]:bg-')
    expect(root).toContain('data-[pressed]:text-')
  })

  it('沈む・縮む表現を使わない（z 軸の語彙）', () => {
    expect(allRoots()).not.toMatch(/(?<![\w-])(?:scale|translate|rotate)-/)
  })

  it('影を持たない（浮く層が無い以上、影は嘘）', () => {
    expect(allRoots()).not.toMatch(/(?<![\w-])shadow-/)
  })

  it('動かすのは色だけ（transition の対象に寸法が入らない）', () => {
    const root = buttonStyles({}).root()
    expect(root).toContain('transition-[background-color,border-color,color]')
    expect(root).not.toMatch(/transition-\[[^\]]*(?:height|width|scale|transform)/)
  })
})

describe('Button: Flatlay の基準（差分）', () => {
  it('全 variant が罫線の幅を持つ（影が無い紙面で輪郭を示せるのは線だけ）', () => {
    for (const variant of NOVI_VARIANTS) {
      expect(buttonStyles({ variant }).root().split(' '), variant).toContain('border')
    }
  })

  it('線の色は variant が決める（ghost / plain だけが transparent を選ぶ）', () => {
    expect(buttonStyles({ variant: 'solid' }).root()).toContain('border-[var(--c)]')
    expect(buttonStyles({ variant: 'outline' }).root()).toContain('border-[var(--c-line)]')
    expect(buttonStyles({ variant: 'soft' }).root()).toContain('border-[var(--novi-color-border)]')
    expect(buttonStyles({ variant: 'ghost' }).root()).toContain('border-transparent')
    expect(buttonStyles({ variant: 'plain' }).root()).toContain('border-transparent')
  })

  it('startContent / endContent が等幅かつ桁揃え（ADR-F7）', () => {
    for (const slot of [buttonStyles({}).startContent(), buttonStyles({}).endContent()]) {
      expect(slot).toContain('--novi-font-mono')
      expect(slot).toContain('tabular-nums')
    }
  })

  it('色はすべてトークン経由（リテラルを書かない）', () => {
    const all = NOVI_COLORS.map((color) => buttonStyles({ color }).root()).join(' ')
    expect(all).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgb\(|hsl\(|oklch\(/)
  })

  it('既定の角丸は sm（書類の直角 2px）', () => {
    expect(buttonStyles({}).root()).toContain('rounded-[var(--novi-radius-sm)]')
  })
})
