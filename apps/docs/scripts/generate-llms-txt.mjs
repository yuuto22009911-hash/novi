#!/usr/bin/env node
/**
 * AI エージェント向けのテキストを IR から生成する。
 *
 * 手書きしない。実装とズレたドキュメントは、人間には軽い不便だが
 * AI には致命的（誤った API を自信を持って生成する）。
 *
 * - `/llms.txt`      概要 + 必ず守る規約 + コンポーネント一覧
 * - `/llms-full.txt` 全 props / slot / 使用例
 */
import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const DOCS_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const IR = join(DOCS_ROOT, '.generated', 'component-index.json')
const OUT_DIR = join(DOCS_ROOT, 'public')

const SITE = 'https://novi-42r.pages.dev'

const index = JSON.parse(readFileSync(IR, 'utf8'))
const { components, vocabularies, themes } = index

const { designRules } = themes.raster

/** 禁止事項。CI が実際に落とす規則をそのまま出す（検査と説明を一致させる）。 */
const PROHIBITED = designRules.prohibited
  .map((rule) => `- \`${rule.pattern}\` — ${rule.reason}`)
  .join('\n')

/** 契約名 → docs のパス。Textarea だけ表記が揺れる。 */
const slugOf = (name) => (name === 'Textarea' ? 'textarea' : name.toLowerCase())

/**
 * 最初に読まれる部分に、最も間違えやすい規約を置く。
 * shadcn 流に慣れた LLM は `disabled` / `onClick` と書きがちなので、そこを先に潰す。
 */
const CONVENTIONS = `## 必ず守ること（他のライブラリと違う点）

- **Provider は不要**。import してそのまま使う。ラップしない
- **\`disabled\` ではなく \`isDisabled\`**、**\`onClick\` ではなく \`onPress\`** を使う（React Aria 準拠）
- **全コンポーネントは \`data-slot="<名前>"\` を出力する**。スタイルの上書きはこれを狙う
- variant は \`${vocabularies.variants.join(' | ')}\` の${vocabularies.variants.length}つのみ
- size は \`${vocabularies.sizes.join(' | ')}\`、color は \`${vocabularies.colors.join(' | ')}\`
- 色は \`--novi-color-*\` の CSS 変数を使う。リテラルの色値を書かない
- スタイルの拡張は \`tv({ extend, slots })\`。**\`base\` は slot 定義では効かない**
- variant のクラスを上書きしたいときは \`classNames={{ <slot>: '...' }}\` を使う`

function buildShort() {
  const list = components
    .map((c) => `- [${c.name}](${SITE}/docs/components/${slugOf(c.name)}/): ${c.summary}`)
    .join('\n')

  return `# Novi UI

> React Aria Components を基盤にした React UI ライブラリ。
> 1つの core に複数の美学（テーマ）を持ち、挙動とアクセシビリティは core が引き受ける。
> バージョン ${index.version}

${CONVENTIONS}

## インストール

\`\`\`bash
pnpm add @novi-ui/core @novi-ui/raster react-aria-components
\`\`\`

\`\`\`css
@import '@novi-ui/core/base.css';
@import '@novi-ui/raster/raster.css';
@source "../node_modules/@novi-ui/raster/dist";
\`\`\`

## テーマ

${Object.entries(themes)
  .map(([, t]) => `- \`${t.pkg}\`（${t.label}）: ${t.description}`)
  .join('\n')}

コンポーネントはテーマパッケージから import する。**テーマを替えても props は変わらない。**

## Raster で書いてはいけないクラス

CI が機械的に検査している。違反するとビルドが落ちる。

${PROHIBITED}

${designRules.colorRule}

## コンポーネント

${list}

一覧にないものは**未実装**。近いもので代用せず、react-aria-components を直接使う。

## Optional

- [llms-full.txt](${SITE}/llms-full.txt): 全 props / slot / 使用例
- [はじめに](${SITE}/docs/getting-started/): インストールと最小構成
`
}

function buildFull() {
  const sections = components.map((c) => {
    const props = c.props
      .map((p) => {
        // 型名のままでは取りうる値が分からないので語彙に展開する。
        // `|` はそのまま書くと Markdown の表を壊すため退避する
        const type = (index.tokenTypes[p.type] ?? p.type).replaceAll('|', '\\|')
        return `| \`${p.name}\` | \`${type}\` | ${p.required ? '必須' : '任意'} | ${p.doc || '-'} |`
      })
      .join('\n')

    const availability =
      c.implementedBy.length === 0
        ? '**未実装**。契約はあるがテーマが実装していない。使えない\n\n'
        : `**import**: \`import { ${c.importName} } from '${themes[c.implementedBy[0]].pkg}'\`\n\n`

    return `### ${c.name}

${c.summary}

${availability}${c.notes === null ? '' : `${c.notes}\n\n`}**slot**: ${c.slots.all.map((s) => `\`${s}\``).join(' ')}
**必須 slot**: ${c.slots.required.map((s) => `\`${s}\``).join(' ')}

| prop | 型 | | 説明 |
|---|---|---|---|
${props}

\`\`\`tsx
${c.example ?? ''}
\`\`\`

**アクセシビリティ**: ${c.a11y}
`
  })

  const numeric = Object.entries(designRules.numeric)
    .map(([group, values]) => `- \`${group}\`: ${JSON.stringify(values)}`)
    .join('\n')

  return `# Novi UI — 全 API

> バージョン ${index.version}
> このファイルは実装から自動生成されている。手書きの記述は含まれない。

${CONVENTIONS}

## Raster のデザイン規則

数値は定義そのもの。目分量で近い値を書かない。

${numeric}

### 書いてはいけないクラス

${PROHIBITED}

${designRules.colorRule}

## コンポーネント

${sections.join('\n---\n\n')}
`
}

mkdirSync(OUT_DIR, { recursive: true })

const short = buildShort()
const full = buildFull()

writeFileSync(join(OUT_DIR, 'llms.txt'), short, 'utf8')
writeFileSync(join(OUT_DIR, 'llms-full.txt'), full, 'utf8')

// 生成物が肥大化して文脈を圧迫していないか検査する。
// 上限を超えたら要約せず分割配信に切り替える（情報を削らない）
const LIMITS = { 'llms.txt': 20_000, 'llms-full.txt': 500_000 }
for (const [name, limit] of Object.entries(LIMITS)) {
  const size = statSync(join(OUT_DIR, name)).size
  if (size > limit) {
    throw new Error(`${name} が上限を超えました: ${size} B > ${limit} B`)
  }
  console.log(`✓ ${name} を生成（${size} B / 上限 ${limit} B）`)
}

// 冒頭の3規約が本当に入っているかを機械的に確かめる（FR-04）。
// ここが欠けると AI 向け出力としての価値がほぼ無くなる
for (const must of ['Provider は不要', 'isDisabled', 'onPress', 'data-slot']) {
  if (!short.includes(must)) throw new Error(`llms.txt に「${must}」が含まれていません`)
}
console.log('✓ 冒頭の規約（Provider 不要 / isDisabled / onPress / data-slot）を確認')
