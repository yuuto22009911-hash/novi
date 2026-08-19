#!/usr/bin/env node
/**
 * Raster のデザイン規律をソースに対して機械的に検査する。
 *
 * 「ミニマル」を主観で運用すると必ずブレる。数値と禁止事項で縛る。
 * 例外はファイル単位のホワイトリストで管理し、**理由の明記を必須**にする。
 * 例外が理由なく増えると、この検査は形骸化する。
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const PKG_ROOT = new URL('..', import.meta.url).pathname
const SRC = join(PKG_ROOT, 'src')

/**
 * 例外。キーはファイル名、値は許可するルール ID と理由。
 * 追加するときは PR で必ず理由を確認する。
 */
const EXCEPTIONS = {
  'spinner.styles.ts': {
    rules: ['rotate'],
    reason: 'ローディング表現の代替（点滅・バー往復）は視認性か情報量で劣る（ADR-R2）',
  },
  'raster-tokens.ts': {
    rules: ['literal-color', 'duration', 'radius', 'shadow'],
    reason: 'トークンの値そのものを定義する唯一の場所。ここだけは「使用」ではなく「定義」',
  },
}

/** @type {{id: string, pattern: RegExp, message: string}[]} */
const RULES = [
  {
    id: 'shadow',
    pattern: /(?<![\w-])shadow-(?!none\b)[\w[]/g,
    message: '影は使わない。階層は境界線と背景色の差で表す',
  },
  {
    id: 'radius',
    pattern: /(?<![\w-])rounded-(?:md|lg|xl|2xl|3xl|\[(?!var\(--novi))/g,
    message: '角丸はトークン経由。Raster では最大 2px',
  },
  {
    id: 'border-width',
    pattern: /(?<![\w-])border-(?:[2-9]|\d\d)(?![\w-])/g,
    message: '境界線は 1px のみ。面の分割は線の太さでなく余白で行う',
  },
  {
    id: 'scale',
    pattern: /(?<![\w-])(?:scale|scale-x|scale-y)-\d/g,
    message: '動きで飾らない。モーションは opacity と translate のみ',
  },
  {
    id: 'rotate',
    pattern: /(?<![\w-])(?:rotate|animate-spin)/g,
    message: '同上。回転は Spinner のみ例外（ADR-R2）',
  },
  {
    id: 'literal-color',
    pattern: /#[0-9a-fA-F]{3,8}\b|(?<![\w-])(?:rgb|rgba|hsl|oklch)\(/g,
    message: '色は必ず --novi-color-* を経由する。リテラル値を書かない',
  },
  {
    id: 'duration',
    pattern: /(?<![\w-])duration-(?!\[var\(--novi)/g,
    message: 'モーションの時間はトークン経由にする',
  },
]

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
  console.error('\n✗ Raster のデザイン規律に違反しています。\n')
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

console.log(`✓ Raster のデザイン規律（${RULES.length} ルール）に違反なし`)
for (const [file, { rules, reason }] of Object.entries(EXCEPTIONS)) {
  console.log(`  例外: ${file} [${rules.join(', ')}] — ${reason}`)
}
