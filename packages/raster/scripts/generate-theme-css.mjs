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

import { cssVariableName, TOKEN_GROUPS } from './tokens.data.mjs'

const PKG_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(PKG_ROOT, 'dist')

/** @param {Record<string,string>} tokens @param {string} prefix @param {string} indent */
const decls = (tokens, prefix, indent) =>
  Object.entries(tokens)
    .map(([name, value]) => `${indent}${cssVariableName(prefix, name)}: ${value};`)
    .join('\n')

/** @param {string} selector @param {string} indent */
function tokenBlock(selector, indent) {
  const inner = `${indent}  `
  return [
    `${indent}${selector} {`,
    ...TOKEN_GROUPS.map((group) => decls(group.values, group.prefix, inner)),
    `${indent}}`,
  ].join('\n')
}

/** ダークで差し替わるのは色だけ。他のトークンはスキームに依存しない。 */
function darkBlock(selector, indent) {
  return [
    `${indent}${selector} {`,
    ...TOKEN_GROUPS.filter((group) => group.dark !== undefined).map((group) =>
      decls(group.dark ?? {}, group.prefix, `${indent}  `),
    ),
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
