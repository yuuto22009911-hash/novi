#!/usr/bin/env node
/**
 * ドキュメントと AI 向け出力の唯一の情報源（IR）を生成する。
 *
 * props 表・slot 表・llms.txt・MCP の応答がすべてこの1ファイルを読む。
 * 各出力先が別々にソースを読むと抽出ロジックが重複し、必ずズレる（ADR-A1）。
 *
 * **手書きのドキュメントを作らないための土台。**
 * 実装とズレたドキュメントは人間には軽い不便だが、AI には致命的（誤った API を自信を持って生成する）。
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const DOCS_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const REPO_ROOT = join(DOCS_ROOT, '..', '..')
const CONTRACTS_DIR = join(REPO_ROOT, 'packages', 'core', 'src', 'contracts')
const OUT_DIR = join(DOCS_ROOT, '.generated')

// ビルド済みの dist から読む。利用者が実際に受け取る API と一致させるため。
// src を直接 import すると相対パスの拡張子解決で Node が詰まる。
const CORE_DIST = join(REPO_ROOT, 'packages', 'core', 'dist', 'index.mjs')
const { NOVI_CONTRACTS, NOVI_COLORS, NOVI_RADII, NOVI_SIZES, NOVI_VARIANTS } = await import(
  CORE_DIST
)

/**
 * 契約ファイルから props とその JSDoc を抜き出す。
 *
 * TypeScript の programmatic API を使わない理由:
 * 契約ファイルは「1インターフェース = プロパティの羅列」という単純な形に統一してあり、
 * 正規表現で十分に読める。TS 7 への移行時に API 変更で壊れる依存を持たずに済む。
 */
function extractProps(source, interfaceName) {
  const start = source.indexOf(`export interface ${interfaceName} `)
  if (start === -1) return []

  const open = source.indexOf('{', start)
  let depth = 0
  let end = open
  for (let i = open; i < source.length; i++) {
    if (source[i] === '{') depth++
    else if (source[i] === '}') {
      depth--
      if (depth === 0) {
        end = i
        break
      }
    }
  }

  const body = source.slice(open + 1, end)
  const props = []
  let doc = ''

  for (const rawLine of body.split('\n')) {
    const line = rawLine.trim()
    if (line === '') continue

    if (line.startsWith('/**') && line.endsWith('*/')) {
      doc = line.slice(3, -2).trim()
      continue
    }
    if (line.startsWith('/**')) {
      doc = line.slice(3).trim()
      continue
    }
    if (line.startsWith('*/')) continue
    if (line.startsWith('*')) {
      doc = `${doc} ${line.slice(1).trim()}`.trim()
      continue
    }

    const match = /^([a-zA-Z]+)(\?)?:\s*(.+?);?$/.exec(line)
    if (match) {
      props.push({
        name: match[1],
        required: match[2] === undefined,
        type: match[3].replace(/;$/, '').trim(),
        doc: doc.replace(/\s+/g, ' ').trim(),
      })
    }
    doc = ''
  }

  return props
}

/** 契約ファイルから `@example` ブロックを抜き出す。 */
function extractExample(source, interfaceName) {
  const start = source.indexOf(`export interface ${interfaceName} `)
  if (start === -1) return null
  const docStart = source.lastIndexOf('/**', start)
  if (docStart === -1) return null

  const doc = source.slice(docStart, start)
  const exampleAt = doc.indexOf('@example')
  if (exampleAt === -1) return null

  return doc
    .slice(exampleAt + '@example'.length)
    .split('\n')
    .map((line) => line.replace(/^\s*\*\s?/, '').replace(/\/$/, ''))
    .filter((line) => line.trim() !== '')
    .join('\n')
    .trim()
}

const contractFiles = readdirSync(CONTRACTS_DIR).filter((f) => f.endsWith('.contract.ts'))
const sources = new Map(contractFiles.map((f) => [f, readFileSync(join(CONTRACTS_DIR, f), 'utf8')]))

/** 契約名 → Props インターフェース名（Textarea だけ表記が揺れる）。 */
const propsInterfaceOf = (name) => `${name === 'Textarea' ? 'Textarea' : name}Props`

const components = Object.entries(NOVI_CONTRACTS)
  .map(([name, contract]) => {
    const interfaceName = propsInterfaceOf(name)
    const source = [...sources.values()].find((s) =>
      s.includes(`export interface ${interfaceName} `),
    )
    if (source === undefined) {
      throw new Error(`${name}: ${interfaceName} が契約ファイルに見つかりません`)
    }

    return {
      name,
      props: extractProps(source, interfaceName),
      example: extractExample(source, interfaceName),
      slots: {
        all: [...contract.slots],
        required: [...contract.required],
      },
    }
  })
  .sort((a, b) => a.name.localeCompare(b.name))

const index = {
  version: JSON.parse(readFileSync(join(REPO_ROOT, 'packages', 'core', 'package.json'), 'utf8'))
    .version,
  conventions: {
    noProvider: true,
    emitsDataSlot: true,
    propNaming: { disabled: 'isDisabled', onClick: 'onPress', checked: 'isSelected' },
  },
  vocabularies: {
    variants: [...NOVI_VARIANTS],
    sizes: [...NOVI_SIZES],
    colors: [...NOVI_COLORS],
    radii: [...NOVI_RADII],
  },
  themes: {
    raster: { pkg: '@novi-ui/raster', label: 'Raster', description: 'ミニマル / スイス系' },
  },
  components,
}

// 生成に失敗したら気づけるよう、空や欠損は明示的に落とす
for (const component of components) {
  if (component.props.length === 0) {
    throw new Error(`${component.name}: props を1つも抽出できませんでした`)
  }
  if (component.example === null) {
    throw new Error(`${component.name}: @example が見つかりません`)
  }
}

mkdirSync(OUT_DIR, { recursive: true })
writeFileSync(join(OUT_DIR, 'component-index.json'), `${JSON.stringify(index, null, 2)}\n`, 'utf8')

const propCount = components.reduce((sum, c) => sum + c.props.length, 0)
console.log(`✓ component-index.json を生成（${components.length} 契約 / ${propCount} props）`)
