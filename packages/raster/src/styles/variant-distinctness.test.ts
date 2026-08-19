import { NOVI_COLORS, NOVI_SIZES, NOVI_VARIANTS } from '@novi-ui/core'
import { describe, expect, it } from 'vitest'
import { buttonStyles } from '../button/button.styles'
import { inputStyles } from '../input/input.styles'

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

const COMPONENTS: [name: string, styles: StyleFn, slot: string][] = [
  ['Button', buttonStyles as unknown as StyleFn, 'root'],
  ['Input', inputStyles as unknown as StyleFn, 'inputWrapper'],
]

describe('variant / size がテーマ内で必ず区別できる', () => {
  it.each(COMPONENTS)('%s: 全 variant が異なるクラスを生む（AC-02-1）', (_n, styles, slot) => {
    const classes = NOVI_VARIANTS.map((variant) => styles({ variant })[slot]?.())
    const duplicated = classes.filter((c, i) => classes.indexOf(c) !== i)
    expect(duplicated, '同じクラスを生む variant がある').toEqual([])
  })

  it.each(COMPONENTS)('%s: 全 size が異なるクラスを生む', (_n, styles, slot) => {
    const classes = NOVI_SIZES.map((size) => styles({ size })[slot]?.())
    expect(new Set(classes).size).toBe(NOVI_SIZES.length)
  })
})

describe('色を持つコンポーネントは全 color を区別できる', () => {
  it('Button: 全 color が異なるクラスを生む（AC-02-3）', () => {
    const classes = NOVI_COLORS.map((color) => buttonStyles({ color }).root())
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
