import { describe, expect, it } from 'vitest'
import { NOVI_COLORS, NOVI_RADII } from '../tokens'
import { DARK_COLORS, LIGHT_COLORS, SCHEME_INDEPENDENT_TOKENS, TOKEN_PREFIX } from './definitions'

// ─────────────────────────────────────────────────────────────
// OKLCH → 相対輝度 → コントラスト比
// 目分量で色を決めないために、実際に計算して検証する。
// ─────────────────────────────────────────────────────────────

interface Oklch {
  l: number
  c: number
  h: number
  alpha: number
}

function parseOklch(value: string): Oklch | null {
  const m = value.match(/^oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+)\s*)?\)$/)
  if (!m) return null
  return {
    l: Number(m[1]) / 100,
    c: Number(m[2]),
    h: Number(m[3]),
    alpha: m[4] === undefined ? 1 : Number(m[4]),
  }
}

/** OKLCH を線形 sRGB に変換する。 */
function oklchToLinearSrgb({ l: L, c, h }: Oklch): [number, number, number] {
  const rad = (h * Math.PI) / 180
  const a = c * Math.cos(rad)
  const b = c * Math.sin(rad)

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b

  const lc = l_ ** 3
  const mc = m_ ** 3
  const sc = s_ ** 3

  return [
    4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc,
    -1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc,
    -0.0041960863 * lc - 0.7034186147 * mc + 1.707614701 * sc,
  ]
}

/** WCAG の相対輝度。 */
function relativeLuminance(value: string): number {
  const parsed = parseOklch(value)
  if (!parsed) throw new Error(`OKLCH として解釈できません: ${value}`)
  const [r, g, b] = oklchToLinearSrgb(parsed)
  const clamp = (x: number) => Math.min(1, Math.max(0, x))
  return 0.2126 * clamp(r) + 0.7152 * clamp(g) + 0.0722 * clamp(b)
}

function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  const [hi, lo] = la > lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}

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
