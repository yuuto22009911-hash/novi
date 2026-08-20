/**
 * 同梱している IR がスキーマに適合しているかを検査する（T-07 / ADR-A1 の Risk 緩和）。
 *
 * 生成時にも同じ検証を通しているが、ここで見るのは**同梱物**。
 * コピーが古い・壊れている・生成し忘れている、を publish 前に捕まえる。
 *
 * 検証ロジックは `scripts/ir-schema.mjs` の1つだけ。出力先ごとに書くと片方が緩くなる。
 */
import { describe, expect, it } from 'vitest'
// @ts-expect-error 型定義を持たない検査スクリプトを共有している（依存を増やさないため）
import { validateComponentIndex } from '../../../scripts/ir-schema.mjs'
import type { ComponentEntry, DesignRules } from './index-data.js'
import { index } from './index-data.js'

const validate = validateComponentIndex as (value: unknown) => string[]

describe('同梱の component-index.json', () => {
  it('スキーマに適合している', () => {
    expect(validate(index)).toEqual([])
  })

  it('バージョンを持つ', () => {
    expect(index.version).toMatch(/^\d+\.\d+\.\d+/)
  })

  it('1件以上のコンポーネントを持つ', () => {
    expect(index.components.length).toBeGreaterThan(0)
  })

  it('全コンポーネントが実装済みテーマを持つ', () => {
    // 契約だけあるものが混ざっていたら、それは一覧に「未実装」として出る。
    // 現時点では全件が raster で実装されているはずで、そうでなければ生成が壊れている
    const orphans = index.components.filter((c) => c.implementedBy.length === 0)
    expect(orphans.map((c) => c.name)).toEqual([])
  })
})

describe('スキーマ検証そのものが機能している', () => {
  // 壊して落ちることを確かめていない検査は、通っていても意味がない
  const clone = () => structuredClone(index)

  /** 最初のコンポーネントだけを壊した IR を作る。 */
  const brokenComponent = (mutate: (component: ComponentEntry) => ComponentEntry) => {
    const copy = clone()
    copy.components = copy.components.map((c, i) => (i === 0 ? mutate(c) : c))
    return validate(copy)
  }

  /** raster のデザイン規則だけを壊した IR を作る。 */
  const brokenRules = (mutate: (rules: DesignRules) => DesignRules) => {
    const copy = clone()
    copy.themes = Object.fromEntries(
      Object.entries(copy.themes).map(([key, theme]) => [
        key,
        key === 'raster' ? { ...theme, designRules: mutate(theme.designRules) } : theme,
      ]),
    )
    return validate(copy)
  }

  it('a11y の欠落を検出する', () => {
    expect(brokenComponent((c) => ({ ...c, a11y: '' }))).not.toEqual([])
  })

  it('必須 slot が全 slot に無いことを検出する', () => {
    expect(brokenComponent((c) => ({ ...c, slots: { ...c.slots, all: [] } }))).not.toEqual([])
  })

  it('検索語の欠落を検出する', () => {
    expect(brokenComponent((c) => ({ ...c, keywords: [] }))).not.toEqual([])
  })

  it('禁止クラス一覧の欠落を検出する', () => {
    expect(brokenRules((rules) => ({ ...rules, prohibited: [] }))).not.toEqual([])
  })

  it('理由のないデザイン規則の例外を検出する', () => {
    expect(
      brokenRules((rules) => ({
        ...rules,
        exceptions: rules.exceptions.map((e, i) => (i === 0 ? { ...e, reason: '' } : e)),
      })),
    ).not.toEqual([])
  })
})
