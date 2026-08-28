/**
 * デザイン規律の走査ロジック（純関数）。
 *
 * ファイルシステムから切り離してあるのは、**変異テストのため**。
 * 「わざと `z-10` を書いたら落ちるか」を確かめるのに実ファイルを汚したくない。
 * 検査スクリプト（`check-design-rules.mjs`）と変異テスト（`design-rules.test.ts`）が
 * 同じ関数を呼ぶので、テストが通ったのに CI が別の判定をする、という食い違いが起きない。
 */
import {
  EXCEPTION_COMMENT_MARKER,
  DESIGN_RULE_EXCEPTIONS as EXCEPTIONS,
  DESIGN_RULES as RULES,
} from './design-rules.data.mjs'

/** コメント行は対象外。説明文に禁止語が出るのは正常。 */
const isComment = (line) => {
  const t = line.trim()
  return t.startsWith('*') || t.startsWith('//') || t.startsWith('/*')
}

/**
 * 1ファイルぶんの違反を返す。空配列なら合格。
 *
 * @param {string} fileName 例外の照合に使うファイル名（パスではなく basename）
 * @param {string} source ファイルの中身
 * @returns {{file: string, line: number, rule: string, found: string, message: string, text: string}[]}
 */
export function scanSource(fileName, source) {
  const exception = EXCEPTIONS[fileName]
  const lines = source.split('\n')
  const violations = []

  for (const rule of RULES) {
    if (exception?.rules.includes(rule.id)) continue

    lines.forEach((line, i) => {
      if (isComment(line)) return
      rule.pattern.lastIndex = 0
      const match = rule.pattern.exec(line)
      if (match === null) return
      violations.push({
        file: fileName,
        line: i + 1,
        rule: rule.id,
        found: match[0],
        message: rule.message,
        text: line.trim().slice(0, 90),
      })
    })
  }

  return violations
}

/**
 * 例外が認められているファイルに、理由のコメントが残っているかを見る。
 *
 * データ側の `reason` はこのファイルを開かない人には届かない。
 * 規律の外にいる理由は、書き換える人の目に入る場所に無ければ意味がない（FR-03）。
 *
 * @param {string} fileName @param {string} source
 * @returns {string | null} 問題があれば説明、無ければ null
 */
export function checkExceptionComment(fileName, source) {
  if (EXCEPTIONS[fileName] === undefined) return null
  const hasReason = source
    .split('\n')
    .some((line) => isComment(line) && line.includes(EXCEPTION_COMMENT_MARKER))
  if (hasReason) return null
  return `${fileName}: 規律の例外なのに理由のコメント（「${EXCEPTION_COMMENT_MARKER}」を含む行）が無い`
}
