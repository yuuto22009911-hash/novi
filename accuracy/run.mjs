#!/usr/bin/env node
/**
 * AI 向け出力の精度を測る（T-27〜T-29 / AC-01-1 / AC-06-1）。
 *
 * 「AI が正しく書けるか」を主観で判断しない。**合否を機械的な2つだけに限定する。**
 *
 * - `tsc --noEmit` の型エラーが 0 件
 * - Raster の禁止クラスが 0 件
 *
 * 文章の一致は見ない。LLM は非決定的なので、表現の揺れを不合格にすると
 * 検査が安定せず、やがて誰も見なくなる。
 *
 * **CI では回さない（ADR-A5）。** LLM 呼び出しは従量課金で、運用費 0 円の前提を崩す。
 * このスクリプト自身は LLM を呼ばない。生成は既存の AI 環境で行い、
 * その出力をファイルとして受け取って検査する。手順は README.md にある。
 *
 * 型検査は apps/docs の下で行う。そこから見える `@novi-ui/raster` は
 * ビルド済みの dist で、**利用者が実際に受け取る型と同じもの**になる。
 */
import { execFileSync } from 'node:child_process'
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { basename, join } from 'node:path'
import { DESIGN_RULES as FLATLAY_RULES } from '../packages/flatlay/scripts/design-rules.data.mjs'
import { DESIGN_RULES as RASTER_RULES } from '../packages/raster/scripts/design-rules.data.mjs'
import { DESIGN_RULES as TACTILE_RULES } from '../packages/tactile/scripts/design-rules.data.mjs'

/**
 * テーマごとの禁止規則。**生成コードが import しているテーマの規則で検査する。**
 *
 * Raster の規則で Tactile のコードを見ると、押下の scale や面の影を
 * 違反として報告してしまう。逆も同じで、Raster のコードを Tactile の規則で
 * 見ると角丸 6px が違反になる。規則はテーマの美学そのもので、共通ではない。
 */
const RULES_BY_THEME = { raster: RASTER_RULES, tactile: TACTILE_RULES, flatlay: FLATLAY_RULES }

/**
 * 検査するテーマ（`--theme=flatlay`）。指定すると **import 先の一致も合否に入る**。
 *
 * テーマを指名して依頼したのに既定の Raster が返ってくるのは、型も規律も
 * 通ってしまうぶん最も気づきにくい失敗になる。テーマ指定は llms.txt の
 * 「## テーマ」節が読まれたかどうかの試験でもある。
 */
const EXPECTED_THEME = process.argv
  .find((arg) => arg.startsWith('--theme='))
  ?.slice('--theme='.length)

if (EXPECTED_THEME !== undefined && !(EXPECTED_THEME in RULES_BY_THEME)) {
  console.error(`✗ 知らないテーマ: ${EXPECTED_THEME}（${Object.keys(RULES_BY_THEME).join(' / ')}）`)
  process.exit(1)
}

const ROOT = new URL('..', import.meta.url).pathname
const HERE = join(ROOT, 'accuracy')
const GENERATED = join(HERE, 'generated')
const WORK = join(ROOT, 'apps', 'docs', '.accuracy')
const IR = join(ROOT, 'apps', 'docs', '.generated', 'component-index.json')

const { prompts } = JSON.parse(readFileSync(join(HERE, 'prompts.json'), 'utf8'))

// --- 1. 指示文が実装済みコンポーネントを網羅しているか ---------------------

if (!existsSync(IR)) {
  console.error('✗ component-index.json がありません。先に `pnpm build` を実行してください')
  process.exit(1)
}

const index = JSON.parse(readFileSync(IR, 'utf8'))
const covered = new Set(prompts.flatMap((p) => p.components))
const uncovered = index.components
  .filter((c) => c.implementedBy.length > 0 && !covered.has(c.name))
  .map((c) => c.name)

if (uncovered.length > 0) {
  console.error(`✗ 指示文の無い実装済みコンポーネント: ${uncovered.join(', ')}`)
  console.error('  accuracy/prompts.json に追加してください。')
  console.error('  検査していないものを「検査済み」と数えると、この試験は嘘になります。\n')
  process.exit(1)
}

// --- 2. 生成物を集める -----------------------------------------------------

mkdirSync(GENERATED, { recursive: true })
const files = readdirSync(GENERATED).filter((f) => f.endsWith('.tsx'))
const found = new Map(files.map((f) => [basename(f, '.tsx'), join(GENERATED, f)]))
const missing = prompts.filter((p) => !found.has(p.id)).map((p) => p.id)

if (found.size === 0) {
  console.error('✗ accuracy/generated/ に生成コードがありません。\n')
  console.error('  手順は accuracy/README.md を読んでください。要約すると:')
  console.error('  1. apps/docs/public/llms-full.txt を AI の文脈に与える')
  console.error('  2. accuracy/prompts.json の指示文を1つずつ渡してコードを書かせる')
  console.error('  3. 出力を accuracy/generated/<id>.tsx として保存する')
  console.error('  4. このスクリプトを再実行する\n')
  process.exit(1)
}

