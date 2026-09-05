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

/**
 * テーマの一覧。**3本目を足すときはここに1件書くだけ。**
 *
 * 実装有無は dist の export で判定する（契約があるだけで使えると誤解させない・FR-06）。
 * デザイン規則と数値トークンは定義元から読む。IR 側で書き写すと必ずズレる。
 */
const THEME_SOURCES = [
  {
    id: 'raster',
    label: 'Raster',
    description: 'ミニマル / スイス系',
    tokensModule: 'raster-tokens.ts',
    prefix: 'RASTER',
  },
  {
    id: 'tactile',
    label: 'Tactile',
    description: 'タッチファースト',
    tokensModule: 'tactile-tokens.ts',
    prefix: 'TACTILE',
  },
  {
    id: 'flatlay',
    label: 'Flatlay',
    description: '帳票・文具 / z 軸なし',
    tokensModule: 'flatlay-tokens.ts',
    prefix: 'FLATLAY',
  },
]

/** @param {(typeof THEME_SOURCES)[number]} source */
async function loadTheme(source) {
  const root = join(REPO_ROOT, 'packages', source.id)
  const exports = new Set(Object.keys(await import(join(root, 'dist', 'index.mjs'))))
  const scripts = join(root, 'scripts')
  const rules = await import(join(scripts, 'design-rules.data.mjs'))
  const tokens = await import(join(root, 'src', 'tokens', source.tokensModule))
  const data = await import(join(scripts, 'tokens.data.mjs'))
  return {
    ...source,
    exports,
    rules,
    numeric: {
      controlHeights: tokens[`${source.prefix}_CONTROL_HEIGHTS`],
      radii: tokens[`${source.prefix}_RADII`],
      text: tokens[`${source.prefix}_TEXT`],
      motion: tokens[`${source.prefix}_MOTION`],
    },
    tokenGroups: data.TOKEN_GROUPS,
    cssVariableName: data.cssVariableName,
    // カラーセット。tokens.data.mjs が color-set.ts の値を写しており、生成 CSS と同じ定義
    colorSet: data.COLOR_SET,
    tone: data[`${source.prefix}_TONE`],
    defaultColor: data.DEFAULT_COLOR_ID,
  }
}

const themes = await Promise.all(THEME_SOURCES.map(loadTheme))
/** 既定テーマ。使用例の検査と props 抽出はこれを基準にする。 */
const primary = themes[0]
const rasterExports = primary.exports

/**
 * 上書きできる CSS 変数の一覧。**CSS を出力しているのと同じ定義から作る。**
 *
 * ドキュメントに載る変数名と実際に出力される名前がズレると、
 * 利用者の上書きが黙って効かなくなる。原因も分からない。
 */
const cssVariablesOf = (groups, nameOf) =>
  groups.map((group) => ({
    id: group.id,
    label: group.label,
    description: group.description,
    variables: Object.entries(group.values).map(([name, value]) => ({
      name: nameOf(group.prefix, name),
      value,
      dark: group.dark?.[name] ?? null,
    })),
  }))

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
 * - `keyboard`  `@keyboard`。1 行に「キー: 動作」。対話しない部品には無い
 */
function extractDoc(source, interfaceName) {
  const empty = { summary: '', notes: null, a11y: null, keywords: [], example: null, keyboard: [] }

  const start = source.indexOf(`export interface ${interfaceName} `)
  if (start === -1) return empty
  const docStart = source.lastIndexOf('/**', start)
  const docEnd = source.indexOf('*/', docStart)
  if (docStart === -1 || docEnd === -1) return empty

  const lines = source
    .slice(docStart + 3, docEnd)
    .split('\n')
    .map((line) => line.replace(/^\s*\*\s?/, '').trimEnd())

  const sections = { prose: [], a11y: [], keywords: [], example: [], keyboard: [] }
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
    // 「キー: 動作」を分解する。区切りは最初のコロン（全角も可）
    keyboard: sections.keyboard
      .map((line) => line.trim())
      .filter((line) => line !== '')
      .map((line) => {
        const at = line.search(/[:：]/)
        if (at === -1) throw new Error(`@keyboard は「キー: 動作」の形で書いてください: ${line}`)
        return { keys: line.slice(0, at).trim(), action: line.slice(at + 1).trim() }
      }),
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
      implementedBy: themes.filter((t) => t.exports.has(exportName)).map((t) => t.id),
      importName: exportName,
      props: extractProps(source, interfaceName),
      example: doc.example,
      keyboard: doc.keyboard,
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
  themes: Object.fromEntries(
    themes.map((theme) => [
      theme.id,
      {
        pkg: `@novi-ui/${theme.id}`,
        label: theme.label,
        description: theme.description,
        cssVariables: cssVariablesOf(theme.tokenGroups, theme.cssVariableName),
        // 検査スクリプトと同じ定義から作る。AI に説明した規則と CI が落とす規則を一致させる
        designRules: {
          numeric: theme.numeric,
          prohibited: theme.rules.DESIGN_RULES.map((rule) => ({
            id: rule.id,
            pattern: rule.prohibited,
            reason: rule.message,
          })),
          exceptions: Object.entries(theme.rules.DESIGN_RULE_EXCEPTIONS).map(
            ([file, { rules, reason }]) => ({ file, rules, reason }),
          ),
          colorRule: theme.rules.COLOR_RULE,
        },
        // 色の語彙（FR-11）。名前・由来・相方まで IR に載せ、docs / llms / MCP が同じ定義を読む。
        // 実値は生成 CSS と同じ color-set.ts から来る（tokens.data.mjs 経由）
        defaultColor: theme.defaultColor,
        tone: theme.tone,
        colorSet: theme.colorSet.map(({ id, name, hue, pair, description, light, dark }) => ({
          id,
          name,
          hue,
          pair,
          description,
          light,
          dark,
        })),
      },
    ]),
  ),
  components,
}

/**
 * 使用例が実在する export だけを使っているか検査する。
 *
 * 例は AI が最も忠実に真似る部分で、間違っていると全員が同じ間違いをする。
 * 実際に Tabs の例が `<Tab>` / `<TabPanel>` を使っていた（実体は `TabItem` / `TabContent`）。
 * 型検査は例をコンパイルしないため、この間違いはテストが全部通ったまま publish された。
 */
for (const component of components) {
  const used = [
    // JSX の要素名
    ...(component.example?.matchAll(/<([A-Z][A-Za-z0-9]*)/g) ?? []),
    // createToastQueue のような生成関数
    ...(component.example?.matchAll(/\b(create[A-Z][A-Za-z0-9]*)\s*\(/g) ?? []),
  ].map((match) => match[1])

  for (const name of new Set(used)) {
    if (rasterExports.has(name)) continue
    throw new Error(
      `${component.name} の @example が存在しない export \`${name}\` を使っています。\n` +
        `  ${component.name} の契約ファイルの @example を実装に合わせてください。`,
    )
  }
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
