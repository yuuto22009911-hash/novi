import { describe, expect, it } from 'vitest'
import { modalStyles } from './modal/modal.styles'
import { colorById, DEFAULT_COLOR_ID, TACTILE_COLOR_SET, TACTILE_TONE } from './tokens/color-set'
import { TACTILE_CONTROL_HEIGHTS, TACTILE_RADII, TACTILE_TEXT } from './tokens/tactile-tokens'

/**
 * README に書いた数値が実装と一致していることを固定する。
 *
 * ドキュメントの数値は書いた時点では正しく、実装を変えたときに黙って古くなる。
 * 例（`@example`）が誰にも型検査されていなかった過去（STATUS #17）と同じ形の問題で、
 * **AI は README の表を最も忠実に真似る**ため、ズレると全員が同じ間違いをする。
 */
describe('README の数値', () => {
  it('高さ 40 / 48 / 56px', () => {
    expect(TACTILE_CONTROL_HEIGHTS).toEqual({ sm: 40, md: 48, lg: 56 })
  })

  it('タイポ 13 / 15 / 17 / 21 / 26 / 32 / 40px', () => {
    expect(Object.values(TACTILE_TEXT)).toEqual([
      '13px',
      '15px',
      '17px',
      '21px',
      '26px',
      '32px',
      '40px',
    ])
  })

  it('角丸 sm 8 / md 14 / lg 20px', () => {
    expect(TACTILE_RADII.sm).toBe('8px')
    expect(TACTILE_RADII.md).toBe('14px')
    expect(TACTILE_RADII.lg).toBe('20px')
  })

  it('トーン light L50 / C0.080・dark L76', () => {
    expect(TACTILE_TONE.light).toEqual({ l: 50, c: 0.08 })
    expect(TACTILE_TONE.dark.l).toBe(76)
  })

  it('既定色は indigo、色は8つ', () => {
    expect(DEFAULT_COLOR_ID).toBe('indigo')
    expect(TACTILE_COLOR_SET.length).toBe(8)
  })

  it('README の色表（名前と相方）が実装と一致する', () => {
    const table: Record<string, string> = {
      indigo: 'saffron',
      peacock: 'madder',
      sage: 'cochineal',
      saffron: 'indigo',
      madder: 'peacock',
      cochineal: 'sage',
      mauve: 'sage',
      greige: 'indigo',
    }
    for (const [id, pair] of Object.entries(table)) {
      expect(colorById(id).pair, id).toBe(pair)
    }
  })

  it('Modal の size は最大高（sm 40 / md 60 / lg 80 / full 100 dvh）', () => {
    expect(modalStyles({ size: 'sm' }).panel()).toContain('max-h-[40dvh]')
    expect(modalStyles({ size: 'md' }).panel()).toContain('max-h-[60dvh]')
    expect(modalStyles({ size: 'lg' }).panel()).toContain('max-h-[80dvh]')
    expect(modalStyles({ size: 'full' }).panel()).toContain('max-h-[100dvh]')
  })
})
