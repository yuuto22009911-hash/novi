import { NOVI_COLORS, NOVI_SIZES, NOVI_VARIANTS } from '@novi-ui/core'
import { describe, expect, it } from 'vitest'
import { badgeStyles } from '../badge/badge.styles'
import { buttonStyles } from '../button/button.styles'
import { checkboxStyles } from '../checkbox/checkbox.styles'
import { comboBoxStyles } from '../combo-box/combo-box.styles'
import { inputStyles } from '../input/input.styles'
import { numberFieldStyles } from '../number-field/number-field.styles'
import { paginationStyles } from '../pagination/pagination.styles'
import { radioStyles } from '../radio/radio.styles'
import { selectStyles } from '../select/select.styles'
import { switchStyles } from '../switch/switch.styles'
import { tableStyles } from '../table/table.styles'
import { textareaStyles } from '../textarea/textarea.styles'

/**
 * 全コンポーネント横断の検査。
 *
 * variant を「実装したつもり」で2つが同じクラスになっていても、型は通ってしまう。
 * その状態だと `variant="soft"` と `variant="solid"` が見分けられず、
 * 「語彙は共通、解釈はテーマの自由」という約束が形だけになる。
 *
 * **コンポーネントを追加したらこの表に足すこと。**
 */

type StyleFn = (props: Record<string, unknown>) => Record<string, () => string>

/** variant 語彙を持つコンポーネント。 */
const WITH_VARIANT: [name: string, styles: StyleFn, slot: string][] = [
  ['Button', buttonStyles as unknown as StyleFn, 'root'],
  ['Input', inputStyles as unknown as StyleFn, 'inputWrapper'],
  ['NumberField', numberFieldStyles as unknown as StyleFn, 'inputWrapper'],
  ['ComboBox', comboBoxStyles as unknown as StyleFn, 'inputWrapper'],
  ['TextArea', textareaStyles as unknown as StyleFn, 'inputWrapper'],
  ['Select', selectStyles as unknown as StyleFn, 'trigger'],
  ['Badge', badgeStyles as unknown as StyleFn, 'root'],
]

/** size 語彙を持つコンポーネント。 */
const WITH_SIZE: [name: string, styles: StyleFn, slot: string][] = [
  ...WITH_VARIANT,
  ['Checkbox', checkboxStyles as unknown as StyleFn, 'control'],
  ['Radio', radioStyles as unknown as StyleFn, 'control'],
  ['Switch', switchStyles as unknown as StyleFn, 'track'],
  ['Pagination', paginationStyles as unknown as StyleFn, 'item'],
  ['Table', tableStyles as unknown as StyleFn, 'cell'],
]

/** color 語彙を持つコンポーネント。 */
const WITH_COLOR: [name: string, styles: StyleFn, slot: string][] = [
  ['Button', buttonStyles as unknown as StyleFn, 'root'],
  ['Checkbox', checkboxStyles as unknown as StyleFn, 'root'],
  ['Radio', radioStyles as unknown as StyleFn, 'root'],
  ['Switch', switchStyles as unknown as StyleFn, 'root'],
  ['Badge', badgeStyles as unknown as StyleFn, 'root'],
]

describe('variant / size がテーマ内で必ず区別できる', () => {
  it.each(WITH_VARIANT)('%s: 全 variant が異なるクラスを生む（AC-02-1）', (_n, styles, slot) => {
    const classes = NOVI_VARIANTS.map((variant) => styles({ variant })[slot]?.())
    const duplicated = classes.filter((c, i) => classes.indexOf(c) !== i)
    expect(duplicated, '同じクラスを生む variant がある').toEqual([])
  })

  it.each(WITH_SIZE)('%s: 全 size が異なるクラスを生む', (_n, styles, slot) => {
    const classes = NOVI_SIZES.map((size) => styles({ size })[slot]?.())
    expect(new Set(classes).size).toBe(NOVI_SIZES.length)
  })
})

describe('色を持つコンポーネントは全 color を区別できる', () => {
  it.each(WITH_COLOR)('%s: 全 color が異なるクラスを生む（AC-02-3）', (_n, styles, slot) => {
    const classes = NOVI_COLORS.map((color) => styles({ color })[slot]?.())
    expect(new Set(classes).size).toBe(NOVI_COLORS.length)
  })
})

describe('コンポーネント間で寸法が揃っている', () => {
  it.each(['sm', 'md', 'lg'] as const)('size=%s の高さが Button と Input で一致する', (size) => {
    const height = /h-(\d+)/
    const button = height.exec(buttonStyles({ size }).root())?.[1]
    const input = height.exec(inputStyles({ size }).inputWrapper())?.[1]
    expect(button).toBeDefined()
    expect(input).toBe(button)
  })
})
