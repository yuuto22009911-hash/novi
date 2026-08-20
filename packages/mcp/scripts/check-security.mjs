#!/usr/bin/env node
/**
 * MCP サーバが「読み取り専用・オフライン」であることをソースと成果物で検査する（T-23 / FR-11 / ADR-A3）。
 *
 * 開発ツールを装って資格情報を盗む MCP サーバの事例がある。
 * このサーバは**触れられるものを構造的に持たない**ことで、その risk を排除している。
 * 設計の意図は、検査が無ければいつか壊れる。
 *
 * 見るのは自分たちのコードと配布物。依存の中身は依存監査（`pnpm audit` と依存数）で見る。
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const PKG_ROOT = new URL('..', import.meta.url).pathname
const SRC = join(PKG_ROOT, 'src')
const DIST = join(PKG_ROOT, 'dist')

/**
 * 禁止するもの。**標準入出力は除く**（MCP の通信路そのもののため）。
 *
 * @type {{id: string, pattern: RegExp, message: string}[]}
 */
const FORBIDDEN = [
  {
    id: 'filesystem',
    pattern: /require\(['"]fs['"]\)|from\s+['"](?:node:)?fs(?:\/promises)?['"]/,
    message: 'ファイルシステムに触れない。データはビルド時に埋め込む',
  },
  {
    id: 'network',
    pattern:
      /\bfetch\s*\(|XMLHttpRequest|from\s+['"](?:node:)?(?:http|https|net|dgram|dns|tls)['"]/,
    message: 'ネットワークに出ない。オフラインで完結する',
  },
  {
    id: 'process-env',
    pattern: /process\.env/,
    message: '環境変数を読まない。資格情報に触れる経路を持たない',
  },
  {
    id: 'child-process',
    pattern: /from\s+['"](?:node:)?child_process['"]|\bexecSync\b|\bspawnSync\b/,
    message: '別プロセスを起動しない',
  },
  {
    id: 'dynamic-eval',
    pattern: /\beval\s*\(|new\s+Function\s*\(/,
    message: '文字列をコードとして実行しない',
  },
]

/** @param {string} dir @param {RegExp} match @returns {string[]} */
function collect(dir, match) {
  if (!existsSync(dir)) return []
  const found = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) found.push(...collect(full, match))
    else if (match.test(entry)) found.push(full)
  }
  return found
}

const targets = [
  ...collect(SRC, /\.ts$/),
  // 成果物も見る。ビルドの過程で混ざったものを見逃さない
  ...collect(DIST, /\.mjs$/),
]

if (targets.length === 0) {
  console.error('✗ 検査対象がありません。先にビルドしてください')
  process.exit(1)
}

const violations = []

for (const file of targets) {
  const lines = readFileSync(file, 'utf8').split('\n')
  for (const rule of FORBIDDEN) {
    lines.forEach((line, i) => {
      const trimmed = line.trim()
      // コメントは対象外。禁止事項の説明そのものが引っかかる
      if (trimmed.startsWith('*') || trimmed.startsWith('//') || trimmed.startsWith('/*')) return
      if (!rule.pattern.test(line)) return
      violations.push({
        file: relative(PKG_ROOT, file),
        line: i + 1,
        rule: rule.id,
        message: rule.message,
        text: trimmed.slice(0, 90),
      })
    })
  }
}

// 依存が増えるほど供給網の面積が広がる。増えたことに気づける形にしておく
const pkg = JSON.parse(readFileSync(join(PKG_ROOT, 'package.json'), 'utf8'))
const ALLOWED_DEPENDENCIES = ['@modelcontextprotocol/sdk', 'zod']
const unexpected = Object.keys(pkg.dependencies ?? {}).filter(
  (name) => !ALLOWED_DEPENDENCIES.includes(name),
)

if (violations.length > 0 || unexpected.length > 0) {
  console.error('\n✗ MCP サーバの安全性の前提が壊れています。\n')
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}  [${v.rule}]`)
    console.error(`    ${v.message}`)
    console.error(`    → ${v.text}`)
  }
  for (const name of unexpected) {
    console.error(`  package.json  [dependency] ${name} が想定外の依存です`)
    console.error('    増やす場合は ADR-A3 を読み直し、この一覧に理由付きで追加してください')
  }
  console.error('')
  process.exit(1)
}

console.log(
  `✓ 環境変数 / FS / ネットワーク / 子プロセス / eval への経路なし（${targets.length} ファイル）`,
)
console.log(`✓ 実行時依存は ${ALLOWED_DEPENDENCIES.join(', ')} のみ`)
