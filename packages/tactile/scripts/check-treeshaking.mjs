#!/usr/bin/env node
/**
 * tree-shaking が効いていることを検査する。**build の後に実行すること。**
 *
 * サイズの合計だけを見ていても気づけない種類の劣化がある。
 * 実際に 2026-08-20 の時点で、全コンポーネントを1ファイルにバンドルしていたため
 * `import { Button }` だけでパッケージ全体（21.7 KB）が取り込まれていた。
 * 合計サイズは微増にしか見えず、実際は全員が全部を背負っていた（ADR-R7）。
 *
 * ここでは **`dist/` から実際に取り込まれたバイト数**を直接測る。
 */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const PKG_ROOT = new URL('..', import.meta.url).pathname
const ENTRY = join(PKG_ROOT, 'dist', 'index.mjs')

/** 1コンポーネントだけ import したときに dist から取り込まれてよい上限。 */
const LIMIT_BYTES = 8_000

const work = mkdtempSync(join(tmpdir(), 'novi-treeshake-'))

try {
  const probe = join(work, 'probe.mjs')
  writeFileSync(probe, `import { Button } from ${JSON.stringify(ENTRY)}\nexport const x = Button\n`)

  const meta = join(work, 'meta.json')
  // `npx --yes esbuild@…` は都度ダウンロードを試み、複数パッケージが同時に走ると
  // npx のキャッシュ書き込みが競合して落ちる。devDependency の実体を直接叩く
  execFileSync(
    join(PKG_ROOT, 'node_modules', '.bin', 'esbuild'),
    [
      probe,
      '--bundle',
      '--minify',
      '--format=esm',
      '--external:react',
      '--external:react-dom',
      '--external:react-aria-components',
      `--outfile=${join(work, 'out.js')}`,
      `--metafile=${meta}`,
      '--log-level=error',
    ],
    { stdio: ['ignore', 'ignore', 'inherit'] },
  )

  const parsed = JSON.parse(readFileSync(meta, 'utf8'))
  const output = Object.values(parsed.outputs).find((o) => o.inputs)
  // node_modules の依存にも dist/ が含まれるため除外する。
  // ここで見たいのは「このパッケージ自身の dist から何バイト来たか」だけ。
  const fromDist = Object.entries(output?.inputs ?? {})
    .filter(([path]) => !path.includes('node_modules'))
    .filter(([path]) => path.includes('/dist/') || path.startsWith('dist/'))
    .reduce((sum, [, info]) => sum + info.bytesInOutput, 0)

  if (fromDist > LIMIT_BYTES) {
    console.error(
      `\n✗ tree-shaking が効いていません。` +
        `\n  Button だけを import したのに dist から ${fromDist} B 取り込まれました（上限 ${LIMIT_BYTES} B）。` +
        `\n  パッケージ全体が引きずられている可能性があります。` +
        `\n  tsdown の unbundle 設定と sideEffects: false を確認してください（ADR-R7）。\n`,
    )
    process.exit(1)
  }

  console.log(
    `✓ tree-shaking 有効（Button 単体で dist から ${fromDist} B / 上限 ${LIMIT_BYTES} B）`,
  )
} finally {
  rmSync(work, { recursive: true, force: true })
}
