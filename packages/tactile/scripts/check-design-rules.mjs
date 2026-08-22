#!/usr/bin/env node
/**
 * Tactile のデザイン規律をソースに対して機械的に検査する。
 *
 * 「タッチファースト」を主観で運用すると必ずブレる。数値と禁止事項で縛る。
 * 例外はファイル単位のホワイトリストで管理し、**理由の明記を必須**にする。
 * 例外が理由なく増えると、この検査は形骸化する。
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import {
  DESIGN_RULE_EXCEPTIONS as EXCEPTIONS,
  DESIGN_RULES as RULES,
} from './design-rules.data.mjs'

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

for (const file of collect(SRC)) {
  const name = file.split('/').pop() ?? ''
  const exception = EXCEPTIONS[name]
  const lines = readFileSync(file, 'utf8').split('\n')

  for (const rule of RULES) {
    if (exception?.rules.includes(rule.id)) continue

    lines.forEach((line, i) => {
      // コメント行は対象外。説明文に禁止語が出るのは正常
      const trimmed = line.trim()
      if (trimmed.startsWith('*') || trimmed.startsWith('//') || trimmed.startsWith('/*')) return

      rule.pattern.lastIndex = 0
      const match = rule.pattern.exec(line)
      if (match === null) return
      violations.push({
        file: relative(PKG_ROOT, file),
        line: i + 1,
        rule: rule.id,
        found: match[0],
        message: rule.message,
        text: trimmed.slice(0, 90),
      })
    })
  }
}

if (violations.length > 0) {
  console.error('\n✗ Tactile のデザイン規律に違反しています。\n')
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}  [${v.rule}] "${v.found}"`)
    console.error(`    ${v.message}`)
    console.error(`    → ${v.text}`)
  }
  console.error(
    '\n  例外が必要な場合は scripts/check-design-rules.mjs の EXCEPTIONS に' +
      '\n  ファイル名と理由を明記して追加してください。理由なしの追加は認めません。\n',
  )
  process.exit(1)
}

console.log(`✓ Tactile のデザイン規律（${RULES.length} ルール）に違反なし`)
for (const [file, { rules, reason }] of Object.entries(EXCEPTIONS)) {
  console.log(`  例外: ${file} [${rules.join(', ')}] — ${reason}`)
}
