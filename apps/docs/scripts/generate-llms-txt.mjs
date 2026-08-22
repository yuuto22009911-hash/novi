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

/**
 * カラーセットの色名。**テーマの定義そのものから読む。**
 * ここに書き写すと、色を足したとき AI への説明だけが古くなる。
 */
const COLOR_NAMES = Object.fromEntries(
  await Promise.all(
    ['raster', 'tactile'].map(async (id) => {
      const mod = await import(
        new URL(`../../../packages/${id}/src/tokens/color-set.ts`, import.meta.url).pathname
      )
      const set = mod.RASTER_COLOR_SET ?? mod.TACTILE_COLOR_SET
      return [id, set.map((c) => c.id)]
    }),
  ),
)
const { components, vocabularies, themes } = index

/**
 * 禁止事項。CI が実際に落とす規則をそのまま出す（検査と説明を一致させる）。
 *
 * **テーマごとに規則が違う。** Raster は影と scale を禁じ、Tactile は影を許して
 * scale を押下に限る。1つのテーマの規則だけを出すと、AI は別のテーマで
 * CI が落とすコードを自信を持って書く。
 */
const prohibitedOf = (theme) =>
  theme.designRules.prohibited.map((rule) => `- \`${rule.pattern}\` — ${rule.reason}`).join('\n')

/** テーマごとの規則節。 */
const RULES_BY_THEME = Object.entries(themes)
  .map(
    ([, theme]) => `### ${theme.label}（\`${theme.pkg}\`）

${prohibitedOf(theme)}

${theme.designRules.colorRule}`,
  )
  .join('\n\n')

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
テーマは見た目だけでなく DOM の組み立て方も替える（Tactile の Modal は下から出るシートになる）。

## 色を選ぶ

各テーマは8色のカラーセットを持ち、\`data-novi-color\` 属性で切り替える。
**色名はテーマごとに違う。** 知らない名前を書いても壊れず、そのテーマの既定色になる。

\`\`\`html
<html data-novi-theme="tactile" data-novi-color="madder">
\`\`\`

${Object.entries(themes)
  .map(([id, t]) => {
    const names = (COLOR_NAMES[id] ?? []).join(' / ')
    return `- **${t.label}**: ${names}`
  })
  .join('\n')}

\`success\` / \`warning\` / \`danger\` は色選択の影響を受けない。

## 書いてはいけないクラス

CI が機械的に検査している。違反するとビルドが落ちる。
**規則はテーマごとに違う。** 使っているテーマの節を読むこと。

${RULES_BY_THEME}

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

    // 実装しているテーマをすべて挙げる。1つだけ出すと、AI はそのテーマしか
    // 使えないと解釈して、指示されたテーマを無視したコードを書く
    const availability =
      c.implementedBy.length === 0
        ? '**未実装**。契約はあるがテーマが実装していない。使えない\n\n'
        : `**import**: ${c.implementedBy
            .map((t) => `\`import { ${c.importName} } from '${themes[t].pkg}'\``)
            .join(' / ')}\n\n`

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

  const numericByTheme = Object.entries(themes)
    .map(
      ([, theme]) => `### ${theme.label}

${Object.entries(theme.designRules.numeric)
  .map(([group, values]) => `- \`${group}\`: ${JSON.stringify(values)}`)
  .join('\n')}`,
    )
    .join('\n\n')

  return `# Novi UI — 全 API

> バージョン ${index.version}
> このファイルは実装から自動生成されている。手書きの記述は含まれない。

${CONVENTIONS}

## デザイン規則

数値は定義そのもの。目分量で近い値を書かない。
**テーマごとに違う値を持つ。** 同じ \`size="md"\` でも高さが違う。

${numericByTheme}

## 書いてはいけないクラス

${RULES_BY_THEME}

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
