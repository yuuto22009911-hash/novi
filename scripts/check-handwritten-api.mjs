#!/usr/bin/env node
/**
 * 手書きの API 情報がリポジトリに紛れ込んでいないかを検査する（T-17 / AC-02-2）。
 *
 * props 表・slot 一覧・`llms.txt` は IR から生成している。同じ情報を人が別の場所に
 * 書くと、**片方だけが更新されて必ずズレる**。ズレたドキュメントは AI に
 * 誤った API を自信を持って生成させるため、無いより悪い。
 *
 * 見つけたいのは「実装の写し」であって、散文としての言及ではない。
 * `isDisabled` という語がドキュメントの文中に出るのは正常。
 * props の**一覧**や slot の**一覧**が手で書かれていることが問題。
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname

/** 生成物・依存・成果物は対象外。ここに手書きは存在しない。 */
const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  '.turbo',
  '.next',
  'out',
  'dist',
  'coverage',
  '.generated',
  'data',
  'test-results',
  'playwright-report',
  // 失敗時に Playwright が書き出すレポート。生成物であってソースではない
  '.playwright',
])

/**
 * 検査から除く個別ファイル。**理由の明記を必須**にする。
 * 理由なく増えると、この検査は形骸化する。
 */
const EXCEPTIONS = {
  'scripts/check-handwritten-api.mjs': 'この検査自身。判定の例をコメントに含む',
  'AGENTS.md': 'リポジトリの規約。API の写しではなく作業手順',
  'packages/mcp/README.md': '設定方法と安全性の説明。props の一覧を含まない',
  // 手書きではなく生成物。鮮度は check:skill が IR と突き合わせて守る
  'skills/novi-ui/SKILL.md': 'IR から生成（apps/docs/scripts/generate-skill.mjs）',
  'skills/novi-ui/references/components.md':
    'IR から生成（同上）。props / slot の表はここが唯一の写し',
}

/** @type {{id: string, test: (text: string) => number[], message: string}[]} */
const RULES = [
  {
    id: 'props-table',
    message: 'props の表を手で書いています。`PropsTable` か IR からの生成に置き換えてください',
    test(text) {
      // `| prop名 | 型 |` の形が2行以上続くものを props 表とみなす
      const lines = text.split('\n')
      const hits = []
      let run = 0
      lines.forEach((line, i) => {
        const isRow = /^\s*\|\s*`?(is[A-Z]|on[A-Z]|variant|size|color|radius|classNames)/.test(line)
        run = isRow ? run + 1 : 0
        if (run === 2) hits.push(i)
      })
      return hits
    },
  },
  {
    id: 'slot-list',
    message: 'slot の一覧を手で書いています。`SlotTable` か契約からの生成に置き換えてください',
    test(text) {
      const hits = []
      text.split('\n').forEach((line, i) => {
        // 3つ以上の slot 名が1行に並んでいたら写し
        const slots = line.match(/`(root|label|startContent|endContent|spinner|trigger|panel)`/g)
        if (slots !== null && slots.length >= 3) hits.push(i)
      })
      return hits
    },
  },
  {
    id: 'variant-vocabulary',
    // TS の中の列挙は定義そのものか型テスト。写しになるのは散文の側だけ
    files: /\.mdx?$/,
    message:
      'variant / size / color の語彙を散文に書き写しています。1つ増えたときに必ず古くなります',
    test(text) {
      const hits = []
      text.split('\n').forEach((line, i) => {
        if (/solid.*outline.*soft.*ghost.*plain/.test(line)) hits.push(i)
      })
      return hits
    },
  },
]

/** @param {string} dir @returns {string[]} */
function collect(dir) {
  const found = []
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) found.push(...collect(full))
    else if (/\.(md|mdx|tsx?)$/.test(entry)) found.push(full)
  }
  return found
}

const violations = []

for (const file of collect(ROOT)) {
  const path = relative(ROOT, file)
  if (EXCEPTIONS[path] !== undefined) continue
  // 生成スクリプトは出力の雛形として語彙を組み立てる。それが仕事
  if (path.startsWith('scripts/') || /\/scripts\//.test(path)) continue

  const text = readFileSync(file, 'utf8')
  for (const rule of RULES) {
    if (rule.files !== undefined && !rule.files.test(path)) continue
    for (const line of rule.test(text)) {
      violations.push({ path, line: line + 1, rule: rule.id, message: rule.message })
    }
  }
}

if (violations.length > 0) {
  console.error('\n✗ 手書きの API 情報が見つかりました。\n')
  for (const v of violations) {
    console.error(`  ${v.path}:${v.line}  [${v.rule}]`)
    console.error(`    ${v.message}`)
  }
  console.error('\n  API の情報は component-index.json から生成してください。')
  console.error('  例外が必要なら scripts/check-handwritten-api.mjs の EXCEPTIONS に')
  console.error('  理由を明記して追加してください。理由なしの追加は認めません。\n')
  process.exit(1)
}

console.log(`✓ 手書きの API 情報なし（${RULES.length} ルール）`)
for (const [path, reason] of Object.entries(EXCEPTIONS)) {
  console.log(`  例外: ${path} — ${reason}`)
}
