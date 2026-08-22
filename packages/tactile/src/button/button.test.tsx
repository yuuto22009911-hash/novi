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
    const { container } = render(<Button variant={variant}>保存</Button>)
    const root = container.querySelector('[data-slot="root"]')
    expect(root?.className).toContain(buttonStyles({ variant }).root().split(' ').at(-1) ?? '')
  })

  it('全 variant が互いに異なるクラスを生む（見た目が同じにならない）', () => {
    const classes = NOVI_VARIANTS.map((variant) => buttonStyles({ variant }).root())
    expect(new Set(classes).size).toBe(NOVI_VARIANTS.length)
  })

  it.each(NOVI_COLORS)('color=%s が固有のクラスを生む', (color) => {
    expect(buttonStyles({ color }).root()).toContain('--c:')
  })

  it('全 color が互いに異なるクラスを生む', () => {
    const classes = NOVI_COLORS.map((color) => buttonStyles({ color }).root())
    expect(new Set(classes).size).toBe(NOVI_COLORS.length)
  })

  it.each([
    ['sm', 'h-10'],
    ['md', 'h-12'],
    ['lg', 'h-14'],
  ] as const)('size=%s の高さが %s（40/48/56px・AC-01-4）', (size, expected) => {
    expect(buttonStyles({ size }).root()).toContain(expected)
  })

  it('size 語彙をすべて実装している', () => {
    const classes = NOVI_SIZES.map((size) => buttonStyles({ size }).root())
    expect(new Set(classes).size).toBe(NOVI_SIZES.length)
  })
})

describe('Button: classNames（AC-03-3）', () => {
  it('slot 単位でクラスを差し込める', () => {
    const { container } = render(
      <Button classNames={{ root: 'my-root', label: 'my-label' }}>保存</Button>,
    )
    expect(container.querySelector('[data-slot="root"]')?.className).toContain('my-root')
    expect(container.querySelector('[data-slot="label"]')?.className).toContain('my-label')
  })

  it('className はルートに付く', () => {
    const { container } = render(<Button className="my-class">保存</Button>)
    expect(container.querySelector('[data-slot="root"]')?.className).toContain('my-class')
  })
})

describe('Button: 操作', () => {
  it('クリックで onPress が呼ばれる', async () => {
    const onPress = vi.fn()
    render(<Button onPress={onPress}>保存</Button>)

    await userEvent.click(screen.getByRole('button'))

    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('キーボード（Enter）でも onPress が呼ばれる（AC-04-1）', async () => {
    const onPress = vi.fn()
    render(<Button onPress={onPress}>保存</Button>)

    await userEvent.tab()
    await userEvent.keyboard('{Enter}')

    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('isDisabled のとき押しても呼ばれない', async () => {
    const onPress = vi.fn()
    render(
      <Button isDisabled onPress={onPress}>
        保存
      </Button>,
    )

    await userEvent.click(screen.getByRole('button'))

    expect(onPress).not.toHaveBeenCalled()
  })

  it('isLoading のときは押せない（見た目だけ変えて押せる状態にしない）', async () => {
    const onPress = vi.fn()
    render(
      <Button isLoading onPress={onPress}>
        保存
      </Button>,
    )

    await userEvent.click(screen.getByRole('button'))

    expect(onPress).not.toHaveBeenCalled()
    expect(screen.getByRole('button').hasAttribute('disabled')).toBe(true)
  })
})

describe('Button: 拡張（AC-06-1 / AC-06-2）', () => {
  it('tv({ extend }) で拡張でき、元の variant が維持される', () => {
    // slot ベースの定義なので `base` ではなく `slots` で足す。
    // `base` は slot を持たない tv 定義にしか効かない。
    const myButton = tv({
      extend: buttonStyles,
      slots: { root: 'uppercase tracking-widest' },
    })

    const extended = myButton({ variant: 'outline', size: 'lg' }).root()

    expect(extended).toContain('uppercase')
    expect(extended).toContain('h-14')
    expect(extended).toContain('--c-line')
  })

  it('base では効かないことを明示的に固定する（誤用の早期検知）', () => {
    // ドキュメントに誤った例が混入すると、AI がそのまま壊れたコードを生成する。
    // 上流の挙動が変わったらこのテストが落ちて気づける。
    const wrong = tv({ extend: buttonStyles, base: 'uppercase' })
    expect(wrong({ variant: 'outline' }).root()).not.toContain('uppercase')
  })

  it('variant を追加できる', () => {
    const myButton = tv({
      extend: buttonStyles,
      variants: { emphasis: { high: { root: 'font-bold' } } },
    })
    expect(myButton({ variant: 'solid', emphasis: 'high' } as never).root()).toContain('font-bold')
  })

  it('buttonStyles が named export されている', () => {
    expect(typeof buttonStyles).toBe('function')
  })
})

describe('Button: Tactile のデザイン規律', () => {
  const allVariants = () =>
    NOVI_VARIANTS.map((variant) => buttonStyles({ variant }).root()).join(' ')

  it('solid だけが影を持ち、押下で消える（持ち上がっていた面が沈む）', () => {
    const solid = buttonStyles({ variant: 'solid' }).root()
    expect(solid).toContain('shadow-[var(--novi-shadow-sm)]')
    expect(solid).toContain('data-[pressed]:shadow-[var(--novi-shadow-none)]')

    for (const variant of NOVI_VARIANTS.filter((v) => v !== 'solid')) {
      expect(buttonStyles({ variant }).root()).not.toContain('--novi-shadow-sm')
    }
  })

  it('scale は押下状態にしか付かない（装飾目的では使わない・ADR-T5）', () => {
    const all = allVariants()
    expect(all).toContain('data-[pressed]:scale-[0.97]')
    // 修飾子の付かない裸の scale が混ざっていないこと
    expect(all).not.toMatch(
      /(?<!data-\[pressed\]:)(?<!motion-reduce:data-\[pressed\]:)\bscale-(?!100)/,
    )
  })

  it('reduced-motion で押下の沈み込みが消える（AC-09-2）', () => {
    expect(allVariants()).toContain('motion-reduce:data-[pressed]:scale-100')
  })

  it('rotate を使っていない', () => {
    expect(allVariants()).not.toMatch(/\brotate-/)
  })

  it('タップ領域を広げる断片が付いている（AC-01-5）', () => {
    // 視覚寸法とは独立に 44px を確保する。実効領域の実測は e2e（T-44）が担当する
    expect(buttonStyles().root()).toContain('before:size-[max(100%,44px)]')
  })

  it('色をリテラルで書かず、すべてトークン経由で参照している', () => {
    const all = NOVI_COLORS.map((color) => buttonStyles({ color }).root()).join(' ')
    expect(all).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgb\(|oklch\(/)
    expect(all).toContain('var(--novi-color-')
  })

  it('角丸がトークン経由で、既定は md（14px）', () => {
    expect(buttonStyles().root()).toContain('rounded-[var(--novi-radius-md)]')
  })
})
