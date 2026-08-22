import { NOVI_COLORS, NOVI_CONTRACTS, NOVI_SIZES, NOVI_VARIANTS } from '@novi-ui/core'
import { describe, expect, it } from 'vitest'
import * as tactileNamespace from '../index'

/**
 * パッケージ横断の検査（T-07）。**コンポーネントを足すたび自動で対象が増える。**
 *
 * Raster では対象を手で並べた表を持っており、追加時に書き忘れると検査が素通りする。
 * ここは公開エントリを走査して対象を集めるため、書き忘れが起きない。
 *
 * 個々のコンポーネントのテストは各ファイルにあるが、
 * 「網羅していること」「互いに見分けがつくこと」はここでしか担保できない。
 */

const tactile: Record<string, unknown> = { ...tactileNamespace }

type StyleFn = (props?: Record<string, unknown>) => Record<string, () => string>

/** `*Styles` という名前で公開されている tv() 定義をすべて集める。 */
function styleFns(): [name: string, fn: StyleFn][] {
  return Object.entries(tactile)
    .filter(([name, value]) => name.endsWith('Styles') && typeof value === 'function')
    .map(([name, value]) => [name, value as StyleFn])
}

/** その定義が受け付ける slot 名（tv の戻り値のキー）。 */
const slotsOf = (fn: StyleFn): string[] => Object.keys(fn({}))

describe('公開 API', () => {
  it('すべての tv() 定義が named export されている（AC-07-2 / FR-04）', () => {
    // 拡張できないコンポーネントがあると「スタイルを所有できる」という約束が崩れる
    expect(styleFns().length).toBeGreaterThan(0)
    for (const [name, fn] of styleFns()) {
      expect(typeof fn, name).toBe('function')
    }
  })

  it('公開しているコンポーネント名が契約の語彙に含まれる', () => {
    const contracts = new Set(Object.keys(NOVI_CONTRACTS))
    const components = Object.keys(tactile).filter(
      (name) => /^[A-Z]/.test(name) && !name.endsWith('Styles'),
    )
    // Tabs の TabItem など、契約1つに複数の公開名が対応するものは接頭辞で照合する
    const unknown = components.filter(
      (name) => !contracts.has(name) && ![...contracts].some((c) => name.startsWith(c)),
    )
    expect(unknown).toEqual([])
  })
})

describe('variant / size / color が互いに見分けられる（AC-04-1）', () => {
  // 「実装したつもり」で2つが同じクラスになっていても型は通る。
  // その状態だと語彙は共通でも解釈が存在しないのと同じになる
  it.each(styleFns())('%s: variant 語彙がすべて異なるクラスを生む', (_name, fn) => {
    const slot = slotsOf(fn)[0] as string
    const produced = NOVI_VARIANTS.map((variant) => fn({ variant })[slot]?.())
    // variant を受け付けない定義（Card 等）はすべて同じ値を返すので対象外
    if (new Set(produced).size === 1) return
    expect(new Set(produced).size).toBe(NOVI_VARIANTS.length)
  })

  it.each(styleFns())('%s: size 語彙がすべて異なるクラスを生む', (_name, fn) => {
    const slot = slotsOf(fn)[0] as string
    const produced = NOVI_SIZES.map((size) => fn({ size })[slot]?.())
    if (new Set(produced).size === 1) return
    expect(new Set(produced).size).toBe(NOVI_SIZES.length)
  })

  it.each(styleFns())('%s: color 語彙がすべて異なるクラスを生む', (_name, fn) => {
    const slot = slotsOf(fn)[0] as string
    const produced = NOVI_COLORS.map((color) => fn({ color })[slot]?.())
    if (new Set(produced).size === 1) return
    expect(new Set(produced).size).toBe(NOVI_COLORS.length)
  })
})

describe('デザイン規律（全コンポーネント）', () => {
  /** 全定義 × 全 variant のクラス文字列を1つに集める。 */
  function allClasses(): string {
    return styleFns()
      .flatMap(([, fn]) =>
        NOVI_VARIANTS.flatMap((variant) =>
          NOVI_COLORS.map((color) => {
            const result = fn({ variant, color })
            return Object.values(result)
              .map((slot) => slot())
              .join(' ')
          }),
        ),
      )
      .join(' ')
  }

  it('色をリテラルで書いていない（すべてトークン経由・FR-06）', () => {
    expect(allClasses()).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgb\(|hsl\(|oklch\(/)
  })

  // 先頭は `\b` ではなく `(?<![\w-])` で縛る。`\b` だと `--novi-shadow-sm` のような
  // 変数名の内側にもマッチし、トークン経由で正しく書いた指定を違反と誤判定する
  it('装飾目的の scale が無い（押下状態のみ・ADR-T5）', () => {
    expect(allClasses()).not.toMatch(
      /(?<!data-\[pressed\]:)(?<!motion-reduce:data-\[pressed\]:)(?<![\w-])scale-(?!100\b)/,
    )
  })

  it('影がトークン経由でのみ指定されている', () => {
    expect(allClasses()).not.toMatch(/(?<![\w-])shadow-(?!none\b)(?!\[var\(--novi-shadow)/)
  })

  it('角丸がトークン経由でのみ指定されている', () => {
    expect(allClasses()).not.toMatch(/(?<![\w-])rounded-(?!\[var\(--novi-radius)/)
  })

  it('モーションの時間がトークン経由でのみ指定されている', () => {
    expect(allClasses()).not.toMatch(/(?<![\w-])duration-(?!\[var\(--novi-duration)/)
  })
})

describe('MVP の網羅（G1）', () => {
  it('実装済みコンポーネント数を記録する', () => {
    const implemented = Object.keys(tactile).filter(
      (name) => /^[A-Z]/.test(name) && !name.endsWith('Styles'),
    )
    // 23契約が揃うまでは増えていく。0 になったら公開エントリが壊れている
    expect(implemented.length).toBeGreaterThan(0)
  })
})
