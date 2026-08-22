import { NOVI_CONTRACTS, NOVI_SIZES } from '@novi-ui/core'
import { testSlotContract } from '@novi-ui/core/testing'
import { fireEvent, render, screen } from '@testing-library/react'
import { tv } from 'tailwind-variants'
import { describe, expect, it } from 'vitest'
import { Avatar, initialsOf } from './avatar'
import { avatarStyles } from './avatar.styles'

testSlotContract({
  name: 'Avatar',
  contract: NOVI_CONTRACTS.Avatar,
  render: () => <Avatar src="/me.jpg" name="山本 太郎" badge={<span>●</span>} />,
})

describe('initialsOf: 日本語の氏名を壊さない', () => {
  it('空白区切りの氏名は各語の先頭を取る', () => {
    expect(initialsOf('山本 太郎')).toBe('山太')
  })

  it('空白のない日本語名は先頭1文字を取る', () => {
    expect(initialsOf('山本太郎')).toBe('山')
  })

  it('英語名も同様に扱える', () => {
    expect(initialsOf('Ada Lovelace')).toBe('AL')
    expect(initialsOf('Ada')).toBe('A')
  })

  it('サロゲートペアを分割しない', () => {
    // 絵文字や一部の漢字は2コード単位。slice(0,1) だと壊れる
    expect(initialsOf('𠮷田 太郎')).toBe('𠮷太')
  })

  it('空文字や空白だけなら空を返す', () => {
    expect(initialsOf('')).toBe('')
    expect(initialsOf('   ')).toBe('')
  })

  it('3語以上でも2文字までにする', () => {
    expect(initialsOf('John Ronald Reuel Tolkien')).toBe('JR')
  })
})

describe('Avatar: 描画', () => {
  it('src があれば画像を描画する', () => {
    const { container } = render(<Avatar src="/me.jpg" name="山本 太郎" />)
    expect(container.querySelector('[data-slot="image"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="fallback"]')).toBeNull()
  })

  it('src がなければイニシャルを表示する', () => {
    render(<Avatar name="山本 太郎" />)
    expect(screen.getByText('山太')).toBeDefined()
  })

  it('fallback は読み上げに氏名を伝える（イニシャルだけにしない）', () => {
    render(<Avatar name="山本 太郎" />)
    expect(screen.getByRole('img', { name: '山本 太郎' })).toBeDefined()
  })

  it('画像の読み込みに失敗したら fallback に切り替わる', () => {
    const { container } = render(<Avatar src="/broken.jpg" name="山本 太郎" />)

    const img = container.querySelector('[data-slot="image"]')
    expect(img).not.toBeNull()
    fireEvent.error(img as Element)

    expect(container.querySelector('[data-slot="image"]')).toBeNull()
    expect(container.querySelector('[data-slot="fallback"]')).not.toBeNull()
  })

  it('fallback を明示的に渡せる', () => {
    render(<Avatar name="山本 太郎" fallback={<span>？</span>} />)
    expect(screen.getByText('？')).toBeDefined()
  })

  it('badge を渡さなければその slot は出ない', () => {
    const { container } = render(<Avatar name="山本 太郎" />)
    expect(container.querySelector('[data-slot="badge"]')).toBeNull()
  })
})

describe('Avatar: size / radius', () => {
  it('全 size が異なるクラスを生む', () => {
    const classes = NOVI_SIZES.map((size) => avatarStyles({ size }).root())
    expect(new Set(classes).size).toBe(NOVI_SIZES.length)
  })

  it('既定は full（人を表すものは丸で示す慣習に従う唯一の例外）', () => {
    expect(avatarStyles().root()).toContain('rounded-[var(--novi-radius-full)]')
  })
})

describe('Avatar: 拡張', () => {
  it('tv({ extend }) で拡張できる', () => {
    const my = tv({ extend: avatarStyles, slots: { fallback: 'font-bold' } })
    expect(my().fallback()).toContain('font-bold')
  })
})
