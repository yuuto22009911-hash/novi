import {
  NOVI_COLORS,
  NOVI_GAP_TOKENS,
  NOVI_PAD_TOKENS,
  NOVI_RADII,
  NOVI_TRACKING_TOKENS,
} from '@novi-ui/core'
import { chromaOf, contrastRatio } from '@novi-ui/core/testing'
import { describe, expect, it } from 'vitest'
import {
  MAX_SEMANTIC_CHROMA,
  NEUTRAL_COLOR_KEYS,
  RASTER_CONTROL_HEIGHTS,
  RASTER_DARK_COLORS,
  RASTER_FONTS,
  RASTER_GAP,
  RASTER_LEADING,
  RASTER_LIGHT_COLORS,
  RASTER_PAD,
  RASTER_RADII,
  RASTER_SHADOWS,
  RASTER_TEXT,
  RASTER_TRACKING,
  SEMANTIC_COLOR_KEYS,
} from './raster-tokens'

const SCHEMES = [
  ['light', RASTER_LIGHT_COLORS],
  ['dark', RASTER_DARK_COLORS],
] as const

describe('コントラスト（WCAG 2.2 AA）', () => {
  it.each(SCHEMES)('%s: 本文が背景に対して 4.5:1 以上（AC-05-1）', (_s, c) => {
    expect(contrastRatio(c.fg as string, c.bg as string)).toBeGreaterThanOrEqual(4.5)
  })

  it.each(SCHEMES)('%s: 補助文字が背景に対して 4.5:1 以上', (_s, c) => {
    expect(contrastRatio(c.muted as string, c.bg as string)).toBeGreaterThanOrEqual(4.5)
  })

  it.each(SCHEMES)('%s: 本文が subtle 面に対しても 4.5:1 以上', (_s, c) => {
    expect(contrastRatio(c.fg as string, c.subtle as string)).toBeGreaterThanOrEqual(4.5)
  })

  it.each(SCHEMES)('%s: 補助文字が subtle 面に対しても 4.5:1 以上', (_s, c) => {
    expect(contrastRatio(c.muted as string, c.subtle as string)).toBeGreaterThanOrEqual(4.5)
  })

  it.each(SCHEMES)('%s: 機能上必要な境界線が 3:1 以上（AC-05-2）', (_s, c) => {
    expect(contrastRatio(c['border-strong'] as string, c.bg as string)).toBeGreaterThanOrEqual(3)
  })

  it.each(SCHEMES)('%s: フォーカスリング（primary）が背景に対して 3:1 以上（AC-04-5）', (_s, c) => {
    expect(contrastRatio(c.primary as string, c.bg as string)).toBeGreaterThanOrEqual(3)
  })

  it.each(SCHEMES)('%s: 意味を持つ色を文字色に使っても 4.5:1 以上', (_s, c) => {
    // outline / soft / ghost / plain は地色ではなく「色そのもの」を文字色に使う。
    // solid だけを検査していると、これらの variant で読めない文字が生まれる。
    const failures = ['primary', 'secondary', 'success', 'warning', 'danger']
      .map((name) => {
        const onBg = contrastRatio(c[name] as string, c.bg as string)
        const onSubtle = contrastRatio(c[name] as string, c.subtle as string)
        const worst = Math.min(onBg, onSubtle)
        return worst < 4.5 ? `${name}: ${worst.toFixed(2)}:1` : null
      })
      .filter(Boolean)
    expect(failures).toEqual([])
  })

  it.each(SCHEMES)('%s: 全 NOVI_COLORS の -fg が地色に対して 4.5:1 以上（AC-02-3）', (_s, c) => {
    const failures = NOVI_COLORS.map((name) => {
      const ratio = contrastRatio(c[`${name}-fg`] as string, c[name] as string)
      return ratio < 4.5 ? `${name}: ${ratio.toFixed(2)}:1` : null
    }).filter(Boolean)
    expect(failures).toEqual([])
  })

  it.each(SCHEMES)('%s: Tabs のアクティブ下線が 3:1 以上（ADR-R4）', (_s, c) => {
    // 下線1本だけで選択を示すため、非テキストコントラストを満たす必要がある
    expect(contrastRatio(c.fg as string, c.bg as string)).toBeGreaterThanOrEqual(3)
  })
})

describe('彩度の規律（AC-01-3 / AC-01-4）', () => {
  it.each(SCHEMES)('%s: 中立色の chroma はすべて 0', (_s, c) => {
    const chromatic = NEUTRAL_COLOR_KEYS.filter((k) => chromaOf(c[k] as string) !== 0).map(
      (k) => `${k}: ${chromaOf(c[k] as string)}`,
    )
    expect(chromatic).toEqual([])
  })

  it.each(SCHEMES)('%s: 意味を持つ色は有彩で、上限を超えない', (_s, c) => {
    const invalid = SEMANTIC_COLOR_KEYS.filter((k) => {
      const chroma = chromaOf(c[k] as string)
      // -fg は地色の上の文字なので無彩でよい
      if (k.endsWith('-fg')) return false
      return chroma <= 0 || chroma > MAX_SEMANTIC_CHROMA
    }).map((k) => `${k}: ${chromaOf(c[k] as string)}`)
    expect(invalid).toEqual([])
  })

  it('success と danger が色として区別できる（灰色に潰れていない）', () => {
    for (const [, colors] of SCHEMES) {
      expect(chromaOf(colors.success as string)).toBeGreaterThan(0)
      expect(chromaOf(colors.danger as string)).toBeGreaterThan(0)
    }
  })
})

