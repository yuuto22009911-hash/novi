/**
 * shadcn 互換のレジストリ（`public/r/*.json`）を生成する。
 *
 * Novi は npm で配るライブラリで、ソースをコピーさせない。それでもレジストリを持つのは、
 * v0 / Cursor / Claude Code などのエージェントが `npx shadcn add <url>` を導入の共通経路に
 * しているから。`registry:item` に `files` を持たせず、`dependencies`（npm）と `css`
 * （`@import` / `@source` の注入）だけを書けば、**ゼロ設定で Tailwind の @source まで揃う**。
 * 導入の最大の事故（@source の書き忘れで無スタイル）をここで潰す。
 *
 * バージョンは各パッケージの package.json から読む。手で書くと公開のたびに古くなる。
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const DOCS_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const REPO_ROOT = join(DOCS_ROOT, '..', '..')
const IR = join(DOCS_ROOT, '.generated', 'component-index.json')
const OUT_DIR = join(DOCS_ROOT, 'public', 'r')
const SITE = 'https://novi-42r.pages.dev'

const index = JSON.parse(readFileSync(IR, 'utf8'))
const versionOf = (dir) =>
  JSON.parse(readFileSync(join(REPO_ROOT, 'packages', dir, 'package.json'), 'utf8')).version
const racRange = JSON.parse(
  readFileSync(join(REPO_ROOT, 'packages', 'raster', 'package.json'), 'utf8'),
).peerDependencies['react-aria-components']

const coreVersion = versionOf('core')

const items = Object.entries(index.themes).map(([id, theme]) => {
  const dir = theme.pkg.replace('@novi-ui/', '')
  return {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    name: id,
    type: 'registry:item',
    title: `Novi UI — ${theme.label}`,
    description: `${theme.description}。@novi-ui/core と ${theme.pkg} を入れ、globals.css に @import と @source を足す。ソースはコピーしない`,
    dependencies: [
      `@novi-ui/core@^${coreVersion}`,
      `${theme.pkg}@^${versionOf(dir)}`,
      `react-aria-components@${racRange}`,
    ],
    css: {
      [`@import "@novi-ui/core/base.css"`]: {},
      [`@import "${theme.pkg}/${dir}.css"`]: {},
      // globals.css からの相対。src/app/globals.css なら ../../node_modules に直す
      [`@source "../node_modules/${theme.pkg}/dist"`]: {},
    },
    docs: [
      `Novi UI (${theme.label}) を入れました。`,
      `- \`@source\` のパスは globals.css からの相対です。globals.css が src/app/ にあるなら "../../node_modules/${theme.pkg}/dist" に直してください`,
      `- テーマ・配色・ダークは <html> の属性: data-novi-theme="${id}" data-novi-scheme="dark" data-novi-color="${theme.defaultColor}"`,
      `- Provider は要りません。import { Button } from '${theme.pkg}'`,
      `- 使い方: ${SITE}/docs/getting-started/ 、AI 向け: ${SITE}/llms.txt`,
    ].join('\n'),
    categories: ['novi-ui', 'design-system'],
    meta: { 'novi:theme': id, 'novi:defaultColor': theme.defaultColor },
  }
})

const registry = {
  $schema: 'https://ui.shadcn.com/schema/registry.json',
  name: 'novi-ui',
  homepage: SITE,
  items: items.map(({ name, type, title, description }) => ({ name, type, title, description })),
}

mkdirSync(OUT_DIR, { recursive: true })
writeFileSync(join(OUT_DIR, 'registry.json'), `${JSON.stringify(registry, null, 2)}\n`)
for (const item of items) {
  writeFileSync(join(OUT_DIR, `${item.name}.json`), `${JSON.stringify(item, null, 2)}\n`)
}
console.log(`✓ public/r/ にレジストリを生成（${items.map((i) => i.name).join(' / ')}）`)
