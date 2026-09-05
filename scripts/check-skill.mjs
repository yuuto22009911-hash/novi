/**
 * コミットされた `skills/novi-ui/` が IR から生成した内容と一致するか検査する。
 *
 * Skill は GitHub から直接取り込まれるので、生成物をリポジトリに置くしかない。
 * 置いた瞬間から「手で直したくなる」「生成し忘れて古くなる」の2つが起きる。
 * どちらも、AI が古い規約で自信を持ってコードを書く事故になるので、ここで落とす。
 */
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SKILL = join(ROOT, 'skills', 'novi-ui', 'SKILL.md')
const REFS = join(ROOT, 'skills', 'novi-ui', 'references', 'components.md')

const before = { skill: readFileSync(SKILL, 'utf8'), refs: readFileSync(REFS, 'utf8') }

// 生成器はファイルへ書く。差分を見たいだけなので、書かせてから戻す
execFileSync(process.execPath, [join(ROOT, 'apps', 'docs', 'scripts', 'generate-skill.mjs')], {
  stdio: 'ignore',
})
const after = { skill: readFileSync(SKILL, 'utf8'), refs: readFileSync(REFS, 'utf8') }

const stale = []
if (before.skill !== after.skill) stale.push('skills/novi-ui/SKILL.md')
if (before.refs !== after.refs) stale.push('skills/novi-ui/references/components.md')

if (stale.length > 0) {
  console.error(
    `Skill が古くなっています: ${stale.join(', ')}\n` +
      '  `pnpm generate:skill` を実行して、生成物をコミットしてください。手で直さないでください。',
  )
  process.exit(1)
}
console.log('check:skill ok（skills/novi-ui は IR と一致）')
