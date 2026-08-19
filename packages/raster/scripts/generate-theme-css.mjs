#!/usr/bin/env node
/**
 * Raster のトークン CSS を2種類生成する。
 *
 * - `raster.css`        `:root` に適用。通常利用はこれを1行 import するだけでよい
 * - `raster.scoped.css` `[data-novi-theme='raster']` 配下にのみ適用。docs で複数テーマが同居するため
 *
 * 2種類必要な理由は 03-docs-site の ADR-D2 を参照。
 * 手書きで二重管理せず、同じ定義から生成する。
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const {
  RASTER_DARK_COLORS,
  RASTER_LIGHT_COLORS,
  RASTER_MOTION,
  RASTER_RADII,
  RASTER_SHADOWS,
  RASTER_TEXT,
} = await import('../src/tokens/raster-tokens.ts')

const PKG_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(PKG_ROOT, 'dist')

/** @param {Record<string,string>} tokens @param {string} group @param {string} indent */
const decls = (tokens, group, indent) =>
  Object.entries(tokens)
    .map(([name, value]) => `${indent}--novi-${group}${name}: ${value};`)
    .join('\n')

/** @param {string} selector @param {string} indent */
function tokenBlock(selector, indent) {
  const inner = indent + '  '
  return [
    `${indent}${selector} {`,
    decls(RASTER_RADII, 'radius-', inner),
    decls(RASTER_SHADOWS, 'shadow-', inner),
    decls(RASTER_TEXT, 'text-', inner),
    decls(RASTER_MOTION, '', inner),
    decls(RASTER_LIGHT_COLORS, 'color-', inner),
    `${indent}}`,
  ].join('\n')
}

/** @param {string} selector @param {string} indent */
function darkBlock(selector, indent) {
  return [
    `${indent}${selector} {`,
    decls(RASTER_DARK_COLORS, 'color-', indent + '  '),
    `${indent}}`,
  ].join('\n')
}

const HEADER =
  '/* 自動生成。編集しないこと。src/tokens/raster-tokens.ts を変更して再生成する。 */\n'

// 通常利用: :root に直接適用する
const globalCss = `${HEADER}
@layer novi.base {
${tokenBlock(':root', '  ')}

${darkBlock("[data-novi-scheme='dark']", '  ')}

  @media (prefers-color-scheme: dark) {
${darkBlock(":root:not([data-novi-scheme='light'])", '    ')}
  }
}
`

// docs 用: テーマ属性の配下にのみ適用する
const scopedCss = `${HEADER}
@layer novi.base {
${tokenBlock("[data-novi-theme='raster']", '  ')}

${darkBlock("[data-novi-theme='raster'][data-novi-scheme='dark']", '  ')}

  @media (prefers-color-scheme: dark) {
${darkBlock("[data-novi-theme='raster']:not([data-novi-scheme='light'])", '    ')}
  }
}
`

mkdirSync(DIST, { recursive: true })
writeFileSync(join(DIST, 'raster.css'), globalCss, 'utf8')
writeFileSync(join(DIST, 'raster.scoped.css'), scopedCss, 'utf8')
console.log(`✓ raster.css (${globalCss.length} B) / raster.scoped.css (${scopedCss.length} B)`)
