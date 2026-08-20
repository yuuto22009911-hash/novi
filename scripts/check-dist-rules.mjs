#!/usr/bin/env node
/**
 * ビルド成果物に対する制約を検査する。**build の後に実行すること。**
 *
 * ここで検出する問題は、いずれも publish するまで気づけない種類のもの。
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const PACKAGES = join(ROOT, 'packages')

/** ワークスペース内の公開パッケージを列挙する。 */
function publishablePackages() {
  return readdirSync(PACKAGES)
    .map((name) => join(PACKAGES, name))
    .filter((dir) => statSync(dir).isDirectory() && existsSync(join(dir, 'package.json')))
    .map((dir) => ({ dir, json: JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')) }))
    .filter((p) => p.json.private !== true)
}

/** @type {{name: string, run: () => string[]}[]} */
const RULES = [
  {
    name: 'package.json の exports が指すファイルが実在する（ADR-C5）',
    run() {
      const problems = []
      for (const { dir, json } of publishablePackages()) {
        const walk = (node) => {
          for (const value of Object.values(node ?? {})) {
            if (typeof value === 'string') {
              if (!existsSync(join(dir, value))) {
                problems.push(`${json.name}: ${value} が存在しません`)
              }
            } else walk(value)
          }
        }
        walk(json.exports)
      }
      return problems
    },
  },
  {
    // テーマパッケージはコンポーネントを配るので、React を import するのは正しい。
    // 問題は「React を使うのに client 宣言が無い」状態。それだと RSC から使ったとき
    // 分かりにくいビルドエラーになる。どちらなのかを必ず明示させる。
    name: 'React ランタイムを使うメインエントリは client を宣言している',
    run() {
      const problems = []
      for (const { dir, json } of publishablePackages()) {
        const main = json.exports?.['.']?.default
        if (typeof main !== 'string') continue
        const file = join(dir, main)
        if (!existsSync(file)) continue
        const code = readFileSync(file, 'utf8')
        const usesReact = ['react', 'react-dom', 'react-aria-components'].some((mod) =>
          new RegExp(`from\\s+["']${mod}["']`).test(code),
        )
        if (!usesReact) continue
        if (!/^\s*["']use client["']/.test(code)) {
          problems.push(
            `${json.name}: ${relative(ROOT, file)} が React を使うのに 'use client' がありません。` +
              `\n      RSC から import したときに分かりにくいビルドエラーになります。`,
          )
        }
      }
      return problems
    },
  },
  {
    // core だけは「型と契約しか持たない」ことが存在理由。React を引き込んだ瞬間、
    // 型を import しただけでクライアント境界が生まれ、ADR-04 が崩れる。
    name: '@novi-ui/core のメインエントリが RSC 安全（React を一切 import しない）（ADR-C6）',
    run() {
      const core = publishablePackages().find((p) => p.json.name === '@novi-ui/core')
      if (!core) return []
      const main = core.json.exports?.['.']?.default
      if (typeof main !== 'string') return []
      const file = join(core.dir, main)
      if (!existsSync(file)) return []
      const code = readFileSync(file, 'utf8')
      return ['react', 'react-dom', 'react-aria-components']
        .filter((mod) => new RegExp(`from\\s+["']${mod}["']`).test(code))
        .map(
          (mod) =>
            `${relative(ROOT, file)} が ${mod} を import しています。` +
            `\n      クライアント専用のものは ./client エントリへ移してください。`,
        )
    },
  },
  {
    name: "クライアント専用エントリに 'use client' が保持されている（ADR-C6）",
    run() {
      const problems = []
      for (const { dir, json } of publishablePackages()) {
        const client = json.exports?.['./client']?.default
        if (typeof client !== 'string') continue
        const file = join(dir, client)
        if (!existsSync(file)) continue
        const head = readFileSync(file, 'utf8').slice(0, 200)
        if (!/^\s*["']use client["']/.test(head)) {
          problems.push(`${json.name}: ${client} の先頭に 'use client' がありません`)
        }
      }
      return problems
    },
  },
  {
    // provenance は package.json の repository とワークフローの出所が一致することを要求する。
    // 欠けていると publish の瞬間に 422 で落ちる（実際に落ちた）。
    // ビルドもテストも通るため、ここで検査しないと気づく方法が無い
    name: '公開パッケージが provenance 用の repository を宣言している',
    run() {
      const problems = []
      for (const { json } of publishablePackages()) {
        const url = json.repository?.url
        if (typeof url !== 'string' || url === '') {
          problems.push(
            `${json.name}: repository.url がありません` +
              '\n      OIDC の provenance 検証に失敗し、publish が 422 で落ちます',
          )
          continue
        }
        if (!url.includes('github.com/yuuto22009911-hash/novi')) {
          problems.push(`${json.name}: repository.url が実際のリポジトリと違います（${url}）`)
        }
        // monorepo では directory が無いと npm がパッケージの場所を辿れない
        if (typeof json.repository?.directory !== 'string') {
          problems.push(`${json.name}: repository.directory がありません`)
        }
      }
      return problems
    },
  },
  {
    name: '公開パッケージが access: public を宣言している',
    run() {
      return publishablePackages()
        .filter((p) => p.json.publishConfig?.access !== 'public')
        .map(
          (p) =>
            `${p.json.name}: publishConfig.access が public ではありません` +
            `\n      scoped パッケージは既定が private 扱いのため publish に失敗します`,
        )
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
