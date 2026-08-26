import { describe, expect, it } from 'vitest'
import {
  DESIGN_RULE_EXCEPTIONS,
  DESIGN_RULES,
  EXCEPTION_COMMENT_MARKER,
} from '../../scripts/design-rules.data.mjs'
import { checkExceptionComment, scanSource } from '../../scripts/scan-design-rules.mjs'

/**
 * デザイン規律の検査そのものを検査する（T-04）。**変異テスト。**
 *
 * 「z 軸を持たない」は 1箇所でも漏れたら原理が崩れるのに、見た目にはほとんど
 * 何も起きない。だから機械で縛るのだが、**その機械が壊れていても同じく何も起きない**。
 * 正常なソースを通すだけの検査は、正規表現を空にしても緑のままになる。
 * そこで「わざと違反を書いたら落ちるか」を毎回確かめる。
 *
 * CI（`check-design-rules.mjs`）とここは同じ `scanSource` を呼ぶので、
 * テストは通ったのに CI は別判定、という食い違いが起きない。
 */

/** 規律の対象外（例外を持たない）ファイル名。変異の置き場所として使う。 */
const PLAIN = 'badge.styles.ts'

const rulesHit = (source: string, file = PLAIN): string[] =>
  scanSource(file, source).map((v) => v.rule)

describe('変異: 違反を書くと落ちる', () => {
  it.each([
    ['z-index', "  base: 'z-10 border'", 'z-index'],
    ['任意値の z-index', "  base: 'z-[999]'", 'z-index'],
    ['JS の zIndex', '  style={{ zIndex: 1 }}', 'z-index'],
    ['fixed', "  base: 'fixed inset-0'", 'position'],
    ['absolute', "  base: 'absolute top-0'", 'position'],
    ['sticky', "  base: 'sticky top-0'", 'sticky'],
    ['高さの transition', "  base: 'transition-[height]'", 'expand-animation'],
    ['max-height の transition', "  base: 'transition-[max-height]'", 'expand-animation'],
    ['スライドの animation', "  base: 'animate-[novi-slide-in_100ms]'", 'expand-animation'],
    ['トークン外の影', "  base: 'shadow-md'", 'shadow-literal'],
    ['リテラルの影', "  base: 'shadow-[0_1px_2px_#0000001a]'", 'shadow-literal'],
    ['scale', "  pressed: 'scale-95'", 'transform'],
    ['translate', "  base: 'translate-y-1'", 'transform'],
    ['animate-spin', "  base: 'animate-spin'", 'transform'],
    ['トークン外の角丸', "  base: 'rounded-full'", 'radius'],
    ['方向つきのトークン外角丸', "  base: 'rounded-t-xl'", 'radius'],
    ['16進の色', "  base: 'text-[#ff0000]'", 'literal-color'],
    ['oklch のリテラル', "  base: 'bg-[oklch(50% 0.1 200)]'", 'literal-color'],
    ['トークン外の duration', "  base: 'duration-150'", 'duration'],
  ])('%s は %s に当たる', (_name, line, rule) => {
    expect(rulesHit(line)).toContain(rule)
  })

  it('違反行の行番号と該当文字列を返す（どこを直せばいいか分かる）', () => {
    const source = ["const a = 'p-2'", "const b = 'z-10'"].join('\n')
    const [v] = scanSource(PLAIN, source)
    expect(v).toMatchObject({ file: PLAIN, line: 2, rule: 'z-index', found: 'z-10' })
  })
})

