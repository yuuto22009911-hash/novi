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

/**
 * カラーセットの色名。**IR から読む。**
 *
 * かつてテーマ名を配列で持ち、色定義のモジュールを直接 import していた。
 * 3本目を足したとき配列に入れ忘れ、AI への説明だけが
 * 「Flatlay: （空）」になっていた。IR は登録した時点で全テーマぶん揃う。
 */
const COLOR_NAMES = Object.fromEntries(
  Object.entries(themes).map(([id, t]) => [id, (t.colorSet ?? []).map((c) => c.id)]),
)

/**
 * 色名の一覧。**short / full の両方に出す。**
 *
 * full だけに欠けていると、full しか渡されない AI は色 id を意味から推測して書く
 * （「青焼き図面の青」→ `blueprint`）。当たっても外れても、それは検査ではなく運になる。
 */
const COLOR_SETS = Object.entries(themes)
  .map(([id, t]) => `- **${t.label}**: ${(COLOR_NAMES[id] ?? []).join(' / ')}`)
  .join('\n')

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
- **余白も \`p-4\` / \`gap-4\` ではなくトークンで書く**。面の内側は \`--novi-pad-surface-x\` / \`--novi-pad-surface-y\`、コントロールの左右は \`--novi-pad-control-x-{sm,md,lg}\`、要素間は \`--novi-gap-{inline,stack,section}\`
- 見出しは \`--novi-font-heading\` / \`--novi-tracking-tight\` / \`--novi-leading-heading\`、本文は \`--novi-leading-body\`。数字は \`--novi-font-numeric\`
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

**前提: React 19 / Tailwind CSS v4（必須）。** テーマの CSS はトークン定義だけで、コンポーネントのクラスは利用側の Tailwind が \`@source\` で生成する。\`@source\` を書き忘れると無スタイルで描画される。

\`\`\`bash
pnpm add @novi-ui/core @novi-ui/raster react-aria-components
\`\`\`

\`\`\`css
/* app/globals.css */
@import "tailwindcss";
@import "@novi-ui/core/base.css";
@import "@novi-ui/raster/raster.css";
/* パスはこの CSS ファイルからの相対 */
@source "../node_modules/@novi-ui/raster/dist";
\`\`\`

ダークは \`<html data-novi-scheme="dark">\`（省略で OS 追従）。

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

${COLOR_SETS}

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
- [llms-en.txt](${SITE}/llms-en.txt): English summary
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

### カラーセット

\`data-novi-color\` に渡せる色名。**テーマごとに違う。**
知らない名前を書いても壊れず、そのテーマの既定色になる（＝間違いに気づけない）。

${COLOR_SETS}

\`success\` / \`warning\` / \`danger\` は色選択の影響を受けない。

## 書いてはいけないクラス

${RULES_BY_THEME}

## コンポーネント

${sections.join('\n---\n\n')}
`
}

mkdirSync(OUT_DIR, { recursive: true })

/**
 * 英語版の短い版。**日本語版と同じ IR から作る。**
 *
 * 日本語の `llms.txt` は accuracy 検査の入力なので触らない。英語で指示された
 * エージェントに日本語の規約を渡すと、規約そのものが読まれない事故が起きるので、
 * 機械検査できる部分（規約・導入手順・語彙・色 id・禁止パターン・部品名）だけを
 * 英語で並行して出す。理由の文（`reason`）は日本語のままなので出さず、
 * 参照先として日本語版を案内する。
 */
const THEME_EN = {
  raster: {
    aesthetic: 'minimal / Swiss grid',
    structure: 'Modal floats in the centre over a dimmed backdrop; close is an ✕ at the top right',
  },
  tactile: {
    aesthetic: 'touch-first, larger surfaces',
    structure: 'Modal rises from the bottom as a sheet; close is full-width in the footer',
  },
  flatlay: {
    aesthetic: 'no z-axis, paper and ruled lines',
    structure:
      'Nothing floats. Modal replaces the page as a full takeover; close is “← back” at the top left. Select and Menu expand in flow and push the page down',
  },
}

function englishThemeOf(id) {
  const en = THEME_EN[id]
  // テーマを足したら英語の説明も足す。抜けたまま公開すると、
  // 英語圏のエージェントにだけ存在しないテーマになる（色名で実際に起きた事故と同型）
  if (en === undefined) throw new Error(`THEME_EN に ${id} がありません（generate-llms-txt.mjs）`)
  return en
}

