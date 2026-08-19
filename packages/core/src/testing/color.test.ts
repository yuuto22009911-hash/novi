import { describe, expect, it } from 'vitest'
import { chromaOf, contrastRatio, parseOklch, relativeLuminance } from './color'

const WHITE = 'oklch(100% 0 0)'
const BLACK = 'oklch(0% 0 0)'

describe('parseOklch', () => {
  it('不透明度なしを解釈する', () => {
    expect(parseOklch('oklch(52% 0.18 250)')).toEqual({ l: 0.52, c: 0.18, h: 250, alpha: 1 })
  })

  it('不透明度つきを解釈する', () => {
    expect(parseOklch('oklch(20% 0 0 / 0.45)')).toEqual({ l: 0.2, c: 0, h: 0, alpha: 0.45 })
  })

  it('OKLCH でない記法は null を返す', () => {
    expect(parseOklch('#ff0000')).toBeNull()
    expect(parseOklch('rgb(255 0 0)')).toBeNull()
    expect(parseOklch('oklch(52 0.18 250)')).toBeNull() // % がない
    expect(parseOklch('')).toBeNull()
  })
})

describe('relativeLuminance', () => {
  it('白はほぼ 1、黒はほぼ 0', () => {
    expect(relativeLuminance(WHITE)).toBeCloseTo(1, 1)
    expect(relativeLuminance(BLACK)).toBeCloseTo(0, 2)
  })

  it('明度が上がると輝度も上がる', () => {
    const dark = relativeLuminance('oklch(20% 0 0)')
    const mid = relativeLuminance('oklch(50% 0 0)')
    const light = relativeLuminance('oklch(90% 0 0)')
    expect(dark).toBeLessThan(mid)
    expect(mid).toBeLessThan(light)
  })

  it('色域外の値でも 0〜1 に収まる', () => {
    // 極端な彩度は sRGB の外に出るが、クランプして扱う
    const luminance = relativeLuminance('oklch(60% 0.4 140)')
    expect(luminance).toBeGreaterThanOrEqual(0)
    expect(luminance).toBeLessThanOrEqual(1)
  })

  it('解釈できない値は例外を投げる', () => {
    expect(() => relativeLuminance('#fff')).toThrow(/OKLCH/)
  })
})

describe('contrastRatio', () => {
  it('白と黒は 21:1', () => {
    expect(contrastRatio(WHITE, BLACK)).toBeCloseTo(21, 0)
  })

  it('同じ色同士は 1:1', () => {
    expect(contrastRatio(WHITE, WHITE)).toBeCloseTo(1, 5)
  })

  it('引数の順序で結果が変わらない', () => {
    const a = 'oklch(20% 0 0)'
    const b = 'oklch(99% 0 0)'
    expect(contrastRatio(a, b)).toBeCloseTo(contrastRatio(b, a), 10)
  })

  it('既知の基準値を再現する（4.5:1 の境目付近）', () => {
    // 白背景に対して 4.5:1 を満たす／満たさない灰色の判定が妥当か
    expect(contrastRatio('oklch(48% 0 0)', 'oklch(99% 0 0)')).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio('oklch(70% 0 0)', 'oklch(99% 0 0)')).toBeLessThan(4.5)
  })
})

describe('chromaOf', () => {
  it('無彩色は 0', () => {
    expect(chromaOf('oklch(48% 0 0)')).toBe(0)
  })

  it('有彩色は彩度を返す', () => {
    expect(chromaOf('oklch(48% 0.18 250)')).toBe(0.18)
  })

  it('解釈できない値は例外を投げる', () => {
    expect(() => chromaOf('rgb(0 0 0)')).toThrow(/OKLCH/)
  })
})
