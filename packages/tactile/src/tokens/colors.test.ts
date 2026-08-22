import { parseOklch } from '@novi-ui/core/testing'
import { describe, expect, it } from 'vitest'
import { buildGlobalCss, buildScopedCss } from '../../scripts/theme-css.mjs'
import {
  colorById,
  DEFAULT_COLOR_ID,
  neutralsFor,
  surfaceFor,
  TACTILE_COLOR_SET,
} from './color-set'

/**
 * 生成 CSS の検査（T-03）。**データではなく成果物を見る。**
 *
 * 値そのものの妥当性（コントラスト・色域・帯域）は `tactile-tokens.test.ts` が担当し、
 * ここは「その値が正しいセレクタで、正しい順序で CSS に出ているか」を固定する。
 * 並び順はカスケードの正しさそのものなので、テストで守る。
 */

/** 行頭のセレクタとしてブロックを取り出す。前方一致の誤マッチを防ぐ。 */
function blockOf(css: string, selector: string): { body: string; index: number } | null {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const m = new RegExp(`^\\s*${escaped} \\{([^}]*)\\}`, 'm').exec(css)
  if (m === null) return null
  return { body: m[1] as string, index: m.index }
}

const VARIANTS = [
  {
    name: 'tactile.css',
    css: buildGlobalCss(),
    root: ':root',
    baseDark: "[data-novi-scheme='dark']",
    baseMediaDark: ":root:not([data-novi-scheme='light'])",
    light: (id: string) => `[data-novi-color='${id}']`,
    dark: (id: string) => `[data-novi-scheme='dark'][data-novi-color='${id}']`,
    mediaDark: (id: string) => `:root:not([data-novi-scheme='light'])[data-novi-color='${id}']`,
  },
  {
    name: 'tactile.scoped.css',
    css: buildScopedCss(),
    root: "[data-novi-theme='tactile']",
    baseDark: "[data-novi-theme='tactile'][data-novi-scheme='dark']",
    baseMediaDark: "[data-novi-theme='tactile']:not([data-novi-scheme='light'])",
    light: (id: string) => `[data-novi-theme='tactile'][data-novi-color='${id}']`,
    dark: (id: string) =>
      `[data-novi-theme='tactile'][data-novi-scheme='dark'][data-novi-color='${id}']`,
    mediaDark: (id: string) =>
      `[data-novi-theme='tactile']:not([data-novi-scheme='light'])[data-novi-color='${id}']`,
  },
] as const

