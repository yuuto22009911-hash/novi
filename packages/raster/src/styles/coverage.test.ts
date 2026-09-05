import { NOVI_CONTRACTS, NOVI_MVP_COMPONENT_COUNT } from '@novi-ui/core'
import { describe, expect, it } from 'vitest'
import * as rasterNamespace from '../index'

// 公開 API を網羅的に検査するため、名前空間をプレーンなオブジェクトに写す。
// 動的アクセスの抑制コメントを検査箇所ごとに撒かずに済む
const raster: Record<string, unknown> = { ...rasterNamespace }

/**
 * テーマが MVP をすべて実装しているかを検査する（T-34 / T-37）。
 *
 * 「あとで作る」つもりで抜けたまま公開されるのを防ぐ。
 * 個々のコンポーネントのテストは各ファイルにあるが、
 * **網羅していること自体**はここでしか担保できない。
 */

/** 契約名 → 公開されているコンポーネント名。 */
const IMPLEMENTED: Record<string, string> = {
  Accordion: 'Accordion',
  Avatar: 'Avatar',
  Badge: 'Badge',
  Breadcrumbs: 'Breadcrumbs',
  Button: 'Button',
  Card: 'Card',
  Checkbox: 'Checkbox',
  CheckboxGroup: 'CheckboxGroup',
  ColorPicker: 'ColorPicker',
  ComboBox: 'ComboBox',
  Input: 'Input',
  Menu: 'Menu',
  Modal: 'Modal',
  NumberField: 'NumberField',
  Pagination: 'Pagination',
  Popover: 'Popover',
  Progress: 'Progress',
  Radio: 'Radio',
  RadioGroup: 'RadioGroup',
  Select: 'Select',
  Skeleton: 'Skeleton',
  Spinner: 'Spinner',
  Switch: 'Switch',
  Table: 'Table',
  Tabs: 'Tabs',
  Textarea: 'TextArea',
  Toast: 'NoviToastRegion',
  Tooltip: 'Tooltip',
}

describe('MVP の網羅（T-34）', () => {
  it('core の全契約に対応する実装がある', () => {
    const missing = Object.keys(NOVI_CONTRACTS).filter((name) => !(name in IMPLEMENTED))
    expect(missing, '契約はあるが実装がない').toEqual([])
  })

  it.each(Object.entries(IMPLEMENTED))('%s が公開されている', (_contract, exportName) => {
    expect(raster[exportName]).toBeDefined()
  })

  it('MVP のコンポーネント数 + 追加分と一致する', () => {
    // Checkbox/CheckboxGroup、Radio/RadioGroup、Progress/Spinner は対で1コンポーネント
    const paired = ['CheckboxGroup', 'RadioGroup', 'Spinner']
    // MVP を締めたあとに足したもの。MVP の数（20）は歴史的な値として動かさない
    const postMvp = ['ColorPicker', 'NumberField', 'ComboBox', 'Pagination', 'Table']
    expect(Object.keys(IMPLEMENTED).length - paired.length - postMvp.length).toBe(
      NOVI_MVP_COMPONENT_COUNT,
    )
  })
})

describe('スタイル定義の公開（T-37 / AC-06-2 / FR-04）', () => {
  const styleExports = Object.keys(raster).filter((name) => name.endsWith('Styles'))

  it('全コンポーネントぶんの tv() 定義が named export されている', () => {
    // 利用者が tv({ extend }) で拡張できることが npm 配布の前提（FR-04）
    expect(styleExports.length).toBeGreaterThanOrEqual(Object.keys(IMPLEMENTED).length - 3)
  })

  it.each(styleExports)('%s が関数として呼べる', (name) => {
    const styles = raster[name]
    expect(typeof styles).toBe('function')
    expect(typeof (styles as () => unknown)()).toBe('object')
  })
})

describe('色のトークン経由（AC-06-3 / FR-06）', () => {
  const styleExports = Object.keys(raster).filter((name) => name.endsWith('Styles'))

  it.each(styleExports)('%s がリテラルな色値を含まない', (name) => {
    const styles = raster[name] as () => Record<string, () => string>
    const all = Object.values(styles())
      .map((fn) => fn())
      .join(' ')
    expect(all).not.toMatch(/#[0-9a-f]{3,8}\b/i)
    expect(all).not.toMatch(/\b(rgb|rgba|hsl)\(/)
  })
})
