import { describe, expect, it } from 'vitest'
import * as clientEntry from './client'
import * as mainEntry from './index'
import * as testingEntry from './testing'

/**
 * 公開 API の変化を検知する。
 *
 * 意図しない export の追加・削除・改名は、利用者にとって破壊的変更になる。
 * また AI は公開 API 一覧を頼りにコードを書くため、
 * 気づかないうちに増えた export はそのまま誤用の入口になる。
 */

const names = (mod: object) => Object.keys(mod).sort()

describe('メインエントリ', () => {
  it('公開 API 一覧', () => {
    expect(names(mainEntry)).toMatchInlineSnapshot(`
      [
        "NOVI_COLORS",
        "NOVI_CONTRACTS",
        "NOVI_MVP_COMPONENT_COUNT",
        "NOVI_RADII",
        "NOVI_SIZES",
        "NOVI_VARIANTS",
        "accordionRequiredSlots",
        "accordionSlots",
        "avatarRequiredSlots",
        "avatarSlots",
        "badgeRequiredSlots",
        "badgeSlots",
        "breadcrumbsRequiredSlots",
        "breadcrumbsSlots",
        "buttonRequiredSlots",
        "buttonSlots",
        "cardRequiredSlots",
        "cardSlots",
        "checkboxGroupRequiredSlots",
        "checkboxGroupSlots",
        "checkboxRequiredSlots",
        "checkboxSlots",
        "colorPickerRequiredSlots",
        "colorPickerSlots",
        "inputRequiredSlots",
        "inputSlots",
        "menuRequiredSlots",
        "menuSlots",
        "modalRequiredSlots",
        "modalSlots",
        "popoverRequiredSlots",
        "popoverSlots",
        "progressRequiredSlots",
        "progressSlots",
        "radioGroupRequiredSlots",
        "radioGroupSlots",
        "radioRequiredSlots",
        "radioSlots",
        "selectRequiredSlots",
        "selectSlots",
        "skeletonRequiredSlots",
        "skeletonSlots",
        "spinnerRequiredSlots",
        "spinnerSlots",
        "switchRequiredSlots",
        "switchSlots",
        "tabsRequiredSlots",
        "tabsSlots",
        "textareaRequiredSlots",
        "textareaSlots",
        "toastRequiredSlots",
        "toastSlots",
        "tooltipRequiredSlots",
        "tooltipSlots",
      ]
    `)
  })

  it('Provider を export しない（FR-14 / AC-05-2）', () => {
    const providers = names(mainEntry).filter((n) => /Provider$/.test(n))
    expect(providers).toEqual([])
  })

  it('React コンポーネントを export しない（RSC 安全性を保つため）', () => {
    // メインエントリの値はすべて配列かオブジェクト。関数（＝コンポーネント）は無い
    const functions = Object.entries(mainEntry)
      .filter(([, v]) => typeof v === 'function')
      .map(([k]) => k)
    expect(functions).toEqual([])
  })
})

describe('client エントリ', () => {
  it('公開 API 一覧', () => {
    expect(names(clientEntry)).toMatchInlineSnapshot(`
      [
        "Toast",
        "ToastContent",
        "ToastList",
        "ToastQueue",
        "ToastRegion",
        "ToastStateContext",
        "useImeSafeKeys",
      ]
    `)
  })

  it('UNSTABLE_ 接頭辞のまま露出していない（AC-04-1）', () => {
    const leaked = names(clientEntry).filter((n) => n.startsWith('UNSTABLE_'))
    expect(leaked).toEqual([])
  })

  it('Provider を export しない（FR-14）', () => {
    expect(names(clientEntry).filter((n) => /Provider$/.test(n))).toEqual([])
  })
})

describe('testing エントリ', () => {
  it('公開 API 一覧', () => {
    expect(names(testingEntry)).toMatchInlineSnapshot(`
      [
        "checkSlotContract",
        "chromaOf",
        "contrastRatio",
        "formatSlotContractFailure",
        "parseOklch",
        "relativeLuminance",
        "testSlotContract",
      ]
    `)
  })
})
