import { describe, expect, it } from 'vitest'
import { NOVI_CONTRACTS, NOVI_MVP_COMPONENT_COUNT, type NoviContract } from './registry'

/**
 * 設計書 architecture.md §6 の slot 語彙表と、この実装が一致していることを守るテスト。
 * 表と実装がズレると、ドキュメント・契約テスト・AI 向け出力がすべて嘘になる。
 */

// 各契約はリテラル型の tuple なので、union のまま扱うと slots.includes() が never を要求する。
// 共通型で受けて string の集合として検査する。
const contracts = Object.entries(NOVI_CONTRACTS) as [string, NoviContract][]

/** 契約をまたいで対になっており、1コンポーネントとして数えるもの。 */
const PAIRED_CONTRACTS = ['CheckboxGroup', 'RadioGroup', 'Spinner']

/**
 * MVP を締めたあとに足した契約。
 *
 * **MVP の数（20）は歴史的な値として動かさない。** ここに列挙する形にしておくと、
 * 契約が増えたことに気づかず通る、という抜け方をしない。
 */
const POST_MVP_CONTRACTS = [
  'ColorPicker',
  'NumberField',
  'ComboBox',
  'Pagination',
  'Table',
  'DatePicker',
]

describe('slot 契約レジストリ', () => {
  it('MVP 20 コンポーネント + 追加分の契約がある', () => {
    expect(contracts.length - PAIRED_CONTRACTS.length - POST_MVP_CONTRACTS.length).toBe(
      NOVI_MVP_COMPONENT_COUNT,
    )
  })

  it.each(contracts)('%s: 必須 slot は語彙の部分集合である', (_name, contract) => {
    const missing = contract.required.filter((slot) => !contract.slots.includes(slot))
    expect(missing).toEqual([])
  })

  it.each(contracts)('%s: slot 名に重複がない', (_name, contract) => {
    expect(new Set(contract.slots).size).toBe(contract.slots.length)
  })

  it.each(contracts)('%s: 必須 slot が1つ以上ある', (_name, contract) => {
    expect(contract.required.length).toBeGreaterThan(0)
  })

  it.each(contracts)('%s: slot 名は lowerCamelCase である', (_name, contract) => {
    const invalid = contract.slots.filter((slot) => !/^[a-z][a-zA-Z]*$/.test(slot))
    expect(invalid).toEqual([])
  })
})

describe('architecture.md §6 との一致', () => {
  // 表をそのまま転記したもの。実装を変えたらここも変える必要があり、
  // 「気づかないうちに設計書と乖離する」ことを防ぐ。
  const EXPECTED: Record<string, readonly string[]> = {
    Button: ['root', 'startContent', 'label', 'endContent', 'spinner'],
    Input: [
      'root',
      'label',
      'inputWrapper',
      'input',
      'startContent',
      'endContent',
      'description',
      'errorMessage',
    ],
    Textarea: ['root', 'label', 'inputWrapper', 'textarea', 'description', 'errorMessage'],
    Checkbox: ['root', 'control', 'indicator', 'label', 'description'],
    CheckboxGroup: ['root', 'label', 'list', 'description', 'errorMessage'],
    Radio: ['root', 'control', 'indicator', 'label', 'description'],
    RadioGroup: ['root', 'label', 'list', 'description', 'errorMessage'],
    Switch: ['root', 'track', 'thumb', 'label', 'description'],
    Select: [
      'root',
      'label',
      'trigger',
      'value',
      'icon',
      'popover',
      'listbox',
      'option',
      'description',
      'errorMessage',
    ],
    Card: ['root', 'header', 'body', 'footer', 'image'],
    Badge: ['root', 'dot', 'label'],
    Avatar: ['root', 'image', 'fallback', 'badge'],
    Progress: ['root', 'label', 'track', 'indicator', 'valueLabel'],
    Spinner: ['root', 'circle', 'label'],
    Skeleton: ['root'],
    Modal: ['backdrop', 'panel', 'header', 'title', 'closeButton', 'body', 'footer'],
    ComboBox: [
      'root',
      'label',
      'inputWrapper',
      'input',
      'trigger',
      'icon',
      'popover',
      'listbox',
      'option',
      'description',
      'errorMessage',
    ],
    DatePicker: [
      'root',
      'label',
      'inputWrapper',
      'dateInput',
      'segment',
      'trigger',
      'icon',
      'popover',
      'calendar',
      'calendarHeader',
      'calendarTitle',
      'prevButton',
      'nextButton',
      'calendarGrid',
      'calendarCell',
      'description',
      'errorMessage',
    ],
    NumberField: [
      'root',
      'label',
      'inputWrapper',
      'input',
      'decrement',
      'increment',
      'description',
      'errorMessage',
    ],
    Pagination: ['root', 'list', 'item', 'prev', 'next', 'ellipsis'],
    Popover: ['root', 'arrow', 'content'],
    Tooltip: ['root', 'arrow', 'content'],
    Menu: [
      'trigger',
      'popover',
      'list',
      'item',
      'itemLabel',
      'itemDescription',
      'itemShortcut',
      'separator',
      'section',
      'sectionLabel',
    ],
    Table: ['root', 'header', 'column', 'sortIcon', 'body', 'row', 'cell', 'empty'],
    Tabs: ['root', 'list', 'tab', 'indicator', 'panel'],
    Accordion: ['root', 'item', 'heading', 'trigger', 'indicator', 'panel'],
    Breadcrumbs: ['root', 'list', 'item', 'link', 'separator', 'current'],
    Toast: ['region', 'root', 'icon', 'content', 'title', 'description', 'closeButton', 'action'],
    ColorPicker: [
      'root',
      'label',
      'description',
      'errorMessage',
      'list',
      'item',
      'swatch',
      'indicator',
      'itemLabel',
    ],
  }

  it('設計書に載っている全コンポーネントが実装されている', () => {
    expect(Object.keys(NOVI_CONTRACTS).sort()).toEqual(Object.keys(EXPECTED).sort())
  })

  it.each(Object.entries(EXPECTED))('%s の slot 語彙が設計書と一致する', (name, expected) => {
    const contract = NOVI_CONTRACTS[name as keyof typeof NOVI_CONTRACTS]
    expect([...contract.slots]).toEqual([...expected])
  })
})