describe('Raster デザイン言語（数値定義）', () => {
  it('角丸は none=0 で、sm→md→lg が控えめな範囲で単調増加する（ADR-R8）', () => {
    expect(RASTER_RADII.none).toBe('0px')
    const steps = ['sm', 'md', 'lg'].map((k) => Number.parseFloat(RASTER_RADII[k] as string))
    for (let i = 0; i < steps.length; i++) {
      // 16px を超えると「丸い」が主張になり、ミニマルの範囲を出る
      expect(steps[i]).toBeGreaterThanOrEqual(4)
      expect(steps[i]).toBeLessThanOrEqual(16)
      if (i > 0) expect(steps[i]).toBeGreaterThan(steps[i - 1] as number)
    }
  })

  it('radius が NOVI_RADII を網羅している', () => {
    expect(NOVI_RADII.filter((r) => !(r in RASTER_RADII))).toEqual([])
  })

  it('影は浮く層（md / lg）だけが持ち、none は本当に無い（ADR-R8）', () => {
    expect(RASTER_SHADOWS.none).toBe('none')
    for (const key of ['md', 'lg']) {
      const value = RASTER_SHADOWS[key] as string
      expect(value).not.toBe('none')
      // 影は「浮いている事実」を伝えるだけ。濃い影は別の美学になる
      for (const alpha of [...value.matchAll(/\/ (0\.\d+)\)/g)].map((m) => Number(m[1]))) {
        expect(alpha).toBeLessThanOrEqual(0.2)
      }
    }
  })

  it('コンポーネント高さが 32 / 40 / 48px（AC-01-2）', () => {
    expect(RASTER_CONTROL_HEIGHTS).toEqual({ sm: 32, md: 40, lg: 48 })
  })

  it('高さが 8px グリッドに乗っている', () => {
    const offGrid = Object.entries(RASTER_CONTROL_HEIGHTS).filter(([, h]) => h % 8 !== 0)
    expect(offGrid).toEqual([])
  })

  it('最小の高さでも WCAG 2.2 のタップ領域 24px を満たす', () => {
    expect(Math.min(...Object.values(RASTER_CONTROL_HEIGHTS))).toBeGreaterThanOrEqual(24)
  })

  it('タイポスケールが比率 1.2 前後で単調増加する', () => {
    const sizes = Object.values(RASTER_TEXT).map((v) => Number.parseFloat(v))
    for (let i = 1; i < sizes.length; i++) {
      const ratio = (sizes[i] as number) / (sizes[i - 1] as number)
      expect(ratio).toBeGreaterThan(1)
      expect(ratio).toBeLessThanOrEqual(1.3)
    }
  })

  it('pad が NOVI_PAD_TOKENS を網羅している', () => {
    expect(NOVI_PAD_TOKENS.filter((t) => !(t in RASTER_PAD))).toEqual([])
  })

  it('gap が NOVI_GAP_TOKENS を網羅している', () => {
    expect(NOVI_GAP_TOKENS.filter((t) => !(t in RASTER_GAP))).toEqual([])
  })

  it('tracking が NOVI_TRACKING_TOKENS を網羅している', () => {
    expect(NOVI_TRACKING_TOKENS.filter((t) => !(t in RASTER_TRACKING))).toEqual([])
  })

  it('余白がすべて 4px の倍数（Raster の支配軸「寸法の規律」）', () => {
    // 高さを 8px グリッドに乗せながら余白だけ格子から外れると、
    // 見えない格子が崩れる。トークンの段階で外れ値を作れなくする
    const offGrid = Object.entries({ ...RASTER_PAD, ...RASTER_GAP }).filter(
      ([, value]) => Number.parseFloat(value) % 4 !== 0,
    )
    expect(offGrid).toEqual([])
  })

  it('数字が等幅（表やカウンタの値が更新されても行が横に踊らない）', () => {
    expect(RASTER_FONTS.numeric).toBe('tabular-nums')
  })

  it('締める字送りは見出しだけで、本文は 0 のまま', () => {
    expect(Number.parseFloat(RASTER_TRACKING.tight as string)).toBeLessThan(0)
    expect(Number.parseFloat(RASTER_TRACKING.normal as string)).toBe(0)
  })

  it('行送りは本文 > 見出し（読む文字と見る文字で必要な高さが違う）', () => {
    expect(Number(RASTER_LEADING.body)).toBeGreaterThan(Number(RASTER_LEADING.heading))
  })

  it('gap が inline < stack < section の順に広がる', () => {
    const [inline, stack, section] = NOVI_GAP_TOKENS.map((t) =>
      Number.parseFloat(RASTER_GAP[t] as string),
    ) as [number, number, number]
    expect(inline).toBeLessThan(stack)
    expect(stack).toBeLessThan(section)
  })

  it('section と stack の比が 1.5 以上（余白のコントラスト）', () => {
    // 比が 1.0 に潰れると「どこまでが一塊か」を余白が語れなくなり、画面が詰まって見える
    const stack = Number.parseFloat(RASTER_GAP.stack as string)
    const section = Number.parseFloat(RASTER_GAP.section as string)
    expect(section / stack).toBeGreaterThanOrEqual(1.5)
  })
})
