import { chromaOf, contrastRatio, parseOklch } from '@novi-ui/core/testing'
import { describe, expect, it } from 'vitest'
import { buildGlobalCss, buildScopedCss } from '../../scripts/theme-css.mjs'
import {
  buildColorEntry,
  colorById,
  DEFAULT_COLOR_ID,
  inSrgbGamut,
  RASTER_COLOR_SET,
  RASTER_TONE,
  type RasterColorEntry,
} from './color-set'
import { MAX_SEMANTIC_CHROMA, RASTER_DARK_COLORS, RASTER_LIGHT_COLORS } from './raster-tokens'

/**
 * カラーセット「Print Inks」の検査（specs/06-tones-and-colors T-02）。
 *
 * 2層で見る:
 * 1. 数値検証 — セットの全色が3条件（sRGB 色域 / 地への 4.5:1 / 面上文字の 4.5:1）と
 *    トーンの規律を満たす。**同じ検査が不正な色を検出できることも変異で確かめる**（AC-03-4）。
 * 2. 生成 CSS — build と同じ関数の出力をパースし、値・セレクタ・並び順を固定する。
 *    並び順はカスケードの正しさそのものなので、テストで守る。
 */

const GROUNDS = {
  light: RASTER_LIGHT_COLORS,
  dark: RASTER_DARK_COLORS,
} as const

type Scheme = keyof typeof GROUNDS

/** 1色 × 1スキームの全件検査。失敗理由の一覧を返す（空なら合格）。 */
function checkScheme(entry: RasterColorEntry, scheme: Scheme): string[] {
  const failures: string[] = []
  const { primary, primaryFg } = entry[scheme]
  const ground = GROUNDS[scheme]
  const tone = RASTER_TONE[scheme]

  const parsed = parseOklch(primary)
  if (parsed === null) return [`${scheme}: OKLCH として解釈できない: ${primary}`]

  if (!inSrgbGamut(parsed.l, parsed.c, parsed.h)) {
    failures.push(`${scheme}: sRGB 域外 (${primary})`)
  }

  for (const surface of ['bg', 'subtle'] as const) {
    const ratio = contrastRatio(primary, ground[surface] as string)
    if (ratio < 4.5) failures.push(`${scheme}: ${surface} への文字 ${ratio.toFixed(2)}:1 < 4.5`)
  }

  const onFace = contrastRatio(primaryFg, primary)
  if (onFace < 4.5) failures.push(`${scheme}: 面上の文字 ${onFace.toFixed(2)}:1 < 4.5`)

  const expectedC = scheme === 'light' ? (entry.fixedC ?? tone.c) : (entry.fixedCDark ?? tone.c)
  if (Math.abs(parsed.l * 100 - tone.l) > 1e-9) {
    failures.push(`${scheme}: L がトーンとズレている (${parsed.l * 100} ≠ ${tone.l})`)
  }
  if (Math.abs(parsed.c - expectedC) > 1e-9) {
    failures.push(`${scheme}: C がトーンとズレている (${parsed.c} ≠ ${expectedC})`)
  }

  const chroma = chromaOf(primary)
  if (chroma <= 0 || chroma > MAX_SEMANTIC_CHROMA) {
    failures.push(`${scheme}: chroma ${chroma} が (0, ${MAX_SEMANTIC_CHROMA}] の外`)
  }

  return failures
}

const checkEntry = (entry: RasterColorEntry): string[] => [
  ...checkScheme(entry, 'light'),
  ...checkScheme(entry, 'dark'),
]

describe('数値検証 — 8色 × 2スキーム × 3条件（AC-03-1〜3）', () => {
  it.each(RASTER_COLOR_SET.map((entry) => [entry.id, entry] as const))(
    '%s: 色域・コントラスト・トーンの全件が通る',
    (_id, entry) => {
      expect(checkEntry(entry)).toEqual([])
    },
  )

  it('相方が全員セット内にいて、自分自身ではない（ADR-C03）', () => {
    for (const entry of RASTER_COLOR_SET) {
      expect(() => colorById(entry.pair)).not.toThrow()
      expect(entry.pair).not.toBe(entry.id)
    }
  })

  it('変異: 域外の色（hue 200 / C 0.10）を同じ検査が検出する（AC-03-4）', () => {
    // Teal はこの C を張れないことが掃引で分かっており、だからセットに入っていない。
    // わざと作って落ちることを見る — 落ちない検査は通っていても意味がない（検証の原則）。
    const teal = buildColorEntry(
      { id: 'teal', name: 'Teal', hue: 200, pair: 'ink', description: '—' },
      { light: { l: 44, c: 0.1 }, dark: { l: 74, c: 0.09 } },
    )
    const failures = checkEntry(teal)
    expect(failures).not.toEqual([])
    expect(failures.join(' ')).toContain('域外')
  })
})

describe('既定色（FR-05）', () => {
  const ink = colorById(DEFAULT_COLOR_ID)
  const pair = colorById(ink.pair)

  it('テーマの primary / secondary は Ink とその相方の値そのもの', () => {
    expect(RASTER_LIGHT_COLORS.primary).toBe(ink.light.primary)
    expect(RASTER_LIGHT_COLORS['primary-fg']).toBe(ink.light.primaryFg)
    expect(RASTER_LIGHT_COLORS.secondary).toBe(pair.light.primary)
    expect(RASTER_DARK_COLORS.primary).toBe(ink.dark.primary)
    expect(RASTER_DARK_COLORS.secondary).toBe(pair.dark.primary)
  })
})

