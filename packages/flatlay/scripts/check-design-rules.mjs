#!/usr/bin/env node
/**
 * Flatlay のデザイン規律をソースに対して機械的に検査する。
 *
 * 「z 軸を持たない」を主観で運用すると必ずブレる。1箇所でも `z-10` が混ざれば
 * 原理そのものが崩れるのに、見た目にはほとんど何も起きない。だから機械で縛る。
 * 例外はファイル単位のホワイトリストで管理し、**理由の明記を必須**にする
 * （データ側の reason と、コード側のコメントの両方）。
 *
 * 走査そのものは `scan-design-rules.mjs` にあり、変異テストが同じ関数を呼ぶ。
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, join, relative } from 'node:path'
import {
  DESIGN_RULE_EXCEPTIONS as EXCEPTIONS,
  DESIGN_RULES as RULES,
} from './design-rules.data.mjs'
import { checkExceptionComment, scanSource } from './scan-design-rules.mjs'

const PKG_ROOT = new URL('..', import.meta.url).pathname
const SRC = join(PKG_ROOT, 'src')

/** @param {string} dir @returns {string[]} */
function collect(dir) {
  const found = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) found.push(...collect(full))
    else if (/\.(ts|tsx)$/.test(entry) && !/\.test\.tsx?$/.test(entry)) found.push(full)
  }
  return found
}

const violations = []
const missingReasons = []

for (const file of collect(SRC)) {
  const name = basename(file)
  const source = readFileSync(file, 'utf8')
  for (const v of scanSource(name, source)) {
    violations.push({ ...v, file: relative(PKG_ROOT, file) })
  }
  const missing = checkExceptionComment(name, source)
  if (missing !== null) missingReasons.push(missing)
}

if (violations.length > 0 || missingReasons.length > 0) {
  console.error('\n✗ Flatlay のデザイン規律に違反しています。\n')
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}  [${v.rule}] "${v.found}"`)
    console.error(`    ${v.message}`)
    console.error(`    → ${v.text}`)
  }
  for (const m of missingReasons) console.error(`  ${m}`)
  console.error(
    '\n  例外が必要な場合は scripts/design-rules.data.mjs の DESIGN_RULE_EXCEPTIONS に' +
      '\n  ファイル名と理由を明記し、当該ファイルにも理由のコメントを残してください。' +
      '\n  position の例外は Modal と Tooltip の2つで固定です（NG1）。\n',
  )
  process.exit(1)
}

console.log(`✓ Flatlay のデザイン規律（${RULES.length} ルール）に違反なし`)
for (const [file, { rules, reason }] of Object.entries(EXCEPTIONS)) {
  console.log(`  例外: ${file} [${rules.join(', ')}] — ${reason}`)
}
