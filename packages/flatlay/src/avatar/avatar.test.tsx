import { NOVI_CONTRACTS, NOVI_SIZES } from '@novi-ui/core'
import { testSlotContract } from '@novi-ui/core/testing'
import { fireEvent, render, screen } from '@testing-library/react'
import { tv } from 'tailwind-variants'
import { describe, expect, it } from 'vitest'
import { Badge } from '../badge'
import { Avatar, initialsOf } from './avatar'
import { avatarStyles } from './avatar.styles'

testSlotContract({
  name: 'Avatar',
  contract: NOVI_CONTRACTS.Avatar,
  render: () => <Avatar src="/me.jpg" name="山本 太郎" badge={<Badge size="sm">在席</Badge>} />,
})

describe('initialsOf', () => {
  it('空白で区切られた氏名は各語の先頭を取る', () => {
    expect(initialsOf('山本 太郎')).toBe('山太')
    expect(initialsOf('Taro Yamamoto')).toBe('TY')
  })

  it('区切りが無ければ先頭1文字だけを取る', () => {
    expect(initialsOf('山本太郎')).toBe('山')
  })

  it('空文字なら空を返す', () => {
    expect(initialsOf('   ')).toBe('')
  })
})

describe('Avatar: 描画', () => {
  it('src があれば画像を出す', () => {
    const { container } = render(<Avatar src="/me.jpg" name="山本 太郎" />)
    expect(container.querySelector('[data-slot="image"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="fallback"]')).toBeNull()
  })

  it('src が無ければイニシャルを出し、氏名を読み上げさせる', () => {
    render(<Avatar name="山本 太郎" />)
    expect(screen.getByRole('img', { name: '山本 太郎' }).textContent).toBe('山太')
  })

  it('読み込みに失敗したら fallback に切り替わる', () => {
    const { container } = render(<Avatar src="/broken.jpg" name="山本 太郎" />)
    const img = container.querySelector('[data-slot="image"]')
    expect(img).not.toBeNull()

    fireEvent.error(img as Element)

    expect(container.querySelector('[data-slot="image"]')).toBeNull()
    expect(container.querySelector('[data-slot="fallback"]')?.textContent).toBe('山太')
  })

  it('badge を渡したときだけ描く', () => {
    const { container, rerender } = render(<Avatar name="山本 太郎" />)
    expect(container.querySelector('[data-slot="badge"]')).toBeNull()

    rerender(<Avatar name="山本 太郎" badge={<Badge size="sm">在席</Badge>} />)
    expect(container.querySelector('[data-slot="badge"]')).not.toBeNull()
  })
})

describe('Avatar: badge は浮かない（FR-02 / FR-03）', () => {
  it('absolute も z-index も使わない', () => {
    const badge = avatarStyles().badge()
    expect(badge).not.toMatch(/(?<![\w-])absolute(?![\w-])/)
    expect(badge).not.toMatch(/(?<![\w-])z-(?:\d+|\[[^\]]*\])/)
  })

  it('画像と同じ升に重ね、順序は DOM 順が決める', () => {
    expect(avatarStyles().image()).toContain('[grid-area:1/1]')
    expect(avatarStyles().badge()).toContain('[grid-area:1/1]')

    // badge は最後の子。これだけが重なりの順序を決めている
    const { container } = render(<Avatar name="山本 太郎" badge={<Badge size="sm">在席</Badge>} />)
    const root = container.querySelector('[data-slot="root"]')
    expect(root?.lastElementChild?.getAttribute('data-slot')).toBe('badge')
  })

  it('枠の内側の下端に収まる（外へはみ出させない）', () => {
    const badge = avatarStyles().badge()
    expect(badge).toContain('self-end')
    expect(badge).not.toMatch(/-(?:top|right|bottom|left|m[trbl]?)-/)
    expect(avatarStyles().root()).toContain('overflow-hidden')
  })
})

describe('Avatar: Flatlay のデザイン規律', () => {
  it('枠は radius-full の例外（Radio と2つだけ）', () => {
    expect(avatarStyles().root()).toContain('rounded-[var(--novi-radius-full)]')
  })

  it('radius を渡せば角も立てられる', () => {
    expect(avatarStyles({ radius: 'sm' }).root()).toContain('rounded-[var(--novi-radius-sm)]')
  })

  it('イニシャルは等幅（名前の略号なので記号扱い・ADR-F7）', () => {
    expect(avatarStyles().fallback()).toContain('font-(family-name:--novi-font-mono)')
  })

  it('寸法は 28 / 32 / 40px（Button の高さと同じ）', () => {
    expect(avatarStyles({ size: 'sm' }).root()).toContain('size-7')
    expect(avatarStyles({ size: 'md' }).root()).toContain('size-8')
    expect(avatarStyles({ size: 'lg' }).root()).toContain('size-10')
  })

  it('影も transform も持たない（ring も使わない）', () => {
    const classes = Object.values(avatarStyles())
      .map((slot) => slot())
      .join(' ')
    expect(classes).not.toMatch(/(?<![\w-])shadow-/)
    expect(classes).not.toMatch(/(?<![\w-])ring-/)
    expect(classes).not.toMatch(/(?<![\w-])(?:scale|rotate|translate)-/)
  })

  it.each(NOVI_SIZES)('size=%s が固有のクラスを適用する', (size) => {
    const produced = NOVI_SIZES.map((s) => avatarStyles({ size: s }).root())
    expect(new Set(produced).size).toBe(NOVI_SIZES.length)
    expect(avatarStyles({ size }).root()).toBeTruthy()
  })
})

describe('Avatar: 拡張', () => {
  it('tv({ extend }) で拡張できる', () => {
    const my = tv({ extend: avatarStyles, slots: { root: 'border-2' } })
    expect(my().root()).toContain('border-2')
  })

  it('classNames が該当 slot に反映される', () => {
    const { container } = render(
      <Avatar
        name="山本 太郎"
        badge={<Badge size="sm">在席</Badge>}
        classNames={{ root: 'a-root', fallback: 'a-fallback', badge: 'a-badge' }}
      />,
    )
    for (const [slot, cls] of [
      ['root', 'a-root'],
      ['fallback', 'a-fallback'],
      ['badge', 'a-badge'],
    ] as const) {
      expect(container.querySelector(`[data-slot="${slot}"]`)?.className, slot).toContain(cls)
    }
  })
})
