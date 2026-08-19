#!/usr/bin/env node
/**
 * 上流の不安定 API（`UNSTABLE_` 接頭辞）の import が
 * `packages/core/src/unstable/` の外に漏れていないことを検査する。
 *
 * 漏れると、上流の破壊的変更のたびに全テーマを直すことになる。
 * 目視では守れないので機械的に検査する（設計書 FR-09 / AC-04-2）。
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const ALLOWED_DIR = join('packages', 'core', 'src', 'unstable')
const SOURCE_EXT = ['.ts', '.tsx', '.mts', '.js', '.jsx']
const SKIP_DIRS = new Set(['node_modules', 'dist', '.turbo', '.next', 'coverage'])

/** @param {string} dir @returns {string[]} */
function collectSources(dir) {
  const found = []
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      found.push(...collectSources(full))
    } else if (SOURCE_EXT.some((ext) => entry.endsWith(ext))) {
      found.push(full)
    }
  }
  return found
}

const violations = []

for (const file of collectSources(join(ROOT, 'packages'))) {
  const rel = relative(ROOT, file)
  if (rel.startsWith(ALLOWED_DIR + sep)) continue

  const lines = readFileSync(file, 'utf8').split('\n')
  lines.forEach((line, index) => {
    // import 文の中に UNSTABLE_ が現れたら違反。コメントでの言及は許す。
    const trimmed = line.trim()
    if (trimmed.startsWith('*') || trimmed.startsWith('//')) return
    if (!/\bUNSTABLE_[A-Za-z]/.test(line)) return
    if (!/\b(import|from|require)\b/.test(line)) return
    violations.push({ file: rel, line: index + 1, text: trimmed })
  })
}

if (violations.length > 0) {
  console.error('\n✗ UNSTABLE_ の直接 import が見つかりました。\n')
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}`)
    console.error(`    ${v.text}`)
  }
  console.error(
    `\n  不安定な上流 API は ${ALLOWED_DIR}/ の中だけで import し、` +
      '\n  安定した Novi 名で再公開してください（設計書 ADR-07）。\n',
  )
  process.exit(1)
}

console.log('✓ UNSTABLE_ の直接 import なし')
