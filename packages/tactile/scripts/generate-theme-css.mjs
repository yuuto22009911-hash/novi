#!/usr/bin/env node
/**
 * Tactile のトークン CSS を2種類生成する。
 *
 * - `tactile.css`        `:root` に適用。通常利用はこれを1行 import するだけでよい
 * - `tactile.scoped.css` `[data-novi-theme='tactile']` 配下にのみ適用。docs で複数テーマが同居するため
 *
 * 2種類必要な理由は 03-docs-site の ADR-D2 を参照。
 * 手書きで二重管理せず、同じ定義から生成する。
 * 組み立ては `theme-css.mjs` にあり、`colors.test.ts` が同じ関数の出力を検査する。
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { buildGlobalCss, buildScopedCss } from './theme-css.mjs'

const PKG_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(PKG_ROOT, 'dist')

const globalCss = buildGlobalCss()
const scopedCss = buildScopedCss()

mkdirSync(DIST, { recursive: true })
writeFileSync(join(DIST, 'tactile.css'), globalCss, 'utf8')
writeFileSync(join(DIST, 'tactile.scoped.css'), scopedCss, 'utf8')
console.log(`✓ tactile.css (${globalCss.length} B) / tactile.scoped.css (${scopedCss.length} B)`)
