import { parseOklch } from '@novi-ui/core/testing'
import { describe, expect, it } from 'vitest'
import { buildGlobalCss, buildScopedCss } from '../../scripts/theme-css.mjs'
import { colorById, DEFAULT_COLOR_ID, FLATLAY_COLOR_SET, neutralsFor } from './color-set'
import { ACHROMATIC_NEUTRAL_KEYS, TINTED_BORDER_KEYS } from './flatlay-tokens'

/**
 * 生成 CSS の検査（T-03）。**データではなく成果物を見る。**
 *
 * 値そのものの妥当性（コントラスト・色域・帯域）は `flatlay-tokens.test.ts` が担当し、
 * ここは「その値が正しいセレクタで、正しい順序で CSS に出ているか」を固定する。
 * 並び順はカスケードの正しさそのものなので、テストで守る。
 *
 * Flatlay 固有の要点は**色ブロックに何が出ていないか**。地・文字・面が出てしまうと、
 * 「紙は染まらない」という原理が生成物のレベルで崩れる（FR-07）。
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
    name: 'flatlay.css',
    css: buildGlobalCss(),
    root: ':root',
    baseDark: "[data-novi-scheme='dark']",
    baseMediaDark: ":root:not([data-novi-scheme='light'])",
    light: (id: string) => `[data-novi-color='${id}']`,
    dark: (id: string) => `[data-novi-scheme='dark'][data-novi-color='${id}']`,
    mediaDark: (id: string) => `:root:not([data-novi-scheme='light'])[data-novi-color='${id}']`,
  },
  {
    name: 'flatlay.scoped.css',
    css: buildScopedCss(),
    root: "[data-novi-theme='flatlay']",
    baseDark: "[data-novi-theme='flatlay'][data-novi-scheme='dark']",
    baseMediaDark: "[data-novi-theme='flatlay']:not([data-novi-scheme='light'])",
    light: (id: string) => `[data-novi-theme='flatlay'][data-novi-color='${id}']`,
    dark: (id: string) =>
      `[data-novi-theme='flatlay'][data-novi-scheme='dark'][data-novi-color='${id}']`,
    mediaDark: (id: string) =>
      `[data-novi-theme='flatlay']:not([data-novi-scheme='light'])[data-novi-color='${id}']`,
  },
] as const

describe.each(VARIANTS.map((v) => [v.name, v] as const))('生成 CSS: %s', (_name, v) => {
  const fieldbook = colorById(DEFAULT_COLOR_ID)

  it('既定（root）ブロックが Fieldbook の値と --novi-hue を持つ', () => {
    const root = blockOf(v.css, v.root)
    expect(root).not.toBeNull()
    expect(root?.body).toContain(`--novi-color-primary: ${fieldbook.light.primary};`)
    expect(root?.body).toContain(`--novi-hue: ${fieldbook.hue};`)
    const dark = blockOf(v.css, v.baseDark)
    expect(dark?.body).toContain(`--novi-color-primary: ${fieldbook.dark.primary};`)
  })

  it('root ブロックが書体トークンを出す（--novi-font-* を上書きする初のテーマ・G6）', () => {
    const root = blockOf(v.css, v.root)
    expect(root?.body).toContain('--novi-font-mono:')
    expect(root?.body).toContain('--novi-font-sans:')
  })

  it.each(FLATLAY_COLOR_SET.map((entry) => [entry.id, entry] as const))(
    '%s: light / dark(attr) / media dark に primary・相方・染まった罫線が出る',
    (id, entry) => {
      const pair = colorById(entry.pair)

      const light = blockOf(v.css, v.light(id))
      expect(light, `light ブロックが無い: ${v.light(id)}`).not.toBeNull()
      expect(light?.body).toContain(`--novi-hue: ${entry.hue};`)
      expect(light?.body).toContain(`--novi-color-primary: ${entry.light.primary};`)
      expect(light?.body).toContain(`--novi-color-primary-fg: ${entry.light.primaryFg};`)
      expect(light?.body).toContain(`--novi-color-secondary: ${pair.light.primary};`)
      for (const key of TINTED_BORDER_KEYS) {
        expect(light?.body).toContain(
          `--novi-color-${key}: ${neutralsFor(entry.hue, 'light')[key]};`,
        )
      }

      const dark = blockOf(v.css, v.dark(id))
      expect(dark, `dark ブロックが無い: ${v.dark(id)}`).not.toBeNull()
      expect(dark?.body).toContain(`--novi-color-primary: ${entry.dark.primary};`)
      expect(dark?.body).toContain(`--novi-color-border: ${neutralsFor(entry.hue, 'dark').border};`)

      const media = blockOf(v.css, v.mediaDark(id))
      expect(media, `media dark ブロックが無い: ${v.mediaDark(id)}`).not.toBeNull()
      expect(media?.body).toContain(`--novi-color-primary: ${entry.dark.primary};`)
    },
  )

  it('色ブロックが地・文字・面を出さない（紙は染まらない・FR-07）', () => {
    // ここが両テーマとの分水嶺。1トークンでも漏れると、色を切り替えたときに
    // 紙の色が動き、「罫線だけが染まる」という主張が生成物のレベルで崩れる
    for (const entry of FLATLAY_COLOR_SET) {
      for (const selector of [v.light(entry.id), v.dark(entry.id), v.mediaDark(entry.id)]) {
        const body = blockOf(v.css, selector)?.body ?? ''
        const leaked = ACHROMATIC_NEUTRAL_KEYS.filter((k) => body.includes(`--novi-color-${k}:`))
        expect(leaked, `${entry.id} / ${selector}`).toEqual([])
      }
    }
  })

  it('色ブロックの罫線がその色の hue を持つ（相方 secondary は別 hue で正しい）', () => {
    for (const entry of FLATLAY_COLOR_SET) {
      const body = blockOf(v.css, v.light(entry.id))?.body ?? ''
      const wrong: string[] = []
      for (const m of body.matchAll(/--novi-color-([\w-]+): (oklch\([^;]+\));/g)) {
        const name = m[1] as string
        if (!TINTED_BORDER_KEYS.includes(name)) continue
        const parsed = parseOklch(m[2] as string)
        if (parsed !== null && parsed.h !== entry.hue) wrong.push(`${name}:${parsed.h}`)
      }
      expect(wrong, `${entry.id}: ${wrong.join(', ')}`).toEqual([])
    }
  })

  it('相方 secondary が別 hue を持つ（ダブルエントリーが成立している）', () => {
    for (const entry of FLATLAY_COLOR_SET) {
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
    for (const entry of FLATLAY_COLOR_SET) {
      expect(indexOf(v.baseDark)).toBeLessThan(indexOf(v.light(entry.id)))
      expect(indexOf(v.light(entry.id))).toBeLessThan(indexOf(v.dark(entry.id)))
      expect(indexOf(v.baseMediaDark)).toBeLessThan(indexOf(v.mediaDark(entry.id)))
    }
  })

  it('色ブロックは意味色（success / warning / danger）を持たない（FR-08）', () => {
    for (const entry of FLATLAY_COLOR_SET) {
      for (const selector of [v.light(entry.id), v.dark(entry.id), v.mediaDark(entry.id)]) {
        const body = blockOf(v.css, selector)?.body ?? ''
        expect(body).not.toMatch(/success|warning|danger/)
      }
    }
  })

  it('影のトークンがすべて透明で出力される（FR-04）', () => {
    const root = blockOf(v.css, v.root)?.body ?? ''
    for (const step of ['none', 'sm', 'md', 'lg']) {
      expect(root).toContain(`--novi-shadow-${step}: 0 0 #0000;`)
    }
  })

  it('参照できる @keyframes が fade だけ（展開はアニメーションしない・ADR-F1）', () => {
    const defined = new Set([...v.css.matchAll(/@keyframes\s+([\w-]+)/g)].map((m) => m[1]))
    expect([...defined]).toEqual(['novi-fade-in'])
  })

  it('他モデルの色名のセレクタが存在しない = 既定色に落ちる（AC-06-4）', () => {
    for (const foreign of ['ink', 'brick', 'indigo', 'saffron', 'peacock']) {
      expect(v.css).not.toContain(`data-novi-color='${foreign}'`)
    }
  })
})