describe.each(VARIANTS.map((v) => [v.name, v] as const))('生成 CSS: %s', (_name, v) => {
  const indigo = colorById(DEFAULT_COLOR_ID)

  it('既定（root）ブロックが Indigo の値と --novi-hue を持つ', () => {
    const root = blockOf(v.css, v.root)
    expect(root).not.toBeNull()
    expect(root?.body).toContain(`--novi-color-primary: ${indigo.light.primary};`)
    expect(root?.body).toContain(`--novi-hue: ${indigo.hue};`)
    const dark = blockOf(v.css, v.baseDark)
    expect(dark?.body).toContain(`--novi-color-primary: ${indigo.dark.primary};`)
  })

  it.each(TACTILE_COLOR_SET.map((entry) => [entry.id, entry] as const))(
    '%s: light / dark(attr) / media dark に primary・相方・染まった中立色が出る',
    (id, entry) => {
      const pair = colorById(entry.pair)

      const light = blockOf(v.css, v.light(id))
      expect(light, `light ブロックが無い: ${v.light(id)}`).not.toBeNull()
      expect(light?.body).toContain(`--novi-hue: ${entry.hue};`)
      expect(light?.body).toContain(`--novi-color-primary: ${entry.light.primary};`)
      expect(light?.body).toContain(`--novi-color-primary-fg: ${entry.light.primaryFg};`)
      expect(light?.body).toContain(`--novi-color-secondary: ${pair.light.primary};`)
      // 染まる生地: 中立色と surface も色ごとに差し替わる（FR-06）
      expect(light?.body).toContain(`--novi-color-bg: ${neutralsFor(entry.hue, 'light').bg};`)
      expect(light?.body).toContain(`--novi-color-surface: ${surfaceFor(entry.hue, 'light')};`)

      const dark = blockOf(v.css, v.dark(id))
      expect(dark, `dark ブロックが無い: ${v.dark(id)}`).not.toBeNull()
      expect(dark?.body).toContain(`--novi-color-primary: ${entry.dark.primary};`)
      expect(dark?.body).toContain(`--novi-color-bg: ${neutralsFor(entry.hue, 'dark').bg};`)

      const media = blockOf(v.css, v.mediaDark(id))
      expect(media, `media dark ブロックが無い: ${v.mediaDark(id)}`).not.toBeNull()
      expect(media?.body).toContain(`--novi-color-primary: ${entry.dark.primary};`)
    },
  )

  it('全中立トークンが色ブロックに揃っている（染め残しがない）', () => {
    const names = Object.keys(neutralsFor(0, 'light'))
    for (const entry of TACTILE_COLOR_SET) {
      const body = blockOf(v.css, v.light(entry.id))?.body ?? ''
      const missing = names.filter((n) => !body.includes(`--novi-color-${n}:`))
      expect(missing, `${entry.id} で未出力: ${missing.join(', ')}`).toEqual([])
    }
  })

  it('色ブロックの中立色がすべてその色の hue を持つ（相方 secondary は別 hue で正しい）', () => {
    const neutralNames = new Set([...Object.keys(neutralsFor(0, 'light')), 'surface'])
    for (const entry of TACTILE_COLOR_SET) {
      const body = blockOf(v.css, v.light(entry.id))?.body ?? ''
      const wrong: string[] = []
      for (const m of body.matchAll(/--novi-color-([\w-]+): (oklch\([^;]+\));/g)) {
        const name = m[1] as string
        if (!neutralNames.has(name)) continue
        const parsed = parseOklch(m[2] as string)
        if (parsed !== null && parsed.h !== entry.hue) wrong.push(`${name}:${parsed.h}`)
      }
      expect(wrong, `${entry.id}: ${wrong.join(', ')}`).toEqual([])
    }
  })

  it('相方 secondary が別 hue を持つ（バイカラーが成立している）', () => {
    for (const entry of TACTILE_COLOR_SET) {
      const body = blockOf(v.css, v.light(entry.id))?.body ?? ''
      const m = /--novi-color-secondary: (oklch\([^;]+\));/.exec(body)
      expect(m, `${entry.id}: secondary が無い`).not.toBeNull()
      expect(parseOklch(m?.[1] as string)?.h).toBe(colorById(entry.pair).hue)
    }
  })

  it('並び順がカスケードを守る: base < 色 light < 色 dark、base media < 色 media', () => {
    const indexOf = (selector: string): number => {
      const block = blockOf(v.css, selector)
      if (block === null) throw new Error(`ブロックが無い: ${selector}`)
      return block.index
    }
    for (const entry of TACTILE_COLOR_SET) {
      expect(indexOf(v.baseDark)).toBeLessThan(indexOf(v.light(entry.id)))
      expect(indexOf(v.light(entry.id))).toBeLessThan(indexOf(v.dark(entry.id)))
      expect(indexOf(v.baseMediaDark)).toBeLessThan(indexOf(v.mediaDark(entry.id)))
    }
  })

  it('色ブロックは意味色（success / warning / danger）を持たない（FR-08）', () => {
    for (const entry of TACTILE_COLOR_SET) {
      for (const selector of [v.light(entry.id), v.dark(entry.id), v.mediaDark(entry.id)]) {
        const body = blockOf(v.css, selector)?.body ?? ''
        expect(body).not.toMatch(/success|warning|danger/)
      }
    }
  })

  it('Raster の色名のセレクタが存在しない = 他モデルの色は既定色に落ちる（FR-05）', () => {
    for (const rasterOnly of ['ink', 'brick', 'ochre', 'prussian']) {
      expect(v.css).not.toContain(`data-novi-color='${rasterOnly}'`)
    }
  })
})
