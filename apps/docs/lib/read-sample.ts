import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * `samples/` の実ファイルをそのまま読む。**ページにコードを手書きしない。**
 *
 * `samples/` は `pnpm typecheck` の対象なので、ここに出るコードは
 * 必ずコンパイルが通っている。契約の `@example` が `<Tab>` という
 * 存在しない要素を使ったまま公開されていた事故と同じことを、docs 側で繰り返さない。
 *
 * 静的エクスポートのビルド時にだけ動く（実行時のファイル読み込みは起きない）。
 */
export function readSample(name: string): string {
  return readFileSync(join(process.cwd(), 'samples', `${name}.tsx`), 'utf8').trimEnd()
}
