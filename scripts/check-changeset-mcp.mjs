/**
 * core / テーマに changeset があるのに @novi-ui/mcp に無ければ落とす。
 *
 * MCP の同梱データは core の契約と各テーマの設計規則から生成される。
 * core が変わっても mcp は devDependency 経由でしか依存していないため
 * Changesets は mcp を自動で bump しない。実際に 0.1.2 が core 0.4.0 の
 * 余白トークン規約を含まないまま公開された。
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const DIR = join(import.meta.dirname, '..', '.changeset')
const SOURCES = new Set([
  '@novi-ui/core',
  '@novi-ui/raster',
  '@novi-ui/tactile',
  '@novi-ui/flatlay',
])
const MCP = '@novi-ui/mcp'

const files = readdirSync(DIR).filter((f) => f.endsWith('.md') && f !== 'README.md')

const touched = new Set()
for (const file of files) {
  const text = readFileSync(join(DIR, file), 'utf8')
  const frontmatter = text.split('---')[1] ?? ''
  for (const line of frontmatter.split('\n')) {
    const m = line.match(/^\s*['"]?(@novi-ui\/[a-z]+)['"]?\s*:/)
    if (m) touched.add(m[1])
  }
}

const sourceTouched = [...touched].filter((p) => SOURCES.has(p))
if (sourceTouched.length > 0 && !touched.has(MCP)) {
  console.error(
    `changeset が ${sourceTouched.join(', ')} を含むのに ${MCP} を含んでいない。\n` +
      'MCP の同梱データはこれらから生成されるため、同じ PR で mcp の changeset（patch で可）を足すこと。',
  )
  process.exit(1)
}
console.log(
  `check:changeset ok (${files.length} changeset, mcp ${touched.has(MCP) ? 'included' : 'not needed'})`,
)