describe('偽陽性を出さない', () => {
  it.each([
    ['トークン経由の角丸', "  base: 'rounded-[var(--novi-radius-md)]'"],
    ['方向つきのトークン角丸', "  base: 'rounded-t-[var(--novi-radius-lg)]'"],
    ['shadow-none（影を消す指定は規律そのもの）', "  base: 'shadow-none'"],
    ['トークン経由の shadow', "  base: 'shadow-[var(--novi-shadow-sm)]'"],
    ['トークン経由の duration', "  base: 'duration-[var(--novi-duration-fast)]'"],
    ['transform-none（インフロー再配置で使う）', "  base: 'transform-none!'"],
    ['scale-none', "  base: 'scale-none'"],
    ['色トークン', "  base: 'bg-[var(--novi-color-bg)]'"],
    ['z を含む単語（size / horizontal）', "  base: 'size-4 horizontal-thing'"],
    ['fixed を含む単語', '  const prefixedValue = 1'],
    ['sticky を含む単語', '  const stickyish = 1'],
    ['border 系の transition', "  base: 'transition-colors'"],
    ['幅の transition（押し下げではない）', "  base: 'transition-[width]'"],
  ])('%s は違反にしない', (_name, line) => {
    expect(rulesHit(line)).toEqual([])
  })

  it('コメント行の禁止語は無視する（説明文に z-index と書けないと困る）', () => {
    const source = [
      '/** Flatlay は z-index を持たない。fixed も sticky も使わない。 */',
      '// shadow-md や rounded-full も禁止。scale-95 も同様',
      ' * transition-[height] は付けない',
    ].join('\n')
    expect(rulesHit(source)).toEqual([])
  })
})

describe('例外', () => {
  it('例外ファイルでは当該ルールだけが免除され、他は生きている', () => {
    const source = ["  base: 'rounded-full z-10'"].join('\n')
    expect(rulesHit(source, 'flatlay-tokens.ts')).toEqual(['z-index'])
  })

  it('z-index には例外が1つも無い（FR-02）', () => {
    for (const [file, { rules }] of Object.entries(DESIGN_RULE_EXCEPTIONS)) {
      expect(rules, file).not.toContain('z-index')
    }
  })

  it('position の例外は Modal と Tooltip の2つで固定（NG1）', () => {
    const allowed = Object.entries(DESIGN_RULE_EXCEPTIONS)
      .filter(([, { rules }]) => rules.includes('position'))
      .map(([file]) => file)
      .sort()
    expect(allowed).toEqual(['modal.styles.ts', 'tooltip.styles.ts'])
  })

  it('例外はすべて実在するルール ID を指す（綴り間違いで黙って全免除にならない）', () => {
    const ids = new Set(DESIGN_RULES.map((r) => r.id))
    for (const [file, { rules }] of Object.entries(DESIGN_RULE_EXCEPTIONS)) {
      for (const id of rules) expect(ids, `${file}: ${id}`).toContain(id)
    }
  })

  it('例外にはすべて理由が書かれている', () => {
    for (const [file, { reason }] of Object.entries(DESIGN_RULE_EXCEPTIONS)) {
      expect(reason.length, file).toBeGreaterThan(20)
    }
  })
})

describe('例外ファイルの理由コメント（FR-03）', () => {
  const exceptionFile = Object.keys(DESIGN_RULE_EXCEPTIONS)[0] as string

  it('理由コメントが無いと指摘される', () => {
    expect(checkExceptionComment(exceptionFile, 'export const A = 1')).toContain(exceptionFile)
  })

  it('理由コメントがあれば通る', () => {
    const source = `/** ${EXCEPTION_COMMENT_MARKER}: トークンを定義する側だから */\nexport const A = 1`
    expect(checkExceptionComment(exceptionFile, source)).toBeNull()
  })

  it('コメントでない行に語があっても通さない（文字列に紛れた偶然を拾わない）', () => {
    const source = `export const A = '${EXCEPTION_COMMENT_MARKER}'`
    expect(checkExceptionComment(exceptionFile, source)).not.toBeNull()
  })

  it('例外でないファイルには何も要求しない', () => {
    expect(checkExceptionComment(PLAIN, 'export const A = 1')).toBeNull()
  })
})

describe('ルール定義そのもの', () => {
  it('ID が重複しない', () => {
    const ids = DESIGN_RULES.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('すべてのルールが人間向けの表記とメッセージを持つ（AI 向け IR がこれを読む）', () => {
    for (const rule of DESIGN_RULES) {
      expect(rule.prohibited.length, rule.id).toBeGreaterThan(0)
      expect(rule.message.length, rule.id).toBeGreaterThan(10)
    }
  })

  it('パターンが g フラグを持つ（lastIndex を消して使い回すため）', () => {
    for (const rule of DESIGN_RULES) expect(rule.pattern.global, rule.id).toBe(true)
  })

  it('同じソースを2度走査しても同じ結果になる（lastIndex の持ち越しが無い）', () => {
    const source = "  base: 'z-10 fixed sticky rounded-full'"
    expect(rulesHit(source)).toEqual(rulesHit(source))
  })
})