/** 行頭のセレクタとしてブロックを取り出す。前方一致の誤マッチ（dark 側の複合セレクタ）を防ぐ。 */
function blockOf(css: string, selector: string): { body: string; index: number } | null {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const m = new RegExp(`^\\s*${escaped} \\{([^}]*)\\}`, 'm').exec(css)
  if (m === null) return null
  return { body: m[1] as string, index: m.index }
}

const VARIANTS = [
  {
    name: 'raster.css',
    css: buildGlobalCss(),
    root: ':root',
    baseDark: "[data-novi-scheme='dark']",
    baseMediaDark: ":root:not([data-novi-scheme='light'])",
    light: (id: string) => `[data-novi-color='${id}']`,
    dark: (id: string) => `[data-novi-scheme='dark'][data-novi-color='${id}']`,
    mediaDark: (id: string) => `:root:not([data-novi-scheme='light'])[data-novi-color='${id}']`,
  },
  {
    name: 'raster.scoped.css',
    css: buildScopedCss(),
    root: "[data-novi-theme='raster']",
    baseDark: "[data-novi-theme='raster'][data-novi-scheme='dark']",
    baseMediaDark: "[data-novi-theme='raster']:not([data-novi-scheme='light'])",
    light: (id: string) => `[data-novi-theme='raster'][data-novi-color='${id}']`,
    dark: (id: string) =>
      `[data-novi-theme='raster'][data-novi-scheme='dark'][data-novi-color='${id}']`,
    mediaDark: (id: string) =>
      `[data-novi-theme='raster']:not([data-novi-scheme='light'])[data-novi-color='${id}']`,
  },
] as const

describe.each(VARIANTS.map((v) => [v.name, v] as const))('生成 CSS: %s', (_name, v) => {
  const ink = colorById(DEFAULT_COLOR_ID)

  it('既定（root）ブロックに Ink の値と --novi-hue が入っている', () => {
    const root = blockOf(v.css, v.root)
    expect(root).not.toBeNull()
    expect(root?.body).toContain(`--novi-color-primary: ${ink.light.primary};`)
    expect(root?.body).toContain(`--novi-hue: ${ink.hue};`)
    const dark = blockOf(v.css, v.baseDark)
    expect(dark?.body).toContain(`--novi-color-primary: ${ink.dark.primary};`)
  })

  it.each(RASTER_COLOR_SET.map((entry) => [entry.id, entry] as const))(
    '%s: light / dark(attr) / media dark の3ブロックが正しい値を持つ',
    (id, entry) => {
      const pair = colorById(entry.pair)

      const light = blockOf(v.css, v.light(id))
      expect(light, `light ブロックが無い: ${v.light(id)}`).not.toBeNull()
      expect(light?.body).toContain(`--novi-hue: ${entry.hue};`)
      expect(light?.body).toContain(`--novi-color-primary: ${entry.light.primary};`)
      expect(light?.body).toContain(`--novi-color-primary-fg: ${entry.light.primaryFg};`)
      expect(light?.body).toContain(`--novi-color-secondary: ${pair.light.primary};`)
      expect(light?.body).toContain(`--novi-color-secondary-fg: ${pair.light.primaryFg};`)

      const dark = blockOf(v.css, v.dark(id))
      expect(dark, `dark ブロックが無い: ${v.dark(id)}`).not.toBeNull()
      expect(dark?.body).toContain(`--novi-color-primary: ${entry.dark.primary};`)
      expect(dark?.body).toContain(`--novi-color-secondary: ${pair.dark.primary};`)

      const media = blockOf(v.css, v.mediaDark(id))
      expect(media, `media dark ブロックが無い: ${v.mediaDark(id)}`).not.toBeNull()
      expect(media?.body).toContain(`--novi-color-primary: ${entry.dark.primary};`)
    },
  )

  it('並び順がカスケードを守る: base < 色 light < 色 dark、base media < 色 media', () => {
    const indexOf = (selector: string): number => {
      const block = blockOf(v.css, selector)
      if (block === null) throw new Error(`ブロックが無い: ${selector}`)
      return block.index
    }
    for (const entry of RASTER_COLOR_SET) {
      expect(indexOf(v.baseDark)).toBeLessThan(indexOf(v.light(entry.id)))
      expect(indexOf(v.light(entry.id))).toBeLessThan(indexOf(v.dark(entry.id)))
      expect(indexOf(v.baseMediaDark)).toBeLessThan(indexOf(v.mediaDark(entry.id)))
    }
  })

  it('色ブロックは意味色（success / warning / danger）を持たない（FR-08）', () => {
    for (const entry of RASTER_COLOR_SET) {
      for (const selector of [v.light(entry.id), v.dark(entry.id), v.mediaDark(entry.id)]) {
        const body = blockOf(v.css, selector)?.body ?? ''
        expect(body).not.toMatch(/success|warning|danger/)
      }
    }
  })

  it('セットに無い色名のセレクタが存在しない = 未知の名前は既定色に落ちる（FR-05）', () => {
    expect(v.css).not.toContain("data-novi-color='teal'")
    expect(v.css).not.toContain("data-novi-color='indigo'")
  })
})
