#!/usr/bin/env node
/**
 * Raster のトークン CSS を2種類生成する。
 *
 * - `raster.css`        `:root` に適用。通常利用はこれを1行 import するだけでよい
 * - `raster.scoped.css` `[data-novi-theme='raster']` 配下にのみ適用。docs で複数テーマが同居するため
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
writeFileSync(join(DIST, 'raster.css'), globalCss, 'utf8')
writeFileSync(join(DIST, 'raster.scoped.css'), scopedCss, 'utf8')
console.log(`✓ raster.css (${globalCss.length} B) / raster.scoped.css (${scopedCss.length} B)`)