// --- 3. 型検査（T-27）------------------------------------------------------

rmSync(WORK, { recursive: true, force: true })
mkdirSync(WORK, { recursive: true })

for (const [id, path] of found) cpSync(path, join(WORK, `${id}.tsx`))

// 利用者が書くであろう設定に揃える。ここを緩めると、緩めた分だけ検査が甘くなる
writeFileSync(
  join(WORK, 'tsconfig.json'),
  `${JSON.stringify(
    {
      compilerOptions: {
        target: 'ES2022',
        lib: ['ES2022', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        moduleResolution: 'bundler',
        jsx: 'react-jsx',
        strict: true,
        noEmit: true,
        skipLibCheck: true,
        types: [],
      },
      include: ['*.tsx'],
    },
    null,
    2,
  )}\n`,
  'utf8',
)

/** @type {Map<string, string[]>} */
const typeErrors = new Map([...found.keys()].map((id) => [id, []]))

try {
  execFileSync(
    process.execPath,
    [
      join(ROOT, 'node_modules', 'typescript', 'bin', 'tsc'),
      '--noEmit',
      '--pretty',
      'false',
      '-p',
      join(WORK, 'tsconfig.json'),
    ],
    { encoding: 'utf8', stdio: 'pipe' },
  )
} catch (error) {
  const output = `${error.stdout ?? ''}${error.stderr ?? ''}`
  for (const line of output.split('\n')) {
    const match = /^(.+?)\((\d+),(\d+)\): error (TS\d+): (.+)$/.exec(line.trim())
    if (match === null) continue
    const id = basename(match[1], '.tsx')
    typeErrors.get(id)?.push(`${match[2]}:${match[3]} ${match[4]} ${match[5]}`)
  }
}

// --- 4. 禁止クラス検査（T-28 / AC-06-1）------------------------------------

/** @type {Map<string, string[]>} */
const classErrors = new Map([...found.keys()].map((id) => [id, []]))

for (const [id, path] of found) {
  const source = readFileSync(path, 'utf8')
  const lines = source.split('\n')
  // どのテーマを使ったコードかは import 文が決める。既定は raster
  const theme = /@novi-ui\/(\w+)/.exec(source)?.[1] ?? 'raster'

  if (EXPECTED_THEME !== undefined && theme !== EXPECTED_THEME) {
    classErrors
      .get(id)
      ?.push(`[theme] @novi-ui/${theme} を import している（指定は ${EXPECTED_THEME}）`)
  }

  // 規則は**実際に import したテーマ**のものを当てる。指定側の規則で見ると
  // 別テーマのコードに無関係な違反が並び、本当の失敗（import 先の取り違え）が埋もれる
  const rules = RULES_BY_THEME[theme] ?? RASTER_RULES
  for (const rule of rules) {
    lines.forEach((line, i) => {
      rule.pattern.lastIndex = 0
      const match = rule.pattern.exec(line)
      if (match === null) return
      classErrors.get(id)?.push(`${i + 1}行 [${rule.id}] "${match[0]}" — ${rule.message}`)
    })
  }
}

// --- 5. 報告（T-29: 合否は上の2つだけ）-------------------------------------

let failed = 0

for (const prompt of prompts) {
  if (!found.has(prompt.id)) continue
  const types = typeErrors.get(prompt.id) ?? []
  const classes = classErrors.get(prompt.id) ?? []
  const ok = types.length === 0 && classes.length === 0

  if (ok) {
    console.log(`✓ ${prompt.id}`)
    continue
  }

  failed++
  console.log(`✗ ${prompt.id}  型エラー ${types.length} 件 / 禁止クラス ${classes.length} 件`)
  for (const error of types) console.log(`    型   ${error}`)
  for (const error of classes) console.log(`    規律 ${error}`)
}

console.log('')
if (missing.length > 0) {
  console.log(`未生成: ${missing.join(', ')}（${missing.length}/${prompts.length} 件）`)
}
console.log(
  `検査: ${found.size} 件 / 合格 ${found.size - failed} 件 / 不合格 ${failed} 件` +
    (EXPECTED_THEME === undefined ? '' : `（テーマ指定: ${EXPECTED_THEME}）`),
)

if (failed > 0) {
  console.log('')
  console.log(
    '不合格があるときは、生成物を直すのではなく **llms.txt の規約セクションを補強**します。',
  )
  console.log('個別のコードを直しても、次に生成したときに同じ間違いが再現します。')
  console.log('手順は accuracy/README.md の「不合格だったとき」を読んでください。')
}

// 未生成があるうちは「全件合格」と言わせない
process.exit(failed > 0 || missing.length > 0 ? 1 : 0)
