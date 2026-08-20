#!/usr/bin/env node
/**
 * ドキュメントと AI 向け出力の唯一の情報源（IR）を生成する。
 *
 * props 表・slot 表・llms.txt・MCP の応答がすべてこの1ファイルを読む。
 * 各出力先が別々にソースを読むと抽出ロジックが重複し、必ずズレる（ADR-A1）。
 *
 * **手書きのドキュメントを作らないための土台。**
 * 実装とズレたドキュメントは人間には軽い不便だが、AI には致命的（誤った API を自信を持って生成する）。
 *
 * 出力先はリポジトリ相対で受け取る。docs と MCP がそれぞれ自分の位置に受け取るため。
 *
 * @example
 * node scripts/generate-component-index.mjs --out apps/docs/.generated/component-index.json
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateComponentIndex } from './ir-schema.mjs'

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const CONTRACTS_DIR = join(REPO_ROOT, 'packages', 'core', 'src', 'contracts')

const outFlag = process.argv.indexOf('--out')
if (outFlag === -1 || process.argv[outFlag + 1] === undefined) {
  console.error('--out <リポジトリ相対の出力先> が必要です')
  process.exit(1)
}
const OUT_FILE = join(REPO_ROOT, process.argv[outFlag + 1])

// ビルド済みの dist から読む。利用者が実際に受け取る API と一致させるため。
// src を直接 import すると相対パスの拡張子解決で Node が詰まる。
const CORE_DIST = join(REPO_ROOT, 'packages', 'core', 'dist', 'index.mjs')
const { NOVI_CONTRACTS, NOVI_COLORS, NOVI_RADII, NOVI_SIZES, NOVI_VARIANTS } = await import(
  CORE_DIST
)

// テーマの実装有無は dist の export で判定する。契約があるだけで使えると誤解させない（FR-06）。
const RASTER_DIST = join(REPO_ROOT, 'packages', 'raster', 'dist', 'index.mjs')
const rasterExports = new Set(Object.keys(await import(RASTER_DIST)))

// デザイン規則と数値トークンは定義元から読む。IR 側で書き写すと必ずズレる。
const RASTER_SCRIPTS = join(REPO_ROOT, 'packages', 'raster', 'scripts')
const { COLOR_RULE, DESIGN_RULES, DESIGN_RULE_EXCEPTIONS } = await import(
  join(RASTER_SCRIPTS, 'design-rules.data.mjs')
)
const { RASTER_CONTROL_HEIGHTS, RASTER_MOTION, RASTER_RADII, RASTER_TEXT } = await import(
  join(REPO_ROOT, 'packages', 'raster', 'src', 'tokens', 'raster-tokens.ts')
)

/** 契約名と Raster の export 名が食い違う箇所。ここ以外は同名で対応する。 */
const RASTER_EXPORT_ALIASES = { Textarea: 'TextArea', Toast: 'NoviToastRegion' }

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

/**
 * インターフェース直前の JSDoc を1回だけ読み、意味の単位に分解する。
 *
 * - `summary`   先頭の1行。一覧に出す
 * - `notes`     summary に続く散文。使うときの注意が書かれている
 * - `a11y`      `@a11y`。支援技術とキーボードの挙動
 * - `keywords`  `@keywords`。MCP の検索語
 * - `example`   `@example`
 */
function extractDoc(source, interfaceName) {
  const empty = { summary: '', notes: null, a11y: null, keywords: [], example: null }

  const start = source.indexOf(`export interface ${interfaceName} `)
  if (start === -1) return empty
  const docStart = source.lastIndexOf('/**', start)
  const docEnd = source.indexOf('*/', docStart)
  if (docStart === -1 || docEnd === -1) return empty

  const lines = source
    .slice(docStart + 3, docEnd)
    .split('\n')
    .map((line) => line.replace(/^\s*\*\s?/, '').trimEnd())

  const sections = { prose: [], a11y: [], keywords: [], example: [] }
  let current = 'prose'

  for (const line of lines) {
    const tag = /^@(\w+)\s?(.*)$/.exec(line)
    if (tag === null) {
      if (current !== 'other') sections[current].push(line)
      continue
    }
    // 知らないタグ以降は捨てる。@param などが例に混ざらないようにする
    current = tag[1] in sections ? tag[1] : 'other'
    if (current !== 'other') sections[current].push(tag[2])
  }

  const prose = sections.prose.join('\n').trim().split('\n')
  const rest = prose
    .slice(1)
    .filter((line) => line.trim() !== '')
    .join('\n')
    .trim()

  return {
    summary: prose[0]?.trim() ?? '',
    notes: rest === '' ? null : rest,
    // 1行に畳む。表や JSON に入れたときに壊れないため
    a11y: sections.a11y.join(' ').replace(/\s+/g, ' ').trim() || null,
    keywords: sections.keywords.join(' ').split(/\s+/).filter(Boolean),
    example: sections.example.join('\n').trim() || null,
  }
}

