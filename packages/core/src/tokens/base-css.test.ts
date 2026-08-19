import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'
import { NOVI_COLORS } from '../tokens'
import { DARK_COLORS, LIGHT_COLORS, TOKEN_PREFIX } from './definitions'

/**
 * 生成された `base.css` の構造を検査する。
 *
 * jsdom は @media とカスタムプロパティのカスケードを正しく評価しないため、
 * ここでは **生成物のテキスト構造**を検証する。
 * 実ブラウザでの見た目の確認は docs サイト側（03-docs-site）で行う。
 */

const PKG_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const CSS_PATH = join(PKG_ROOT, 'dist', 'base.css')

let css = ''

beforeAll(() => {
  if (!existsSync(CSS_PATH)) {
    execFileSync('node', [join(PKG_ROOT, 'scripts', 'generate-base-css.mjs')], {
      stdio: 'ignore',
    })
  }
  css = readFileSync(CSS_PATH, 'utf8')
})

/** `@layer novi.base` 内の指定セレクタのブロックを取り出す。 */
function blockOf(selector: string): string {
  const start = css.indexOf(selector)
  if (start === -1) return ''
  const open = css.indexOf('{', start)
  let depth = 0
  for (let i = open; i < css.length; i++) {
    if (css[i] === '{') depth++
    else if (css[i] === '}') {
      depth--
      if (depth === 0) return css.slice(open + 1, i)
    }
  }
  return ''
}

describe('レイヤ宣言（FR-11）', () => {
  it('ユーザーの上書きが最後に来る順序で宣言されている', () => {
    expect(css).toContain('@layer novi.reset, novi.base, novi.component, novi.override;')
  })

  it('reset と base のレイヤを持つ', () => {
    expect(css).toContain('@layer novi.reset {')
    expect(css).toContain('@layer novi.base {')
  })

  it('編集しないことが明記されている', () => {
    expect(css).toContain('自動生成')
  })
})

describe('カラースキームの切り替え（AC-06-1〜3）', () => {
  it('属性指定でダーク値を適用するブロックがある（AC-06-1）', () => {
    expect(css).toContain("[data-novi-scheme='dark']")
  })

  it('OS 設定に追従するブロックがある（AC-06-2）', () => {
    expect(css).toContain('@media (prefers-color-scheme: dark)')
  })

  it('明示的な light 指定が OS 設定より優先される（AC-06-3）', () => {
    // :not([data-novi-scheme='light']) が無いと、OS がダークのとき明示 light を無視してしまう
    expect(css).toContain(":root:not([data-novi-scheme='light'])")
  })

  it('属性ブロックがメディアクエリより先に出る（明示指定が後勝ちしないように）', () => {
    const attrIndex = css.indexOf("[data-novi-scheme='dark'] {")
    const mediaIndex = css.indexOf('@media (prefers-color-scheme: dark)')
    expect(attrIndex).toBeGreaterThan(-1)
    expect(mediaIndex).toBeGreaterThan(attrIndex)
  })
})

describe('トークンの出力網羅', () => {
  it(':root がライトの全色を宣言している', () => {
    const root = blockOf(':root {')
    const missing = Object.keys(LIGHT_COLORS).filter(
      (name) => !root.includes(`${TOKEN_PREFIX}color-${name}:`),
    )
    expect(missing).toEqual([])
  })

  it('ダークの全色が2箇所（属性・メディアクエリ）とも出力されている', () => {
    for (const name of Object.keys(DARK_COLORS)) {
      const decl = `${TOKEN_PREFIX}color-${name}:`
      // 属性ブロックとメディアクエリの2回 + :root のライト定義1回 = 3回
      const count = css.split(decl).length - 1
      expect(count, `${name} の出現回数`).toBe(3)
    }
  })

  it('全 NOVI_COLORS が -fg つきで出力されている（FR-15）', () => {
    const root = blockOf(':root {')
    const missing = NOVI_COLORS.flatMap((name) =>
      [`color-${name}`, `color-${name}-fg`].filter(
        (key) => !root.includes(`${TOKEN_PREFIX}${key}:`),
      ),
    )
    expect(missing).toEqual([])
  })

  it('全てのカスタムプロパティが --novi- 名前空間にある（FR-15）', () => {
    const props = css.match(/--[a-z0-9-]+\s*:/gi) ?? []
    const outside = [...new Set(props)].filter((p) => !p.startsWith(TOKEN_PREFIX))
    expect(outside).toEqual([])
  })
})

describe('モーション低減（FR-09 相当・AC-08-1）', () => {
  it('prefers-reduced-motion で duration を 0 にする', () => {
    expect(css).toContain('@media (prefers-reduced-motion: reduce)')
    const block = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'))
    for (const name of ['fast', 'base', 'slow']) {
      expect(block).toContain(`${TOKEN_PREFIX}duration-${name}: 0ms;`)
    }
  })
})

describe('フォーカスリング（FR-11）', () => {
  it('幅・オフセット・色のトークンがある', () => {
    for (const key of ['focus-ring-width', 'focus-ring-offset', 'focus-ring-color']) {
      expect(css).toContain(`${TOKEN_PREFIX}${key}:`)
    }
  })

  it('リング色はスキームに追従するよう変数参照になっている', () => {
    expect(css).toContain(`${TOKEN_PREFIX}focus-ring-color: var(${TOKEN_PREFIX}color-primary)`)
  })
})