function buildEnglish() {
  const themeList = Object.entries(themes)
    .map(
      ([id, t]) =>
        `- \`${t.pkg}\` (${t.label}) — ${englishThemeOf(id).aesthetic}. ${englishThemeOf(id).structure}`,
    )
    .join('\n')

  const colours = Object.entries(themes)
    .map(([id, t]) => `- **${t.label}**: ${(COLOR_NAMES[id] ?? []).join(' / ')}`)
    .join('\n')

  const prohibited = Object.entries(themes)
    .map(
      ([, t]) =>
        `### ${t.label} (\`${t.pkg}\`)\n\n` +
        t.designRules.prohibited.map((rule) => `- \`${rule.pattern}\``).join('\n'),
    )
    .join('\n\n')

  const list = components
    .map((c) => `- [${c.name}](${SITE}/docs/components/${slugOf(c.name)}/)`)
    .join('\n')

  return `# Novi UI (English summary)

> A React component library built on React Aria Components.
> One core holds behaviour and accessibility; several themes hold structure and style.
> Version ${index.version}
>
> The full documentation, per-component props and rationale are in Japanese:
> [llms.txt](${SITE}/llms.txt) and [llms-full.txt](${SITE}/llms-full.txt).

## Rules you must follow (these differ from other libraries)

- **No provider.** Import and use. Do not wrap the tree
- **\`isDisabled\`, not \`disabled\`. \`onPress\`, not \`onClick\`** (React Aria conventions)
- **Every component emits \`data-slot="<name>"\`.** Target these to override styles
- variant is one of \`${vocabularies.variants.join(' | ')}\`
- size is \`${vocabularies.sizes.join(' | ')}\`, color is \`${vocabularies.colors.join(' | ')}\`
- Use the \`--novi-color-*\` custom properties. Never write literal colour values
- **Spacing is a token too, not \`p-4\` / \`gap-4\`.** Inside a surface use \`--novi-pad-surface-x\` / \`--novi-pad-surface-y\`; horizontal padding of a control uses \`--novi-pad-control-x-{sm,md,lg}\`; between elements use \`--novi-gap-{inline,stack,section}\`
- Headings use \`--novi-font-heading\` / \`--novi-tracking-tight\` / \`--novi-leading-heading\`; body text uses \`--novi-leading-body\`; figures use \`--novi-font-numeric\`
- Extend styles with \`tv({ extend, slots })\`. **\`base\` has no effect on a slot definition**
- To override the classes of a variant, use \`classNames={{ <slot>: '...' }}\`

## Install

**Requires React 19 and Tailwind CSS v4.** A theme's CSS ships token definitions only; the
component classes are generated by the consuming project's Tailwind through \`@source\`.
Omit \`@source\` and everything renders unstyled.

\`\`\`bash
pnpm add @novi-ui/core @novi-ui/raster react-aria-components
\`\`\`

\`\`\`css
/* app/globals.css */
@import "tailwindcss";
@import "@novi-ui/core/base.css";
@import "@novi-ui/raster/raster.css";
/* path is relative to this CSS file */
@source "../node_modules/@novi-ui/raster/dist";
\`\`\`

Dark mode is \`<html data-novi-scheme="dark">\`; omit it to follow the OS setting.

## Themes

${themeList}

Import components from the theme package. **Props never change when you change theme.**
A theme changes how the DOM is assembled, not only how it looks.

## Colourways

Each theme owns a set of 8 colours, selected with the \`data-novi-color\` attribute.
**The names differ per theme.** An unknown name does not break anything; it falls back to
that theme's default colour.

\`\`\`html
<html data-novi-theme="tactile" data-novi-color="madder">
\`\`\`

${colours}

\`success\` / \`warning\` / \`danger\` are unaffected by the colourway.

## Classes you must not write

CI checks these mechanically; a violation fails the build.
**The rules differ per theme.** The rationale for each is in the Japanese
[llms.txt](${SITE}/llms.txt).

${prohibited}

## Components

${list}

Anything not listed is **not implemented**. Do not substitute something similar — use
react-aria-components directly, and note that it ships no styles.

## Optional

- [llms-full.txt](${SITE}/llms-full.txt): every prop, slot and example (Japanese)
- [Getting started](${SITE}/docs/getting-started/) (Japanese)
`
}

const short = buildShort()
const full = buildFull()
const english = buildEnglish()

writeFileSync(join(OUT_DIR, 'llms.txt'), short, 'utf8')
writeFileSync(join(OUT_DIR, 'llms-full.txt'), full, 'utf8')
writeFileSync(join(OUT_DIR, 'llms-en.txt'), english, 'utf8')

// 生成物が肥大化して文脈を圧迫していないか検査する。
// 上限を超えたら要約せず分割配信に切り替える（情報を削らない）
const LIMITS = { 'llms.txt': 20_000, 'llms-full.txt': 500_000, 'llms-en.txt': 20_000 }
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