const contractFiles = readdirSync(CONTRACTS_DIR).filter((f) => f.endsWith('.contract.ts'))
const sources = new Map(contractFiles.map((f) => [f, readFileSync(join(CONTRACTS_DIR, f), 'utf8')]))

/** 契約名 → Props インターフェース名（Textarea だけ表記が揺れる）。 */
const propsInterfaceOf = (name) => `${name === 'Textarea' ? 'Textarea' : name}Props`

/** @param {readonly string[]} values */
const unionOf = (values) => values.map((v) => `'${v}'`).join(' | ')

const components = Object.entries(NOVI_CONTRACTS)
  .map(([name, contract]) => {
    const interfaceName = propsInterfaceOf(name)
    const source = [...sources.values()].find((s) =>
      s.includes(`export interface ${interfaceName} `),
    )
    if (source === undefined) {
      throw new Error(`${name}: ${interfaceName} が契約ファイルに見つかりません`)
    }

    const doc = extractDoc(source, interfaceName)
    const exportName = RASTER_EXPORT_ALIASES[name] ?? name

    return {
      name,
      summary: doc.summary,
      notes: doc.notes,
      a11y: doc.a11y,
      keywords: doc.keywords,
      // 契約があってもテーマが実装していなければ使えない。空配列は「未実装」を意味する
      implementedBy: rasterExports.has(exportName) ? ['raster'] : [],
      importName: exportName,
      props: extractProps(source, interfaceName),
      example: doc.example,
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
  // props の型名だけでは取りうる値が分からない。展開を1箇所で持ち、全出力先が引く
  tokenTypes: {
    NoviVariant: unionOf(NOVI_VARIANTS),
    NoviSize: unionOf(NOVI_SIZES),
    NoviColor: unionOf(NOVI_COLORS),
    NoviRadius: unionOf(NOVI_RADII),
  },
  themes: {
    raster: {
      pkg: '@novi-ui/raster',
      label: 'Raster',
      description: 'ミニマル / スイス系',
      // 検査スクリプトと同じ定義から作る。AI に説明した規則と CI が落とす規則を一致させる
      designRules: {
        numeric: {
          controlHeights: RASTER_CONTROL_HEIGHTS,
          radii: RASTER_RADII,
          text: RASTER_TEXT,
          motion: RASTER_MOTION,
        },
        prohibited: DESIGN_RULES.map((rule) => ({
          id: rule.id,
          pattern: rule.prohibited,
          reason: rule.message,
        })),
        exceptions: Object.entries(DESIGN_RULE_EXCEPTIONS).map(([file, { rules, reason }]) => ({
          file,
          rules,
          reason,
        })),
        colorRule: COLOR_RULE,
      },
    },
  },
  components,
}

// 欠損したまま配信すると、AI は「その情報は存在しない」ではなく「自分で埋める」を選ぶ。
// 古い生成物を配信するくらいならビルドを落とす（FR-09）
const errors = validateComponentIndex(index)
if (errors.length > 0) {
  console.error(`\n✗ component-index.json がスキーマに適合しません（${errors.length} 件）\n`)
  for (const error of errors) console.error(`  - ${error}`)
  console.error('')
  process.exit(1)
}

mkdirSync(dirname(OUT_FILE), { recursive: true })
writeFileSync(OUT_FILE, `${JSON.stringify(index, null, 2)}\n`, 'utf8')

const propCount = components.reduce((sum, c) => sum + c.props.length, 0)
console.log(
  `✓ ${process.argv[outFlag + 1]} を生成（${components.length} 契約 / ${propCount} props）`,
)
