import { describe, expect, it } from 'vitest'
import { contrastRatio } from '../testing/color'
import { NOVI_COLORS, NOVI_RADII } from '../tokens'
import { DARK_COLORS, LIGHT_COLORS, SCHEME_INDEPENDENT_TOKENS, TOKEN_PREFIX } from './definitions'

const SCHEMES = [
  ['light', LIGHT_COLORS],
  ['dark', DARK_COLORS],
] as const

// ─────────────────────────────────────────────────────────────

describe('トークンの網羅性（FR-15）', () => {
  it('ライトとダークが同じキー集合を持つ', () => {
    expect(Object.keys(LIGHT_COLORS).sort()).toEqual(Object.keys(DARK_COLORS).sort())
  })

  it.each(SCHEMES)('%s: 全 NOVI_COLORS に対応する色と -fg が存在する', (_scheme, colors) => {
    const missing = NOVI_COLORS.flatMap((name) =>
      [name, `${name}-fg`].filter((key) => !(key in colors)),
    )
    expect(missing).toEqual([])
  })

  it.each(SCHEMES)('%s: 面と文字の基本トークンが揃っている', (_scheme, colors) => {
    for (const key of ['bg', 'subtle', 'fg', 'muted', 'border', 'border-strong', 'overlay']) {
      expect(colors).toHaveProperty(key)
    }
  })

  it('radius が NOVI_RADII を網羅している', () => {
    const radius = SCHEME_INDEPENDENT_TOKENS.radius ?? {}
    expect(NOVI_RADII.filter((r) => !(r in radius))).toEqual([])
  })

  // NOVI_SIZES（コンポーネントの寸法 sm/md/lg）と text スケール（xs/sm/base/lg/xl…）は
  // 別の語彙。どの寸法にどの文字サイズを割り当てるかはテーマの判断なので、一致は強制しない。
  it('text スケールが単調増加している', () => {
    const text = SCHEME_INDEPENDENT_TOKENS.text ?? {}
    const values = Object.values(text).map((v) => Number.parseFloat(v))
    const sorted = [...values].sort((a, b) => a - b)
    expect(values).toEqual(sorted)
    expect(new Set(values).size).toBe(values.length)
  })

  it('全トークンの値が空でない', () => {
    const empty: string[] = []
    for (const [group, tokens] of Object.entries(SCHEME_INDEPENDENT_TOKENS)) {
      for (const [name, value] of Object.entries(tokens)) {
        if (value.trim() === '') empty.push(`${group}.${name}`)
      }
    }
    expect(empty).toEqual([])
  })

  it('接頭辞が --novi- である', () => {
    expect(TOKEN_PREFIX).toBe('--novi-')
  })
})

describe('コントラスト（WCAG 2.2 AA）', () => {
  it.each(SCHEMES)('%s: 本文が背景に対して 4.5:1 以上', (_scheme, colors) => {
    expect(contrastRatio(colors.fg as string, colors.bg as string)).toBeGreaterThanOrEqual(4.5)
  })

  it.each(SCHEMES)('%s: 補助文字が背景に対して 4.5:1 以上', (_scheme, colors) => {
    expect(contrastRatio(colors.muted as string, colors.bg as string)).toBeGreaterThanOrEqual(4.5)
  })

  it.each(SCHEMES)('%s: 本文が subtle 面に対しても 4.5:1 以上', (_scheme, colors) => {
    expect(contrastRatio(colors.fg as string, colors.subtle as string)).toBeGreaterThanOrEqual(4.5)
  })

  it.each(SCHEMES)('%s: 機能上必要な境界線が 3:1 以上（WCAG 1.4.11）', (_scheme, colors) => {
    expect(
      contrastRatio(colors['border-strong'] as string, colors.bg as string),
    ).toBeGreaterThanOrEqual(3)
  })

  it.each(SCHEMES)('%s: 各色の -fg が地色に対して 4.5:1 以上', (_scheme, colors) => {
    const failures: string[] = []
    for (const name of NOVI_COLORS) {
      const bg = colors[name] as string
      const fg = colors[`${name}-fg`] as string
      const ratio = contrastRatio(fg, bg)
      if (ratio < 4.5) failures.push(`${name}: ${ratio.toFixed(2)}:1`)
    }
    expect(failures).toEqual([])
  })
})

describe('色の記法', () => {
  it.each(SCHEMES)('%s: 全ての色が OKLCH で書かれている', (_scheme, colors) => {
    const invalid = Object.entries(colors)
      .filter(([, v]) => !v.startsWith('oklch('))
      .map(([k]) => k)
    expect(invalid).toEqual([])
  })

  it.each(SCHEMES)('%s: リテラルな色名を使っていない', (_scheme, colors) => {
    const literal = Object.keys(colors).filter((k) =>
      /(blue|red|green|gray|grey|yellow|purple|orange)/i.test(k),
    )
    expect(literal).toEqual([])
  })
})
