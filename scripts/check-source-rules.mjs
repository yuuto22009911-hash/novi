#!/usr/bin/env node
/**
 * ソースに対する設計上の制約を検査する。
 *
 * いずれも目視では守れない種類の制約なので機械的に検査する。
 * 違反しても見た目には何も起きず、後から静かに壊れるものばかり。
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const SOURCE_EXT = ['.ts', '.tsx', '.mts', '.js', '.jsx']
const SKIP_DIRS = new Set(['node_modules', 'dist', '.turbo', '.next', 'coverage'])

/** @param {string} dir @param {(name: string) => boolean} accept */
function collect(dir, accept) {
  const found = []
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) found.push(...collect(full, accept))
    else if (accept(entry)) found.push(full)
  }
  return found
}

/** @type {{name: string, run: () => string[]}[]} */
const RULES = [
  {
    // import だけを見ていると、prop 名としての直書き（`UNSTABLE_portalContainer={...}`）が
    // すり抜ける。Flatlay はこの prop に原理そのものを預けているので、出現ごと禁じる。
    // `UNSAFE_` も同じ扱い（Toast の region はポータル先を context でしか受け取らない）
    name: 'UNSTABLE_ / UNSAFE_ を書けるのは core/src/unstable/ の中だけ（FR-09 / ADR-07）',
    run() {
      const allowed = join('packages', 'core', 'src', 'unstable')
      const problems = []
      for (const file of collect(join(ROOT, 'packages'), (n) =>
        SOURCE_EXT.some((e) => n.endsWith(e)),
      )) {
        const rel = relative(ROOT, file)
        if (rel.startsWith(allowed + sep)) continue
        // テストは接頭辞が漏れていないことを「主張する」ために名前を書く必要がある
        if (/\.test(-d)?\.[jt]sx?$/.test(rel)) continue
        readFileSync(file, 'utf8')
          .split('\n')
          .forEach((line, i) => {
            const t = line.trim()
            if (t.startsWith('*') || t.startsWith('//')) return
            if (!/\bUN(?:STABLE|SAFE)_[A-Za-z]/.test(line)) return
            problems.push(`${rel}:${i + 1}  ${t}`)
          })
      }
      return problems
    },
  },
  {
    name: 'core のソースに CSS を置かない（FR-10）',
    run() {
      const dir = join(ROOT, 'packages', 'core', 'src')
      return collect(dir, (n) => n.endsWith('.css')).map(
        (f) => `${relative(ROOT, f)}  （base.css はビルド時生成にすること）`,
      )
    },
  },
  {
    name: 'テーマは core 経由でのみ挙動を使う（react-aria を直接 import しない）',
    run() {
      const problems = []
      const themes = join(ROOT, 'packages')
      for (const file of collect(themes, (n) => SOURCE_EXT.some((e) => n.endsWith(e)))) {
        const rel = relative(ROOT, file)
        // core 自身とテストは対象外。テーマパッケージのみを見る
        if (rel.startsWith(join('packages', 'core') + sep)) continue
        if (/\.test\.[jt]sx?$/.test(rel)) continue
        readFileSync(file, 'utf8')
          .split('\n')
          .forEach((line, i) => {
            if (/from\s+['"]@react-aria\//.test(line) || /from\s+['"]@react-stately\//.test(line)) {
              problems.push(`${rel}:${i + 1}  ${line.trim()}`)
            }
          })
      }
      return problems
    },
  },
  {
    // 命名が揺れると AI の推測が外れる。一貫していれば「たぶんこう」が当たる（AC-01-2 / ADR-05）
    name: '契約の props 名が React Aria の慣習に従う（AC-01-2）',
    run() {
      /** 使ってはいけない名前 → 使うべき名前。 */
      const RENAMED = {
        disabled: 'isDisabled',
        onClick: 'onPress',
        checked: 'isSelected',
        selected: 'isSelected',
        open: 'isOpen',
        required: 'isRequired',
        invalid: 'isInvalid',
        readOnly: 'isReadOnly',
        indeterminate: 'isIndeterminate',
      }

      const problems = []
      const dir = join(ROOT, 'packages', 'core', 'src', 'contracts')
      for (const file of collect(dir, (n) => n.endsWith('.contract.ts'))) {
        const rel = relative(ROOT, file)
        readFileSync(file, 'utf8')
          .split('\n')
          .forEach((line, i) => {
            const match = /^\s{2}([a-zA-Z]+)\??:/.exec(line)
            if (match === null) return
            const should = RENAMED[match[1]]
            if (should === undefined) return
            problems.push(`${rel}:${i + 1}  \`${match[1]}\` ではなく \`${should}\` を使う`)
          })
      }
      return problems
    },
  },
]

let failed = 0
for (const rule of RULES) {
  const problems = rule.run()
  if (problems.length === 0) {
    console.log(`✓ ${rule.name}`)
  } else {
    failed++
    console.error(`✗ ${rule.name}`)
    for (const p of problems) console.error(`    ${p}`)
  }
}

if (failed > 0) {
  console.error(`\n${failed} 件の制約違反があります。\n`)
  process.exit(1)
}
